import type { ChatMessage } from "./types"

const MAX_QUESTION_LENGTH = 1600
const HISTORY_BUDGET = 8000

export class ChatRequestError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

// 用户输入单独校验；较长的历史回答只缩减上下文，不能阻断下一轮访谈。
export function normalizeChatMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ChatRequestError("请发送一个有效的问题。")
  }

  const messages: ChatMessage[] = value.slice(-24).map((message) => {
    if (
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > 20_000
    ) {
      throw new ChatRequestError("对话内容格式不正确。")
    }
    return { role: message.role, content: message.content.trim() }
  })
  const latest = messages.at(-1)!
  if (latest.role !== "user" || latest.content.length > MAX_QUESTION_LENGTH) {
    throw new ChatRequestError("请发送不超过 1600 字的问题。")
  }

  const selected = [latest]
  let remaining = HISTORY_BUDGET - latest.content.length
  for (let index = messages.length - 2; index >= 0 && selected.length < 12; index -= 1) {
    const message = messages[index]
    const content = message.content.slice(0, 1800)
    if (content.length > remaining) break
    selected.unshift({ ...message, content })
    remaining -= content.length
  }
  while (selected[0]?.role === "assistant") selected.shift()
  return selected
}
