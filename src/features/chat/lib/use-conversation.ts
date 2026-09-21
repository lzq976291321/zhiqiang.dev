"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ChatMessage, ChatSource, ChatStreamEvent } from "@/lib/chat/types"
import { normalizeChatMessages } from "@/lib/chat/messages"

export interface ConversationMessage extends ChatMessage {
  id: string
  sources?: ChatSource[]
  status?: "streaming" | "complete" | "stopped" | "error"
}

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

export function useConversation() {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const controllerRef = useRef<AbortController | null>(null)
  const sessionRef = useRef<string | null>(null)
  const frameRef = useRef<number | null>(null)
  const bufferRef = useRef("")

  const flush = useCallback((id: string) => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    const delta = bufferRef.current
    bufferRef.current = ""
    if (!delta) return
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, content: message.content + delta } : message
    ))
  }, [])

  useEffect(() => () => {
    controllerRef.current?.abort()
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
  }, [])

  async function send(question: string, history = messages) {
    const content = question.trim()
    if (!content || controllerRef.current) return
    const controller = new AbortController()
    controllerRef.current = controller
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
          messages: normalizeChatMessages(
            [...history.filter((message) => message.content && message.status !== "error"), user]
              .slice(-12).map(({ role, content: text }) => ({ role, content: text }))
          ),
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "暂时没能回答，请稍后重试。")
      }
      if (!response.body) throw new Error("连接没有建立，请重试。")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let streamBuffer = ""
      const consume = (event: string) => {
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
      flush(assistantId)
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, status: "complete" } : message
      ))
    } catch (cause) {
      flush(assistantId)
      const stopped = controller.signal.aborted
      if (!stopped) setError(cause instanceof Error ? cause.message : "连接中断了，请重试。")
      setMessages((current) => current.map((message) =>
        message.id === assistantId ? { ...message, status: stopped ? "stopped" : "error" } : message
      ))
    } finally {
      controllerRef.current = null
      setPending(false)
    }
  }

  function retry() {
    const index = messages.findLastIndex((message) => message.role === "user")
    if (index >= 0) void send(messages[index].content, messages.slice(0, index))
  }

  function reset() {
    if (controllerRef.current) return
    setMessages([])
    setError("")
  }

  return { messages, pending, error, send, retry, reset, stop: () => controllerRef.current?.abort() }
}
