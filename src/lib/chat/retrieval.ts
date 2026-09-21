import { getChatCorpus } from "./corpus"
import type { ChatChunk, ChatMessage, ChatSource } from "./types"

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
  // “你知道哪些”“design token”等普通技术提问，不应自动补入个人履历。
  const profileTerms = [
    "志强",
    "林志强",
    "介绍一下你",
    "介绍你自己",
    "自我介绍",
    "你的经历",
    "你的项目",
    "你做过",
    "你开发过",
    "你的工作",
    "你的能力",
    "你的技术栈",
    "和你合作",
    "最近在研究什么",
  ]

  return profileTerms.some((term) => normalized.includes(term))
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

function wantsRecentKnowledge(question: string) {
  return /最近|当前|目前|现在|最新|现阶段/.test(question)
}

function isFutureSource(source: ChatSource, now: Date) {
  return Boolean(source.updatedAt && source.updatedAt > now.toISOString().slice(0, 10))
}

export function retrieveChatSources(question: string, limit = 5, corpus = getChatCorpus(), now = new Date()): ChatSource[] {
  const terms = getTerms(question)
  const preferRecent = wantsRecentKnowledge(question)
  const ranked = corpus
    .filter((chunk) => !preferRecent || !isFutureSource(chunk, now))
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, question, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (preferRecent
      ? (b.chunk.updatedAt ?? "").localeCompare(a.chunk.updatedAt ?? "")
      : 0))

  return ranked.slice(0, limit).map((item) => toSource(item.chunk))
}

export function getDefaultProfileSources(limit = 4, corpus = getChatCorpus()): ChatSource[] {
  return corpus
    .filter((chunk) => chunk.category === "profile")
    .slice(0, limit)
    .map(toSource)
}

export function buildKnowledgeQuery(question: string, messages: ChatMessage[] = []) {
  // 只有代词或承接式追问才补充前文，显式换题时以本轮问题为准。
  if (!/^(那|它|他|这个|这些|该|其中|继续|还有|具体|详细|展开|为什么|怎么)|上面|刚才|前面/.test(question.trim())) return question
  const history = messages.at(-1)?.content.trim() === question.trim() ? messages.slice(0, -1) : messages
  const priorUser = history.findLast((message) => message.role === "user")
  const priorAssistant = history.findLast((message) => message.role === "assistant")
  return [question, priorUser?.content.slice(0, 400), priorAssistant?.content.slice(0, 220)]
    .filter(Boolean).join(" ")
}

export function getChatKnowledgeSources(
  question: string,
  limit = 6,
  messages: ChatMessage[] = [],
  corpus = getChatCorpus(),
  now = new Date()
): ChatSource[] {
  const eligibleCorpus = wantsRecentKnowledge(question) ? corpus.filter((chunk) => !isFutureSource(chunk, now)) : corpus
  const relevantSources = retrieveChatSources(buildKnowledgeQuery(question, messages), limit, eligibleCorpus, now)
  const shouldAddProfileContext = hasProfileIntent(question)

  if (relevantSources.length === 0) {
    return shouldAddProfileContext ? getDefaultProfileSources(Math.min(3, limit), eligibleCorpus) : []
  }

  return uniqueSources([
    ...(shouldAddProfileContext ? getDefaultProfileSources(2, eligibleCorpus) : []),
    ...relevantSources,
  ]).slice(0, limit)
}
