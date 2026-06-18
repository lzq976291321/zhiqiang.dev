"use client"
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  FileText,
  LoaderCircle,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react"
import type {
  ChatMessage,
  ChatStreamEvent,
  ChatStreamMode,
} from "@/lib/chat/types"

interface UiMessage extends ChatMessage {
  id: string
  mode?: ChatStreamMode
}

const welcomeMessage: UiMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你可以直接问任何问题；如果涉及我的经历、项目、技术判断或合作方向，我会结合公开知识库回答。",
}

const quickQuestions = [
  "你会什么？",
  "帮我评估一个 Agent 产品想法",
  "我的项目经历里最强的是什么？",
  "做 SEO 内容产品怎么规划？",
  "根据我的经历适合接什么项目？",
]

const boundaryItems = [
  "开放式对话",
  "相关问题结合知识库",
  "个人事实不编造",
]

function getSessionId() {
  const storageKey = "zhiqiang-chat-session-id"
  const existing = window.localStorage.getItem(storageKey)

  if (existing) return existing

  const sessionId = createMessageId()
  window.localStorage.setItem(storageKey, sessionId)
  return sessionId
}

function createMessageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const internalReferencePattern =
  /[ \t]*\[(?:profile|agent|skill|mcp)(?:\.[a-z0-9_-]+)+\][ \t]*/gi
const trailingInternalReferencePattern =
  /[ \t]*\[(?:profile|agent|skill|mcp)(?:\.[a-z0-9_-]*)*$/i

function cleanAssistantMarkdown(content: string) {
  return content
    .replace(internalReferencePattern, " ")
    .replace(trailingInternalReferencePattern, "")
    .replace(/\s+([，。！？；：,.!?;:])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/gi)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white/86">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.86em] text-cyan-50/78"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}

const ChatMarkdown = memo(function ChatMarkdown({ content }: { content: string }) {
  const lines = cleanAssistantMarkdown(content).replace(/\r\n/g, "\n").split("\n")
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const HeadingTag = level <= 2 ? "h2" : level === 3 ? "h3" : "h4"
      const className =
        level <= 2
          ? "text-lg font-semibold leading-7 text-white/90"
          : "text-base font-semibold leading-7 text-white/86"

      blocks.push(
        <HeadingTag key={`h-${blocks.length}`} className={className}>
          {renderInlineMarkdown(headingMatch[2])}
        </HeadingTag>
      )
      index += 1
      continue
    }

    const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      const items: string[][] = []

      while (index < lines.length) {
        const current = lines[index].trim()
        const itemMatch = current.match(/^\d+\.\s+(.+)$/)
        if (!itemMatch) break

        const itemLines = [itemMatch[1]]
        index += 1

        while (index < lines.length) {
          const next = lines[index].trim()
          if (!next) {
            index += 1
            break
          }
          if (/^\d+\.\s+/.test(next)) break
          itemLines.push(next)
          index += 1
        }

        items.push(itemLines)
      }

      blocks.push(
        <ol key={`ol-${blocks.length}`} className="list-decimal space-y-4 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`${item.join("-")}-${itemIndex}`} className="pl-1">
              {item.map((itemLine, lineIndex) => (
                <p key={`${itemLine}-${lineIndex}`} className={lineIndex ? "mt-1.5" : ""}>
                  {renderInlineMarkdown(itemLine)}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )
      continue
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      const items: string[] = []

      while (index < lines.length) {
        const current = lines[index].trim()
        const itemMatch = current.match(/^[-*]\s+(.+)$/)
        if (!itemMatch) break
        items.push(itemMatch[1])
        index += 1
      }

      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    const paragraphLines = [line]
    index += 1

    while (index < lines.length) {
      const next = lines[index].trim()
      if (
        !next ||
        /^#{1,6}\s+/.test(next) ||
        /^\d+\.\s+/.test(next) ||
        /^[-*]\s+/.test(next)
      ) {
        break
      }
      paragraphLines.push(next)
      index += 1
    }

    blocks.push(
      <p key={`p-${blocks.length}`}>
        {renderInlineMarkdown(paragraphLines.join(" "))}
      </p>
    )
  }

  return <div className="space-y-4 text-sm leading-7">{blocks}</div>
})

export function ChatRoom() {
  const [messages, setMessages] = useState<UiMessage[]>([welcomeMessage])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const sessionIdRef = useRef<string | null>(null)
  const streamBufferRef = useRef("")
  const streamFrameRef = useRef<number | null>(null)

  const apiMessages = useMemo(
    () =>
      messages
        .filter((message) => message.id !== welcomeMessage.id)
        .map(({ role, content }) => ({ role, content })),
    [messages]
  )

  const flushStreamBuffer = useCallback((assistantId: string) => {
    if (streamFrameRef.current !== null) {
      cancelAnimationFrame(streamFrameRef.current)
      streamFrameRef.current = null
    }

    const bufferedContent = streamBufferRef.current
    if (!bufferedContent) return

    streamBufferRef.current = ""
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? { ...message, content: message.content + bufferedContent }
          : message
      )
    )
  }, [])

  const queueAssistantDelta = useCallback((assistantId: string, content: string) => {
    streamBufferRef.current += content
    if (streamFrameRef.current !== null) return

    streamFrameRef.current = requestAnimationFrame(() => {
      streamFrameRef.current = null
      flushStreamBuffer(assistantId)
    })
  }, [flushStreamBuffer])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const frame = requestAnimationFrame(() => {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: pending ? "auto" : "smooth",
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [messages, pending])

  useEffect(() => {
    sessionIdRef.current = getSessionId()
  }, [])

  useEffect(() => {
    return () => {
      if (streamFrameRef.current !== null) {
        cancelAnimationFrame(streamFrameRef.current)
      }
    }
  }, [])

  async function submitQuestion(question: string) {
    const trimmed = question.trim()
    if (!trimmed || pending) return

    const userMessage: UiMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    }
    const assistantId = createMessageId()
    const assistantMessage: UiMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
    }

    const nextApiMessages = [...apiMessages, { role: "user" as const, content: trimmed }]

    setMessages((current) => [...current, userMessage, assistantMessage])
    setInput("")
    setError("")
    setPending(true)
    setStreamingMessageId(assistantId)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextApiMessages,
          sessionId: sessionIdRef.current,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "请求失败")
      }

      if (!response.body) throw new Error("当前环境不支持流式响应")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() ?? ""

        for (const event of events) {
          const dataLines = event
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .filter(Boolean)

          for (const data of dataLines) {
            const payload = JSON.parse(data) as ChatStreamEvent

            if (payload.type === "meta") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? {
                        ...message,
                        mode: payload.mode,
                      }
                    : message
                )
              )
            }

            if (payload.type === "delta") {
              queueAssistantDelta(assistantId, payload.content)
            }

            if (payload.type === "error") {
              throw new Error(payload.error)
            }

            if (payload.type === "done") {
              flushStreamBuffer(assistantId)
              setStreamingMessageId(null)
            }
          }
        }
      }
    } catch (requestError) {
      flushStreamBuffer(assistantId)
      setError(requestError instanceof Error ? requestError.message : "请求失败")
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId || message.content)
      )
    } finally {
      flushStreamBuffer(assistantId)
      setPending(false)
      setStreamingMessageId(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submitQuestion(input)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void submitQuestion(input)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="order-2 grid gap-5 lg:order-1 lg:max-h-[calc(100vh-9rem)]">
          <div className="glass-card overflow-hidden p-6 sm:p-8">
            <div className="mb-10 flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1.5 text-sm text-cyan-50/78">
                <Sparkles className="size-4" />
                Public Profile Agent
              </div>
              <MessageSquareText className="size-5 text-white/42" />
            </div>

            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/46">
              zhiqiang.chat / dev interview room
            </p>
            <h1 className="text-balance font-heading text-5xl font-semibold leading-[0.9] tracking-[-0.045em] text-white sm:text-6xl">
              Ask the
              <span className="aurora-text block">Builder</span>
            </h1>
            <p className="mt-6 text-base leading-7 text-white/58">
              开放式对话，结合我的公开知识库生成回答。
            </p>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-100/52">
                Mode
              </p>
              <ShieldCheck className="size-5 text-emerald-100/52" />
            </div>
            <div className="grid gap-2">
              {boundaryItems.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                >
                  <span className="font-mono text-[10px] text-cyan-100/36">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-white/58">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/48">
                Quick prompts
              </p>
              <TerminalSquare className="size-5 text-white/42" />
            </div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void submitQuestion(question)}
                  disabled={pending}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-left text-xs leading-5 text-white/58 transition hover:border-cyan-100/22 hover:bg-cyan-100/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="glass-card order-1 flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden lg:order-2 lg:min-h-[720px]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full border border-cyan-100/18 bg-cyan-100/10 text-cyan-100">
                <TerminalSquare className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/84">开发侧访谈室</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/32">
                  profile augmented
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/42 sm:flex">
              <FileText className="size-3.5" />
              profile + mdx
            </div>
          </div>

          <div
            ref={viewportRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5"
          >
            {messages.map((message) => {
              const isUser = message.role === "user"

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(92%,46rem)] rounded-[24px] border px-4 py-3 sm:px-5 ${
                      isUser
                        ? "border-cyan-100/20 bg-cyan-100/12 text-cyan-50"
                        : "border-white/10 bg-white/[0.045] text-white/72"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                    ) : (
                      <div>
                        {message.content ? <ChatMarkdown content={message.content} /> : null}
                        {streamingMessageId === message.id ? (
                          <span className="ml-1 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-cyan-100/70" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {pending ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/48">
                  <LoaderCircle className="size-4 animate-spin" />
                  正在组织回答
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 sm:p-5">
            {error ? (
              <p className="mb-3 rounded-2xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100/78">
                {error}
              </p>
            ) : null}

            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={1600}
                placeholder="直接输入你的问题..."
                className="min-h-12 flex-1 resize-none rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-cyan-100/28 focus:bg-white/[0.075]"
              />
              <button
                type="submit"
                disabled={pending || input.trim().length === 0}
                className="grid size-12 shrink-0 place-items-center rounded-full border border-cyan-100/22 bg-cyan-100/14 text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-cyan-100/20 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="发送"
              >
                {pending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  )
}
