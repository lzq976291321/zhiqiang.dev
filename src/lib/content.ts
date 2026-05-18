import { getMdxFiles } from "./mdx"
import type { AgentArticle, Skill, Prompt, PromptCase, McpServer } from "./types"

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

// ===== Prompts =====
export function getAllPrompts(type?: "prompt-image" | "prompt-video"): Prompt[] {
  const imagePrompts = getMdxFiles("prompts/image").map(
    ({ slug, frontmatter, content }) => ({
      slug,
      title: frontmatter.title ?? "",
      type: "prompt-image" as const,
      scene: frontmatter.scene ?? "",
      platforms: frontmatter.platforms ?? [],
      prompt: frontmatter.prompt ?? "",
      negative: frontmatter.negative,
      tips: frontmatter.tips,
      content,
    })
  )

  const videoPrompts = getMdxFiles("prompts/video").map(
    ({ slug, frontmatter, content }) => ({
      slug,
      title: frontmatter.title ?? "",
      type: "prompt-video" as const,
      scene: frontmatter.scene ?? "",
      platforms: frontmatter.platforms ?? [],
      prompt: frontmatter.prompt ?? "",
      negative: frontmatter.negative,
      tips: frontmatter.tips,
      content,
    })
  )

  const all = [...imagePrompts, ...videoPrompts]
  if (type) return all.filter((p) => p.type === type)
  return all
}

// ===== Prompt Studio =====
export function getAllPromptCases(): PromptCase[] {
  return getMdxFiles("prompt-studio")
    .map(({ slug, frontmatter, content }) => ({
      slug,
      title: frontmatter.title ?? "",
      description: frontmatter.description ?? "",
      mode: frontmatter.mode ?? "image",
      category: frontmatter.category ?? "Creative System",
      useCase: frontmatter.useCase ?? "",
      asset: frontmatter.asset ?? "",
      output: frontmatter.output ?? "",
      modelFit: frontmatter.modelFit ?? [],
      ratio: frontmatter.ratio ?? "16:9",
      difficulty: frontmatter.difficulty ?? "intermediate",
      order: frontmatter.order ?? 999,
      tags: frontmatter.tags ?? [],
      prompt: frontmatter.prompt ?? "",
      negative: frontmatter.negative,
      parameters: frontmatter.parameters ?? [],
      structure: frontmatter.structure ?? [],
      failureModes: frontmatter.failureModes ?? [],
      iterationPrompts: frontmatter.iterationPrompts ?? [],
      shotList: frontmatter.shotList ?? [],
      content,
    }))
    .sort((a, b) => a.order - b.order)
}

export function getPromptCaseBySlug(slug: string): PromptCase | null {
  return getAllPromptCases().find((item) => item.slug === slug) ?? null
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
