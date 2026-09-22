"use client"

import { useEffect, useRef, type RefObject } from "react"
import { drawBanner } from "../lib/renderer"
import type { BannerLiveData, BannerSettings } from "../lib/settings"

interface BannerCanvasProps {
  settings: BannerSettings
  playing: boolean
  recording?: boolean
  live?: BannerLiveData
  canvasRef?: RefObject<HTMLCanvasElement | null>
  className?: string
  onTogglePlay?: () => void
  /** 用户明确选择继续播放后，允许覆盖系统的减少动态偏好。 */
  reducedMotionOverride?: boolean
}

export function BannerCanvas({ settings, playing, live, canvasRef, className, onTogglePlay, reducedMotionOverride = false, recording = false }: BannerCanvasProps) {
  const internalRef = useRef<HTMLCanvasElement>(null)
  const elapsed = useRef(0)
  const drawing = useRef<(() => void) | null>(null)
  const state = useRef({ settings, playing, live, reducedMotionOverride, recording })

  useEffect(() => {
    state.current = { settings, playing, live, reducedMotionOverride, recording }
    drawing.current?.()
  }, [settings, playing, live, reducedMotionOverride, recording])

  useEffect(() => {
    const canvas = internalRef.current
    const container = canvas?.parentElement
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return
    let width = 0
    let height = 0
    let frame = 0
    let previous = 0
    let onScreen = true
    let destroyed = false
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")

    const render = (timestamp: number) => {
      frame = 0
      if (destroyed || document.hidden || !onScreen || width <= 0 || height <= 0) {
        previous = 0
        return
      }
      const current = state.current
      const reduced = preference.matches && !current.reducedMotionOverride
      const moving = current.playing && !reduced && (current.settings.motion !== "still" || current.settings.blink || current.settings.effect === "rainbow")
      // 静态灯牌录制也持续提交画面，保证视频包含完整六秒时间轴。
      const animate = moving || current.recording
      if (moving && previous) elapsed.current += Math.min(0.08, Math.max(0, (timestamp - previous) / 1000))
      previous = timestamp
      const config = reduced ? { ...current.settings, motion: "still" as const, blink: false, autoFit: true } : current.settings
      drawBanner(ctx, width, height, config, reduced ? 0 : elapsed.current, current.live)
      if (animate) frame = requestAnimationFrame(render)
    }

    const schedule = () => {
      if (destroyed) return
      if (frame) cancelAnimationFrame(frame)
      // 参数变化、恢复可见或恢复播放时重置帧时钟，暂停时间不计入运动。
      previous = 0
      frame = requestAnimationFrame(render)
    }
    drawing.current = schedule

    const resize = () => {
      // 使用旋转前的布局尺寸，横屏回退旋转不会把画布再绘制成竖屏。
      width = Math.max(0, container.clientWidth)
      height = Math.max(0, container.clientHeight)
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      schedule()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      schedule()
    })
    intersectionObserver.observe(canvas)
    document.addEventListener("visibilitychange", schedule)
    preference.addEventListener("change", schedule)
    window.addEventListener("resize", resize)
    // 字体加载后重绘，使首次绘制与 PNG 导出使用浏览器最终选定的字体。
    void document.fonts.ready.then(() => { if (!destroyed) schedule() })
    resize()
    return () => {
      destroyed = true
      drawing.current = null
      if (frame) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      document.removeEventListener("visibilitychange", schedule)
      preference.removeEventListener("change", schedule)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={(node) => {
        internalRef.current = node
        if (canvasRef) canvasRef.current = node
      }}
      className={className}
      data-testid="led-canvas"
      style={{ display: "block", width: "100%", height: "100%", outlineOffset: "-4px" }}
      aria-label={`LED 横幅预览：${settings.mode === "scoreboard" ? `${settings.teamA} ${live?.scoreA ?? 0} 比 ${live?.scoreB ?? 0} ${settings.teamB}` : settings.text || "空白横幅"}。空格键切换播放。`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.code === "Space" && !event.repeat && onTogglePlay) {
          event.preventDefault()
          onTogglePlay()
        }
      }}
    />
  )
}
