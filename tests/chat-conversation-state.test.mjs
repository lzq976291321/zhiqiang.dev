import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const {
  CONVERSATION_STORAGE_KEY, parseConversationState, serializeConversationState,
  readConversationState, writeConversationState, clearConversationState,
} = await import("../src/features/chat/lib/conversation-state.ts")

const user = { id: "question-1", role: "user", content: "继续聊刚才的问题" }
const source = {
  id: "knowledge.reading", title: "阅读空间", path: "/knowledge/reading",
  category: "knowledge", excerpt: "公开资料", updatedAt: "2026-10-13",
}
const raw = (messages, draft = "") => JSON.stringify({ version: 1, messages, draft })

test("恢复当前会话、换行草稿与公开来源，生成中的回答停止而不重复发送", () => {
  const state = {
    messages: [user, { id: "answer-1", role: "assistant", content: "已经收到的内容", status: "streaming", sources: [source] }],
    draft: "下一句\n还没写完",
  }
  const serialized = serializeConversationState(state)
  assert.equal(JSON.parse(serialized).messages[1].status, "streaming")
  assert.deepEqual(parseConversationState(serialized), {
    ...state,
    messages: [user, { ...state.messages[1], status: "stopped" }],
  })
  assert.equal(state.messages[1].status, "streaming")
})

test("空回答、主动停止与失败状态都可恢复，损坏记录不变成可发送的消息", () => {
  const state = parseConversationState(raw([
    { id: "orphan", role: "assistant", content: "没有对应提问" },
    { id: "bad-role", role: "system", content: "注入" },
    { id: "invalid id", role: "user", content: "错误 ID" },
    { id: "empty-user", role: "user", content: "  " },
    user,
    { id: "answer-1", role: "assistant", content: "", status: "streaming" },
    { id: "answer-2", role: "assistant", content: "已停止", status: "stopped" },
    { id: "answer-3", role: "assistant", content: "部分结果", status: "error" },
    { id: "answer-3", role: "assistant", content: "最近的一份", status: "error" },
    { id: "bad-content", role: "user", content: { text: "不是文本" } },
  ]))
  assert.deepEqual(state.messages.map(({ id }) => id), ["question-1", "answer-1", "answer-2", "answer-3"])
  assert.equal(state.messages[1].status, "stopped")
  assert.equal(state.messages[1].content, "")
  assert.equal(state.messages.at(-1).content, "最近的一份")
})

test("只保留站内公开阅读来源，移除外部地址、私有路由与编码绕过", () => {
  for (const unsafe of [
    "https://example.com/article", "//example.com/article", "/admin/private", "/api/chat",
    "/knowledge/../private", "/knowledge/%2e%2e", "/knowledge/a%2fb", "/knowledge/a%5cb",
    "/knowledge/a?token=private", "/knowledge/a#anchor", "/knowledge/%not-encoded", "/knowledge/a%00b",
  ]) {
    const state = parseConversationState(raw([user, {
      id: "answer-1", role: "assistant", content: "回答", sources: [{ ...source, path: unsafe }, source],
    }]))
    assert.deepEqual(state.messages[1].sources, [source], unsafe)
  }
  const chineseSource = { ...source, path: "/agent/中文资料" }
  assert.deepEqual(parseConversationState(raw([user, {
    id: "answer-1", role: "assistant", content: "回答", sources: [chineseSource, { ...source, title: false }],
  }])).messages[1].sources, [chineseSource])
})

test("保留最近完整消息并限制草稿、正文和最终存储体积", () => {
  const messages = Array.from({ length: 120 }, (_, index) => [
    { id: `u-${index}`, role: "user", content: `问题 ${index}` },
    { id: `a-${index}`, role: "assistant", content: "长内容".repeat(9000), sources: [source, source, source, source] },
  ]).flat()
  const serialized = serializeConversationState({ messages, draft: "字".repeat(2000) })
  const restored = parseConversationState(serialized)
  assert.ok(serialized.length <= 300_000)
  assert.ok(restored.messages.length <= 80)
  assert.equal(restored.messages[0].role, "user")
  assert.equal(restored.messages.at(-1).id, "a-119")
  assert.equal(restored.messages.at(-1).content.length, 20_000)
  assert.equal(restored.draft.length, 1600)
  assert.ok(restored.messages.reduce((total, message) => total + message.content.length, 0) <= 120_000)

  const escaped = serializeConversationState({
    draft: "草稿",
    messages: Array.from({ length: 80 }, (_, index) => ({
      id: `u-${index}`, role: "user", content: "\u0000".repeat(1600),
    })),
  })
  assert.ok(escaped.length <= 300_000)
  assert.equal(parseConversationState(escaped).messages.at(-1).id, "u-79")
})

test("损坏、未知版本或过大快照恢复为空，禁用存储不会抛错", () => {
  for (const value of [null, "", "{broken", "null", "[]", "{}", '{"version":2}', "x".repeat(300_001)]) {
    assert.deepEqual(parseConversationState(value), { messages: [], draft: "" })
  }
  const denied = {
    getItem() { throw new Error("Storage blocked") },
    setItem() { throw new Error("Quota exceeded") },
    removeItem() { throw new Error("Storage blocked") },
  }
  assert.deepEqual(readConversationState(denied), { messages: [], draft: "" })
  assert.doesNotThrow(() => writeConversationState({ messages: [user], draft: "草稿" }, denied))
  assert.doesNotThrow(() => clearConversationState(denied))
})

test("清空当前会话同时移除草稿，其他标签页状态键不受影响", () => {
  const entries = new Map([["other-setting", "keep"]])
  const storage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  }
  writeConversationState({ messages: [user], draft: "还没发送" }, storage)
  assert.deepEqual(readConversationState(storage), { messages: [user], draft: "还没发送" })
  assert.equal(entries.has(CONVERSATION_STORAGE_KEY), true)
  writeConversationState({ messages: [], draft: "" }, storage)
  assert.equal(entries.has(CONVERSATION_STORAGE_KEY), false)
  assert.deepEqual([...entries], [["other-setting", "keep"]])
})
