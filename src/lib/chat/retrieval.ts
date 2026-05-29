import { getChatCorpus } from "./corpus"
import type { ChatChunk, ChatSource } from "./types"

const categoryKeywords: Record<string, string[]> = {
  profile: ["林志强", "介绍", "会什么", "能做什么", "擅长", "技术栈", "能力", "合作", "简历", "履历", "工作经历", "项目经历", "经历", "适合"],
  agent: ["agent", "智能体", "claude", "工具", "上下文", "验证", "权限", "执行"],
  skills: ["skill", "skills", "技能", "触发", "长期启用", "角色"],
  mcp: ["mcp", "server", "权限", "工具", "接入", "风险"],
}

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
  const { id, title, path, category, excerpt } = chunk
  return { id, title, path, category, excerpt }
}

function scoreChunk(chunk: ChatChunk, question: string, terms: string[]) {
  const query = normalizeForSearch(question)
  const text = normalizeForSearch(`${chunk.title} ${chunk.keywords.join(" ")} ${chunk.text}`)
  const title = normalizeForSearch(`${chunk.title} ${chunk.keywords.join(" ")}`)
  const isProfileIntent = /你|他|林志强|会什么|能做什么|擅长|能力|技术栈|合作|适合|简历|履历|工作经历|项目经历|经历|介绍/.test(question)
  const capabilityIntent = /你会什么|会什么|能做什么|可以做什么|你能做什么|你擅长什么|擅长什么|有什么能力|能帮我做什么|能提供什么/.test(question)
  let score = 0

  if (query.length >= 4 && text.includes(query)) score += 12

  for (const term of terms) {
    if (title.includes(term)) score += 5
    if (text.includes(term)) score += 2
  }

  for (const keyword of categoryKeywords[chunk.category] ?? []) {
    if (question.toLowerCase().includes(keyword.toLowerCase())) score += 4
  }

  if (chunk.category === "profile") score += isProfileIntent ? 10 : 1
  if (chunk.id === "profile.dev_intro" && /介绍|是谁|做什么|林志强|你|他|会什么|能做什么/.test(question)) score += 14
  if (chunk.id === "profile.identity" && /介绍|是谁|身份|林志强|你|他/.test(question)) score += 10
  if (chunk.id === "profile.resume_summary" && /简历|履历|经历|工作|项目/.test(question)) score += 14
  if (chunk.id === "profile.work_experience" && /工作经历|履历|经历|公司|任职|工作/.test(question)) score += 16
  if (chunk.id === "profile.resume_projects" && /项目经历|项目|作品|做过/.test(question)) score += 14
  if (chunk.id === "profile.core_strengths" && (/优势|能力|擅长|强项/.test(question) || capabilityIntent)) score += 16
  if (chunk.id === "profile.stack" && capabilityIntent) score += 14
  if (chunk.id === "profile.collaboration" && capabilityIntent) score += 12
  if (chunk.id === "profile.video_editor" && /视频|编辑器|前端架构|架构/.test(question)) score += 12
  if (chunk.id === "profile.seo_content" && /seo|内容|多语言|落地页|landing/i.test(question)) score += 12
  if (chunk.id === "profile.agent" && /agent|智能体/i.test(question)) score += 12
  if (chunk.id === "profile.design_lab" && /design token|design lab|设计/i.test(question)) score += 12
  if (chunk.id === "profile.stack" && /技术栈|常用|react|next|typescript/i.test(question)) score += 12
  if (chunk.id === "profile.collaboration" && /合作|适合|项目|方向/.test(question)) score += 12

  return score
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
