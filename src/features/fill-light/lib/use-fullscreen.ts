"use client"

import { useSyncExternalStore } from "react"

type WebKitDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => Promise<void> | void
}
type WebKitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

type DisplayMode = "browser" | "unsupported" | "fullscreen" | "installed"

function nativeFullscreenElement() {
  return document.fullscreenElement || (document as WebKitDocument).webkitFullscreenElement
}

function readDisplayMode(): DisplayMode {
  if (nativeFullscreenElement()) return "fullscreen"
  // 主屏幕 Web App 与 DOM Fullscreen API 是不同状态，不能提供假的“退出全屏”。
  if ((navigator as Navigator & { standalone?: boolean }).standalone
    || window.matchMedia("(display-mode: standalone)").matches
    || window.matchMedia("(display-mode: fullscreen)").matches) return "installed"
  const root = document.documentElement as WebKitElement
  if (typeof root.requestFullscreen === "function" && document.fullscreenEnabled !== false
    || typeof root.webkitRequestFullscreen === "function" && (document as WebKitDocument).webkitFullscreenEnabled !== false) return "browser"
  return "unsupported"
}

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia("(display-mode: standalone)"), window.matchMedia("(display-mode: fullscreen)")]
  document.addEventListener("fullscreenchange", onChange)
  document.addEventListener("webkitfullscreenchange", onChange)
  window.addEventListener("pageshow", onChange)
  queries.forEach((query) => query.addEventListener("change", onChange))
  return () => {
    document.removeEventListener("fullscreenchange", onChange)
    document.removeEventListener("webkitfullscreenchange", onChange)
    window.removeEventListener("pageshow", onChange)
    queries.forEach((query) => query.removeEventListener("change", onChange))
  }
}

export function useFullscreenMode() {
  return useSyncExternalStore(subscribe, readDisplayMode, (): DisplayMode => "browser")
}

export function isAppleMobile() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
}

function waitForWebKitChange(action: () => Promise<void> | void, completed: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    let settled = false
    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      document.removeEventListener("webkitfullscreenchange", changed)
      document.removeEventListener("webkitfullscreenerror", failed)
      if (error) reject(error)
      else resolve()
    }
    const changed = () => { if (completed()) finish() }
    const failed = () => finish(new Error("WebKit 全屏请求失败"))
    const timer = window.setTimeout(failed, 2500)
    document.addEventListener("webkitfullscreenchange", changed)
    document.addEventListener("webkitfullscreenerror", failed)
    try { Promise.resolve(action()).then(changed, finish) }
    catch (error) { finish(error) }
  })
}

// 必须直接在点击处理函数里请求全屏，以保留浏览器要求的用户手势。
export async function requestFullscreen(element: HTMLElement): Promise<boolean> {
  if (element.requestFullscreen && document.fullscreenEnabled !== false) {
    await element.requestFullscreen({ navigationUI: "hide" })
    return true
  }
  const webkitElement = element as WebKitElement
  if (webkitElement.webkitRequestFullscreen && (document as WebKitDocument).webkitFullscreenEnabled !== false) {
    const request = webkitElement.webkitRequestFullscreen.bind(webkitElement)
    await waitForWebKitChange(request, () => nativeFullscreenElement() === element)
    return true
  }
  return false
}

export async function exitFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen()
  else {
    const exit = (document as WebKitDocument).webkitExitFullscreen
    if (exit) await waitForWebKitChange(exit.bind(document), () => !nativeFullscreenElement())
  }
}
