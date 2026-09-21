import type { ChatStreamEvent } from "./types"

export type SendChatEvent = (event: ChatStreamEvent) => void

export function createChatStreamResponse(
  requestSignal: AbortSignal,
  run: (send: SendChatEvent, signal: AbortSignal) => Promise<void>
) {
  const cancellation = new AbortController()
  const encoder = new TextEncoder()
  let closed = false
  let stop: () => void = () => {}

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const close = () => {
        if (closed) return
        closed = true
        controller.close()
      }
      stop = () => {
        cancellation.abort(requestSignal.reason)
        close()
      }
      requestSignal.addEventListener("abort", stop, { once: true })
      if (requestSignal.aborted) stop()
      const send: SendChatEvent = (event) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      void run(send, cancellation.signal)
        .catch(() => {
          if (!cancellation.signal.aborted) send({ type: "error", error: "回答暂时中断，请稍后再试。" })
        })
        .finally(() => {
          requestSignal.removeEventListener("abort", stop)
          close()
        })
    },
    cancel() {
      closed = true
      cancellation.abort(new DOMException("访客已停止回答", "AbortError"))
      requestSignal.removeEventListener("abort", stop)
    },
  })

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  })
}
