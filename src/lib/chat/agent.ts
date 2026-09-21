import { readStyleReference } from "@/features/chat/server/response-style"
import { getChatCorpus } from "./corpus"
import { buildKnowledgeQuery, retrieveChatSources } from "./retrieval"
import {
  buildSystemPrompt,
  createDeepSeekCompletionStream,
  createPublicAnswerWriter,
  readCompletionStream,
  type KnowledgeTool,
  type ModelMessage,
  type ToolCall,
} from "./answer"
import type { ChatChunk, ChatMessage, ChatSource } from "./types"
import type { SendChatEvent } from "./stream"

const MAX_TOOL_ROUNDS = 3
const MAX_TOOL_CALLS = 8
const READ_PAGE_LENGTH = 4000

const knowledgeTools: KnowledgeTool[] = [
  {
    type: "function",
    function: {
      name: "read_style_reference",
      description: "按需读取已安装孙割.skill 的原版参考文档，补充判断方法、语言习惯或人物研究材料。只能使用系统提示中列出的 references/ 路径；这些材料不是站点主人的个人经历。",
      parameters: {
        type: "object",
        properties: {
          reference: { type: "string", description: "已安装技能的参考文档路径" },
          offset: { type: "integer", minimum: 0, description: "续读位置，首次省略" },
        },
        required: ["reference"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description: "搜索站点主人已公开的经历、项目和工程知识，返回资料标识、摘要和记录日期。承接追问时使用完整主题。",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "需要查找的主题或具体问题" } },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_knowledge",
      description: "读取已公开资料的完整段落，确认摘要未覆盖的细节。长段落可按返回的 nextOffset 继续阅读，不能读取文件路径。",
      parameters: {
        type: "object",
        properties: {
          reference: { type: "string", description: "检索结果中的资料标识" },
          offset: { type: "integer", minimum: 0, description: "长段落的起始位置，首次读取省略或填 0" },
        },
        required: ["reference"],
        additionalProperties: false,
      },
    },
  },
]

function toSource(chunk: ChatSource): ChatSource {
  const { id, title, path, category, excerpt, updatedAt } = chunk
  return { id, title, path, category, excerpt, updatedAt }
}

export function executeKnowledgeTool(call: ToolCall, corpus: ChatChunk[], now = new Date()) {
  let args: Record<string, unknown>
  try {
    args = JSON.parse(call.function.arguments)
  } catch {
    return { result: { error: "工具参数必须是有效 JSON，请修正后重试。" }, sources: [] }
  }
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    return { result: { error: "工具参数必须是对象。" }, sources: [] }
  }

  if (call.function.name === "read_style_reference") {
    return { result: readStyleReference(args.reference, args.offset), sources: [] }
  }

  if (call.function.name === "search_knowledge") {
    if (typeof args.query !== "string" || !args.query.trim() || args.query.length > 800) {
      return { result: { error: "请提供不超过 800 字的检索主题。" }, sources: [] }
    }
    const sources = retrieveChatSources(args.query, 5, corpus, now)
    return {
      result: {
        matches: sources.map((source) => ({
          reference: source.id,
          title: source.title,
          recordedAt: source.updatedAt ?? "未标注日期",
          summary: source.excerpt,
        })),
      },
      sources,
    }
  }

  if (call.function.name === "read_knowledge") {
    const offset = args.offset ?? 0
    if (typeof args.reference !== "string" || !Number.isInteger(offset) || Number(offset) < 0) {
      return { result: { error: "请使用搜索结果中的资料标识和有效起始位置。" }, sources: [] }
    }
    const chunk = corpus.find((entry) => entry.id === args.reference)
    if (!chunk) return { result: { error: "没有找到这份公开资料，请重新搜索。" }, sources: [] }
    const start = Number(offset)
    if (start >= chunk.text.length) return { result: { error: "已到达这份资料的结尾。" }, sources: [] }
    const end = Math.min(start + READ_PAGE_LENGTH, chunk.text.length)
    return {
      result: {
        reference: chunk.id,
        title: chunk.title,
        recordedAt: chunk.updatedAt ?? "未标注日期",
        text: chunk.text.slice(start, end),
        ...(end < chunk.text.length ? { nextOffset: end } : {}),
      },
      sources: [toSource(chunk)],
    }
  }

  return { result: { error: "这里只能阅读已公开知识和已安装的风格参考。" }, sources: [] }
}

export async function runChatAgent({
  messages,
  send,
  signal,
  corpus = getChatCorpus(),
  now = new Date(),
  fetcher = fetch,
}: {
  messages: ChatMessage[]
  send: SendChatEvent
  signal: AbortSignal
  corpus?: ChatChunk[]
  now?: Date
  fetcher?: typeof fetch
}) {
  const question = messages.at(-1)!.content
  const selected = new Map<string, ChatSource>()
  const readSources = new Map<string, ChatSource>()
  // 先理解问题，再由工具取资料，避免相似关键词把一般讨论带回个人项目介绍。
  const systemPrompt = buildSystemPrompt([], now)
  const conversation: ModelMessage[] = [{ role: "system", content: systemPrompt }, ...messages]
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(55_000)])
  let toolCount = 0
  send({ type: "meta", mode: "deepseek" })
  send({ type: "sources", sources: [] })

  // 工具选择阶段只在服务端进行；最终答复单独流式生成，不把执行旁白发给访客。
  for (let round = 0; round < MAX_TOOL_ROUNDS && toolCount < MAX_TOOL_CALLS; round += 1) {
    deadline.throwIfAborted()
    const planning: ModelMessage[] = [
      {
        role: "system",
        content: `${systemPrompt}\n本轮只决定是否需要继续查阅资料，不写最终回答。询问个人事实、知识笔记，以及 Agent、上下文、开发实践、设计或技术选型时，优先搜索并阅读相关知识；需要原版技能的专题方法时调用 read_style_reference，不把其中的人物经历混入站点知识。寒暄和纯语言改写不必检索，信息足够时停止查阅。承接后的检索主题：${buildKnowledgeQuery(question, messages)}`,
      },
      ...conversation.slice(1),
    ]
    const response = await createDeepSeekCompletionStream({ messages: planning, tools: knowledgeTools, signal: deadline, fetcher })
    const completion = await readCompletionStream(response, deadline)
    if (completion.toolCalls.length === 0) break
    conversation.push({ role: "assistant", content: null, tool_calls: completion.toolCalls })

    for (const call of completion.toolCalls) {
      const canExecute = toolCount < MAX_TOOL_CALLS
      const execution = canExecute
        ? executeKnowledgeTool(call, corpus, now)
        : { result: { error: "本轮查阅次数已用完，请基于已读取资料回答并说明缺口。" }, sources: [] }
      if (canExecute) toolCount += 1
      for (const source of execution.sources) {
        selected.set(source.id, source)
        if (call.function.name === "read_knowledge") readSources.set(source.id, source)
      }
      conversation.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(execution.result) })
    }
  }

  conversation[0] = {
    role: "system",
    content: `${systemPrompt}\n现在直接接住访客这句话，不再调用工具或讲查阅过程。采用原版孙割.skill 的中文访谈口吻和判断方式，按站点接入约定回答，通常三句话以内；用户要求详细时再展开。个人事实只能来自林志强的公开资料，技能人物经历不能冒充自己的经历。不要列小标题、复述规则或加一段总结。`,
  }
  // 搜索候选不等于回答依据，只有实际读过的文章才作为延伸阅读发送。
  send({ type: "sources", sources: [...readSources.values()].slice(0, 6) })
  const writer = createPublicAnswerWriter(corpus.map((chunk) => chunk.id), (content) => send({ type: "delta", content }))
  const response = await createDeepSeekCompletionStream({ messages: conversation, tools: knowledgeTools, toolChoice: "none", signal: deadline, fetcher })
  const completion = await readCompletionStream(response, deadline, writer.push)
  if (completion.toolCalls.length > 0) throw new Error("Upstream called tools during the final answer")
  const responseLength = writer.finish()
  if (responseLength === 0 || !completion.content.trim()) throw new Error("Upstream returned an empty answer")
  send({ type: "done" })
  return { responseLength, sourceIds: [...selected.keys()], toolCount }
}
