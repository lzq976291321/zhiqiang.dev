export interface Post {
  slug: string
  title: string
  date: string
  category: string
  tags: string[]
  description: string
  cover?: string
  content: string
}

export interface Skill {
  slug: string
  title: string
  description: string
  roles: string[]
  source: "official" | "community" | "vendor"
  trigger: string
  installs?: number
  content: string
}

export interface Prompt {
  slug: string
  title: string
  type: "prompt-image" | "prompt-video"
  scene: string
  platforms: string[]
  prompt: string
  negative?: string
  tips?: string
  content: string
}

export interface McpServer {
  slug: string
  title: string
  description: string
  maintainer: string
  tier: "essential" | "recommended"
  installCommand: string
  whoNeeds: string
  content: string
}

// frontmatter 原始类型（解析前）
export type ContentType = "blog" | "skill" | "prompt-image" | "prompt-video" | "mcp"
