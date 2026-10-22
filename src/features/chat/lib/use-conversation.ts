"use client"

import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react"
import type { ChatStreamEvent } from "@/lib/chat/types"
import { normalizeChatMessages } from "@/lib/chat/messages"
import {
  clearConversationState, readConversationState, writeConversationState,
  type ConversationMessage, type ConversationState,
} from "./conversation-state"

export type { ConversationMessage } from "./conversation-state"

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getSessionId() {
  try {
    const key = "zhiqiang-chat-session-id"
    const existing = sessionStorage.getItem(key)
    if (existing) return existing
    const id = createId()
    sessionStorage.setItem(key, id)
    return id
  } catch {
    return createId()
  }
}

export function useConversation({ initialDraft }: { initialDraft?: string } = {}) {
  const [state, setState] = useState<ConversationState>({ messages: [], draft: initialDraft?.slice(0, 1600) ?? "" })
  const [ready, setReady] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [loginSignal, setLoginSignal] = useState(0)
  const stateRef = useRef(state)
  const initialDraftRef = useRef(initialDraft)
  const readyRef = useRef(false)
  const mountedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const sessionRef = useRef<string | null>(null)
  const frameRef = useRef<number | null>(null)
  const bufferRef = useRef("")

  const persist = useCallback(() => {
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = null
    if (readyRef.current) writeConversationState(stateRef.current)
  }, [])

  const updateState = useCallback((update: (current: ConversationState) => ConversationState) => {
    if (!mountedRef.current) return
    const next = update(stateRef.current)
    stateRef.current = next
    setState(next)
    if (readyRef.current && saveTimerRef.current === null) {
      saveTimerRef.current = setTimeout(persist, 400)
    }
  }, [persist])

  const setMessages = useCallback((update: SetStateAction<ConversationMessage[]>) => {
    updateState((current) => ({
      ...current,
      messages: typeof update === "function" ? update(current.messages) : update,
    }))
  }, [updateState])

  const setDraft = useCallback((update: SetStateAction<string>) => {
    updateState((current) => ({
      ...current,
      draft: (typeof update === "function" ? update(current.draft) : update).slice(0, 1600),
    }))
  }, [updateState])

  const flush = useCallback((id: string) => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    const delta = bufferRef.current
    bufferRef.current = ""
    if (!delta) return
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, content: message.content + delta } : message
    ))
  }, [setMessages])

  useEffect(() => {
    mountedRef.current = true
    const restoreFrame = requestAnimationFrame(() => {
      const restored = readConversationState()
      if (initialDraftRef.current !== undefined) restored.draft = initialDraftRef.current.slice(0, 1600)
      stateRef.current = restored
      setState(restored)
      readyRef.current = true
      setReady(true)
    })
    const leavePage = () => {
      persist()
      controllerRef.current?.abort()
    }
    window.addEventListener("pagehide", leavePage)
    return () => {
      cancelAnimationFrame(restoreFrame)
      persist()
      mountedRef.current = false
      readyRef.current = false
      controllerRef.current?.abort()
      controllerRef.current = null
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      bufferRef.current = ""
      window.removeEventListener("pagehide", leavePage)
    }
  }, [persist])

  async function send(question: string, history = stateRef.current.messages) {
    const content = question.trim()
    if (!content || !readyRef.current || !mountedRef.current || controllerRef.current) return
    const controller = new AbortController()
    controllerRef.current = controller
    const isCurrent = () => mountedRef.current && controllerRef.current === controller
    sessionRef.current ??= getSessionId()
    const assistantId = createId()
    const user: ConversationMessage = { id: createId(), role: "user", content }
    setMessages([...history, user, { id: assistantId, role: "assistant", content: "", status: "streaming" }])
    setPending(true)
    setError("")
    bufferRef.current = ""
    let completed = false

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId: sessionRef.current,
          mode: "companion",
          messages: normalizeChatMessages(
            [...history.filter((message) => message.content && message.status !== "error"), user]
              .slice(-12).map(({ role, content: text }) => ({ role, content: text }))
          ),
        }),
      })
      if (!isCurrent()) {
        await response.body?.cancel().catch(() => undefined)
        return
      }
      if (response.status === 401) {
        const payload = await response.json().catch(() => null)
        if (payload?.code === "login_required") {
          // 服务端拒绝时回滚这一轮并保留草稿，避免留下没有回答的用户消息。
          setMessages((current) => current.filter((message) => message.id !== assistantId && message.id !== user.id))
          setDraft(content)
          setLoginSignal((value) => value + 1)
          return
        }
        throw new Error(payload?.error ?? "请先登录。")
      }
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "暂时没能回答，请稍后重试。")
      }
      if (!response.body) throw new Error("连接没有建立，请重试。")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamBuffer = ""
      const consume = (event: string) => {
        if (!isCurrent()) return
        const data = event.split("\n").filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim()).join("\n")
        if (!data) return
        const payload = JSON.parse(data) as ChatStreamEvent
        if (payload.type === "error") throw new Error(payload.error)
        if (payload.type === "delta") {
          bufferRef.current += payload.content
          if (frameRef.current === null) frameRef.current = requestAnimationFrame(() => flush(assistantId))
        }
        if (payload.type === "sources") {
          setMessages((current) => current.map((message) =>
            message.id === assistantId ? { ...message, sources: payload.sources } : message
          ))
        }
        if (payload.type === "done") completed = true
      }

      try {
        while (!completed) {
          const { done, value } = await reader.read()
          if (!isCurrent()) return
          streamBuffer += done ? decoder.decode() : decoder.decode(value, { stream: true })
          streamBuffer = streamBuffer.replace(/\r\n/g, "\n")
          let boundary: number
          while ((boundary = streamBuffer.indexOf("\n\n")) !== -1) {
            consume(streamBuffer.slice(0, boundary))
            streamBuffer = streamBuffer.slice(boundary + 2)
          }
          if (done) {
            if (streamBuffer.trim()) consume(streamBuffer)
            break
          }
        }
        if (!completed) throw new Error("连接中断了，可以重试这次回答。")
      } finally {
        await reader.cancel().catch(() => undefined)
        reader.releaseLock()
      }
      if (!isCurrent()) return
      flush(assistantId)
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, status: "complete" } : message
      ))
    } catch (cause) {
      if (!isCurrent()) return
      flush(assistantId)
      const stopped = controller.signal.aborted
      if (!stopped) setError(cause instanceof Error ? cause.message : "连接中断了，请重试。")
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, status: stopped ? "stopped" : "error" } : message
      ))
    } finally {
      if (isCurrent()) {
        controllerRef.current = null
        setPending(false)
        persist()
      }
    }
  }

  function retry() {
    const messages = stateRef.current.messages
    const index = messages.findLastIndex((message) => message.role === "user")
    if (index >= 0) void send(messages[index].content, messages.slice(0, index))
  }

  function reset() {
    if (!readyRef.current || controllerRef.current) return
    updateState(() => ({ messages: [], draft: "" }))
    setError("")
    setLoginSignal(0)
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = null
    clearConversationState()
  }

  return {
    messages: state.messages, draft: state.draft, setDraft, ready,
    pending, error, loginSignal, send, retry, reset, stop: () => controllerRef.current?.abort(),
  }
}
