"use client"

import { useEffect } from "react"

export function useScreenAwake() {
  useEffect(() => {
    let disposed = false
    let pending = false
    let lock: WakeLockSentinel | null = null
    async function acquire() {
      if (!("wakeLock" in navigator) || document.visibilityState !== "visible" || pending || lock && !lock.released) return
      pending = true
      try {
        const next = await navigator.wakeLock.request("screen")
        if (disposed) { await next.release(); return }
        lock = next
      } catch { /* 系统省电策略可能拒绝保持常亮，补光功能仍可使用。 */ }
      finally { pending = false }
    }
    void acquire()
    document.addEventListener("visibilitychange", acquire)
    return () => {
      disposed = true
      document.removeEventListener("visibilitychange", acquire)
      void lock?.release().catch(() => {})
    }
  }, [])
}
