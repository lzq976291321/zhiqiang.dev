import { getMdxFiles } from "./mdx"
import type {
  AgentArticle,
  KnowledgeConfidence,
  KnowledgeEntry,
  KnowledgeStatus,
  McpServer,
  Skill,
} from "./types"

function getKnowledgeStatus(value: unknown): KnowledgeStatus {
  if (value === "draft" || value === "reviewed" || value === "published") return value
  return "draft"
}

function getKnowledgeConfidence(value: unknown): KnowledgeConfidence {
  if (value === "low" || value === "medium" || value === "high") return value
  return "medium"
}

// ===== Skills =====
export function getAllSkills(): Skill[] {
  return getMdxFiles("skills").map(({ slug, frontmatter, content }) => ({
    slug,
    title: frontmatter.title ?? "",
    description: frontmatter.description ?? "",
    roles: frontmatter.roles ?? [],
    source: frontmatter.source ?? "community",
    trigger: frontmatter.trigger ?? "",
    fit: frontmatter.fit ?? "situational",
    worth: frontmatter.worth ?? "当你的角色和触发场景匹配时再启用，不建议长期全局加载。",
    installs: frontmatter.installs,
    content,
  }))
}

export function getSkillsByRole(role: string): Skill[] {
  return getAllSkills().filter((s) => s.roles.includes(role))
}

// ===== MCP =====
export function getAllMcpServers(): McpServer[] {
  return getMdxFiles("mcp").map(({ slug, frontmatter, content }) => ({
    slug,
    title: frontmatter.title ?? "",
    description: frontmatter.description ?? "",
    maintainer: frontmatter.maintainer ?? "",
    tier: frontmatter.tier ?? "recommended",
    roles: frontmatter.roles ?? [],
    fit: frontmatter.fit ?? "situational",
    risk: frontmatter.risk ?? "medium",
    worth: frontmatter.worth ?? "按项目启用。先确认权限范围，再决定是否长期保留。",
    installCommand: frontmatter.installCommand ?? "",
    whoNeeds: frontmatter.whoNeeds ?? "",
    content,
  }))
}

// ===== Agent Engineering =====
export function getAllAgentArticles(): AgentArticle[] {
  return getMdxFiles("agent")
    .map(({ slug, frontmatter, content }) => ({
      slug,
      title: frontmatter.title ?? "",
      description: frontmatter.description ?? "",
      category: frontmatter.category ?? "Agent 设计原则",
      series: frontmatter.series ?? "Agent Engineering",
      order: frontmatter.order ?? 999,
      tags: frontmatter.tags ?? [],
      date: frontmatter.date ?? "",
      readTime: frontmatter.readTime ?? "5 min",
      level: frontmatter.level ?? "foundation",
      content,
    }))
    .sort((a, b) => a.order - b.order)
}

export function getAgentArticleBySlug(slug: string): AgentArticle | null {
  return getAllAgentArticles().find((article) => article.slug === slug) ?? null
}

export function getAgentCategories(): string[] {
  return Array.from(new Set(getAllAgentArticles().map((article) => article.category)))
}

// ===== Knowledge =====
export function getAllKnowledgeEntries(): KnowledgeEntry[] {
  return getMdxFiles("knowledge")
    .map(({ slug, frontmatter, content }) => ({
      slug,
      id: frontmatter.id ?? slug,
      title: frontmatter.title ?? "",
      description: frontmatter.description ?? "",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      status: getKnowledgeStatus(frontmatter.status),
      confidence: getKnowledgeConfidence(frontmatter.confidence),
      updatedAt: frontmatter.updatedAt ?? "",
      sourceId: frontmatter.sourceId ?? `knowledge.${slug}`,
      publicPath: frontmatter.publicPath ?? "/chat#knowledge",
      content,
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
}
