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

function hasProfileIntent(question: string) {
  const normalized = normalizeForSearch(question)
  const profileTerms = [
    "你",
    "志强",
    "林志强",
    "开发",
    "经历",
    "项目",
    "能力",
    "合作",
    "技术栈",
    "agent",
    "mcp",
    "skill",
    "skills",
    "design token",
    "design",
    "token",
    "seo",
    "博客",
  ]

  return profileTerms.some((term) => normalized.includes(term))
}

function toSource(chunk: ChatChunk): ChatSource {
  const { id, title, path, category, excerpt } = chunk
  return { id, title, path, category, excerpt }
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

function uniqueSources(sources: ChatSource[]) {
  const seen = new Set<string>()
  const unique: ChatSource[] = []

  for (const source of sources) {
    if (seen.has(source.id)) continue
    seen.add(source.id)
    unique.push(source)
  }

  return unique
}

export function retrieveChatSources(question: string, limit = 5): ChatSource[] {
  const terms = getTerms(question)
  const ranked = getChatCorpus()
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, question, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked.slice(0, limit).map((item) => toSource(item.chunk))
}

export function getDefaultProfileSources(limit = 4): ChatSource[] {
  return getChatCorpus()
    .filter((chunk) => chunk.category === "profile")
    .slice(0, limit)
    .map(toSource)
}

export function getChatKnowledgeSources(question: string, limit = 12): ChatSource[] {
  const relevantSources = retrieveChatSources(question, limit)
  const shouldAddProfileContext = hasProfileIntent(question)

  if (relevantSources.length === 0) {
    return shouldAddProfileContext ? getDefaultProfileSources(Math.min(5, limit)) : []
  }

  return uniqueSources([
    ...relevantSources,
    ...(shouldAddProfileContext ? getDefaultProfileSources(3) : []),
  ]).slice(0, limit)
}
