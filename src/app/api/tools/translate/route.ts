import type { NextRequest } from "next/server"
import { checkChatRateLimit } from "@/lib/chat/rate-limit"

export const runtime = "nodejs"

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com"
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash"
const MAX_TEXT_LENGTH = 5000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

type TranslateMode = "zh-to-en" | "en-to-zh" | "rewrite-zh" | "rewrite-en" | "explain"

type TranslateRequestBody = {
  text?: unknown
  mode?: unknown
  glossary?: unknown
}

function getClientId(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local"
}

function normalizeMode(mode: unknown): TranslateMode {
  if (
    mode === "zh-to-en" ||
    mode === "en-to-zh" ||
    mode === "rewrite-zh" ||
    mode === "rewrite-en" ||
    mode === "explain"
  ) {
    return mode
  }

  return "zh-to-en"
}

function getModeInstruction(mode: TranslateMode) {
  switch (mode) {
    case "zh-to-en":
      return "把中文翻译成自然、准确、适合技术博客和产品说明的英文。"
    case "en-to-zh":
      return "把英文翻译成简洁、准确、适合技术博客和产品说明的中文。"
    case "rewrite-zh":
      return "在不改变事实的前提下，把中文改写得更简洁、更有判断、更适合公开技术内容。"
    case "rewrite-en":
      return "Rewrite the English text to be clearer, concise, and suitable for technical writing."
    case "explain":
      return "解释文本中的技术概念和表达问题，给出更好的中文表达建议。"
  }
}

function buildPrompt({
  text,
  mode,
  glossary,
}: {
  text: string
  mode: TranslateMode
  glossary: string
}) {
  return `
任务：
${getModeInstruction(mode)}

术语要求：
${glossary || "无额外术语表。"}

输出要求：
- 只输出处理后的结果，不要复述任务。
- 保留 Markdown 结构。
- 不编造原文没有的信息。
- Agent、MCP、Skill、AGENTS.md、Profile Agent 等专有名词按术语要求处理。

原文：
${text}
`.trim()
}

export async function POST(request: NextRequest) {
  const clientId = getClientId(request)
  const allowed = await checkChatRateLimit({
    clientId,
    windowMs: RATE_LIMIT_WINDOW_MS,
    maxRequests: RATE_LIMIT_MAX,
  })

  if (!allowed) {
    return Response.json({ error: "请求过于频繁，请稍后再试。" }, { status: 429 })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "当前环境没有配置 DEEPSEEK_API_KEY，翻译工具暂不可用。" },
      { status: 503 }
    )
  }

  let body: TranslateRequestBody
  try {
    body = (await request.json()) as TranslateRequestBody
  } catch {
    return Response.json({ error: "请求体不是有效 JSON。" }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  if (!text) {
    return Response.json({ error: "请输入需要处理的文本。" }, { status: 400 })
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      { error: `文本太长，最多 ${MAX_TEXT_LENGTH} 个字符。` },
      { status: 413 }
    )
  }

  const mode = normalizeMode(body.mode)
  const glossary = typeof body.glossary === "string" ? body.glossary.trim().slice(0, 4000) : ""
  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? DEFAULT_DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是 zhiqiang.chat 的翻译和技术写作工具。你只处理用户提供的文本，不记录、不扩展私人事实。",
        },
        {
          role: "user",
          content: buildPrompt({ text, mode, glossary }),
        },
      ],
      max_tokens: 1800,
      temperature: 0.25,
      stream: false,
      thinking: { type: "disabled" },
    }),
  })

  if (!response.ok) {
    return Response.json(
      { error: `模型服务请求失败：${response.status}` },
      { status: 502 }
    )
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const result = payload.choices?.[0]?.message?.content?.trim()

  if (!result) {
    return Response.json({ error: "模型没有返回可用结果。" }, { status: 502 })
  }

  return Response.json({ result })
}
