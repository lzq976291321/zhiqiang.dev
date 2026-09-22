"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => void }
type LockableOrientation = ScreenOrientation & { lock?: (orientation: "landscape") => Promise<void> }
type FullscreenDocument = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }

export function usePresentation(target: RefObject<HTMLDivElement | null>, report: (message: string) => void) {
  const [presenting, setPresenting] = useState(false)
  const native = useRef(false)
  const presentationId = useRef(0)
  const showing = useRef(false)
  const orientationRequested = useRef(false)
  const unlockOrientation = useCallback(() => {
    if (!orientationRequested.current) return
    orientationRequested.current = false
    try { window.screen.orientation?.unlock?.() } catch { /* 浏览器自行恢复方向时无需再次处理。 */ }
  }, [])
  const previousFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    presentationId.current++
    showing.current = false
    unlockOrientation()
    setPresenting(false)
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else (document as FullscreenDocument).webkitExitFullscreen?.()
    native.current = false
    requestAnimationFrame(() => previousFocus.current?.focus())
  }, [unlockOrientation])

  async function open() {
    const element = target.current as FullscreenElement | null
    if (!element) return
    const id = ++presentationId.current
    showing.current = true
    previousFocus.current = document.activeElement as HTMLElement
    setPresenting(true)
    try {
      if (element.requestFullscreen && document.fullscreenEnabled !== false) {
        await element.requestFullscreen({ navigationUI: "hide" })
        native.current = true
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
        native.current = true
      } else report("已进入页面内横屏展示。")
    } catch { report("当前浏览器未开启系统全屏，已使用页面内横屏展示。") }
    if (id !== presentationId.current) {
      if (!showing.current && document.fullscreenElement === element) void document.exitFullscreen().catch(() => {})
      return
    }
    element.querySelector("canvas")?.focus()
    const orientation = window.screen.orientation as LockableOrientation | undefined
    if (typeof orientation?.lock === "function") {
      orientationRequested.current = true
      try {
        await orientation.lock("landscape")
        // 用户可能在方向锁定完成前退出，不能在编辑页留下方向锁。
        if (id !== presentationId.current && !showing.current) {
          try { orientation.unlock() } catch { /* 退出时系统可能已经解除锁定。 */ }
        }
      } catch { /* iOS 等不支持方向锁定时，由展示层 CSS 保持横向画布。 */ }
    }
  }

  useEffect(() => () => {
    presentationId.current++
    showing.current = false
    unlockOrientation()
  }, [unlockOrientation])

  useEffect(() => {
    const onFullscreen = () => {
      const active = document.fullscreenElement || (document as FullscreenDocument).webkitFullscreenElement
      if (active === target.current) native.current = true
      else if (native.current) close()
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && presenting) close() }
    document.addEventListener("fullscreenchange", onFullscreen)
    document.addEventListener("webkitfullscreenchange", onFullscreen)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen)
      document.removeEventListener("webkitfullscreenchange", onFullscreen)
      document.removeEventListener("keydown", onKey)
    }
  }, [close, target, presenting])

  useEffect(() => {
    if (!presenting) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    let disposed = false
    let pending = false
    let lock: WakeLockSentinel | undefined
    async function keepAwake() {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible" || pending || lock && !lock.released) return
      pending = true
      try {
        const next = await navigator.wakeLock.request("screen")
        if (disposed) await next.release()
        else lock = next
      } catch { /* 省电模式拒绝常亮时不影响展示。 */ }
      finally { pending = false }
    }
    void keepAwake()
    document.addEventListener("visibilitychange", keepAwake)
    return () => {
      disposed = true
      document.body.style.overflow = overflow
      document.removeEventListener("visibilitychange", keepAwake)
      void lock?.release().catch(() => {})
    }
  }, [presenting])

  return { presenting, open, close }
}
