import { after, type NextRequest } from "next/server"
import { DeepSeekApiError, generateLocalAnswer, hasDeepSeekApiKey } from "@/lib/chat/answer"
import { runChatAgent } from "@/lib/chat/agent"
import { ChatRequestError, parseChatRequest } from "@/lib/chat/request"
import { createChatStreamResponse } from "@/lib/chat/stream"
import { recordChatQuestion, type ChatQuestionOutcome } from "@/lib/chat/question-log"
import { checkChatRateLimit } from "@/lib/chat/rate-limit"

export const runtime = "nodejs"
// Agent 最多运行 55 秒，额外留出异步收集与一次重试的时间。
export const maxDuration = 75

export async function POST(request: NextRequest) {
  let input: Awaited<ReturnType<typeof parseChatRequest>>
  try {
    input = await parseChatRequest(request)
  } catch (error) {
    return Response.json(
      { error: error instanceof ChatRequestError ? error.message : "请求内容格式不正确。" },
      { status: error instanceof ChatRequestError ? error.status : 400 }
    )
  }

  const { messages, sessionId } = input
  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip") || "local"
  const allowed = await checkChatRateLimit({ clientId, sessionId, windowMs: 60_000, maxRequests: 12 })
  if (!allowed) return Response.json({ error: "请求过于频繁，请稍后再试。" }, { status: 429 })

  const startedAt = Date.now()
  const mode = hasDeepSeekApiKey() ? "deepseek" : "local_fallback"
  const logInput = {
    question: messages.at(-1)!.content,
    createdAt: new Date(startedAt).toISOString(),
    sessionId,
    clientId,
    messageCount: messages.length,
    totalMessageLength: messages.reduce((sum, message) => sum + message.content.length, 0),
    userAgent: request.headers.get("user-agent"),
    referrer: request.headers.get("referer"),
  }
  let finish: (outcome: ChatQuestionOutcome) => void = () => {}
  const finished = new Promise<ChatQuestionOutcome>((resolve) => { finish = resolve })
  // 注册在请求上下文中，Vercel 会等待后台任务；断开连接也会执行。
  // 等待模型收尾以避免客户端收到 done 后立即取消读取时丢失最终状态。
  after(async () => {
    try {
      await recordChatQuestion(logInput, await finished)
    } catch {
      console.error("Failed to collect chat question")
    }
  })

  return createChatStreamResponse(request.signal, async (send, signal) => {
    let outcome: ChatQuestionOutcome = { status: "failed", mode, durationMs: 0 }
    try {
      signal.throwIfAborted()
      if (mode === "deepseek") {
        const result = await runChatAgent({ messages, send, signal })
        outcome = { status: "completed", mode, durationMs: 0, responseLength: result.responseLength, sourceIds: result.sourceIds }
      } else {
        send({ type: "meta", mode })
        send({ type: "error", error: generateLocalAnswer() })
        outcome.errorMessage = "Model service is not configured"
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error("Chat agent failed", error)
        send({ type: "error", error: "回答暂时中断，请稍后再试。" })
      }
      outcome.errorMessage = signal.aborted ? "Visitor cancelled the answer" : error instanceof Error ? error.message : String(error)
      outcome.upstreamStatus = error instanceof DeepSeekApiError ? error.status : undefined
    } finally {
      finish({ ...outcome, durationMs: Date.now() - startedAt })
    }
  })
}
