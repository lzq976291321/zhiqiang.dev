import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"

process.env.COMPANION_TRIAL_SECRET = "trial-test"
register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const { parseTrialCookie, serializeTrialCookie } = await import("../src/lib/companion/trial-cookie.ts")

test("签名的体验计数可往返，篡改后失效", () => {
  const cookie = serializeTrialCookie(2)
  assert.ok(cookie)
  const value = cookie.split(";")[0].split("=")[1]
  assert.equal(parseTrialCookie(value), 2)

  const [payload, signature] = value.split(".")
  assert.equal(parseTrialCookie(`${payload}.${signature}x`), null)
  const tampered = Buffer.from(Buffer.from(payload, "base64url").toString().replace('"count":2', '"count":0')).toString("base64url")
  assert.equal(parseTrialCookie(`${tampered}.${signature}`), null)
  assert.equal(parseTrialCookie("0"), null)
  assert.equal(parseTrialCookie(""), null)
})

test("过期的计数 cookie 返回空", () => {
  const value = serializeTrialCookie(1).split(";")[0].split("=")[1]
  assert.equal(parseTrialCookie(value, Date.now() + 31 * 24 * 60 * 60 * 1000), null)
})
