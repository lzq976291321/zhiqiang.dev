export const MAX_COMPANION_MEMORY_FACTS = 12
export const MAX_COMPANION_MEMORY_LENGTH = 240
export const MAX_EXTRACTED_COMPANION_FACTS = 3

export const COMPANION_MEMORY_KINDS = ["preference", "event", "person", "ongoing", "boundary"] as const
export type CompanionMemoryKind = typeof COMPANION_MEMORY_KINDS[number]

export interface CompanionMemoryFact {
  kind: CompanionMemoryKind
  content: string
}

function isKind(value: unknown): value is CompanionMemoryKind {
  return typeof value === "string" && (COMPANION_MEMORY_KINDS as readonly string[]).includes(value)
}

// 记忆来自客户端或数据库，是参考数据而不是指令；只保留有限条数、长度和可读文本。
export function normalizeCompanionMemory(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const facts: string[] = []
  const seen = new Set<string>()

  for (const item of value) {
    const raw = typeof item === "string"
      ? item
      : item && typeof item === "object" && typeof (item as { content?: unknown }).content === "string"
        ? (item as { content: string }).content
        : ""
    const content = raw
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_COMPANION_MEMORY_LENGTH)

    if (!content || seen.has(content)) continue
    seen.add(content)
    facts.push(content)
    if (facts.length >= MAX_COMPANION_MEMORY_FACTS) break
  }

  return facts
}

// 抽取结果的校验与去重；模型可能返回数组、对象或带代码块的文本。
export function normalizeCompanionFacts(value: unknown): CompanionMemoryFact[] {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { facts?: unknown }).facts)
      ? (value as { facts: unknown[] }).facts
      : []

  const facts: CompanionMemoryFact[] = []
  const seen = new Set<string>()

  for (const item of list) {
    if (!item || typeof item !== "object") continue
    const kind = (item as { kind?: unknown }).kind
    const raw = (item as { content?: unknown }).content
    if (!isKind(kind) || typeof raw !== "string") continue
    const content = raw
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_COMPANION_MEMORY_LENGTH)
    if (!content || seen.has(content)) continue
    seen.add(content)
    facts.push({ kind, content })
    if (facts.length >= MAX_EXTRACTED_COMPANION_FACTS) break
  }

  return facts
}
