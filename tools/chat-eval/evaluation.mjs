import { CASES_VERSION } from "./cases.mjs"

export const SCRIPT_VERSION = "2"
export const SCHEMA_VERSION = 1

// 错误只保留故障类别和 HTTP 状态，不把上游正文、请求头或密钥写入产物。
function describeError(error) {
  if (Number.isInteger(error?.status)) return `上游或请求失败（HTTP ${error.status}）`
  if (error?.name === "AbortError") return "运行已取消"
  if (error?.name === "TimeoutError") return "请求超时"
  return "本轮未完整完成，请检查模型配置、网络和服务状态后重试"
}

export async function runEvaluation({
  scenarios, repeat = 1, label, metadata = {}, runAgent, normalizeMessages,
  signal = new AbortController().signal, onProgress = async () => {}, getModel = () => null,
}) {
  const report = {
    schemaVersion: SCHEMA_VERSION, scriptVersion: SCRIPT_VERSION, casesVersion: CASES_VERSION,
    label, ...metadata, model: getModel(), startedAt: new Date().toISOString(), finishedAt: null,
    repeat, status: "running", runs: [],
    evaluation: "完成情况与延迟只用于检查运行；自然、承接、分寸和事实需要人工判断。",
  }
  await onProgress(report)
  for (const scenario of scenarios) {
    for (let repetition = 1; repetition <= repeat; repetition += 1) {
      const run = { caseId: scenario.id, title: scenario.title, criteria: scenario.criteria, repetition, turns: [] }
      report.runs.push(run)
      let history = []
      let failed = false
      for (const [index, user] of scenario.turns.entries()) {
        const turn = { index: index + 1, user, assistant: "", elapsedMs: 0, status: "skipped", sources: [] }
        run.turns.push(turn)
        if (failed || signal.aborted) {
          turn.error = failed ? "前一轮失败，未继续本场景" : "运行已取消"
          await onProgress(report)
          continue
        }
        const started = performance.now()
        let completed = false
        try {
          // 与产品保持同样的历史裁剪；下一轮续接上一轮真实生成的正文。
          const messages = normalizeMessages([...history, { role: "user", content: user }])
          const result = await runAgent({
            messages, signal,
            send(event) {
              if (event.type === "delta") turn.assistant += event.content
              if (event.type === "sources") turn.sources = event.sources
              if (event.type === "done") completed = true
              if (event.type === "error") throw new Error("对话流返回错误")
            },
          })
          if (!completed || !turn.assistant.trim()) throw new Error("未收到完整回答")
          turn.status = "completed"
          turn.toolCount = result?.toolCount ?? null
          history = [...messages, { role: "assistant", content: turn.assistant }]
        } catch (error) {
          turn.status = "failed"
          turn.error = describeError(error)
          failed = true
        } finally {
          turn.elapsedMs = Math.round(performance.now() - started)
          report.model = getModel()
        }
        await onProgress(report)
      }
    }
  }
  report.finishedAt = new Date().toISOString()
  report.status = report.runs.every((run) => run.turns.every((turn) => turn.status === "completed")) ? "completed" : "failed"
  await onProgress(report)
  return report
}
