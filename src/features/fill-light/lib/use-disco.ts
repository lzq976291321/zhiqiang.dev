"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import type { LightColor } from "./light-settings"

const colors: LightColor[] = [330, 280, 235, 190, 145, 55, 20].map((hue) => ({
  hue,
  saturation: 85,
  lightness: 70,
}))
const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function readReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

export function useDisco(enabled: boolean) {
  const reducedMotion = useSyncExternalStore(subscribeToReducedMotion, readReducedMotion, () => false)
  const [bpm, setTempo] = useState(100)
  const [session, setSession] = useState({ enabled, index: 0, playingOverride: null as boolean | null })

  // 切换模式时重置这一轮播放，保留速度；不用 effect 延迟到下一帧。
  if (session.enabled !== enabled) {
    setSession({ enabled, index: 0, playingOverride: null })
  }

  const playing = enabled && (session.playingOverride ?? !reducedMotion)

  const setBpm = useCallback((value: number) => {
    if (Number.isFinite(value)) setTempo(Math.min(150, Math.max(60, Math.round(value))))
  }, [])

  const togglePlaying = useCallback(() => {
    setSession((previous) => previous.enabled ? {
      ...previous,
      playingOverride: !(previous.playingOverride ?? !reducedMotion),
    } : previous)
  }, [reducedMotion])

  useEffect(() => {
    if (!enabled || !playing) return

    let timer: number | undefined
    const stop = () => {
      window.clearInterval(timer)
      timer = undefined
    }
    const restart = () => {
      stop()
      if (document.visibilityState !== "visible") return
      timer = window.setInterval(() => {
        setSession((previous) => previous.enabled ? {
          ...previous,
          index: (previous.index + 1) % colors.length,
        } : previous)
      }, 60_000 / bpm)
    }

    restart()
    document.addEventListener("visibilitychange", restart)
    return () => {
      stop()
      document.removeEventListener("visibilitychange", restart)
    }
  }, [enabled, playing, bpm])

  return { color: colors[session.index], bpm, setBpm, playing, togglePlaying }
}
