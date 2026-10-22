import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
process.env.DEEPSEEK_API_KEY ??= "test-only-key"

const { normalizeCompanionFacts } = await import("../src/lib/chat/companion-memory.ts")
const { parseCompanionFacts, extractCompanionFacts } = await import("../src/lib/chat/memory-extraction.ts")

test("抽取结果只保留合法类型、去重并限制三条", () => {
  const facts = normalizeCompanionFacts({
    facts: [
      { kind: "preference", content: "喜欢雨天" },
      { kind: "preference", content: "喜欢雨天" },
      { kind: "unknown", content: "忽略" },
      { content: "没有类型" },
      { kind: "event", content: "  下周   面试 " },
      { kind: "person", content: "养了一只叫豆豆的猫" },
      { kind: "boundary", content: "不要提工作" },
    ],
  })
  assert.deepEqual(facts, [
    { kind: "preference", content: "喜欢雨天" },
    { kind: "event", content: "下周 面试" },
    { kind: "person", content: "养了一只叫豆豆的猫" },
  ])
  assert.deepEqual(normalizeCompanionFacts([]), [])
  assert.deepEqual(normalizeCompanionFacts("bad"), [])
})

test("模型返回代码块或数组时仍能解析，坏 JSON 返回空", () => {
  assert.deepEqual(parseCompanionFacts('```json\n{"facts":[{"kind":"ongoing","content":"在准备面试"}]}\n```'), [
    { kind: "ongoing", content: "在准备面试" },
  ])
  assert.deepEqual(parseCompanionFacts('[{"kind":"person","content":"朋友叫阿岚"}]'), [
    { kind: "person", content: "朋友叫阿岚" },
  ])
  assert.deepEqual(parseCompanionFacts("not json"), [])
  assert.deepEqual(parseCompanionFacts('{"facts":[{"kind":"preference","content":"' + "长".repeat(300) + '"}]}')[0].content.length, 240)
})

test("抽取使用非流式请求，空输入不调用模型", async () => {
  let body
  const fetcher = async (_url, init) => {
    body = JSON.parse(init.body)
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"facts":[{"kind":"ongoing","content":"在准备面试"}]}' } }],
    }), { headers: { "content-type": "application/json" } })
  }
  const facts = await extractCompanionFacts({
    userMessage: "我下个月要面试，有点紧张",
    assistantMessage: "紧张很正常，准备到哪一步了？",
    fetcher,
  })
  assert.deepEqual(facts, [{ kind: "ongoing", content: "在准备面试" }])
  assert.equal(body.stream, false)
  assert.equal(body.max_tokens, 300)
  assert.match(body.messages[0].content, /记忆整理器/)

  let called = false
  await extractCompanionFacts({ userMessage: "  ", assistantMessage: "x", fetcher: async () => { called = true; return new Response("") } })
  assert.equal(called, false)
})
