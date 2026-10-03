#!/usr/bin/env node
import { readFile, mkdir, writeFile, rename } from "node:fs/promises"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { createRequire, register } from "node:module"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { cases, selectCases } from "./cases.mjs"
import { runEvaluation } from "./evaluation.mjs"
import { createComparison, renderRun } from "./reports.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const help = `本地多轮对话评估（真实调用模型，不写站点提问日志）

运行：node tools/chat-eval/cli.mjs run --label <版本名> [--cases <id,id>] [--repeat <次数>] [--out <文件前缀>]
盲评：node tools/chat-eval/cli.mjs compare <左侧.json> <右侧.json> [--out <文件前缀>]

默认运行所有场景，每个场景 1 次；每轮使用上一轮真实回答继续聊天。
--out 默认为 .local/chat-eval 下的时间戳文件前缀，run 生成 .json/.html，compare 生成 .html/.mapping.json。
使用已有 DEEPSEEK_API_KEY / DEEPSEEK_MODEL / DEEPSEEK_BASE_URL 和 Next 环境文件；不会打印密钥。
运行失败保存部分结果并以非 0 退出；单个场景失败后跳过余下轮次，继续其他场景。
盲评先下载人工评审记录，再打开 mapping 文件核对版本。自动数据只表示完成与耗时，不评人味。

场景：
${cases.map((entry) => `  ${entry.id}  ${entry.title}`).join("\n")}
`

function parseArgs(args, allowed) {
  const options = {}
  const positional = []
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index]
    if (!value.startsWith("--")) { positional.push(value); continue }
    const name = value.slice(2)
    if (!allowed.includes(name) || options[name] !== undefined) throw new Error(`无效或重复选项：${value}`)
    const next = args[++index]
    if (!next || next.startsWith("--")) throw new Error(`${value} 需要参数`)
    options[name] = next
  }
  return { options, positional }
}

async function save(filename, content) {
  await mkdir(path.dirname(filename), { recursive: true })
  await writeFile(`${filename}.tmp`, content, "utf8")
  await rename(`${filename}.tmp`, filename)
}

function gitMetadata() {
  try {
    const repositoryRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
    // 复制到 .local 的源码快照不能误记成外层工作区的 Git 状态。
    if (path.resolve(repositoryRoot) !== root) return { sha: null, dirty: null }
    return {
      sha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(),
      dirty: Boolean(execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()),
    }
  } catch { return { sha: null, dirty: null } }
}

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!command || ["help", "--help", "-h"].includes(command) || args.includes("--help")) { console.log(help); return }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  if (command === "compare") {
    const { options, positional } = parseArgs(args, ["out"])
    if (positional.length !== 2) throw new Error("compare 需要两份 JSON 结果")
    const reports = await Promise.all(positional.map(async (filename) => JSON.parse(await readFile(path.resolve(filename), "utf8"))))
    const comparison = createComparison(...reports)
    comparison.mapping.inputs.left.file = path.resolve(positional[0])
    comparison.mapping.inputs.right.file = path.resolve(positional[1])
    const output = path.resolve(options.out ?? path.join(root, ".local/chat-eval", `compare-${stamp}`))
    await save(`${output}.html`, comparison.html)
    await save(`${output}.mapping.json`, JSON.stringify(comparison.mapping, null, 2))
    console.log(`盲评页面：${output}.html\n版本映射（完成评审后再看）：${output}.mapping.json`)
    return
  }
  if (command !== "run") throw new Error("请使用 run、compare 或 --help")
  const { options, positional } = parseArgs(args, ["label", "cases", "repeat", "out"])
  if (positional.length) throw new Error("run 不接受位置参数")
  const repeat = Number(options.repeat ?? 1)
  if (!Number.isInteger(repeat) || repeat < 1 || repeat > 20) throw new Error("--repeat 必须是 1 到 20 的整数")
  const scenarios = selectCases(options.cases)
  const output = path.resolve(options.out ?? path.join(root, ".local/chat-eval", `run-${stamp}`))
  // pnpm 的间接依赖从 Next 所在目录解析，保留进程已经传入的环境变量。
  const require = createRequire(import.meta.url)
  const nextRequire = createRequire(require.resolve("next/package.json"))
  nextRequire("@next/env").loadEnvConfig(root, false, { info() {}, error() {} })
  register(new URL("../../tests/chat-agent.test-loader.mjs", import.meta.url))
  const { runChatAgent } = await import("../../src/lib/chat/agent.ts")
  const { normalizeChatMessages } = await import("../../src/lib/chat/request.ts")
  const { buildSystemPrompt, buildFinalSystemPrompt } = await import("../../src/lib/chat/answer.ts")
  const style = await import("../../src/features/chat/server/response-style.ts")
  const evaluationNow = new Date()
  const systemPrompt = buildSystemPrompt([], evaluationNow)
  // 指纹同时覆盖查阅阶段与最终作答，避免只改作答要求却仍得到旧指纹。
  const systemPromptHash = createHash("sha256").update(JSON.stringify({
    planning: systemPrompt, final: buildFinalSystemPrompt(systemPrompt),
    finalInput: "system-with-tool-evidence-then-original-conversation",
  })).digest("hex")
  let model = null
  const fetcher = (url, init) => {
    model = JSON.parse(init.body).model
    return fetch(url, init)
  }
  const controller = new AbortController()
  const cancel = () => controller.abort()
  process.once("SIGINT", cancel)
  process.once("SIGTERM", cancel)
  try {
    const report = await runEvaluation({
      scenarios, repeat, label: options.label ?? `run-${stamp}`,
      metadata: { git: gitMetadata(), provider: "DeepSeek", systemPromptHash, responseStyleVersion: style.responseStyleVersion ?? null },
      normalizeMessages: normalizeChatMessages, runAgent: (args) => runChatAgent({ ...args, fetcher, now: evaluationNow }),
      signal: controller.signal, getModel: () => model,
      async onProgress(report) {
        await save(`${output}.json`, JSON.stringify(report, null, 2))
        await save(`${output}.html`, renderRun(report))
        const run = report.runs.at(-1)
        const turn = run?.turns.at(-1)
        if (turn && report.status === "running") console.log(`${run.caseId} #${run.repetition} 第 ${turn.index} 轮：${turn.status} (${turn.elapsedMs} ms)`)
      },
    })
    console.log(`结果：${output}.json\n阅读：${output}.html`)
    if (report.status !== "completed") process.exitCode = 1
  } finally {
    process.removeListener("SIGINT", cancel)
    process.removeListener("SIGTERM", cancel)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "评估运行失败")
  process.exitCode = 1
})
