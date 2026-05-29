import fs from "fs"
import path from "path"
import matter from "gray-matter"
import {
  getAllAgentArticles,
  getAllMcpServers,
  getAllSkills,
} from "@/lib/content"
import type { ChatChunk } from "./types"

const contentDir = path.join(process.cwd(), "src/content")

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
}: {
  content: string
  sourceBaseId: string
  title: string
  path: string
  category: string
  keywords?: string[]
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
      }
    })
    .filter((chunk) => chunk.text.length > 40)
}

function readProfileChunks() {
  const filePath = path.join(contentDir, "profile/dev-profile.md")
  if (!fs.existsSync(filePath)) return []

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return chunkMarkdown({
    content,
    sourceBaseId: data.sourceId ?? "profile",
    title: data.title ?? "开发侧公开 Profile",
    path: "/chat#profile",
    category: "profile",
    keywords: ["林志强", "开发侧", "公开资料", "合作", "技术栈"],
  })
}

function readAgentChunks() {
  return getAllAgentArticles().flatMap((article) =>
    chunkMarkdown({
      content: `${article.description}\n\n${article.content}`,
      sourceBaseId: `agent.${article.slug}`,
      title: article.title,
      path: `/agent/${article.slug}`,
      category: "agent",
      keywords: [
        article.series,
        article.category,
        article.level,
        ...article.tags,
      ],
    })
  )
}

function readSkillChunks() {
  return getAllSkills().flatMap((skill) =>
    chunkMarkdown({
      content: [
        skill.description,
        `触发：${skill.trigger}`,
        `价值判断：${skill.worth}`,
        skill.content,
      ].join("\n\n"),
      sourceBaseId: `skill.${skill.slug}`,
      title: skill.title,
      path: "/skills",
      category: "skills",
      keywords: [skill.fit, skill.source, ...skill.roles],
    })
  )
}

function readMcpChunks() {
  return getAllMcpServers().flatMap((server) =>
    chunkMarkdown({
      content: [
        server.description,
        `适合人群：${server.whoNeeds}`,
        `价值判断：${server.worth}`,
        `风险：${server.risk}`,
        server.content,
      ].join("\n\n"),
      sourceBaseId: `mcp.${server.slug}`,
      title: server.title,
      path: "/mcp",
      category: "mcp",
      keywords: [server.maintainer, server.fit, server.tier, server.risk, ...server.roles],
    })
  )
}

export function getChatCorpus(): ChatChunk[] {
  return [
    ...readProfileChunks(),
    ...readAgentChunks(),
    ...readSkillChunks(),
    ...readMcpChunks(),
  ]
}
