import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const { consumeAnonymousTrial, trialKey, ANONYMOUS_TRIAL_LIMIT } = await import("../src/lib/companion/trial.ts")

const admin = (result) => ({
  rpc: async (name, args) => {
    assert.equal(name, "consume_companion_trial")
    assert.equal(args.p_key, trialKey("session-1"))
    return result
  },
})

test("匿名体验计数按数据库返回值递增", async () => {
  assert.equal(ANONYMOUS_TRIAL_LIMIT, 2)
  for (const rounds of [1, 2, 3]) {
    const result = await consumeAnonymousTrial("session-1", admin({ data: rounds, error: null }))
    assert.equal(result.rounds, rounds)
  }
  const stringRounds = await consumeAnonymousTrial("session-1", admin({ data: "4", error: null }))
  assert.equal(stringRounds.rounds, 4)
})

test("计数失败时向上抛出，由调用方用签名 cookie 兜底", async () => {
  await assert.rejects(() => consumeAnonymousTrial("session-1", admin({ data: null, error: { message: "offline" } })))
  await assert.rejects(() => consumeAnonymousTrial("session-1", null))
  await assert.rejects(() => consumeAnonymousTrial("session-1", admin({ data: "bad", error: null })))
})

test("trialKey 稳定且不保存原始 session", () => {
  const key = trialKey("abc")
  assert.match(key, /^[0-9a-f]{64}$/)
  assert.notEqual(key, "abc")
  assert.equal(key, trialKey("abc"))
})
