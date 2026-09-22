import assert from "node:assert/strict"
import { register } from "node:module"
import { test } from "node:test"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const { DEFAULT_SETTINGS, decodeSettings, sanitizeSettings } = await import("../src/features/led-banner/lib/settings.ts")

const designHash = (value) => `#design=${encodeURIComponent(JSON.stringify(value))}`

test("分享链接完整恢复中文、emoji、换行及非默认展示设置", () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    mode: "wedding",
    text: "欢迎来到我们的婚礼 💍\n林 & 陈 · 100% 热爱 #1",
    subtext: "一起走过春夏秋冬 🌸",
    effect: "neon",
    motion: "still",
    color: "#FF68BF",
    gradient: true,
    mirror: true,
    font: "serif",
    teamA: "星光队 ✨",
    teamB: "银河队 🚀",
  }
  assert.deepEqual(decodeSettings(designHash(settings)), settings)
})

test("损坏编码、无效 JSON、错误前缀及过长分享链接不进入设置", () => {
  const invalid = ["", "#templates", "#other=%7B%7D", "#design=%E0%A4%A", "#design=%7B", "#design=undefined"]
  for (const hash of invalid) assert.equal(decodeSettings(hash), null, hash)
  const oversized = designHash({ text: "字".repeat(6000) })
  assert.ok(oversized.length > 45000)
  assert.equal(decodeSettings(oversized), null)
})

test("外部 JSON 的错误类型、非法枚举、数值字符串和 CSS 内容回退到安全默认值", () => {
  const settings = sanitizeSettings(JSON.parse(`{
    "mode":"__proto__", "effect":"<script>", "motion":"diagonal", "font":"url(evil)", "dotShape":"triangle",
    "text":{}, "subtext":[], "teamA":null, "teamB":17,
    "color":"red; background:url(evil)", "background":"#000", "secondaryColor":"#12345678",
    "fontSize":"240", "speed":null, "duration":true,
    "gradient":"false", "mirror":1, "uppercase":{}, "blink":[], "autoFit":null
  }`))
  assert.deepEqual(settings, DEFAULT_SETTINGS)
  for (const invalid of [null, false, 42, "settings", []]) assert.deepEqual(sanitizeSettings(invalid), DEFAULT_SETTINGS)
})

test("只保留允许字段，JSON 原型键和嵌套配置不能污染输出或默认设置", () => {
  const input = JSON.parse('{"text":"保留这句话","unknown":"丢弃","__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"settings":{"color":"#ffffff"}}')
  const defaultsBefore = { ...DEFAULT_SETTINGS }
  const result = sanitizeSettings(input)
  assert.deepEqual(Object.keys(result).sort(), Object.keys(DEFAULT_SETTINGS).sort())
  assert.equal(result.text, "保留这句话")
  assert.equal(Object.getPrototypeOf(result), Object.prototype)
  assert.equal(Object.prototype.hasOwnProperty.call(result, "__proto__"), false)
  assert.equal(Object.prototype.hasOwnProperty.call(result, "constructor"), false)
  assert.equal(result.polluted, undefined)
  assert.equal({}.polluted, undefined)
  result.color = "#ffffff"
  assert.deepEqual(DEFAULT_SETTINGS, defaultsBefore)
})

test("所有可调数值都限制范围，非有限数值不能传入画布，合法小数按整数处理", () => {
  const ranges = { fontSize: [32, 240], speed: [1, 10], glow: [0, 100], letterSpacing: [0, 20], dotSize: [4, 16], duration: [1, 359999] }
  const keys = Object.keys(ranges)
  const fill = (value) => Object.fromEntries(keys.map((key) => [key, value]))
  const low = sanitizeSettings(fill(-Number.MAX_VALUE))
  const high = sanitizeSettings(fill(Number.MAX_VALUE))
  for (const key of keys) {
    assert.equal(low[key], ranges[key][0], `${key} 下限`)
    assert.equal(high[key], ranges[key][1], `${key} 上限`)
  }
  for (const invalid of [NaN, Infinity, -Infinity]) {
    const result = sanitizeSettings(fill(invalid))
    for (const key of keys) assert.equal(result[key], DEFAULT_SETTINGS[key], `${key} 非有限数值`)
  }
  const rounded = sanitizeSettings({ fontSize: 124.6, speed: 4.4, duration: 3.5 })
  assert.equal(rounded.fontSize, 125)
  assert.equal(rounded.speed, 4)
  assert.equal(rounded.duration, 4)
})

test("过长文本和队名受限，截断边界的 emoji 整体移除且分享仍能恢复", () => {
  const settings = sanitizeSettings({
    text: `${"中".repeat(3999)}😀`,
    subtext: `${"欢".repeat(159)}🎉`,
    teamA: `${"星".repeat(31)}🚀`,
    teamB: "银河".repeat(40),
  })
  assert.ok(settings.text.length <= 4000)
  assert.ok(settings.subtext.length <= 160)
  assert.ok(settings.teamA.length <= 32)
  assert.ok(settings.teamB.length <= 32)
  assert.equal(settings.text, "中".repeat(3999))
  assert.equal(settings.subtext, "欢".repeat(159))
  assert.equal(settings.teamA, "星".repeat(31))
  assert.equal(settings.teamB, "银河".repeat(16))
  for (const key of ["text", "subtext", "teamA", "teamB"]) assert.doesNotMatch(settings[key], /[\uD800-\uDBFF]$/)
  assert.doesNotThrow(() => designHash(settings))
  assert.deepEqual(decodeSettings(designHash(settings)), settings)
})
