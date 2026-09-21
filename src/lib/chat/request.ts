import { ChatRequestError, normalizeChatMessages } from "./messages"

export { ChatRequestError, normalizeChatMessages } from "./messages"

const MAX_BODY_BYTES = 64_000

export async function parseChatRequest(request: Request) {
  const contentLength = Number(request.headers.get("content-length"))
  if (contentLength > MAX_BODY_BYTES) throw new ChatRequestError("对话内容太长，请开启新的访谈。", 413)
  if (!request.body) throw new ChatRequestError("请发送一个有效的问题。")

  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ""
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel()
        throw new ChatRequestError("对话内容太长，请开启新的访谈。", 413)
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(text)
  } catch {
    throw new ChatRequestError("请求内容不是有效 JSON。")
  }
  if (!body || typeof body !== "object") throw new ChatRequestError("请求内容格式不正确。")
  return {
    messages: normalizeChatMessages(body.messages),
    sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : undefined,
  }
}
