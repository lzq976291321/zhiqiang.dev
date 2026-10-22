import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
process.env.COMPANION_TRIAL_SECRET = "trial-test"

const { POST } = await import("../src/app/api/chat/route.ts")
const { serializeTrialCookie } = await import("../src/lib/companion/trial-cookie.ts")

const post = (body, headers = {}) => POST(new Request("https://example.test/api/chat", {
  method: "POST",
  headers,
  body: JSON.stringify(body),
}))

test("匿名请求缺少会话标识时直接返回 401，不调用模型", async () => {
  const response = await post({ messages: [{ role: "user", content: "你好" }] })
  assert.equal(response.status, 401)
  const payload = await response.json()
  assert.equal(payload.code, "login_required")
})

test("有会话标识但没有进入聊天页的计数 cookie 时返回 401", async () => {
  const response = await post({ sessionId: "direct-api", messages: [{ role: "user", content: "你好" }] })
  assert.equal(response.status, 401)
})

test("签名 cookie 已到 2 轮时，直接请求接口返回 401", async () => {
  const cookie = serializeTrialCookie(2)?.split(";")[0]
  const response = await post({ sessionId: "direct-api", messages: [{ role: "user", content: "你好" }] }, { cookie })
  assert.equal(response.status, 401)
  assert.equal((await response.json()).code, "login_required")
})

test("资料问答模式不再对外公开", async () => {
  const response = await post({ mode: "knowledge", messages: [{ role: "user", content: "你好" }] })
  assert.equal(response.status, 404)
})
