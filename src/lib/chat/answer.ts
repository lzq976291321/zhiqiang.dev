import type { ChatMessage, ChatSource } from "./types"

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com"
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash"

const systemPrompt = `
你是 zhiqiang.chat 的公开开发侧 Profile Agent。

边界：
- 只基于提供的公开资料回答。
- 只回答林志强的开发能力、项目、Agent 设计、MCP、Skills、Design Token Lab、工程偏好和合作方向。
- 不回答家庭、住址、私人关系、财务、日常生活、未公开经历、私人联系方式、推测性人格判断。
- 如果用户让你“介绍一下林志强”或问“他是谁”，默认只输出开发领域介绍：开发身份、技术栈、公开项目、Agent 工程能力、工具链能力和适合合作方向。
- 资料不足时直接说“公开开发侧资料没有覆盖”，不要编造。

回答要求：
- 使用中文，先结论后理由。
- 简洁具体，不写泛泛而谈的自我介绍。
- 可以使用 Markdown 的加粗、列表和简短段落，方便前端渲染。
- 关键判断尽量附带来源 id，例如 [profile.agent]。
- 不要输出资料里没有的隐私信息。
`.trim()

function buildUserPrompt({
  question,
  messages,
  sources,
}: {
  question: string
  messages: ChatMessage[]
  sources: ChatSource[]
}) {
  const recentMessages = messages
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n")

  const sourceContext = sources
    .map(
      (source, index) =>
        `${index + 1}. [${source.id}] ${source.title} (${source.category}, ${source.path})\n${source.excerpt}`
    )
    .join("\n\n")

  return `
用户当前问题：
${question}

最近对话：
${recentMessages || "无"}

可用公开资料：
${sourceContext || "无"}
`.trim()
}

export function hasDeepSeekApiKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY)
}

export function generateLocalAnswer(question: string, sources: ChatSource[]) {
  if (sources.length === 0) {
    return "公开开发侧资料没有覆盖这个问题，我不能编造。你可以改问技术栈、项目经验、Agent 设计、MCP / Skills 判断、Design Token Lab，或适合什么类型的合作。"
  }

  const sourceLines = sources
    .slice(0, 3)
    .map((source) => `- [${source.id}] ${source.excerpt}`)
    .join("\n")

  return [
    "根据公开开发侧资料，可以先这样判断：",
    sourceLines,
    "",
    `针对“${question}”，更准确的回答需要以上资料作为边界；公开资料没有覆盖的部分我不会补充或推测。`,
  ].join("\n")
}

export async function createDeepSeekCompletionStream({
  question,
  messages,
  sources,
}: {
  question: string
  messages: ChatMessage[]
  sources: ChatSource[]
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return null

  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`

  return fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? DEFAULT_DEEPSEEK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt({ question, messages, sources }) },
      ],
      max_tokens: 900,
      stream: true,
      stream_options: { include_usage: false },
      temperature: 0.3,
      thinking: { type: "disabled" },
    }),
  })
}

export function extractDeepSeekDelta(rawEvent: string) {
  const dataLines = rawEvent
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean)

  const deltas: string[] = []
  let done = false

  for (const data of dataLines) {
    if (data === "[DONE]") {
      done = true
      continue
    }

    const payload = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string | null } }>
    }
    const content = payload.choices?.[0]?.delta?.content

    if (content) deltas.push(content)
  }

  return { content: deltas.join(""), done }
}
