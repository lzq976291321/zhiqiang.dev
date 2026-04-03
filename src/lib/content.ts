import { getMdxFiles } from "./mdx"
import type { Skill, Prompt, McpServer } from "./types"

// ===== Skills =====
export function getAllSkills(): Skill[] {
  return getMdxFiles("skills").map(({ slug, frontmatter, content }) => ({
    slug,
    title: frontmatter.title ?? "",
    description: frontmatter.description ?? "",
    roles: frontmatter.roles ?? [],
    source: frontmatter.source ?? "community",
    trigger: frontmatter.trigger ?? "",
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

// ===== MCP =====
export function getAllMcpServers(): McpServer[] {
  return getMdxFiles("mcp").map(({ slug, frontmatter, content }) => ({
    slug,
    title: frontmatter.title ?? "",
    description: frontmatter.description ?? "",
    maintainer: frontmatter.maintainer ?? "",
    tier: frontmatter.tier ?? "recommended",
    installCommand: frontmatter.installCommand ?? "",
    whoNeeds: frontmatter.whoNeeds ?? "",
    content,
  }))
}
