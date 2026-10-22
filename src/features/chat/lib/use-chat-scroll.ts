"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const POSITION_KEY = "zhiqiang-chat-position"

export function useChatScroll(ready: boolean, conversationId?: string) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const followingRef = useRef(true)
  const restoredRef = useRef(false)
  const lastTopRef = useRef(0)
  const userScrollUntil = useRef(0)
  const [away, setAway] = useState(false)

  const toLatest = useCallback(() => {
    followingRef.current = true
    userScrollUntil.current = 0
    setAway(false)
    const viewport = viewportRef.current
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
      lastTopRef.current = viewport.scrollTop
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const viewport = viewportRef.current
    const content = contentRef.current
    if (!viewport || !content) return
    let frame = 0
    const save = () => {
      if (!restoredRef.current) return
      try {
        if (!conversationId) sessionStorage.removeItem(POSITION_KEY)
        else sessionStorage.setItem(POSITION_KEY, JSON.stringify({
          conversationId, top: viewport.scrollTop, following: followingRef.current,
        }))
      } catch { /* 无存储权限时仍然可以聊天。 */ }
    }
    frame = requestAnimationFrame(() => {
      if (!restoredRef.current) {
        try {
          const saved = JSON.parse(sessionStorage.getItem(POSITION_KEY) ?? "null")
          if (saved?.conversationId === conversationId && Number.isFinite(saved?.top) && saved.top >= 0) {
            followingRef.current = saved.following !== false
            if (!followingRef.current) viewport.scrollTop = saved.top
          }
        } catch { /* 忽略损坏的浏览位置。 */ }
        restoredRef.current = true
      }
      if (conversationId && followingRef.current) viewport.scrollTop = viewport.scrollHeight
      lastTopRef.current = viewport.scrollTop
      setAway(!followingRef.current && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 24)
    })
    const observer = new ResizeObserver(() => {
      if (!restoredRef.current || !conversationId) return
      // 新回复和键盘变化只在用户正在读最新消息时跟随。
      if (followingRef.current) viewport.scrollTop = viewport.scrollHeight
      lastTopRef.current = viewport.scrollTop
      setAway(!followingRef.current && viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 24)
    })
    observer.observe(viewport)
    observer.observe(content)
    viewport.addEventListener("scroll", save, { passive: true })
    window.addEventListener("pagehide", save)
    return () => {
      save()
      cancelAnimationFrame(frame)
      observer.disconnect()
      viewport.removeEventListener("scroll", save)
      window.removeEventListener("pagehide", save)
    }
  }, [ready, conversationId])

  function markUserScroll() {
    userScrollUntil.current = performance.now() + 900
  }

  function onScroll() {
    const viewport = viewportRef.current
    if (!viewport) return
    const change = viewport.scrollTop - lastTopRef.current
    lastTopRef.current = viewport.scrollTop
    // 布局变化和程序定位不能被误当作用户要离开/回到最新回复。
    if (performance.now() > userScrollUntil.current || Math.abs(change) < 1) return
    userScrollUntil.current = performance.now() + 900
    const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    if (change < 0) followingRef.current = false
    else if (distance < 24) followingRef.current = true
    setAway(!followingRef.current && distance > 24)
  }

  function jumpToMessage(id: string) {
    const viewport = viewportRef.current
    const message = document.getElementById(`message-${id}`)
    if (!viewport || !message) return
    followingRef.current = false
    userScrollUntil.current = 0
    viewport.scrollTop += message.getBoundingClientRect().top - viewport.getBoundingClientRect().top - 20
    lastTopRef.current = viewport.scrollTop
    setAway(viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight > 24)
    message.focus({ preventScroll: true })
  }

  return { viewportRef, contentRef, away, toLatest, jumpToMessage, onScroll, markUserScroll }
}
