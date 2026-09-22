"use client"

import { useEffect, useRef, useState } from "react"
import { defaultSettings, isLightColor, parseSettings, type LightColor } from "./light-settings"

const settingsKey = "fill-light:settings:v1"
const favoritesKey = "fill-light:favorites:v1"

export function useLightSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [favorites, setFavorites] = useState<LightColor[]>([])
  const [loaded, setLoaded] = useState(false)
  const flushRef = useRef<() => void>(() => {})

  useEffect(() => {
    const flush = () => flushRef.current()
    window.addEventListener("pagehide", flush)
    return () => {
      window.removeEventListener("pagehide", flush)
      flush()
    }
  }, [])

  useEffect(() => {
    // 首帧与服务端保持一致，再恢复浏览器里上次使用的设置。
    const frame = requestAnimationFrame(() => {
      try {
        setSettings(parseSettings(localStorage.getItem(settingsKey)))
        const saved: unknown = JSON.parse(localStorage.getItem(favoritesKey) ?? "[]")
        if (Array.isArray(saved)) setFavorites(saved.filter(isLightColor).slice(0, 8))
      } catch { /* 隐私模式下仍可正常使用，只不保留设置。 */ }
      setLoaded(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!loaded) return
    // 拖动时只更新画面，停止拖动后再写入本地存储。
    const save = () => {
      try {
        localStorage.setItem(settingsKey, JSON.stringify(settings))
        localStorage.setItem(favoritesKey, JSON.stringify(favorites))
      } catch { /* 存储不可用不影响补光。 */ }
    }
    flushRef.current = save
    const timer = window.setTimeout(save, 180)
    return () => clearTimeout(timer)
  }, [settings, favorites, loaded])

  return { settings, setSettings, favorites, setFavorites }
}
