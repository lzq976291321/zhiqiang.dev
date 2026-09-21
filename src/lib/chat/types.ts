export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatSource {
  id: string
  title: string
  path: string
  category: string
  excerpt: string
  updatedAt?: string
}

export interface ChatChunk extends ChatSource {
  text: string
  keywords: string[]
}

export interface ChatResult {
  answer: string
  sources: ChatSource[]
  mode: ChatStreamMode
}

export type ChatStreamMode =
  | "deepseek"
  | "local_fallback"

export type ChatStreamEvent =
  | {
      type: "meta"
      mode: ChatStreamMode
    }
  | {
      type: "sources"
      sources: ChatSource[]
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
