import assert from "node:assert/strict"
import { test } from "node:test"
import { register } from "node:module"
import { execFileSync, spawnSync } from "node:child_process"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { cases, selectCases } from "../tools/chat-eval/cases.mjs"
import { runEvaluation } from "../tools/chat-eval/evaluation.mjs"
import { createComparison, escapeHtml, renderRun } from "../tools/chat-eval/reports.mjs"

register(new URL("./chat-agent.test-loader.mjs", import.meta.url))
const { normalizeChatMessages } = await import("../src/lib/chat/request.ts")
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const scenario = { id: "test", title: "连续聊天", criteria: "真实续接", turns: ["第一句", "第二句", "第三句"] }

async function makeReport(label = "current-secret-label", overrides = {}) {
  return runEvaluation({
    scenarios: [scenario], label, normalizeMessages: normalizeChatMessages,
    metadata: { git: { sha: "source-sha-secret", dirty: false } }, getModel: () => "model-secret",
    runAgent: async ({ send }) => { send({ type: "delta", content: "真实模型回答" }); send({ type: "done" }); return { toolCount: 0 } },
    ...overrides,
  })
}

test("固定场景可选择，非法和重复选择明确报错", () => {
  assert.ok(cases.length > 0)
  assert.equal(new Set(cases.map((entry) => entry.id)).size, cases.length)
  assert.ok(cases.every((entry) => entry.turns.length === 3))
  assert.deepEqual(selectCases("humor-to-task,no-advice").map((entry) => entry.id), ["humor-to-task", "no-advice"])
  assert.throws(() => selectCases("no-advice,no-advice"), /重复/)
  assert.throws(() => selectCases("missing"), /未知场景/)
})

test("每轮使用产品历史裁剪，续接真实生成内容；不同重复独立开始", async () => {
  const histories = []
  const report = await makeReport("history", {
    repeat: 2,
    runAgent: async ({ messages, send }) => {
      histories.push(structuredClone(messages))
      send({ type: "delta", content: `实际答复 ${histories.length}` })
      send({ type: "done" })
      return { toolCount: 1 }
    },
  })
  assert.deepEqual(histories[1], [
    { role: "user", content: "第一句" },
    { role: "assistant", content: "实际答复 1" },
    { role: "user", content: "第二句" },
  ])
  assert.deepEqual(histories[3], [{ role: "user", content: "第一句" }])
  assert.equal(report.status, "completed")
  assert.equal(report.runs[1].turns[2].assistant, "实际答复 6")
  assert.equal(report.runs[0].turns[0].toolCount, 1)
  assert.equal(report.model, "model-secret")
  assert.ok(report.finishedAt)
})

test("长历史在进入下一轮时遵守产品限制，报告保留完整实际回答", async () => {
  const histories = []
  const longAnswer = "完整回答".repeat(1000)
  const report = await makeReport("long", {
    runAgent: async ({ messages, send }) => { histories.push(messages); send({ type: "delta", content: longAnswer }); send({ type: "done" }) },
  })
  assert.equal(histories[1][1].content.length, 1800)
  assert.equal(report.runs[0].turns[0].assistant, longAnswer)
})

test("失败保存部分正文，跳过本场景余下轮次，其他场景继续且不泄露错误原文", async () => {
  const snapshots = []
  let call = 0
  const report = await makeReport("failure", {
    scenarios: [scenario, { ...scenario, id: "next", turns: ["独立问题"] }],
    async runAgent({ send }) {
      call += 1
      send({ type: "delta", content: call === 1 ? "尚未完成" : "下一场景完成" })
      if (call === 1) throw new Error("secret-provider-key")
      send({ type: "done" })
    },
    async onProgress(report) { snapshots.push(structuredClone(report)) },
  })
  assert.equal(call, 2)
  assert.equal(report.status, "failed")
  assert.deepEqual(report.runs[0].turns.map((turn) => turn.status), ["failed", "skipped", "skipped"])
  assert.equal(report.runs[0].turns[0].assistant, "尚未完成")
  assert.equal(report.runs[1].turns[0].status, "completed")
  assert.doesNotMatch(JSON.stringify(report), /secret-provider-key/)
  assert.ok(snapshots.some((snapshot) => snapshot.status === "running" && snapshot.runs[0]?.turns[0]?.status === "failed"))
})

test("未收到 done 或只有空白回答都不计为完成", async () => {
  for (const event of [{ type: "delta", content: "中断回答" }, { type: "done" }]) {
    const report = await makeReport("incomplete", { runAgent: async ({ send }) => { send(event) } })
    assert.equal(report.status, "failed")
    assert.equal(report.runs[0].turns[0].status, "failed")
  }
})

test("取消运行保存未执行轮次，不继续请求模型", async () => {
  const controller = new AbortController()
  controller.abort()
  const report = await makeReport("cancelled", { signal: controller.signal, runAgent: async () => assert.fail("不应请求模型") })
  assert.equal(report.status, "failed")
  assert.ok(report.runs[0].turns.every((turn) => turn.status === "skipped"))
})

test("普通报告和盲评转义全部模型文本，不包含可执行标签", async () => {
  const payload = '<script>alert("x")</script><img src=x onerror=alert(1)>'
  const report = await makeReport(payload, {
    scenarios: [{ ...scenario, title: payload, criteria: payload, turns: [payload] }],
    runAgent: async ({ send }) => { send({ type: "delta", content: payload }); send({ type: "sources", sources: [{ title: payload, path: payload }] }); send({ type: "done" }) },
  })
  const normal = renderRun(report)
  const blind = createComparison(report, report, () => true).html
  for (const html of [normal, blind]) {
    assert.doesNotMatch(html, /<script>alert|<img src=x/)
    assert.ok(html.includes(escapeHtml(payload)))
  }
  assert.equal(escapeHtml("<>&\"'"), "&lt;&gt;&amp;&quot;&#39;")
})

test("盲评页面隐藏版本元数据，随机分配保留独立映射和人工四维评价", async () => {
  const left = await makeReport("old-version-secret")
  const right = await makeReport("new-version-secret", { runAgent: async ({ send }) => { send({ type: "delta", content: "另一版答复" }); send({ type: "done" }) } })
  const { html, mapping } = createComparison(left, right, () => false)
  assert.deepEqual(mapping.assignments, [{ key: "test:1", A: "right", B: "left" }])
  assert.equal(mapping.inputs.left.label, "old-version-secret")
  assert.doesNotMatch(html, /old-version-secret|new-version-secret|source-sha-secret|model-secret/)
  assert.ok(html.indexOf("另一版答复") < html.indexOf("真实模型回答"))
  for (const dimension of ["自然", "承接", "分寸", "事实"]) assert.ok(html.includes(dimension))
  assert.match(html, /不自动宣布胜者/)
  assert.match(html, /下载人工评审记录/)
})

test("场景、重复次数、题目或判断依据不一致以及重复数据均拒绝比较", async () => {
  const report = await makeReport()
  const variants = [
    (value) => { value.repeat = 2 },
    (value) => { value.casesVersion = "different" },
    (value) => { value.runs[0].caseId = "different" },
    (value) => { value.runs[0].turns[0].user = "不同问题" },
    (value) => { value.runs[0].criteria = "不同标准" },
    (value) => { value.runs.push(value.runs[0]) },
    (value) => { value.finishedAt = null },
  ]
  for (const mutate of variants) {
    const candidate = structuredClone(report)
    mutate(candidate)
    assert.throws(() => createComparison(report, candidate))
  }
})

test("CLI 帮助不依赖模型凭据，缺少凭据保存失败报告并以非零退出", async () => {
  const env = { ...process.env, DEEPSEEK_API_KEY: "" }
  const cli = path.join(root, "tools/chat-eval/cli.mjs")
  const help = execFileSync(process.execPath, [cli, "--help"], { cwd: root, env, encoding: "utf8" })
  assert.match(help, /identity-and-contact/)
  const directory = await mkdtemp(path.join(tmpdir(), "blog-chat-eval-"))
  try {
    const prefix = path.join(directory, "failure")
    const result = spawnSync(process.execPath, [cli, "run", "--label", "missing-key", "--cases", "no-advice", "--out", prefix], { cwd: root, env, encoding: "utf8", timeout: 15_000 })
    assert.equal(result.error, undefined)
    assert.equal(result.status, 1)
    const report = JSON.parse(await readFile(`${prefix}.json`, "utf8"))
    assert.equal(report.status, "failed")
    assert.match(report.systemPromptHash, /^[a-f0-9]{64}$/)
    assert.equal(typeof report.git.dirty, "boolean")
    assert.match(report.git.sha, /^[a-f0-9]{40}$/)
    assert.deepEqual(report.runs[0].turns.map((turn) => turn.status), ["failed", "skipped", "skipped"])
    assert.ok((await readFile(`${prefix}.html`, "utf8")).includes("missing-key"))
  } finally { await rm(directory, { recursive: true, force: true }) }
})
