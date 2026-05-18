export interface Skill {
  slug: string
  title: string
  description: string
  roles: string[]
  source: "official" | "community" | "vendor"
  trigger: string
  fit: "core" | "situational" | "watch"
  worth: string
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

export interface PromptCase {
  slug: string
  title: string
  description: string
  mode: "image" | "video"
  category: string
  useCase: string
  asset: string
  output: string
  modelFit: string[]
  ratio: string
  difficulty: "starter" | "intermediate" | "advanced"
  order: number
  tags: string[]
  prompt: string
  negative?: string
  parameters: string[]
  structure: string[]
  failureModes: string[]
  iterationPrompts: string[]
  shotList: string[]
  reference?: {
    title: string
    url: string
    model: string
    source?: string
    sample?: string
    scrapedAt?: string
    media?: Array<{
      type: "image" | "video"
      src: string
      poster?: string
      alt?: string
    }>
  }
  content: string
}

export interface McpServer {
  slug: string
  title: string
  description: string
  maintainer: string
  tier: "essential" | "recommended"
  roles: string[]
  fit: "core" | "situational" | "watch"
  risk: "low" | "medium" | "high"
  worth: string
  installCommand: string
  whoNeeds: string
  content: string
}

export interface AgentArticle {
  slug: string
  title: string
  description: string
  category: string
  series: string
  order: number
  tags: string[]
  date: string
  readTime: string
  level: "foundation" | "practice" | "advanced"
  content: string
}

export type ContentType = "skill" | "prompt-image" | "prompt-video" | "prompt-studio" | "mcp" | "agent"
