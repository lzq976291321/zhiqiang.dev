import { randomInt, randomUUID } from "node:crypto"
import { SCHEMA_VERSION } from "./evaluation.mjs"

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])
}

const statusLabels = { completed: "完成", failed: "失败", skipped: "未执行", running: "运行中" }
const styles = `body{margin:0;background:#f3f3ef;color:#232923;font:16px/1.7 system-ui,sans-serif}main{max-width:1180px;margin:auto;padding:36px 24px}h1{font-size:28px;line-height:1.3}h2{font-size:21px}h3{font-size:16px}p{margin:8px 0}section{margin:28px 0;padding:24px;background:#fff;border:1px solid #dcded6;border-radius:16px}.muted{color:#626b61;font-size:14px}.text{white-space:pre-wrap;overflow-wrap:anywhere}.turn{padding:16px 0;border-top:1px solid #e1e4dc}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.answer{padding:16px;background:#f6f7f3;border-radius:10px}fieldset{border:1px solid #d6dbd0;border-radius:8px;margin-top:14px}label{display:inline-block;margin:4px 14px 4px 0}textarea{box-sizing:border-box;width:100%;min-height:80px;font:inherit;padding:10px}button{font:inherit;cursor:pointer;border:0;border-radius:8px;background:#283a2c;color:white;padding:10px 18px}a{color:#315e47}ul{padding-left:20px}@media(max-width:700px){main{padding:24px 14px}section{padding:16px}.grid{grid-template-columns:1fr}}`

function page(title, content, script = "") {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>${styles}</style></head><body><main>${content}</main>${script}</body></html>`
}

function answer(turn, showLatency = true) {
  const sources = (turn.sources ?? []).map((source) => `<li>${escapeHtml(source.title)} <span class="muted">${escapeHtml(source.path)}</span></li>`).join("")
  return `<p class="text">${escapeHtml(turn.assistant || "（没有回答）")}</p><p class="muted">${escapeHtml(statusLabels[turn.status] ?? turn.status)}${showLatency ? ` · ${escapeHtml(turn.elapsedMs)} ms` : ""}${turn.error ? ` · ${escapeHtml(turn.error)}` : ""}</p>${sources ? `<details><summary>本轮延伸阅读</summary><ul>${sources}</ul></details>` : ""}`
}

export function renderRun(report) {
  return page("多轮对话评估", `<h1>多轮对话评估 · ${escapeHtml(report.label)}</h1><p>${escapeHtml(report.evaluation)}</p><p class="muted">${escapeHtml(report.startedAt)} · 模型 ${escapeHtml(report.model ?? "尚未请求")} · ${escapeHtml(statusLabels[report.status])}</p><p class="muted">Git ${escapeHtml(report.git?.sha ?? "未获取")}${report.git?.dirty ? "（有未提交改动）" : ""} · 脚本 ${escapeHtml(report.scriptVersion)} · 场景 ${escapeHtml(report.casesVersion)}</p><p class="muted text">表达版本 ${escapeHtml(report.responseStyleVersion ?? "未标注")} · 提示词 SHA256 ${escapeHtml(report.systemPromptHash ?? "未获取")}</p>${report.runs.map((run) => `<section><h2>${escapeHtml(run.title)} · 第 ${escapeHtml(run.repetition)} 次</h2><p class="muted">人工判断：${escapeHtml(run.criteria)}</p>${run.turns.map((turn) => `<div class="turn"><h3>${escapeHtml(turn.index)}. 用户</h3><p class="text">${escapeHtml(turn.user)}</p><h3>实际回答</h3>${answer(turn)}</div>`).join("")}</section>`).join("")}`)
}

function indexReport(report) {
  if (report.schemaVersion !== SCHEMA_VERSION || !Array.isArray(report.runs) || !report.runs.length || !Number.isInteger(report.repeat) || report.repeat < 1) {
    throw new Error("结果格式或版本不支持比较")
  }
  if (report.status === "running" || !report.finishedAt) throw new Error("结果尚未运行结束，请等运行结束后比较")
  const indexed = new Map()
  const counts = new Map()
  for (const run of report.runs) {
    const key = `${run.caseId}:${run.repetition}`
    if (indexed.has(key) || !Number.isInteger(run.repetition) || run.repetition < 1 || run.repetition > report.repeat || !Array.isArray(run.turns) || !run.turns.length) {
      throw new Error("结果包含重复场景或无效轮次")
    }
    indexed.set(key, run)
    counts.set(run.caseId, (counts.get(run.caseId) ?? 0) + 1)
  }
  if ([...counts.values()].some((count) => count !== report.repeat)) throw new Error("场景的重复次数不完整")
  return indexed
}

export function createComparison(left, right, chooseLeft = () => randomInt(2) === 0) {
  const leftRuns = indexReport(left)
  const rightRuns = indexReport(right)
  if (left.casesVersion !== right.casesVersion || left.repeat !== right.repeat || leftRuns.size !== rightRuns.size) {
    throw new Error("场景版本、选择的场景或重复次数不一致，不能比较")
  }
  const comparisonId = randomUUID()
  const mapping = {
    comparisonId, createdAt: new Date().toISOString(),
    inputs: Object.fromEntries([["left", left], ["right", right]].map(([side, report]) => [side, {
      label: report.label, git: report.git, model: report.model,
      systemPromptHash: report.systemPromptHash, responseStyleVersion: report.responseStyleVersion,
    }])),
    assignments: [],
  }
  const pairs = [...leftRuns].map(([key, first]) => {
    const second = rightRuns.get(key)
    if (!second || first.criteria !== second.criteria || JSON.stringify(first.turns.map((turn) => turn.user)) !== JSON.stringify(second.turns.map((turn) => turn.user))) {
      throw new Error(`场景 ${first.caseId} 的问题或判断依据不一致，不能比较`)
    }
    const aIsLeft = chooseLeft()
    mapping.assignments.push({ key, A: aIsLeft ? "left" : "right", B: aIsLeft ? "right" : "left" })
    return { key, title: first.title, repetition: first.repetition, criteria: first.criteria, A: aIsLeft ? first : second, B: aIsLeft ? second : first }
  })
  const dimensions = [
    ["natural", "自然", "像在交流，语气和长度合适，不堆固定话术"],
    ["continuity", "承接", "听懂上一轮，跟上转折和纠正，记住当前对话"],
    ["judgment", "分寸", "知道何时回应、收住、开玩笑或保留不同意见"],
    ["facts", "事实", "身份、能力和来源真实，缺少依据时不编造"],
  ]
  const sections = pairs.map((pair, pairIndex) => `<section data-case="${escapeHtml(pair.key)}"><h2>${escapeHtml(pair.title)} · 第 ${escapeHtml(pair.repetition)} 次</h2><p class="muted">${escapeHtml(pair.criteria)}</p>${pair.A.turns.map((turn, index) => `<div class="turn"><h3>${index + 1}. 用户</h3><p class="text">${escapeHtml(turn.user)}</p><div class="grid"><div class="answer"><h3>A</h3>${answer(turn, false)}</div><div class="answer"><h3>B</h3>${answer(pair.B.turns[index], false)}</div></div></div>`).join("")}${dimensions.map(([id, title, description]) => `<fieldset><legend>${title}：${description}</legend>${[["A", "A 更好"], ["B", "B 更好"], ["tie", "相当"], ["neither", "都不合格"]].map(([value, title]) => `<label><input type="radio" name="${pairIndex}-${id}" data-dimension="${id}" value="${value}">${title}</label>`).join("")}</fieldset>`).join("")}<p><label for="notes-${pairIndex}">具体哪一轮好或不好，下一轮想改什么</label><textarea id="notes-${pairIndex}"></textarea></p></section>`).join("")
  // 所有动态文本走 HTML 转义；脚本中只有本工具生成的 UUID，没有模型正文或版本名。
  const script = `<script>document.getElementById("download").addEventListener("click",()=>{const reviews=[...document.querySelectorAll("section[data-case]")].map(section=>({case:section.dataset.case,dimensions:Object.fromEntries([...section.querySelectorAll("input:checked")].map(input=>[input.dataset.dimension,input.value])),notes:section.querySelector("textarea").value}));const result={comparisonId:"${comparisonId}",reviewedAt:new Date().toISOString(),reviews};const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="chat-review-${comparisonId}.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)})</script>`
  return {
    mapping,
    html: page("多轮对话盲评", `<h1>多轮对话盲评</h1><p>每个场景的 A / B 独立随机分配；同一场景内连续三轮保持同一版本。请先看完整对话，再评价自然、承接、分寸和事实。</p><p class="muted">页面隐藏版本名、模型和提交信息。完成情况不代表人味分数；不自动宣布胜者。评审仅在当前页面保留，关闭前下载记录，之后再查看独立映射文件。</p>${sections}<button id="download" type="button">下载人工评审记录</button>`, script),
  }
}
