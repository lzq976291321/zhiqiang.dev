import type { ChatMessage, ChatSource } from "@/lib/chat/types"

export interface ConversationMessage extends ChatMessage {
  id: string
  sources?: ChatSource[]
  status?: "streaming" | "complete" | "stopped" | "error"
}

export interface ConversationState {
  messages: ConversationMessage[]
  draft: string
}

interface ConversationStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

export const CONVERSATION_STORAGE_KEY = "zhiqiang-chat-conversation-v1"
const MAX_MESSAGES = 80
const MAX_CONTENT_LENGTH = 20_000
const MAX_TOTAL_CONTENT_LENGTH = 120_000
const MAX_SNAPSHOT_LENGTH = 300_000
const MAX_DRAFT_LENGTH = 1600

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

function text(value: unknown, limit: number): string | undefined {
  return typeof value === "string" ? value.slice(0, limit) : undefined
}

function publicSource(value: unknown): ChatSource | undefined {
  if (!record(value) || typeof value.path !== "string" || value.path.length > 500) return
  if (!/^\/(?:agent|knowledge)\/[^/?#\\\s]+$/.test(value.path)) return
  try {
    const slug = decodeURIComponent(value.path.split("/")[2])
    if (!slug || slug === "." || slug === ".." || /[/\\\s\u0000-\u001f]/.test(slug)) return
  } catch {
    return
  }
  const id = text(value.id, 160)
  const title = text(value.title, 300)
  const category = text(value.category, 80)
  const excerpt = text(value.excerpt, 2000)
  if (!id || !title || category === undefined || excerpt === undefined) return
  return {
    id, title, path: value.path, category, excerpt,
    ...(typeof value.updatedAt === "string" ? { updatedAt: value.updatedAt.slice(0, 80) } : {}),
  }
}

function cleanState(value: unknown, restoring: boolean): ConversationState {
  if (!record(value)) return { messages: [], draft: "" }
  const candidates = Array.isArray(value.messages) ? value.messages.slice(-MAX_MESSAGES) : []
  const messages: ConversationMessage[] = []
  const ids = new Set<string>()
  let totalLength = 0

  // 从最近的消息开始保留，超过上限时只舍弃较早的完整消息。
  for (const candidate of candidates.toReversed()) {
    if (!record(candidate) || typeof candidate.id !== "string" || !/^[\w-]{1,100}$/.test(candidate.id)) continue
    if (ids.has(candidate.id) || (candidate.role !== "user" && candidate.role !== "assistant")) continue
    if (typeof candidate.content !== "string" || (candidate.role === "user" && !candidate.content.trim())) continue
    const content = candidate.content.slice(0, MAX_CONTENT_LENGTH)
    if (totalLength + content.length > MAX_TOTAL_CONTENT_LENGTH) break
    let status: ConversationMessage["status"]
    if (candidate.role === "assistant") {
      if (candidate.status === "streaming") status = restoring ? "stopped" : "streaming"
      else if (candidate.status === "complete" || candidate.status === "stopped" || candidate.status === "error") status = candidate.status
      else status = "complete"
    }
    const sources = candidate.role === "assistant" && Array.isArray(candidate.sources)
      ? candidate.sources.slice(0, 4).map(publicSource).filter((source): source is ChatSource => !!source)
      : []
    messages.unshift({
      id: candidate.id, role: candidate.role, content,
      ...(status ? { status } : {}),
      ...(sources.length ? { sources } : {}),
    })
    ids.add(candidate.id)
    totalLength += content.length
  }
  while (messages[0]?.role === "assistant") messages.shift()
  return { messages, draft: text(value.draft, MAX_DRAFT_LENGTH) ?? "" }
}

export function parseConversationState(raw: string | null): ConversationState {
  if (!raw || raw.length > MAX_SNAPSHOT_LENGTH) return { messages: [], draft: "" }
  try {
    const value: unknown = JSON.parse(raw)
    if (!record(value) || value.version !== 1) return { messages: [], draft: "" }
    return cleanState(value, true)
  } catch {
    return { messages: [], draft: "" }
  }
}

export function serializeConversationState(state: ConversationState): string {
  const clean = cleanState(state, false)
  let serialized = JSON.stringify({ version: 1, ...clean })
  // 大量引用或需要 JSON 转义的正文也不能挤满当前标签页的存储空间。
  while (serialized.length > MAX_SNAPSHOT_LENGTH && clean.messages.length) {
    clean.messages.shift()
    while (clean.messages[0]?.role === "assistant") clean.messages.shift()
    serialized = JSON.stringify({ version: 1, ...clean })
  }
  return serialized
}

function browserStorage(): ConversationStorage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.sessionStorage
  } catch {
    return undefined
  }
}

export function readConversationState(storage = browserStorage()): ConversationState {
  try {
    return parseConversationState(storage?.getItem(CONVERSATION_STORAGE_KEY) ?? null)
  } catch {
    return { messages: [], draft: "" }
  }
}

export function clearConversationState(storage = browserStorage()): void {
  try {
    storage?.removeItem(CONVERSATION_STORAGE_KEY)
  } catch {
    // 隐私模式或容量限制不影响本次对话继续使用。
  }
}

export function writeConversationState(state: ConversationState, storage = browserStorage()): void {
  if (!state.messages.length && !state.draft) {
    clearConversationState(storage)
    return
  }
  try {
    storage?.setItem(CONVERSATION_STORAGE_KEY, serializeConversationState(state))
  } catch {
    // 存储不可用时仍保留页面内状态。
  }
}
