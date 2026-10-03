import { getChatCorpus } from "./corpus"
import type { ChatChunk, ChatSource } from "./types"

function normalizeForSearch(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function getCjkBigrams(value: string) {
  const chars = Array.from(value.replace(/[^\u4e00-\u9fff]/g, ""))
  const bigrams: string[] = []

  for (let index = 0; index < chars.length - 1; index += 1) {
    bigrams.push(`${chars[index]}${chars[index + 1]}`)
  }

  return bigrams
}

function getTerms(question: string) {
  const asciiTerms = normalizeForSearch(question)
    .split(/[^a-z0-9_.+-]+/i)
    .filter((term) => term.length >= 2)

  return Array.from(new Set([...asciiTerms, ...getCjkBigrams(question)]))
}

function toSource(chunk: ChatChunk): ChatSource {
  const { id, title, path, category, excerpt, updatedAt } = chunk
  return { id, title, path, category, excerpt, updatedAt }
}

function scoreChunk(chunk: ChatChunk, question: string, terms: string[]) {
  const query = normalizeForSearch(question)
  const text = normalizeForSearch(`${chunk.title} ${chunk.keywords.join(" ")} ${chunk.text}`)
  const title = normalizeForSearch(`${chunk.title} ${chunk.keywords.join(" ")}`)
  let score = 0

  if (query.length >= 4 && text.includes(query)) score += 12

  for (const term of terms) {
    if (title.includes(term)) score += 6
    if (text.includes(term)) score += 2
  }

  return score
}

function isFutureSource(source: ChatSource, now: Date) {
  return Boolean(source.updatedAt && source.updatedAt > now.toISOString().slice(0, 10))
}

export function retrieveChatSources(question: string, limit = 5, corpus = getChatCorpus(), now = new Date()): ChatSource[] {
  const terms = getTerms(question)
  // 检索只按模型给出的查询排序；记录是否可用由日期元数据决定，与问法无关。
  const ranked = corpus
    .filter((chunk) => !isFutureSource(chunk, now))
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, question, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.chunk.updatedAt ?? "").localeCompare(a.chunk.updatedAt ?? ""))

  return ranked.slice(0, limit).map((item) => toSource(item.chunk))
}
