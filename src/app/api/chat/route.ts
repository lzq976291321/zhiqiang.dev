import type { NextRequest } from "next/server"
import {
  createDeepSeekCompletionStream,
  extractDeepSeekDelta,
  generateLocalAnswer,
  hasDeepSeekApiKey,
} from "@/lib/chat/answer"
import { getChatKnowledgeSources } from "@/lib/chat/retrieval"
import {
  createChatQuestionLog,
  updateChatQuestionLog,
} from "@/lib/chat/question-log"
import { checkChatRateLimit } from "@/lib/chat/rate-limit"
import type {
  ChatMessage,
  ChatSource,
  ChatStreamEvent,
  ChatStreamMode,
} from "@/lib/chat/types"

export const runtime = "nodejs"

const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 1600
const MAX_TOTAL_LENGTH = 6000
const MAX_REQUEST_BODY_LENGTH = 20_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 12

const encoder = new TextEncoder()

class DeepSeekApiError extends Error {
  constructor(readonly status: number) {
    super(`DeepSeek request failed: ${status}`)
  }
}

function getClientId(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local"
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false

  const message = value as Partial<ChatMessage>
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  )
}

function isRequestBodyTooLarge(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length"))
  return Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_LENGTH
}

async function parseChatRequest(request: NextRequest) {
  const body = (await request.json()) as {
    messages?: unknown
    sessionId?: unknown
  }
  if (!Array.isArray(body.messages)) return null

  const messages = body.messages.slice(-MAX_MESSAGES)
  if (!messages.every(isChatMessage)) return null

  const totalLength = messages.reduce((sum, message) => sum + message.content.length, 0)
  if (totalLength > MAX_TOTAL_LENGTH) return null

  return {
    messages,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
  }
}

function getLatestQuestion(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message.role === "user") return message.content.trim()
  }

  return ""
}

function getTotalMessageLength(messages: ChatMessage[]) {
  return messages.reduce((sum, message) => sum + message.content.length, 0)
}

function createStreamResponse(
  stream: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void> | void
) {
  return new Response(new ReadableStream({ start: stream }), {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  })
}

function encodeSse(event: ChatStreamEvent) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
}

function send(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: ChatStreamEvent
) {
  controller.enqueue(encodeSse(event))
}

async function streamText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  text: string
) {
  const chars = Array.from(text)

  for (let index = 0; index < chars.length; index += 8) {
    send(controller, {
      type: "delta",
      content: chars.slice(index, index + 8).join(""),
    })
    await new Promise((resolve) => setTimeout(resolve, 18))
  }
}

function sendMeta(
  controller: ReadableStreamDefaultController<Uint8Array>,
  mode: ChatStreamMode
) {
  send(controller, {
    type: "meta",
    mode,
  })
}

async function createQuestionLogSafely(input: Parameters<typeof createChatQuestionLog>[0]) {
  try {
    return await createChatQuestionLog(input)
  } catch (error) {
    console.error("Failed to create chat question log", error)
    return null
  }
}

async function updateQuestionLogSafely(input: Parameters<typeof updateChatQuestionLog>[0]) {
  try {
    await updateChatQuestionLog(input)
  } catch (error) {
    console.error("Failed to update chat question log", error)
  }
}

async function proxyDeepSeekStream({
  controller,
  question,
  messages,
  sources,
}: {
  controller: ReadableStreamDefaultController<Uint8Array>
  question: string
  messages: ChatMessage[]
  sources: ChatSource[]
}) {
  const upstream = await createDeepSeekCompletionStream({
    question,
    messages,
    sources,
  })

  if (!upstream || !upstream.body) {
    throw new Error("DeepSeek API key is not configured.")
  }

  if (!upstream.ok) {
    throw new DeepSeekApiError(upstream.status)
  }

  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let responseLength = 0

  while (true) {
    const { done, value } = await reader.read()

    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split("\n\n")
    buffer = events.pop() ?? ""

    for (const event of events) {
      const { content, done: streamDone } = extractDeepSeekDelta(event)

      if (content) {
        responseLength += content.length
        send(controller, { type: "delta", content })
      }

      if (streamDone) {
        send(controller, { type: "done" })
        return responseLength
      }
    }
  }

  send(controller, { type: "done" })
  return responseLength
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request)

  if (isRequestBodyTooLarge(request)) {
    return Response.json({ error: "请求体太大。" }, { status: 413 })
  }

  let chatRequest: { messages: ChatMessage[]; sessionId?: string } | null = null

  try {
    chatRequest = await parseChatRequest(request)
  } catch {
    return Response.json({ error: "请求体不是有效 JSON。" }, { status: 400 })
  }

  if (!chatRequest) {
    return Response.json(
      { error: "messages 格式不正确，或输入太长。" },
      { status: 400 }
    )
  }

  const { messages, sessionId } = chatRequest
  const allowed = await checkChatRateLimit({
    clientId,
    sessionId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  })

  if (!allowed) {
    return Response.json(
      { error: "请求过于频繁，请稍后再试。" },
      { status: 429 }
    )
  }

  const question = getLatestQuestion(messages)
  const sources = getChatKnowledgeSources(question)
  const startedAt = Date.now()
  const mode: ChatStreamMode = hasDeepSeekApiKey() ? "deepseek" : "local_fallback"
  const logId = await createQuestionLogSafely({
    question,
    sourceIds: sources.map((source) => source.id),
    sessionId,
    clientId,
    messageCount: messages.length,
    totalMessageLength: getTotalMessageLength(messages),
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  })

  return createStreamResponse(async (controller) => {
    try {
      if (mode === "deepseek") {
        sendMeta(controller, mode)
        const responseLength = await proxyDeepSeekStream({
          controller,
          question,
          messages,
          sources,
        })
        await updateQuestionLogSafely({
          id: logId,
          status: "completed",
          durationMs: Date.now() - startedAt,
          mode,
          responseLength,
        })
        controller.close()
        return
      }

      const fallbackAnswer = generateLocalAnswer(question, sources)
      sendMeta(controller, mode)
      await streamText(controller, fallbackAnswer)
      send(controller, { type: "done" })
      await updateQuestionLogSafely({
        id: logId,
        status: "completed",
        durationMs: Date.now() - startedAt,
        mode,
        responseLength: fallbackAnswer.length,
      })
      controller.close()
    } catch (error) {
      console.error(error)
      send(controller, {
        type: "error",
        error: error instanceof DeepSeekApiError
          ? getDeepSeekErrorMessage(error.status)
          : "模型输出失败，已停止本次回答。",
      })
      await updateQuestionLogSafely({
        id: logId,
        status: "failed",
        durationMs: Date.now() - startedAt,
        mode,
        errorMessage: error instanceof Error ? error.message : String(error),
        upstreamStatus: error instanceof DeepSeekApiError ? error.status : undefined,
      })
      controller.close()
    }
  })
}

function getDeepSeekErrorMessage(status: number) {
  if (status === 401) return "DeepSeek API 认证失败，请检查 API Key。"
  if (status === 402) return "DeepSeek API 返回余额不足，请确认账号余额或更换 API Key。"
  if (status === 429) return "DeepSeek API 请求过快，请稍后再试。"
  return `DeepSeek API 请求失败（${status}），请稍后再试。`
}
