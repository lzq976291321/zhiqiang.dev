"use client"

import type {
  ButtonHTMLAttributes,
  Dispatch,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  SetStateAction,
  TextareaHTMLAttributes,
} from "react"
import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Check,
  Copy,
  Download,
  ExternalLink,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react"
import { chinaHolidaySource } from "@/features/tools/data/china-holidays"
import {
  toolDefinitions,
  type ToolDefinition,
  type ToolId,
} from "@/features/tools/data/registry"
import {
  classifyChinaDate,
  countChinaWorkdays,
  getUpcomingChinaHolidays,
} from "@/features/tools/lib/calendar"
import { cn } from "@/lib/utils"

type PromptTemplate = {
  id: string
  name: string
  body: string
}

type Snippet = {
  id: string
  title: string
  content: string
  tags: string
}

type GlossaryTerm = {
  id: string
  term: string
  translation: string
  note: string
}

type Reminder = {
  id: string
  title: string
  dueAt: string
  note: string
  done: boolean
  notified: boolean
}

const defaultPrompts: PromptTemplate[] = [
  {
    id: "code-review",
    name: "代码评审",
    body: "请评审下面的改动，优先指出 bug、行为回归、边界风险和缺失测试。项目背景：{{项目背景}}。改动内容：{{改动内容}}。",
  },
  {
    id: "article-outline",
    name: "技术文章大纲",
    body: "请基于主题「{{主题}}」生成一份技术文章大纲。要求：先给核心判断，再给章节结构，每节说明读者能获得什么。",
  },
  {
    id: "agent-design",
    name: "Agent 产品判断",
    body: "请评估这个 Agent 想法：{{想法}}。从用户场景、工具边界、上下文来源、失败处理、验证闭环和 MVP 范围给出判断。",
  },
]

const defaultSnippets: Snippet[] = [
  {
    id: "pnpm-verify",
    title: "项目验证命令",
    content: "pnpm lint && pnpm build",
    tags: "dev, verify",
  },
  {
    id: "codex-memory",
    title: "项目记忆提醒",
    content: "先读取 AGENTS.md 和当前仓库结构，再按现有模式修改，不引入不必要依赖。",
    tags: "codex, agent",
  },
]

const defaultGlossary: GlossaryTerm[] = [
  {
    id: "agent",
    term: "Agent",
    translation: "Agent",
    note: "工程语境下保留英文，不翻成代理。",
  },
  {
    id: "profile-agent",
    term: "Profile Agent",
    translation: "Profile Agent",
    note: "指公开开发侧资料问答入口，不翻成私人助理。",
  },
  {
    id: "mcp",
    term: "MCP",
    translation: "MCP",
    note: "Model Context Protocol，默认保留缩写。",
  },
  {
    id: "skill",
    term: "Skill",
    translation: "Skill",
    note: "指可复用能力包，默认保留英文。",
  },
]

const defaultReminders: Reminder[] = []

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getTodayString() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function useLocalList<T>(key: string, fallback: T[]) {
  const [items, setItems] = useState<T[]>(fallback)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(key)
      if (saved) {
        try {
          setItems(JSON.parse(saved) as T[])
        } catch {
          setItems(fallback)
        }
      }

      setLoaded(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [fallback, key])

  useEffect(() => {
    if (!loaded) return
    window.localStorage.setItem(key, JSON.stringify(items))
  }, [items, key, loaded])

  return [items, setItems] as const
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-white/72">{children}</span>
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-100/34 focus:ring-4 focus:ring-cyan-100/10",
        props.className
      )}
    />
  )
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-36 w-full resize-y rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-100/34 focus:ring-4 focus:ring-cyan-100/10",
        props.className
      )}
    />
  )
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-2xl border border-white/12 bg-white/[0.06] px-4 text-sm text-white outline-none transition focus:border-cyan-100/34 focus:ring-4 focus:ring-cyan-100/10",
        props.className
      )}
    />
  )
}

function ToolButton({
  children,
  variant = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "subtle" | "danger"
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-cyan-100/10 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "border-cyan-100/24 bg-cyan-100/14 text-cyan-50 hover:bg-cyan-100/18",
        variant === "subtle" &&
          "border-white/10 bg-white/[0.055] text-white/70 hover:border-white/18 hover:bg-white/[0.08] hover:text-white",
        variant === "danger" &&
          "border-rose-200/18 bg-rose-300/10 text-rose-100 hover:bg-rose-300/16",
        props.className
      )}
    >
      {children}
    </button>
  )
}

function Panel({
  title,
  children,
  aside,
}: {
  title: string
  children: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/12 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  )
}

function CopyButton({ text, label = "复制" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <ToolButton type="button" variant="subtle" onClick={copy} disabled={!text}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "已复制" : label}
    </ToolButton>
  )
}

function ToolSwitcher({
  activeTool,
  onSelect,
}: {
  activeTool: ToolDefinition
  onSelect: (toolId: ToolId) => void
}) {
  return (
    <aside className="rounded-[28px] border border-white/12 bg-black/20 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
      <div className="px-3 py-3">
        <p className="font-mono text-[11px] uppercase text-cyan-100/48">Tools</p>
        <h2 className="mt-1 text-xl font-semibold text-white">工具站</h2>
      </div>

      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
        {toolDefinitions.map((tool) => {
          const selected = tool.id === activeTool.id
          const Icon = tool.Icon

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              className={cn(
                "group flex min-h-16 w-full items-start gap-2 rounded-2xl border px-2.5 py-3 text-left transition lg:min-h-20 lg:gap-3 lg:px-3",
                selected
                  ? "border-cyan-100/24 bg-cyan-100/12 text-white shadow-[0_16px_44px_rgba(45,212,255,0.12)]"
                  : "border-transparent text-white/58 hover:border-white/10 hover:bg-white/[0.05] hover:text-white/86"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border lg:size-9",
                  selected
                    ? "border-cyan-100/22 bg-cyan-100/14 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-white/44 group-hover:text-cyan-100/76"
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase text-white/36">
                  {tool.eyebrow}
                </span>
                <span className="mt-1 block text-xs font-medium leading-5 lg:hidden">
                  {tool.shortTitle}
                </span>
                <span className="mt-1 hidden text-sm font-medium leading-5 lg:block">
                  {tool.title}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

function glossaryToPrompt(terms: GlossaryTerm[]) {
  return terms
    .filter((term) => term.term.trim())
    .map((term) => `- ${term.term} => ${term.translation || term.term}：${term.note || "保留固定口径"}`)
    .join("\n")
}

function TranslateTool({ glossary }: { glossary: GlossaryTerm[] }) {
  const [mode, setMode] = useState("zh-to-en")
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const glossaryText = useMemo(() => glossaryToPrompt(glossary), [glossary])

  async function submit() {
    setError("")
    setResult("")
    setLoading(true)

    try {
      const response = await fetch("/api/tools/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text, glossary: glossaryText }),
      })
      const payload = (await response.json()) as { result?: string; error?: string }

      if (!response.ok) {
        setError(payload.error || "翻译失败。")
        return
      }

      setResult(payload.result || "")
    } catch {
      setError("请求失败，请检查本地服务或网络。")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
      <Panel title="输入">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>模式</FieldLabel>
            <Select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option className="bg-slate-950" value="zh-to-en">中译英</option>
              <option className="bg-slate-950" value="en-to-zh">英译中</option>
              <option className="bg-slate-950" value="rewrite-zh">中文润色</option>
              <option className="bg-slate-950" value="rewrite-en">英文润色</option>
              <option className="bg-slate-950" value="explain">技术表达解释</option>
            </Select>
          </label>
          <label className="grid gap-2">
            <FieldLabel>文本</FieldLabel>
            <TextArea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="粘贴需要翻译或改写的文本"
              className="min-h-64"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <ToolButton type="button" onClick={submit} disabled={!text.trim() || loading}>
              {loading ? "处理中..." : "翻译 / 改写"}
            </ToolButton>
            <ToolButton type="button" variant="subtle" onClick={() => setText("")}>
              <RefreshCcw className="size-4" />
              清空
            </ToolButton>
          </div>
        </div>
      </Panel>

      <Panel
        title="结果"
        aside={result ? <CopyButton text={result} /> : null}
      >
        {error ? (
          <div className="rounded-2xl border border-rose-200/18 bg-rose-300/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {error}
          </div>
        ) : (
          <pre className="min-h-64 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#050913]/70 p-4 text-sm leading-7 text-cyan-50/78">
            {result || "结果会显示在这里。术语表会自动作为约束传给模型。"}
          </pre>
        )}
      </Panel>
    </div>
  )
}

function extractVariables(template: string) {
  return Array.from(template.matchAll(/{{\s*([^{}\s]+)\s*}}/g))
    .map((match) => match[1])
    .filter((name, index, array) => array.indexOf(name) === index)
}

function PromptLibraryTool({
  prompts,
  setPrompts,
}: {
  prompts: PromptTemplate[]
  setPrompts: Dispatch<SetStateAction<PromptTemplate[]>>
}) {
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? "")
  const selected = prompts.find((prompt) => prompt.id === selectedId) ?? prompts[0]
  const variables = useMemo(() => extractVariables(selected?.body ?? ""), [selected?.body])
  const [values, setValues] = useState<Record<string, string>>({})

  const rendered = useMemo(() => {
    let output = selected?.body ?? ""
    for (const name of variables) {
      output = output.replaceAll(`{{${name}}}`, values[name] || `{{${name}}}`)
      output = output.replaceAll(`{{ ${name} }}`, values[name] || `{{${name}}}`)
    }
    return output
  }, [selected?.body, values, variables])

  function updateSelected(next: Partial<PromptTemplate>) {
    if (!selected) return
    setPrompts((current) =>
      current.map((prompt) => prompt.id === selected.id ? { ...prompt, ...next } : prompt)
    )
  }

  function addPrompt() {
    const prompt = {
      id: createId("prompt"),
      name: "新 Prompt",
      body: "请处理：{{任务}}",
    }
    setPrompts((current) => [prompt, ...current])
    setSelectedId(prompt.id)
  }

  function deletePrompt() {
    if (!selected) return
    const next = prompts.filter((prompt) => prompt.id !== selected.id)
    setPrompts(next)
    setSelectedId(next[0]?.id ?? "")
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Panel title="模板">
        <div className="grid gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => setSelectedId(prompt.id)}
              className={cn(
                "rounded-2xl border px-3 py-3 text-left text-sm transition",
                prompt.id === selected?.id
                  ? "border-cyan-100/24 bg-cyan-100/12 text-white"
                  : "border-white/8 bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
              )}
            >
              {prompt.name}
            </button>
          ))}
          <ToolButton type="button" onClick={addPrompt}>
            <Plus className="size-4" />
            新增模板
          </ToolButton>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="编辑"
          aside={
            selected ? (
              <ToolButton type="button" variant="danger" onClick={deletePrompt}>
                <Trash2 className="size-4" />
                删除
              </ToolButton>
            ) : null
          }
        >
          {selected ? (
            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel>名称</FieldLabel>
                <TextInput value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} />
              </label>
              <label className="grid gap-2">
                <FieldLabel>模板正文，用 {"{{变量名}}"} 标记变量</FieldLabel>
                <TextArea value={selected.body} onChange={(event) => updateSelected({ body: event.target.value })} className="min-h-64" />
              </label>
              {variables.map((name) => (
                <label key={name} className="grid gap-2">
                  <FieldLabel>{name}</FieldLabel>
                  <TextInput value={values[name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} />
                </label>
              ))}
            </div>
          ) : null}
        </Panel>

        <Panel title="生成结果" aside={<CopyButton text={rendered} />}>
          <pre className="min-h-64 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#050913]/70 p-4 text-sm leading-7 text-cyan-50/78">
            {rendered}
          </pre>
        </Panel>
      </div>
    </div>
  )
}

function SnippetsTool({
  snippets,
  setSnippets,
}: {
  snippets: Snippet[]
  setSnippets: Dispatch<SetStateAction<Snippet[]>>
}) {
  const [query, setQuery] = useState("")
  const [draft, setDraft] = useState<Snippet>({
    id: "",
    title: "",
    content: "",
    tags: "",
  })
  const filtered = snippets.filter((snippet) => {
    const haystack = `${snippet.title}\n${snippet.content}\n${snippet.tags}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  function saveSnippet() {
    if (!draft.title.trim() || !draft.content.trim()) return

    if (draft.id) {
      setSnippets((current) =>
        current.map((snippet) => snippet.id === draft.id ? draft : snippet)
      )
    } else {
      setSnippets((current) => [{ ...draft, id: createId("snippet") }, ...current])
    }

    setDraft({ id: "", title: "", content: "", tags: "" })
  }

  function removeSnippet(id: string) {
    setSnippets((current) => current.filter((snippet) => snippet.id !== id))
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">
      <Panel title={draft.id ? "编辑片段" : "新增片段"}>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>标题</FieldLabel>
            <TextInput value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="grid gap-2">
            <FieldLabel>内容</FieldLabel>
            <TextArea value={draft.content} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} className="min-h-52" />
          </label>
          <label className="grid gap-2">
            <FieldLabel>标签</FieldLabel>
            <TextInput value={draft.tags} onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))} placeholder="dev, prompt, deploy" />
          </label>
          <div className="flex flex-wrap gap-2">
            <ToolButton type="button" onClick={saveSnippet}>
              <Save className="size-4" />
              保存
            </ToolButton>
            <ToolButton type="button" variant="subtle" onClick={() => setDraft({ id: "", title: "", content: "", tags: "" })}>
              清空
            </ToolButton>
          </div>
        </div>
      </Panel>

      <Panel title="片段库">
        <div className="mb-4">
          <TextInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、内容或标签" />
        </div>
        <div className="grid gap-3">
          {filtered.map((snippet) => (
            <article key={snippet.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-white">{snippet.title}</h4>
                  <p className="mt-1 text-xs text-white/42">{snippet.tags}</p>
                </div>
                <div className="flex gap-2">
                  <CopyButton text={snippet.content} />
                  <ToolButton type="button" variant="subtle" onClick={() => setDraft(snippet)}>
                    编辑
                  </ToolButton>
                  <ToolButton type="button" variant="danger" onClick={() => removeSnippet(snippet.id)}>
                    <Trash2 className="size-4" />
                  </ToolButton>
                </div>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-black/24 p-3 text-xs leading-5 text-cyan-50/70">
                {snippet.content}
              </pre>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function GlossaryTool({
  glossary,
  setGlossary,
}: {
  glossary: GlossaryTerm[]
  setGlossary: Dispatch<SetStateAction<GlossaryTerm[]>>
}) {
  const [draft, setDraft] = useState<GlossaryTerm>({
    id: "",
    term: "",
    translation: "",
    note: "",
  })
  const exportText = glossaryToPrompt(glossary)

  function saveTerm() {
    if (!draft.term.trim()) return

    if (draft.id) {
      setGlossary((current) =>
        current.map((term) => term.id === draft.id ? draft : term)
      )
    } else {
      setGlossary((current) => [{ ...draft, id: createId("term") }, ...current])
    }

    setDraft({ id: "", term: "", translation: "", note: "" })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">
      <Panel title={draft.id ? "编辑术语" : "新增术语"}>
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>术语</FieldLabel>
            <TextInput value={draft.term} onChange={(event) => setDraft((current) => ({ ...current, term: event.target.value }))} placeholder="Agent" />
          </label>
          <label className="grid gap-2">
            <FieldLabel>固定译法</FieldLabel>
            <TextInput value={draft.translation} onChange={(event) => setDraft((current) => ({ ...current, translation: event.target.value }))} placeholder="Agent" />
          </label>
          <label className="grid gap-2">
            <FieldLabel>说明</FieldLabel>
            <TextArea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="min-h-28" />
          </label>
          <ToolButton type="button" onClick={saveTerm}>
            <Save className="size-4" />
            保存术语
          </ToolButton>
        </div>
      </Panel>

      <Panel title="术语表" aside={<CopyButton text={exportText} label="复制术语表" />}>
        <div className="grid gap-3">
          {glossary.map((term) => (
            <article key={term.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-medium text-white">{term.term}</h4>
                  <p className="mt-1 text-sm text-cyan-50/72">{term.translation || term.term}</p>
                </div>
                <div className="flex gap-2">
                  <ToolButton type="button" variant="subtle" onClick={() => setDraft(term)}>
                    编辑
                  </ToolButton>
                  <ToolButton type="button" variant="danger" onClick={() => setGlossary((current) => current.filter((item) => item.id !== term.id))}>
                    <Trash2 className="size-4" />
                  </ToolButton>
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/56">{term.note}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function ChinaCalendarTool() {
  const [date, setDate] = useState(getTodayString)
  const [rangeStart, setRangeStart] = useState(getTodayString)
  const [rangeEnd, setRangeEnd] = useState("2026-06-30")

  const info = classifyChinaDate(date)
  const workdays = countChinaWorkdays(rangeStart, rangeEnd)
  const upcoming = getUpcomingChinaHolidays(date)

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
      <Panel title="日期判断">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>日期</FieldLabel>
            <TextInput type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <div className="rounded-3xl border border-cyan-100/18 bg-cyan-100/10 p-5">
            <p className="font-mono text-xs uppercase text-cyan-100/52">{info.weekday}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">{info.label}</h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{info.detail}</p>
            <p className="mt-4 text-sm text-white/48">
              {info.isWorkday ? "这一天按工作日计算。" : "这一天不按工作日计算。"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2">
              <FieldLabel>开始日期</FieldLabel>
              <TextInput type="date" value={rangeStart} onChange={(event) => setRangeStart(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <FieldLabel>结束日期</FieldLabel>
              <TextInput type="date" value={rangeEnd} onChange={(event) => setRangeEnd(event.target.value)} />
            </label>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white/70">
            区间内工作日：<span className="text-lg font-semibold text-white">{workdays}</span> 天
          </div>
        </div>
      </Panel>

      <Panel title="后续假期">
        <div className="grid gap-3">
          {upcoming.map((holiday) => (
            <article key={holiday.name} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-medium text-white">{holiday.name}</h4>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">
                  {holiday.days} 天
                </span>
              </div>
              <p className="mt-2 text-sm text-white/58">{holiday.start} 至 {holiday.end}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-white/42">
          数据来源：{chinaHolidaySource.title}
        </p>
      </Panel>
    </div>
  )
}

function toIcsDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function buildIcs(reminders: Reminder[]) {
  const events = reminders
    .filter((reminder) => reminder.dueAt)
    .map((reminder) =>
      [
        "BEGIN:VEVENT",
        `UID:${reminder.id}@zhiqiang.chat`,
        `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
        `DTSTART:${toIcsDate(reminder.dueAt)}`,
        `SUMMARY:${reminder.title.replace(/\n/g, " ")}`,
        reminder.note ? `DESCRIPTION:${reminder.note.replace(/\n/g, "\\n")}` : "",
        "END:VEVENT",
      ].filter(Boolean).join("\n")
    )
    .join("\n")

  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//zhiqiang.chat//Tools//CN", events, "END:VCALENDAR"].join("\n")
}

function RemindersTool({
  reminders,
  setReminders,
}: {
  reminders: Reminder[]
  setReminders: Dispatch<SetStateAction<Reminder[]>>
}) {
  const [draft, setDraft] = useState({ title: "", dueAt: "", note: "" })
  const pending = reminders.filter((reminder) => !reminder.done)
  const done = reminders.filter((reminder) => reminder.done)

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now()
      setReminders((current) =>
        current.map((reminder) => {
          const due = reminder.dueAt ? new Date(reminder.dueAt).getTime() : Number.POSITIVE_INFINITY
          if (reminder.done || reminder.notified || due > now) return reminder

          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(reminder.title, { body: reminder.note || "提醒时间到了。" })
          }

          return { ...reminder, notified: true }
        })
      )
    }, 15_000)

    return () => window.clearInterval(timer)
  }, [setReminders])

  async function requestNotification() {
    if (!("Notification" in window)) return
    await Notification.requestPermission()
  }

  function addReminder() {
    if (!draft.title.trim() || !draft.dueAt) return
    setReminders((current) => [
      {
        id: createId("reminder"),
        title: draft.title,
        dueAt: draft.dueAt,
        note: draft.note,
        done: false,
        notified: false,
      },
      ...current,
    ])
    setDraft({ title: "", dueAt: "", note: "" })
  }

  function updateReminder(id: string, next: Partial<Reminder>) {
    setReminders((current) =>
      current.map((reminder) => reminder.id === id ? { ...reminder, ...next } : reminder)
    )
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">
      <Panel title="新增提醒">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>标题</FieldLabel>
            <TextInput value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label className="grid gap-2">
            <FieldLabel>时间</FieldLabel>
            <TextInput type="datetime-local" value={draft.dueAt} onChange={(event) => setDraft((current) => ({ ...current, dueAt: event.target.value }))} />
          </label>
          <label className="grid gap-2">
            <FieldLabel>备注</FieldLabel>
            <TextArea value={draft.note} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} className="min-h-28" />
          </label>
          <div className="flex flex-wrap gap-2">
            <ToolButton type="button" onClick={addReminder}>
              <Plus className="size-4" />
              添加
            </ToolButton>
            <ToolButton type="button" variant="subtle" onClick={requestNotification}>
              <Bell className="size-4" />
              开启浏览器通知
            </ToolButton>
            <ToolButton type="button" variant="subtle" onClick={() => downloadText("zhiqiang-reminders.ics", buildIcs(reminders))}>
              <Download className="size-4" />
              导出 ICS
            </ToolButton>
          </div>
        </div>
      </Panel>

      <Panel title="提醒列表">
        <div className="grid gap-3">
          {[...pending, ...done].map((reminder) => (
            <article key={reminder.id} className={cn("rounded-2xl border p-3", reminder.done ? "border-white/8 bg-white/[0.025] opacity-60" : "border-white/10 bg-white/[0.045]")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium text-white">{reminder.title}</h4>
                  <p className="mt-1 text-sm text-cyan-50/62">{reminder.dueAt.replace("T", " ")}</p>
                  {reminder.note ? <p className="mt-2 text-sm leading-6 text-white/54">{reminder.note}</p> : null}
                </div>
                <div className="flex gap-2">
                  <ToolButton type="button" variant="subtle" onClick={() => updateReminder(reminder.id, { done: !reminder.done })}>
                    {reminder.done ? "恢复" : "完成"}
                  </ToolButton>
                  <ToolButton type="button" variant="danger" onClick={() => setReminders((current) => current.filter((item) => item.id !== reminder.id))}>
                    <Trash2 className="size-4" />
                  </ToolButton>
                </div>
              </div>
            </article>
          ))}
          {reminders.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/50">
              暂无提醒。提醒只保存在当前浏览器。
            </p>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}

function LighthouseTool() {
  const [url, setUrl] = useState("https://zhiqiang.chat")
  const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`
  const command = `npx lighthouse ${url} --view`

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)]">
      <Panel title="目标页面">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <FieldLabel>URL</FieldLabel>
            <TextInput value={url} onChange={(event) => setUrl(event.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <a href={pageSpeedUrl} target="_blank" rel="noreferrer">
              <ToolButton type="button">
                <ExternalLink className="size-4" />
                打开 PageSpeed Insights
              </ToolButton>
            </a>
            <CopyButton text={command} label="复制 Lighthouse 命令" />
          </div>
        </div>
      </Panel>

      <Panel title="本地命令">
        <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#050913]/70 p-4 font-mono text-sm leading-7 text-cyan-50/78">
          {command}
        </pre>
        <p className="mt-4 text-sm leading-6 text-white/52">
          这里不做自研 SEO 打分。性能、可访问性、最佳实践和 SEO 直接交给 Lighthouse；站内只提供入口和命令。
        </p>
      </Panel>
    </div>
  )
}

export function ToolsWorkbench() {
  const [activeId, setActiveId] = useState<ToolId>("translate")
  const [prompts, setPrompts] = useLocalList<PromptTemplate>("zhiqiang-tools-prompts", defaultPrompts)
  const [snippets, setSnippets] = useLocalList<Snippet>("zhiqiang-tools-snippets", defaultSnippets)
  const [glossary, setGlossary] = useLocalList<GlossaryTerm>("zhiqiang-tools-glossary", defaultGlossary)
  const [reminders, setReminders] = useLocalList<Reminder>("zhiqiang-tools-reminders", defaultReminders)
  const activeTool = toolDefinitions.find((tool) => tool.id === activeId) ?? toolDefinitions[0]
  const ActiveIcon = activeTool.Icon

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <ToolSwitcher activeTool={activeTool} onSelect={setActiveId} />

      <div className="grid content-start gap-5">
        <section className="rounded-[32px] border border-white/12 bg-white/[0.07] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100/20 bg-cyan-100/12 text-cyan-100">
              <ActiveIcon className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[11px] uppercase text-cyan-100/50">
                  {activeTool.eyebrow}
                </p>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/46">
                  {activeTool.local ? "本地保存" : "服务端处理"}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold leading-tight text-white">
                {activeTool.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
                {activeTool.description}
              </p>
            </div>
          </div>
        </section>

        {activeId === "translate" ? <TranslateTool glossary={glossary} /> : null}
        {activeId === "prompt-library" ? <PromptLibraryTool prompts={prompts} setPrompts={setPrompts} /> : null}
        {activeId === "snippets" ? <SnippetsTool snippets={snippets} setSnippets={setSnippets} /> : null}
        {activeId === "glossary" ? <GlossaryTool glossary={glossary} setGlossary={setGlossary} /> : null}
        {activeId === "china-calendar" ? <ChinaCalendarTool /> : null}
        {activeId === "reminders" ? <RemindersTool reminders={reminders} setReminders={setReminders} /> : null}
        {activeId === "lighthouse" ? <LighthouseTool /> : null}
      </div>
    </div>
  )
}
