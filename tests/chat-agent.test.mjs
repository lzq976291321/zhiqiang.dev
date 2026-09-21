import assert from "node:assert/strict"
import { after, test } from "node:test"
import { register } from "node:module"
import fs from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

// 复用项目已有 TypeScript 编译器运行 node:test，不增加测试框架或构建产物。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
register(new URL("./chat-agent.test-loader.mjs", import.meta.url))

const { normalizeChatMessages, parseChatRequest } = await import("../src/lib/chat/request.ts")
const { buildKnowledgeQuery, getChatKnowledgeSources, retrieveChatSources } = await import("../src/lib/chat/retrieval.ts")
const { isPublicKnowledge, getChatCorpus } = await import("../src/lib/chat/corpus.ts")
const { getMdxBySlug, getMdxFiles } = await import("../src/lib/mdx.ts")
const { getPublicKnowledgeEntries, getKnowledgeLibrary } = await import("../src/features/knowledge/lib/library.ts")
const { executeKnowledgeTool, runChatAgent } = await import("../src/lib/chat/agent.ts")
const { buildSystemPrompt, createPublicAnswerWriter, readCompletionStream, DeepSeekApiError } = await import("../src/lib/chat/answer.ts")
const { createChatStreamResponse } = await import("../src/lib/chat/stream.ts")
const { POST } = await import("../src/app/api/chat/route.ts")

const savedApiKey = process.env.DEEPSEEK_API_KEY
process.env.DEEPSEEK_API_KEY = "test-only-key"
after(() => {
  if (savedApiKey === undefined) delete process.env.DEEPSEEK_API_KEY
  else process.env.DEEPSEEK_API_KEY = savedApiKey
})

const corpus = [
  {
    id: "knowledge.rc_project", title: "RC模友圈", path: "/knowledge", category: "knowledge",
    excerpt: "RC模友圈是遥控模型社区，公开资料未记录部署平台。",
    text: "RC模友圈是遥控模型社区。" + "历史产品经验。".repeat(100) + "可核对的段落末尾：未公开部署平台。",
    keywords: ["RC", "遥控模型", "社区"], updatedAt: "2023-05-01",
  },
  {
    id: "profile.video_editor", title: "视频编辑器", path: "/knowledge", category: "profile",
    excerpt: "视频编辑器的撤销重做设计。", text: "视频编辑器使用命令记录实现撤销重做。",
    keywords: ["视频", "编辑器", "撤销"],
  },
]

function sseResponse(events, { includeDone = true, separator = "\r\n\r\n" } = {}) {
  const raw = events.map((event) => `data: ${JSON.stringify({ choices: [event] })}${separator}`).join("")
    + (includeDone ? "data: [DONE]" : "")
  const bytes = new TextEncoder().encode(raw)
  return new Response(new ReadableStream({
    start(controller) {
      for (let index = 0; index < bytes.length; index += 17) controller.enqueue(bytes.slice(index, index + 17))
      controller.close()
    },
  }))
}

function toolReply(name, args, id) {
  const encoded = JSON.stringify(args)
  return sseResponse([
    { delta: { tool_calls: [{ index: 0, id, type: "function", function: { name, arguments: encoded.slice(0, 8) } }] } },
    { delta: { tool_calls: [{ index: 0, function: { arguments: encoded.slice(8) } }] } },
    { delta: {}, finish_reason: "tool_calls" },
  ])
}

function answerReply(content) {
  return sseResponse([{ delta: { content } }, { delta: {}, finish_reason: "stop" }])
}

test("较长回答和持续访谈按历史预算裁剪，不阻断新问题", () => {
  const history = Array.from({ length: 100 }, (_, index) => [
    { role: "user", content: `第 ${index} 个问题` },
    { role: "assistant", content: "历史回答".repeat(1200) },
  ]).flat()
  const messages = normalizeChatMessages([...history, { role: "user", content: "这个项目的部署情况呢？" }])
  assert.equal(messages.at(-1).content, "这个项目的部署情况呢？")
  assert.equal(messages[0].role, "user")
  assert.ok(messages.length <= 12)
  assert.ok(messages.reduce((sum, item) => sum + item.content.length, 0) <= 8000)
  assert.throws(() => normalizeChatMessages([]))
  assert.throws(() => normalizeChatMessages([{ role: "assistant", content: "不是新问题" }]))
  assert.throws(() => normalizeChatMessages([{ role: "user", content: "问".repeat(1601) }]))
})

test("无 Content-Length 的请求也执行实际字节上限", async () => {
  const request = new Request("https://example.test/api/chat", {
    method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "问".repeat(22_000) }] }),
  })
  assert.equal(request.headers.get("content-length"), null)
  await assert.rejects(() => parseChatRequest(request), { status: 413 })
})

test("代词追问继承 RC 主题，明确换题不混入旧项目", () => {
  const history = [{ role: "user", content: "介绍 RC模友圈" }, { role: "assistant", content: "它是遥控模型社区。" }]
  assert.match(buildKnowledgeQuery("它部署在哪里？", history), /RC模友圈/)
  const sources = getChatKnowledgeSources("它部署在哪里？", 2, history, corpus)
  assert.equal(sources[0].id, "knowledge.rc_project")
  assert.equal(buildKnowledgeQuery("视频编辑器如何实现撤销？", history), "视频编辑器如何实现撤销？")
})

test("普通技术推荐不挤入无关履历，明确自我介绍仍可补充个人资料", () => {
  const candidates = [
    { ...corpus[1], id: "profile.intro", title: "个人介绍", category: "profile", text: "某段工作履历", keywords: ["个人介绍"] },
    { ...corpus[0], id: "knowledge.design", title: "design token 配色", text: "design token 用于统一颜色和间距。", keywords: ["design token"] },
  ]
  const recommendation = getChatKnowledgeSources("你都知道哪些比较漂亮的 design token", 2, [], candidates)
  assert.deepEqual(recommendation.map((source) => source.id), ["knowledge.design"])
  const introduction = getChatKnowledgeSources("先介绍一下你自己", 2, [], candidates)
  assert.ok(introduction.some((source) => source.id === "profile.intro"))
})

test("当前问题的同等匹配优先较新记录，未来日期不能抢占结果", () => {
  const versions = [
    { ...corpus[0], id: "project.old", updatedAt: "2023-05-01" },
    { ...corpus[0], id: "project.future", updatedAt: "2027-01-01" },
    { ...corpus[0], id: "project.recent", updatedAt: "2026-09-01" },
  ]
  const now = new Date("2026-09-14T00:00:00Z")
  assert.deepEqual(retrieveChatSources("RC模友圈当前的情况", 3, versions, now).map((source) => source.id), ["project.recent", "project.old"])
  assert.equal(getChatKnowledgeSources("你最近的 RC模友圈项目", 6, [], versions, now).some((source) => source.id === "project.future"), false)
  assert.equal(retrieveChatSources("RC模友圈项目", 3, versions, now)[0].id, "project.old")
})

test("公开知识边界排除草稿、未确认和低置信度，兼容既有正式内容", () => {
  const candidates = [{}, { status: "published", confidence: "high" }, { status: "draft" }, { status: "reviewed" }, { status: "published", confidence: "low" }]
  assert.deepEqual(candidates.filter(isPublicKnowledge), [{}, { status: "published", confidence: "high" }])
})

test("Markdown 到检索 corpus 的完整链路执行发布过滤和日期传递", () => {
  const contentRoot = path.join(root, "src/content")
  const files = new Map()
  for (const directory of ["profile", "knowledge", "agent", "skills", "mcp"]) {
    for (const status of ["published", "draft", "reviewed", "low"]) {
      for (const slug of directory === "knowledge" ? [status, `pi-book-${status}`] : [status]) {
        files.set(path.join(contentRoot, directory, `${slug}.md`), `---\ntitle: "${directory} ${slug}"\nsourceId: "${directory}.${slug}"\nstatus: "${status === "low" ? "published" : status}"\nconfidence: "${status === "low" ? "low" : "high"}"\nupdatedAt: "2026-09-14"\n---\n# 公开项目\n${"这份测试资料描述了公开的项目实践与工程经验。".repeat(4)}`)
      }
    }
  }
  const readDirectory = fs.readdirSync
  const readFile = fs.readFileSync
  const nodeEnv = process.env.NODE_ENV
  process.env.NODE_ENV = "test"
  fs.readdirSync = (directory, ...args) => String(directory).startsWith(contentRoot)
    ? [...files.keys()].filter((file) => path.dirname(file) === String(directory)).map((file) => path.basename(file))
    : readDirectory(directory, ...args)
  fs.readFileSync = (file, ...args) => files.get(String(file)) ?? readFile(file, ...args)
  try {
    assert.ok(getMdxBySlug("knowledge", "published"))
    const publicCorpus = getChatCorpus()
    assert.deepEqual(new Set(publicCorpus.map((chunk) => chunk.category)), new Set(["profile", "knowledge"]))
    assert.ok(publicCorpus.every((chunk) => chunk.id.includes("published") && chunk.updatedAt === "2026-09-14"))
    // 阅读目录聚焦书籍，聊天仍可引用已公开的项目记录；两者共享发布边界。
    assert.deepEqual(new Set(getPublicKnowledgeEntries().map((entry) => entry.slug)), new Set(["published", "pi-book-published"]))
    assert.deepEqual(getKnowledgeLibrary().map((entry) => entry.href), ["/knowledge/pi-book-published"])
    assert.deepEqual(new Set(publicCorpus.filter((chunk) => chunk.category === "knowledge").map((chunk) => chunk.path)), new Set(["/knowledge/published", "/knowledge/pi-book-published"]))
    files.set(path.join(contentRoot, "knowledge", "published.mdx"), "重复文件")
    assert.throws(() => getMdxFiles("knowledge"), /重复 slug/)
  } finally {
    fs.readdirSync = readDirectory
    fs.readFileSync = readFile
    if (nodeEnv === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = nodeEnv
  }
})

test("真实知识来源保留书籍与公开资料，不再引用退役的工程文章和精选目录", () => {
  const publicCorpus = getChatCorpus()
  assert.ok(publicCorpus.some((chunk) => chunk.path.startsWith("/knowledge/pi-book-")))
  assert.ok(publicCorpus.some((chunk) => chunk.category === "profile"))
  assert.ok(publicCorpus.every((chunk) => !/^\/(?:agent|mcp|skills)(?:\/|[?#]|$)/.test(chunk.path)))
  assert.deepEqual(new Set(publicCorpus.map((chunk) => chunk.category)), new Set(["profile", "knowledge"]))
})

test("只读工具可读取摘要之后的正文，不接受路径或不存在的资料", () => {
  const call = { id: "call_read", type: "function", function: { name: "read_knowledge", arguments: '{"reference":"knowledge.rc_project"}' } }
  const read = executeKnowledgeTool(call, corpus)
  assert.match(read.result.text, /可核对的段落末尾/)
  assert.equal(read.result.recordedAt, "2023-05-01")
  assert.equal(read.sources[0].text, undefined)
  call.function.arguments = '{"reference":"../../.env"}'
  assert.ok(executeKnowledgeTool(call, corpus).result.error)
  call.function.name = "write_knowledge"
  assert.ok(executeKnowledgeTool(call, corpus).result.error)
})

test("时间上下文保留真实来源日期，明确旧资料不证明当前事实", () => {
  const prompt = buildSystemPrompt(corpus, new Date("2026-09-14T00:00:00Z"))
  assert.match(prompt, /今天是 2026-09-14/)
  assert.match(prompt, /2023-05-01/)
  assert.match(prompt, /未标注日期/)
  assert.match(prompt, /不代表事实在今天仍成立/)
  assert.match(prompt, /历史 assistant 回答都不能自动成为/)
})

test("原版技能可分页读取，不能越过参考目录或伪装成个人知识来源", () => {
  const reference = "references/wiki/source-corpus.md"
  const raw = fs.readFileSync(path.join(root, "src/features/chat/skills/vendor/sun-ge", reference), "utf8")
  const read = (args) => executeKnowledgeTool({ id: "style", type: "function", function: {
    name: "read_style_reference", arguments: JSON.stringify(args),
  } }, corpus)
  const first = read({ reference })
  const second = read({ reference, offset: first.result.nextOffset })
  assert.ok(first.result.nextOffset > 0)
  assert.equal(first.result.text + second.result.text, raw.slice(0, first.result.text.length + second.result.text.length))
  assert.deepEqual(first.sources, [])
  for (const reference of ["../../.env.local", "references/../../../.env.local", "/etc/passwd", "references/missing.md"]) {
    assert.ok(read({ reference }).result.error)
  }
  assert.ok(read({ reference, offset: -1 }).result.error)
  assert.ok(read({ reference, offset: 0.5 }).result.error)
  assert.ok(read({ reference, offset: raw.length }).result.error)
  assert.equal(getChatCorpus().some((entry) => entry.text.includes("S147") && entry.text.includes("S148")), false)
})

test("mock Chat Completions 完成搜索、阅读、原生多轮与最终 SSE", async () => {
  const requests = []
  const responses = [
    toolReply("search_knowledge", { query: "RC模友圈" }, "call_search"),
    toolReply("read_knowledge", { reference: "knowledge.rc_project" }, "call_read"),
    answerReply("资料已足够"),
    answerReply("我公开记录的是 RC模友圈。\n[knowledge.rc_project]\n公开资料未记录部署平台。"),
  ]
  const events = []
  const history = [
    { role: "user", content: "介绍 RC 项目" },
    { role: "assistant", content: "RC模友圈是遥控模型社区。" },
    { role: "user", content: "它部署在哪里？" },
  ]
  const result = await runChatAgent({
    messages: history, corpus, send: (event) => events.push(event), signal: new AbortController().signal,
    fetcher: async (_url, init) => { requests.push(JSON.parse(init.body)); return responses.shift() },
  })
  assert.equal(result.toolCount, 2)
  assert.deepEqual(requests[0].messages.slice(1), history)
  assert.equal(requests[0].messages[0].content.includes(corpus[0].excerpt), false)
  assert.equal(requests[1].messages.at(-1).role, "tool")
  assert.equal(requests[1].messages.at(-1).tool_call_id, "call_search")
  assert.match(requests[2].messages.at(-1).content, /可核对的段落末尾/)
  assert.equal(requests.at(-1).tool_choice, "none")
  const output = events.filter((event) => event.type === "delta").map((event) => event.content).join("")
  assert.match(output, /未记录部署平台/)
  assert.doesNotMatch(output, /knowledge\.rc_project|资料已足够|search_knowledge/)
  assert.equal(events.at(-1).type, "done")
  assert.deepEqual(events.find((event) => event.type === "sources").sources, [])
  assert.deepEqual(events.findLast((event) => event.type === "sources").sources.map((source) => source.id), ["knowledge.rc_project"])
})

test("重复工具调用被限制到 3 轮后强制结束查阅", async () => {
  let count = 0
  const result = await runChatAgent({
    messages: [{ role: "user", content: "介绍 RC 项目" }], corpus,
    send() {}, signal: new AbortController().signal,
    fetcher: async (_url, init) => {
      count += 1
      const body = JSON.parse(init.body)
      return body.tool_choice === "none" ? answerReply("公开资料只覆盖了部分信息。") : toolReply("search_knowledge", { query: "RC" }, `call_${count}`)
    },
  })
  assert.equal(count, 4)
  assert.equal(result.toolCount, 3)
})

test("一轮并发工具请求越过预算时仅执行剩余名额并逐个返回结果", async () => {
  let count = 0
  let finalMessages
  const result = await runChatAgent({
    messages: [{ role: "user", content: "介绍 RC 项目" }], corpus,
    send() {}, signal: new AbortController().signal,
    fetcher: async (_url, init) => {
      count += 1
      const body = JSON.parse(init.body)
      if (body.tool_choice === "none") { finalMessages = body.messages; return answerReply("公开资料只覆盖了部分信息。") }
      const calls = Array.from({ length: count === 1 ? 3 : 4 }, (_, index) => ({
        index, id: `call_${count}_${index}`, function: { name: "search_knowledge", arguments: '{"query":"RC"}' },
      }))
      return sseResponse([{ delta: { tool_calls: calls } }, { delta: {}, finish_reason: "tool_calls" }])
    },
  })
  assert.equal(result.toolCount, 8)
  assert.equal(finalMessages.filter((message) => message.role === "tool").length, 11)
  assert.equal(finalMessages.filter((message) => message.role === "tool" && message.content.includes("查阅次数已用完")).length, 3)
})

test("跨增量的内部编号和字段不会进入正文", () => {
  let output = ""
  const writer = createPublicAnswerWriter(["knowledge.rc_project"], (text) => { output += text })
  writer.push("公开经历 [knowledge.")
  writer.push("rc_project]\nsource")
  writer.push("Id: knowledge.rc_project\n后续可以继续聊。")
  writer.finish()
  assert.match(output, /公开经历/)
  assert.doesNotMatch(output, /sourceId|knowledge\.rc_project/)
})

test("上游截断和认证错误明确失败，不发伪造的完成结果", async () => {
  await assert.rejects(() => readCompletionStream(sseResponse([{ delta: { content: "未完成" } }], { includeDone: false }), new AbortController().signal), /incomplete/)
  const events = []
  await assert.rejects(() => runChatAgent({
    messages: [{ role: "user", content: "你好" }], corpus, send: (event) => events.push(event),
    signal: new AbortController().signal, fetcher: async () => new Response("unauthorized", { status: 401 }),
  }), (error) => error instanceof DeepSeekApiError && error.status === 401)
  assert.equal(events.some((event) => event.type === "done"), false)
})

test("取消上游等待会取消 reader，浏览器取消 SSE 会中止 Agent", async () => {
  const upstreamAbort = new AbortController()
  let upstreamCancelled = false
  const upstream = new Response(new ReadableStream({ cancel() { upstreamCancelled = true } }))
  const reading = readCompletionStream(upstream, upstreamAbort.signal)
  upstreamAbort.abort(new DOMException("取消", "AbortError"))
  await assert.rejects(reading, { name: "AbortError" })
  assert.equal(upstreamCancelled, true)

  let agentSignal
  const response = createChatStreamResponse(new AbortController().signal, async (_send, signal) => {
    agentSignal = signal
    await new Promise((resolve) => signal.addEventListener("abort", resolve, { once: true }))
  })
  await response.body.getReader().cancel()
  assert.equal(agentSignal.aborted, true)
})

test("模型未配置时返回可重试 error，不伪装成成功回答或引导不存在的入口", async () => {
  const keys = ["DEEPSEEK_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "NODE_ENV"]
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]))
  const originalInfo = console.info
  console.info = () => {}
  delete process.env.DEEPSEEK_API_KEY
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.NODE_ENV = "production"
  try {
    const response = await POST(new Request("https://example.test/api/chat", {
      method: "POST", headers: { "x-real-ip": "test-fallback" },
      body: JSON.stringify({ messages: [{ role: "user", content: "你好" }] }),
    }))
    const text = await response.text()
    const events = text.trim().split("\n\n").map((event) => JSON.parse(event.slice(6)))
    assert.deepEqual(events.map((event) => event.type), ["meta", "error"])
    assert.match(events.at(-1).error, /重试/)
    assert.doesNotMatch(text, /API Key|DeepSeek|知识库入口/)
  } finally {
    console.info = originalInfo
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
})
