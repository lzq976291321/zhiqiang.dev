export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export type ChatClassification =
  | "allowed_dev"
  | "privacy_blocked"
  | "unknown_or_uncovered"

export interface ChatSource {
  id: string
  title: string
  path: string
  category: string
  excerpt: string
}

export interface ChatChunk extends ChatSource {
  text: string
  keywords: string[]
}

export interface ChatResult {
  answer: string
  classification: ChatClassification
  sources: ChatSource[]
  mode: ChatStreamMode
}

export type ChatStreamMode =
  | "deepseek"
  | "local_fallback"
  | "blocked"
  | "uncovered"

export type ChatStreamEvent =
  | {
      type: "meta"
      classification: ChatClassification
      sources: ChatSource[]
      mode: ChatStreamMode
    }
  | {
      type: "delta"
      content: string
    }
  | {
      type: "done"
    }
  | {
      type: "error"
      error: string
    }
