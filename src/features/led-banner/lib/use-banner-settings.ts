"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { DEFAULT_SETTINGS, DESIGNS_KEY, STORAGE_KEY, decodeSettings, sanitizeSettings, type BannerSettings } from "./settings"

export interface SavedDesign { id: string; name: string; settings: BannerSettings }

export function useBannerSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [ready, setReady] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const past = useRef<BannerSettings[]>([])
  const future = useRef<BannerSettings[]>([])
  const [history, setHistory] = useState({ canUndo: false, canRedo: false })
  const current = useRef(settings)

  useEffect(() => {
    const load = () => {
      const shared = decodeSettings(window.location.hash)
      let initial = DEFAULT_SETTINGS
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) initial = sanitizeSettings(JSON.parse(raw))
        const saved: unknown = JSON.parse(localStorage.getItem(DESIGNS_KEY) || "[]")
        if (Array.isArray(saved)) setDesigns(saved.slice(0, 20).filter((item) => item && typeof item.id === "string" && typeof item.name === "string").map((item) => ({ id: item.id.slice(0, 80), name: item.name.slice(0, 40), settings: sanitizeSettings(item.settings) })))
      } catch { /* 无法恢复旧数据时仍然可以直接制作灯牌。 */ }
      const next = shared ?? initial
      current.current = next
      setSettings(next)
      setReady(true)
    }
    const frame = requestAnimationFrame(load)
    const onHash = () => {
      const next = decodeSettings(window.location.hash)
      if (next) { current.current = next; setSettings(next) }
    }
    window.addEventListener("hashchange", onHash)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", onHash) }
  }, [])

  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); setStorageError(false) }
      catch { setStorageError(true) }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [settings, ready])

  const update = useCallback((patch: Partial<BannerSettings>) => {
    past.current = [...past.current.slice(-39), current.current]
    future.current = []
    const next = sanitizeSettings({ ...current.current, ...patch })
    current.current = next
    setSettings(next)
    setHistory({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 })
  }, [])

  const travel = useCallback((direction: "undo" | "redo") => {
    const source = direction === "undo" ? past : future
    const target = direction === "undo" ? future : past
    const next = source.current.pop()
    if (!next) return
    target.current.push(current.current)
    current.current = next
    setSettings(next)
    setHistory({ canUndo: past.current.length > 0, canRedo: future.current.length > 0 })
  }, [])

  function saveDesign(name: string) {
    const next = [{ id: crypto.randomUUID(), name: name.trim().slice(0, 40) || "未命名灯牌", settings }, ...designs].slice(0, 20)
    try { localStorage.setItem(DESIGNS_KEY, JSON.stringify(next)); setDesigns(next); return true }
    catch { setStorageError(true); return false }
  }

  function deleteDesign(id: string) {
    const next = designs.filter((design) => design.id !== id)
    try { localStorage.setItem(DESIGNS_KEY, JSON.stringify(next)); setDesigns(next); return true }
    catch { setStorageError(true); return false }
  }

  return { settings, update, ready, designs, saveDesign, deleteDesign, storageError, travel, ...history }
}
