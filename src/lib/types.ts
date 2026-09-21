export type KnowledgeStatus = "draft" | "reviewed" | "published"
export type KnowledgeConfidence = "low" | "medium" | "high"

export interface ContentMetadata {
  status?: KnowledgeStatus
  confidence?: KnowledgeConfidence
  date?: string
  updatedAt?: string
}

export interface Skill extends ContentMetadata {
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

export interface McpServer extends ContentMetadata {
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

export interface AgentArticle extends ContentMetadata {
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

export interface KnowledgeEntry extends ContentMetadata {
  slug: string
  id: string
  title: string
  description: string
  tags: string[]
  status: KnowledgeStatus
  confidence: KnowledgeConfidence
  updatedAt: string
  sourceId: string
  publicPath: string
  content: string
}

export type ContentType = "skill" | "mcp" | "agent" | "knowledge"
