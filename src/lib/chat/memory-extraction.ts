import { createDeepSeekCompletion } from "./answer"
import { normalizeCompanionFacts, type CompanionMemoryFact } from "./companion-memory"

const extractionPrompt = `你是记忆整理器。从下面这段对话里提取 0-3 条关于“对方”的、值得长期记住的事实。
只提取对方明确说过的内容，不要推断，也不要把你自己的回答当成对方的事实。
不要提取健康、性取向、政治、宗教、住址、财务等敏感信息；不要提取一次性情绪、客套话或临时安排。
kind 只能是 preference、event、person、ongoing、boundary。
只输出 JSON，不要解释：{"facts":[{"kind":"preference","content":"..."}]}。没有可记的就输出 {"facts":[]}。
每条不超过 120 字。`

export function parseCompanionFacts(raw: string): CompanionMemoryFact[] {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  const start = trimmed.search(/[{[]/)
  const end = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"))
  const jsonText = start >= 0 && end > start ? trimmed.slice(start, end + 1) : trimmed
  try {
    return normalizeCompanionFacts(JSON.parse(jsonText))
  } catch {
    return []
  }
}

// 在响应结束后的 after 里运行，不阻塞访客看到回答；失败只记录，不影响对话。
export async function extractCompanionFacts({
  userMessage,
  assistantMessage,
  signal = AbortSignal.timeout(20_000),
  fetcher = fetch,
}: {
  userMessage: string
  assistantMessage: string
  signal?: AbortSignal
  fetcher?: typeof fetch
}): Promise<CompanionMemoryFact[]> {
  if (!userMessage.trim()) return []
  const content = await createDeepSeekCompletion({
    messages: [
      { role: "system", content: extractionPrompt },
      {
        role: "user",
        content: `对方说：${userMessage.slice(0, 1600)}\n\n你刚才回答：${assistantMessage.slice(0, 1200)}`,
      },
    ],
    signal,
    fetcher,
    maxTokens: 300,
  })
  return parseCompanionFacts(content)
}
