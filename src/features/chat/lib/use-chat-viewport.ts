"use client"

import { useEffect, useRef } from "react"

// iOS 的键盘改变可见视口，不一定改变布局视口。让输入区跟随实际可见区域。
export function useChatViewport() {
  const roomRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const room = roomRef.current
    if (!room) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    root.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    const viewport = window.visualViewport
    const touch = window.matchMedia("(pointer: coarse)")
    let frame = 0

    function update() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!room || !viewport || !touch.matches || viewport.scale !== 1) return
        room.style.setProperty("--chat-height", `${viewport.height}px`)
        room.style.setProperty("--chat-offset", `${viewport.offsetTop}px`)
        room.dataset.keyboard = String(window.innerHeight - viewport.height > 100)
        room.dataset.compact = String(viewport.height < 400)
      })
    }
    update()
    viewport?.addEventListener("resize", update)
    viewport?.addEventListener("scroll", update)
    window.addEventListener("resize", update)
    return () => {
      cancelAnimationFrame(frame)
      viewport?.removeEventListener("resize", update)
      viewport?.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      root.style.overflow = previousOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [])

  return roomRef
}
