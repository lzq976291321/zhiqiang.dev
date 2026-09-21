import { getMdxFiles } from "@/lib/mdx"
import { getAllKnowledgeEntries } from "@/lib/content"
import type { ChatChunk } from "./types"

let cachedChatCorpus: ChatChunk[] | null = null

export function isPublicKnowledge(data: { status?: unknown; confidence?: unknown }) {
  return (data.status === undefined || data.status === "published") && data.confidence !== "low"
}

function sourceDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isFinite(value.getTime())) return undefined
  const date = value instanceof Date ? value.toISOString().slice(0, 10) : value
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined
  const parsed = new Date(`${date}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : undefined
}

function normalizeText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^>\s*source id:\s*`[^`]+`\s*$/gim, " ")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[>#*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function excerpt(text: string, maxLength = 260) {
  const normalized = normalizeText(text)
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trim()}...`
    : normalized
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[`"'：:，,。.!?？/\\]/g, " ")
    .trim()
    .replace(/\s+/g, "-")

  return slug || "section"
}

function extractSourceId(text: string, fallback: string) {
  const match = text.match(/source id:\s*`([^`]+)`/i)
  return match?.[1] ?? fallback
}

function splitMarkdownSections(content: string) {
  const sections: Array<{ heading: string; body: string }> = []
  let heading = "Overview"
  let body: string[] = []

  for (const line of content.split("\n")) {
    const match = line.match(/^#{1,3}\s+(.+)$/)
    if (match && body.length > 0) {
      sections.push({ heading, body: body.join("\n") })
      heading = match[1]
      body = [line]
      continue
    }

    if (match) heading = match[1]
    body.push(line)
  }

  if (body.length > 0) {
    sections.push({ heading, body: body.join("\n") })
  }

  return sections
}

function chunkMarkdown({
  content,
  sourceBaseId,
  title,
  path: sourcePath,
  category,
  keywords = [],
  updatedAt,
}: {
  content: string
  sourceBaseId: string
  title: string
  path: string
  category: string
  keywords?: string[]
  updatedAt?: unknown
}): ChatChunk[] {
  return splitMarkdownSections(content)
    .map((section) => {
      const text = normalizeText(section.body)
      const id = extractSourceId(section.body, `${sourceBaseId}.${slugify(section.heading)}`)

      return {
        id,
        title: section.heading === "Overview" ? title : section.heading,
        path: sourcePath,
        category,
        excerpt: excerpt(text),
        text,
        keywords: [title, section.heading, category, sourcePath, ...keywords],
        updatedAt: sourceDate(updatedAt),
      }
    })
    .filter((chunk) => chunk.text.length > 40)
}

function readProfileChunks() {
  return getMdxFiles("profile")
    .flatMap(({ frontmatter: data, content }) => {
      if (!isPublicKnowledge(data)) return []

      return chunkMarkdown({
        content,
        sourceBaseId: data.sourceId ?? "profile",
        title: data.title ?? "开发侧公开 Profile",
        path: data.publicPath ?? "/chat#profile",
        category: "profile",
        updatedAt: data.updatedAt ?? data.date,
        keywords: [
          "开发侧",
          "公开资料",
          "合作",
          "技术栈",
          ...(Array.isArray(data.keywords) ? data.keywords : []),
        ],
      })
    })
}

function readKnowledgeChunks() {
  return getAllKnowledgeEntries()
    .filter((entry) => entry.status === "published" && isPublicKnowledge(entry))
    .flatMap((entry) =>
      chunkMarkdown({
        content: [
          entry.description,
          `标签：${entry.tags.join("、")}`,
          entry.content,
        ].join("\n\n"),
        sourceBaseId: entry.sourceId,
        title: entry.title,
        path: `/knowledge/${entry.slug}`,
        category: "knowledge",
        updatedAt: entry.updatedAt || entry.date,
        keywords: [
          entry.id,
          entry.confidence,
          ...entry.tags,
        ],
      })
    )
}

export function getChatCorpus(): ChatChunk[] {
  if (cachedChatCorpus && process.env.NODE_ENV === "production") return cachedChatCorpus

  cachedChatCorpus = [
    ...readProfileChunks(),
    ...readKnowledgeChunks(),
  ]

  return cachedChatCorpus
}
