import { after, type NextRequest } from "next/server"
import { DeepSeekApiError, generateLocalAnswer, hasDeepSeekApiKey } from "@/lib/chat/answer"
import { runChatAgent } from "@/lib/chat/agent"
import { runCompanion } from "@/lib/chat/companion"
import { extractCompanionFacts } from "@/lib/chat/memory-extraction"
import { ChatRequestError, parseChatRequest } from "@/lib/chat/request"
import { createChatStreamResponse } from "@/lib/chat/stream"
import { recordChatQuestion, type ChatQuestionOutcome } from "@/lib/chat/question-log"
import { checkChatRateLimit } from "@/lib/chat/rate-limit"
import { ensureCompanionProfile, loadCompanionMemory, saveCompanionMemories } from "@/lib/companion/memory-store"
import { ANONYMOUS_TRIAL_LIMIT, consumeAnonymousTrial } from "@/lib/companion/trial"
import { TRIAL_BOOTSTRAP_COOKIE, TRIAL_COOKIE } from "@/lib/companion/trial-constants"
import { parseTrialCookie, serializeTrialCookie } from "@/lib/companion/trial-cookie"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient, getChatUser } from "@/lib/supabase/server"

function readCookie(request: NextRequest, name: string): string | undefined {
  const header = request.headers.get("cookie")
  if (!header) return undefined
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return rest.join("=")
  }
  return undefined
}

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

  const { messages, sessionId, mode: chatMode, memory } = input

  // 资料问答已退出公开入口；保留内部令牌是为了旧工具和回归测试，不作为访客能力。
  const adminToken = process.env.ADMIN_ACCESS_TOKEN
  if (chatMode === "knowledge" && (!adminToken || request.headers.get("authorization") !== `Bearer ${adminToken}`)) {
    return Response.json({ error: "接口不存在。" }, { status: 404 })
  }

  const clientId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip") || "local"
  const allowed = await checkChatRateLimit({ clientId, sessionId, windowMs: 60_000, maxRequests: 12 })
  if (!allowed) return Response.json({ error: "请求过于频繁，请稍后再试。" }, { status: 429 })

  // 登录用户的记忆以服务端为准，不采用客户端传来的内容。
  const user = chatMode === "companion" ? await getChatUser() : null

  // 匿名体验只放行前 2 轮；直接调用接口也走同一计数，不依赖前端弹窗。
  // 计数优先用数据库，数据库不可达时用签名 cookie；没有进入过聊天页的请求直接拒绝。
  let trialRounds: number | null = null
  if (chatMode === "companion" && !user) {
    if (!sessionId) {
      return Response.json(
        { error: "请先登录，再继续和 Mori 聊天。", code: "login_required" },
        { status: 401 },
      )
    }

    const rawTrial = readCookie(request, TRIAL_COOKIE)
    if (rawTrial === undefined) {
      return Response.json(
        { error: "请先登录，再继续和 Mori 聊天。", code: "login_required" },
        { status: 401 },
      )
    }

    const cookieRounds = parseTrialCookie(rawTrial) ?? (rawTrial === "0" ? 0 : null)
    if (cookieRounds === null) {
      return Response.json(
        { error: "请重新进入聊天页，再继续。", code: "login_required" },
        { status: 401, headers: { "Set-Cookie": TRIAL_BOOTSTRAP_COOKIE } },
      )
    }
    if (cookieRounds >= ANONYMOUS_TRIAL_LIMIT) {
      return Response.json(
        { error: "先登录，再继续和 Mori 聊天。", code: "login_required" },
        { status: 401 },
      )
    }

    let rounds = cookieRounds + 1
    try {
      rounds = (await consumeAnonymousTrial(sessionId)).rounds
    } catch {
      // Supabase 短暂不可达时继续用 cookie 计数。
    }
    if (rounds > ANONYMOUS_TRIAL_LIMIT) {
      return Response.json(
        { error: "先登录，再继续和 Mori 聊天。", code: "login_required" },
        { status: 401 },
      )
    }
    trialRounds = rounds
  }

  let companionMemory = memory
  if (user) {
    try {
      const supabase = await createSupabaseServerClient()
      await ensureCompanionProfile(supabase, user.id)
      companionMemory = await loadCompanionMemory(supabase, user.id)
    } catch {
      // 读取失败时继续聊天，不把记忆故障暴露给访客。
      companionMemory = memory
    }
  }

  const startedAt = Date.now()
  const streamMode = hasDeepSeekApiKey() ? "deepseek" : "local_fallback"
  const logInput = {
    question: messages.at(-1)!.content,
    // 伴侣对话默认不落正文；保留长度和结果，便于排障与容量统计。
    storeQuestion: chatMode !== "companion",
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
  let companionAnswer = ""
  // 注册在请求上下文中，Vercel 会等待后台任务；断开连接也会执行。
  // 等待模型收尾以避免客户端收到 done 后立即取消读取时丢失最终状态。
  after(async () => {
    let outcome: ChatQuestionOutcome | undefined
    try {
      outcome = await finished
      await recordChatQuestion(logInput, outcome)
    } catch {
      console.error("Failed to collect chat question")
    }

    // 只从完成的伴侣回答里抽取记忆；中断或失败的回合一概不写。
    if (!user || chatMode !== "companion" || outcome?.status !== "completed" || !companionAnswer.trim()) return
    try {
      const facts = await extractCompanionFacts({
        userMessage: messages.at(-1)!.content,
        assistantMessage: companionAnswer,
      })
      if (!facts.length) return
      const admin = createSupabaseAdminClient()
      if (admin) await saveCompanionMemories(admin, user.id, facts)
    } catch {
      console.error("Failed to extract companion memory")
    }
  })

  const response = createChatStreamResponse(request.signal, async (send, signal) => {
    let outcome: ChatQuestionOutcome = { status: "failed", mode: streamMode, durationMs: 0 }
    // 保留给 after 使用的完整回答，同时不改变发给访客的流。
    const sendWithCapture: typeof send = (event) => {
      if (event.type === "delta") companionAnswer += event.content
      send(event)
    }
    try {
      signal.throwIfAborted()
      if (streamMode === "deepseek") {
        const result = chatMode === "companion"
          ? await runCompanion({ messages, memory: companionMemory, send: sendWithCapture, signal })
          : await runChatAgent({ messages, send, signal })
        outcome = { status: "completed", mode: streamMode, durationMs: 0, responseLength: result.responseLength, sourceIds: result.sourceIds }
      } else {
        send({ type: "meta", mode: streamMode })
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

  if (trialRounds !== null) {
    const cookie = serializeTrialCookie(trialRounds)
    if (cookie) response.headers.append("Set-Cookie", cookie)
  }
  return response
}
