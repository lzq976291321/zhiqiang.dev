import { buildCompanionSystemPrompt } from "@/features/chat/server/companion-persona"
import {
  createDeepSeekCompletionStream,
  createPublicAnswerWriter,
  readCompletionStream,
} from "./answer"
import type { ChatMessage } from "./types"
import type { SendChatEvent } from "./stream"

// 伴侣模式不做资料检索：人格、记忆和当前对话就是全部上下文。
export async function runCompanion({
  messages,
  memory,
  send,
  signal,
  now = new Date(),
  fetcher = fetch,
}: {
  messages: ChatMessage[]
  memory?: unknown
  send: SendChatEvent
  signal: AbortSignal
  now?: Date
  fetcher?: typeof fetch
}) {
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(55_000)])
  send({ type: "meta", mode: "deepseek" })
  send({ type: "sources", sources: [] })

  const writer = createPublicAnswerWriter((content) => send({ type: "delta", content }))
  const response = await createDeepSeekCompletionStream({
    messages: [
      { role: "system", content: buildCompanionSystemPrompt({ memory, now }) },
      ...messages,
    ],
    toolChoice: "none",
    signal: deadline,
    fetcher,
  })
  const completion = await readCompletionStream(response, deadline, writer.push)
  if (completion.toolCalls.length > 0) throw new Error("Companion called an unexpected tool")

  const responseLength = writer.finish()
  if (responseLength === 0 || !completion.content.trim()) throw new Error("Upstream returned an empty answer")
  send({ type: "done" })
  return { responseLength, sourceIds: [] as string[] }
}
