import assert from "node:assert/strict"
import { register } from "node:module"
import { afterEach, test } from "node:test"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const {
  DEFAULT_READER_PREFERENCES,
  readReadingProgress,
  readLastReading,
  saveReadingProgress,
  readReaderPreferences,
  saveReaderPreferences,
} = await import("../src/features/knowledge/lib/reading-state.ts")

const progressKey = "knowledge-reading-progress-v1"
const preferencesKey = "knowledge-reader-preferences-v1"
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
afterEach(() => {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow)
  else delete globalThis.window
})

function browser() {
  const data = new Map()
  const events = []
  globalThis.window = {
    localStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
    },
    dispatchEvent: (event) => { events.push(event.type); return true },
  }
  return { data, events }
}

function progress(overrides = {}) {
  return {
    href: "/knowledge/pi-book-chapter-1",
    title: "第一章 · 起点",
    percent: 42.5,
    anchor: "读到这里",
    offset: -72.5,
    scrollY: 840.5,
    updatedAt: 1_792_000_000_000,
    ...overrides,
  }
}

test("保存后可继续最近章节，每章位置独立且只通知成功的写入", () => {
  const { events } = browser()
  const first = progress()
  const second = progress({ href: "/knowledge/pi-book-chapter-2", updatedAt: first.updatedAt + 1 })
  saveReadingProgress(first)
  saveReadingProgress(second)
  assert.deepEqual(readReadingProgress(first.href), first)
  assert.deepEqual(readReadingProgress(second.href), second)
  assert.deepEqual(readLastReading(), second)
  const resumed = { ...first, percent: 70, updatedAt: second.updatedAt + 1 }
  saveReadingProgress(resumed)
  assert.deepEqual(readLastReading(), resumed)
  assert.deepEqual(readReadingProgress(second.href), second)
  assert.deepEqual(events, ["reading-progress", "reading-progress", "reading-progress"])
})

test("仅保留最近 80 章，重复保存同一章不会占用额外位置", () => {
  const { data } = browser()
  for (let i = 0; i < 85; i++) {
    saveReadingProgress(progress({ href: `/knowledge/chapter-${i}`, updatedAt: i }))
  }
  assert.equal(readReadingProgress("/knowledge/chapter-4"), null)
  assert.equal(readReadingProgress("/knowledge/chapter-5").updatedAt, 5)
  saveReadingProgress(progress({ href: "/knowledge/chapter-5", updatedAt: 100 }))
  assert.equal(readLastReading().href, "/knowledge/chapter-5")
  assert.equal(JSON.parse(data.get(progressKey)).entries.length, 80)
})

test("损坏 JSON、错误版本和无效结构返回空进度", () => {
  const { data } = browser()
  for (const raw of ["{", "null", "[]", "false", "42", "{}", '{"version":2,"entries":[]}', '{"version":1,"entries":{}}']) {
    data.set(progressKey, raw)
    assert.equal(readLastReading(), null, raw)
    assert.equal(readReadingProgress(progress().href), null, raw)
  }
})

test("外部存储的非法字段和非本站章节路径被丢弃，合法章节仍能恢复", () => {
  const { data, events } = browser()
  const invalid = [
    ...["https://evil.example/knowledge/x", "//evil.example/x", "/knowledge", "/knowledge/../x", "/knowledge/x/y", "/knowledge/%2f%2fevil", "/knowledge/x?next=evil", "/knowledge/x#heading", "javascript:alert(1)"].map((href) => progress({ href })),
    progress({ title: "" }), progress({ title: {} }), progress({ anchor: [] }), progress({ anchor: "\u0000" }),
    progress({ percent: "50" }), progress({ percent: -1 }), progress({ percent: 101 }),
    progress({ offset: null }), progress({ scrollY: -1 }), progress({ updatedAt: "100" }), progress({ updatedAt: 2.5 }),
  ]
  for (const entry of invalid) saveReadingProgress(entry)
  assert.equal(data.size, 0)
  assert.equal(events.length, 0)
  data.set(progressKey, JSON.stringify({ version: 1, entries: [...invalid, progress()] }))
  assert.deepEqual(readLastReading(), progress())
  for (const value of [NaN, Infinity, -Infinity]) {
    for (const field of ["percent", "offset", "scrollY", "updatedAt"]) {
      saveReadingProgress(progress({ [field]: value }))
    }
  }
  assert.equal(events.length, 0)
})

test("同一章的旧记录和未知字段不会覆盖最新位置", () => {
  const { data } = browser()
  const latest = progress({ updatedAt: 20 })
  data.set(progressKey, JSON.stringify({ version: 1, entries: [
    progress({ updatedAt: 1, percent: 1 }),
    { ...latest, unknown: "discard", __proto__: { polluted: true } },
  ] }))
  assert.deepEqual(readLastReading(), latest)
  assert.deepEqual(readReadingProgress(latest.href), latest)
  assert.equal({}.polluted, undefined)
})

test("阅读主题与字号往返保存，错误字段分别回到默认值", () => {
  const { data } = browser()
  assert.deepEqual(readReaderPreferences(), { theme: "light", fontSize: 18 })
  for (const theme of ["light", "warm", "dark"]) {
    for (const fontSize of [16, 18, 20, 22]) {
      saveReaderPreferences({ theme, fontSize })
      assert.deepEqual(readReaderPreferences(), { theme, fontSize })
    }
  }
  for (const raw of ["{", "null", "[]", "false", '{"theme":"sepia","fontSize":"20"}']) {
    data.set(preferencesKey, raw)
    assert.deepEqual(readReaderPreferences(), DEFAULT_READER_PREFERENCES)
  }
  data.set(preferencesKey, '{"theme":"warm","fontSize":999,"unknown":true}')
  assert.deepEqual(readReaderPreferences(), { theme: "warm", fontSize: 18 })
  const defaults = readReaderPreferences()
  defaults.fontSize = 22
  assert.equal(DEFAULT_READER_PREFERENCES.fontSize, 18)
})

test("服务端、禁用存储、读取异常和配额不足都不阻断阅读", () => {
  const check = () => {
    assert.equal(readLastReading(), null)
    assert.equal(readReadingProgress(progress().href), null)
    assert.deepEqual(readReaderPreferences(), DEFAULT_READER_PREFERENCES)
    assert.doesNotThrow(() => saveReadingProgress(progress()))
    assert.doesNotThrow(() => saveReaderPreferences({ theme: "dark", fontSize: 20 }))
  }
  delete globalThis.window
  check()
  globalThis.window = { get localStorage() { throw new Error("Storage blocked") } }
  check()
  globalThis.window = {
    localStorage: {
      getItem() { throw new Error("Read blocked") },
      setItem() { throw new Error("Quota exceeded") },
    },
    dispatchEvent() { assert.fail("写入失败不应通知进度变化") },
  }
  check()
})
