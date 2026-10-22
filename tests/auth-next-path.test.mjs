import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const { safeNextPath } = await import("../src/lib/auth/next-path.ts")

test("登录回跳只允许站内路径", () => {
  assert.equal(safeNextPath("/chat"), "/chat")
  assert.equal(safeNextPath("/chat?question=hi"), "/chat?question=hi")
  for (const bad of [
    "https://evil.test", "//evil.test", "/\\evil.test", "/chat\nx",
    "", null, undefined, "/".repeat(400),
  ]) {
    assert.equal(safeNextPath(bad), "/chat")
  }
})
