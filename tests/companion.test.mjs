import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))

// 运行时只校验配置是否存在；测试用假 fetcher，不会发起网络请求。
process.env.DEEPSEEK_API_KEY ??= "test-only-key"

const { buildCompanionSystemPrompt } = await import("../src/features/chat/server/companion-persona.ts")
const { normalizeCompanionMemory, MAX_COMPANION_MEMORY_FACTS, MAX_COMPANION_MEMORY_LENGTH } = await import("../src/lib/chat/companion-memory.ts")
const { runCompanion } = await import("../src/lib/chat/companion.ts")
const { parseChatRequest } = await import("../src/lib/chat/request.ts")

const sse = (content) => new Response(
  `data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: null }] })}\n\n`
  + `data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\n`
  + "data: [DONE]\n\n"
)

test("伴侣提示词包含人格、记忆与安全边界，不继承站点作者身份", () => {
  const prompt = buildCompanionSystemPrompt({
    memory: ["对方养了一只叫豆豆的猫", "对方下个月要面试"],
    now: new Date("2026-10-22T00:00:00Z"),
  })
  assert.match(prompt, /Mori/)
  assert.match(prompt, /豆豆/)
  assert.match(prompt, /下个月要面试/)
  assert.match(prompt, /2026-10-22/)
  assert.match(prompt, /12356/)
  assert.match(prompt, /不是真人/)
  assert.doesNotMatch(prompt, /林志强是网站作者/)
  assert.doesNotMatch(prompt, /search_knowledge|read_knowledge/)
  assert.doesNotMatch(prompt, /sz976291321@gmail\.com/)
  assert.doesNotMatch(prompt, /\/resume/)
})

test("记忆只保留有限条数、长度与可读文本", () => {
  const many = Array.from({ length: 30 }, (_, index) => `第 ${index} 条\u0000记忆`)
  const facts = normalizeCompanionMemory([{ content: "对象形式的记忆" }, ...many, many[0], null, 1])
  assert.equal(facts.length, MAX_COMPANION_MEMORY_FACTS)
  assert.ok(facts.every((fact) => fact.length <= MAX_COMPANION_MEMORY_LENGTH))
  assert.ok(facts.every((fact) => !/[\u0000-\u001f]/.test(fact)))
  assert.ok(facts.includes("对象形式的记忆"))
  assert.equal(normalizeCompanionMemory("not an array").length, 0)
})

test("伴侣请求只接受 companion 模式与受限记忆", async () => {
  const request = new Request("https://example.test/api/chat", {
    method: "POST",
    body: JSON.stringify({
      mode: "companion",
      memory: ["喜欢雨天", { content: "养了猫" }, 42],
      messages: [{ role: "user", content: "在吗" }],
    }),
  })
  const input = await parseChatRequest(request)
  assert.equal(input.mode, "companion")
  assert.deepEqual(input.memory, ["喜欢雨天", "养了猫"])

  const legacy = await parseChatRequest(new Request("https://example.test/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: [{ role: "user", content: "在吗" }] }),
  }))
  assert.equal(legacy.mode, "knowledge")
})

test("伴侣运行时只做一次流式回答，不调用工具，并注入记忆", async () => {
  const send = []
  let body
  const fetcher = async (_url, init) => {
    body = JSON.parse(init.body)
    return sse("我在。今天想从哪儿说起？")
  }
  const result = await runCompanion({
    messages: [{ role: "user", content: "今天有点累" }],
    memory: ["对方不喜欢被追问工作"],
    send: (event) => send.push(event),
    signal: new AbortController().signal,
    fetcher,
  })

  assert.equal(result.responseLength, "我在。今天想从哪儿说起？".length)
  assert.equal(body.tools, undefined)
  assert.equal(body.max_tokens, 1500)
  assert.match(body.messages[0].content, /对方不喜欢被追问工作/)
  assert.equal(body.messages.at(-1).content, "今天有点累")
  assert.deepEqual(send.map((event) => event.type), ["meta", "sources", "delta", "done"])
  assert.match(send[2].content, /想从哪儿说起/)
})
