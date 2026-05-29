import type { ChatMessage, ChatSource } from "./types"

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com"
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash"

const systemPrompt = `
你是 zhiqiang.chat 的对话助手，具备通用 LLM 对话能力，并能结合林志强的公开知识库回答。

工作方式：
- 不要按规则先判断“能不能回答”，也不要因为问题没有命中特定关键词就拒答。
- 用户问任何正常问题时，先直接回答；如果问题与林志强、项目经历、技术判断、Agent、MCP、Skills、SEO、Design Token、合作方向有关，优先结合提供的知识库。
- 用户问“你会什么”“你能做什么”“你擅长什么”时，可以同时说明：你作为聊天助手能做什么，以及基于公开知识库可以介绍林志强哪些开发能力。
- 如果用户要求未公开的个人事实、私人联系方式、住址、家庭、财务、私人关系等，不编造；可以说明知识库没有这些公开信息，然后给出可替代的公开信息或通用建议。
- 当知识库不足以支撑某个关于林志强的具体事实时，明确区分“公开资料显示”和“通用判断/建议”。

回答要求：
- 使用中文，先结论后理由。
- 简洁具体，不写泛泛而谈的自我介绍。
- 可以使用 Markdown 的加粗、列表和简短段落，方便前端渲染。
- 使用知识库时尽量附带来源 id，例如 [profile.agent]。
- 不要输出资料里没有的私人事实。
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

林志强公开知识库上下文：
${sourceContext || "无"}
`.trim()
}

export function hasDeepSeekApiKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY)
}

export function generateLocalAnswer(question: string, sources: ChatSource[]) {
  if (sources.length === 0) {
    return "当前没有可用模型，也没有检索到可用知识库上下文，所以只能先暂停回答。配置模型后，这里会支持开放式对话。"
  }

  const sourceLines = sources
    .slice(0, 3)
    .map((source) => `- [${source.id}] ${source.excerpt}`)
    .join("\n")

  return [
    "当前没有可用模型，先基于知识库给一个简要版本：",
    sourceLines,
    "",
    `针对“${question}”，完整开放式回答需要模型服务可用后生成。`,
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
      temperature: 0.5,
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
