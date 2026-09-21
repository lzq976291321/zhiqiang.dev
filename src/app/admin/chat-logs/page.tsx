"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Database,
  LockKeyhole,
  RefreshCw,
  Search,
} from "lucide-react"

interface ChatLog {
  id: string
  created_at: string
  session_id: string
  client_id: string | null
  question_preview: string
  question_length: number
  message_count: number | null
  total_message_length: number | null
  source_ids: string[] | null
  source_count: number
  mode: string | null
  status: string | null
  error_message: string | null
  duration_ms: number | null
  response_length: number | null
  upstream_status: number | null
  completed_at: string | null
  updated_at: string | null
  user_agent: string | null
  referrer: string | null
}

interface RateLimitEvent {
  id: string
  created_at: string
  client_id: string
  session_id: string | null
  event: string
  window_ms: number
  limit_count: number
  request_count: number
}

interface SiteVisitLog {
  id: string
  created_at: string
  session_id: string
  client_id: string
  path: string
  referrer: string | null
  user_agent: string | null
}

interface ChatLogResponse {
  configured: boolean
  logs: ChatLog[]
  rateLimitEvents: RateLimitEvent[]
  siteVisitLogs: SiteVisitLog[]
  total?: number | null
  hasMore?: boolean
  message?: string
  error?: string
  rateLimitError?: string
  siteVisitError?: string
}

const tokenStorageKey = "zhiqiang-admin-chat-logs-token"

const statusOptions = [
  { label: "全部", value: "all" },
  { label: "已收到", value: "received" },
  { label: "成功", value: "completed" },
  { label: "失败", value: "failed" },
]

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString("zh-CN", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function getStatusLabel(status: string | null) {
  if (!status) return "未知"

  return statusOptions.find((option) => option.value === status)?.label ?? status
}

function getModeLabel(mode: string | null) {
  if (mode === "deepseek") return "DeepSeek"
  if (mode === "local_fallback") return "本地"

  return mode ?? "-"
}

function getKnowledgeSourceCount(sourceIds: string[] | null) {
  if (!sourceIds) return 0

  let count = 0
  for (const sourceId of sourceIds) {
    if (sourceId.startsWith("knowledge.")) count += 1
  }

  return count
}

export default function ChatLogsPage() {
  const [token, setToken] = useState("")
  const [tokenInput, setTokenInput] = useState("")
  const [authenticated, setAuthenticated] = useState(false)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [logs, setLogs] = useState<ChatLog[]>([])
  const [rateLimitEvents, setRateLimitEvents] = useState<RateLimitEvent[]>([])
  const [siteVisitLogs, setSiteVisitLogs] = useState<SiteVisitLog[]>([])
  const [configured, setConfigured] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  const pageSize = 80

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(tokenStorageKey) ?? ""
      setTokenInput(saved)
      setToken(saved)
    } catch {
      // 浏览器禁用存储时，仍可手动输入口令查看。
    }
  }, [])

  const filteredSummary = useMemo(() => {
    let completedCount = 0
    let failedCount = 0
    let noSourceCount = 0
    let knowledgeHitCount = 0
    let totalDuration = 0
    let timedLogCount = 0
    let rejectedRateLimitCount = 0

    for (const log of logs) {
      if (log.status === "completed") completedCount += 1
      if (log.status === "failed" || log.error_message) failedCount += 1
      if (log.source_count === 0) noSourceCount += 1
      if (getKnowledgeSourceCount(log.source_ids) > 0) knowledgeHitCount += 1

      if (typeof log.duration_ms === "number") {
        totalDuration += log.duration_ms
        timedLogCount += 1
      }
    }

    for (const event of rateLimitEvents) {
      if (event.event === "rejected") rejectedRateLimitCount += 1
    }

    return {
      count: logs.length,
      visitCount: siteVisitLogs.length,
      completedCount,
      failedCount,
      noSourceCount,
      knowledgeHitCount,
      averageDuration: timedLogCount ? Math.round(totalDuration / timedLogCount) : 0,
      rejectedRateLimitCount,
    }
  }, [logs, rateLimitEvents, siteVisitLogs])

  const loadLogs = useCallback(async () => {
    if (!token) return
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const searchParams = new URLSearchParams({
        limit: String(pageSize),
        status,
        offset: String(offset),
      })

      if (query.trim()) {
        searchParams.set("q", query.trim())
      }

      const response = await fetch(`/api/admin/chat-logs?${searchParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        signal: controller.signal,
      })
      const payload = (await response.json()) as ChatLogResponse
      if (controller.signal.aborted) return

      if (!response.ok) {
        if (response.status === 401) {
          setAuthenticated(false)
          setToken("")
          try { window.sessionStorage.removeItem(tokenStorageKey) } catch {}
          throw new Error("口令不正确或已失效，请重新输入后台访问口令。")
        }
        throw new Error(payload.error ?? "读取日志失败。")
      }

      setAuthenticated(true)
      setConfigured(payload.configured)
      setLogs(payload.logs)
      setTotal(payload.total ?? null)
      setHasMore(payload.hasMore ?? false)
      setRateLimitEvents(payload.rateLimitEvents ?? [])
      setSiteVisitLogs(payload.siteVisitLogs ?? [])
      setMessage(payload.message ?? payload.rateLimitError ?? payload.siteVisitError ?? "")

      if (token) {
        try { window.sessionStorage.setItem(tokenStorageKey, token) } catch {}
      }
    } catch (requestError) {
      if (controller.signal.aborted) return
      setLogs([])
      setTotal(null)
      setHasMore(false)
      setRateLimitEvents([])
      setSiteVisitLogs([])
      setError(requestError instanceof Error ? requestError.message : "读取日志失败。")
    } finally {
      if (requestRef.current === controller) setLoading(false)
    }
  }, [query, status, token, offset])

  useEffect(() => {
    void loadLogs()
    return () => requestRef.current?.abort()
  }, [loadLogs])

  return (
    <main className="min-h-screen px-4 pb-10 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto max-w-6xl space-y-5">
        <div className="glass-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/52">
                <Database className="size-4" />
                Chat logs
              </div>
              <h1 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                用户提问
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
                问题会在回答结束或中断后自动收集。展开查看全文，搜索关键词，找出值得补充的知识。
              </p>
            </div>

            <form className="grid gap-2 sm:grid-cols-[1fr_auto]" onSubmit={(event) => {
              event.preventDefault()
              const submitted = tokenInput.trim()
              if (!submitted) return
              setError("")
              if (submitted === token && offset === 0) void loadLogs()
              else { setOffset(0); setToken(submitted) }
            }}>
              <label className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
                <input
                  value={tokenInput}
                  onChange={(event) => setTokenInput(event.target.value)}
                  type="password"
                  aria-label="后台访问口令"
                  autoComplete="current-password"
                  required
                  placeholder="后台访问口令"
                  className="h-11 w-full min-w-64 rounded-2xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-100/32"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-100/20 bg-cyan-100/12 px-4 text-sm text-cyan-50 transition hover:bg-cyan-100/18 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "正在读取" : authenticated ? "刷新" : "查看提问"}
              </button>
            </form>
          </div>
          {!authenticated ? (
            <p className="mt-4 text-sm text-white/54" role="status">请输入后台访问口令，再点击“查看提问”。口令仅在当前标签页记住。</p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-100/80" role="alert">{error}</p> : null}
        </div>

        {authenticated ? <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">访问数</p>
            <p className="mt-2 text-2xl font-semibold text-white">{filteredSummary.visitCount}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">提问数</p>
            <p className="mt-2 text-2xl font-semibold text-white">{filteredSummary.count}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">成功 / 失败</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {filteredSummary.completedCount} / {filteredSummary.failedCount}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">平均耗时</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {filteredSummary.averageDuration ? `${filteredSummary.averageDuration}ms` : "-"}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">知识命中 / 缺口</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {filteredSummary.knowledgeHitCount} / {filteredSummary.noSourceCount}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-white/42">限流拒绝</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {filteredSummary.rejectedRateLimitCount}
            </p>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-5">
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
              <input
                value={query}
                onChange={(event) => { setQuery(event.target.value); setOffset(0) }}
                placeholder="搜索问题关键词"
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-100/32"
              />
            </label>
            <select
              value={status}
              onChange={(event) => { setStatus(event.target.value); setOffset(0) }}
              className="h-11 rounded-2xl border border-white/10 bg-[#111827] px-3 text-sm text-white outline-none focus:border-cyan-100/32"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {message || !configured ? (
            <div className="mb-4 rounded-2xl border border-amber-200/18 bg-amber-200/10 px-3 py-2 text-sm text-amber-50/76">
              {message || "还没有配置 Supabase 日志环境变量。"}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
              <thead className="text-xs text-white/42">
                <tr>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">时间</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">问题</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">状态</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">模式</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">来源</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">耗时</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">会话</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="text-white/68">
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top font-mono text-xs text-white/46">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="max-w-[28rem] border-b border-white/[0.08] px-3 py-3 align-top">
                      <details>
                        <summary className="cursor-pointer leading-6">
                          <span className="whitespace-pre-wrap break-words">{log.question_preview.slice(0, 100)}{log.question_preview.length > 100 ? "…" : ""}</span>
                          <span className="ml-2 text-xs text-cyan-100/70">展开全文</span>
                        </summary>
                        <p className="mt-3 whitespace-pre-wrap break-words leading-6">{log.question_preview}</p>
                        {log.question_length > 500 && log.question_preview.length <= 500 ? (
                          <p className="mt-2 text-xs text-amber-100/60">旧记录仅保留了问题摘要。</p>
                        ) : null}
                      </details>
                      <p className="mt-1 text-xs text-white/36">
                        消息 {log.message_count ?? "-"} 条
                        {" · "}
                        输入 {log.total_message_length ?? log.question_length} 字
                        {" · "}
                        响应 {log.response_length ?? "-"} 字
                        {log.upstream_status ? ` · 上游 ${log.upstream_status}` : ""}
                      </p>
                      {log.error_message ? (
                        <p className="mt-1 text-xs text-red-100/70">{log.error_message}</p>
                      ) : null}
                    </td>
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top">
                      {getStatusLabel(log.status)}
                    </td>
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top">
                      {getModeLabel(log.mode)}
                    </td>
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top">
                      <p>{log.source_count}</p>
                      <p className="mt-1 text-xs text-white/36">
                        知识 {getKnowledgeSourceCount(log.source_ids)}
                      </p>
                    </td>
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top">
                      {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                    </td>
                    <td className="max-w-[13rem] border-b border-white/[0.08] px-3 py-3 align-top font-mono text-xs text-white/42">
                      <p className="truncate">{log.session_id}</p>
                      {log.client_id ? (
                        <p className="mt-1 truncate text-white/30">{log.client_id}</p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/54">
            <span>{total === null ? `本页 ${logs.length} 条` : `共 ${total} 条`} · 第 {Math.floor(offset / pageSize) + 1} 页</span>
            <div className="flex gap-3">
              <button type="button" disabled={loading || offset === 0} onClick={() => setOffset(Math.max(0, offset - pageSize))} className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-30">上一页</button>
              <button type="button" disabled={loading || !hasMore} onClick={() => setOffset(offset + pageSize)} className="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-30">下一页</button>
            </div>
          </div>

          {!loading && logs.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/44">
              暂无日志。
            </div>
          ) : null}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white/86">访问日志</h2>
            <span className="text-xs text-white/38">{siteVisitLogs.length} 条</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-separate border-spacing-0 text-left text-sm">
              <thead className="text-xs text-white/42">
                <tr>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">时间</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">路径</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">来源</th>
                  <th className="border-b border-white/10 px-3 py-3 font-medium">会话</th>
                </tr>
              </thead>
              <tbody>
                {siteVisitLogs.map((visit) => (
                  <tr key={visit.id} className="text-white/68">
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top font-mono text-xs text-white/46">
                      {formatDate(visit.created_at)}
                    </td>
                    <td className="border-b border-white/[0.08] px-3 py-3 align-top font-mono text-xs">
                      {visit.path}
                    </td>
                    <td className="max-w-[16rem] truncate border-b border-white/[0.08] px-3 py-3 align-top text-xs text-white/46">
                      {visit.referrer || "-"}
                    </td>
                    <td className="max-w-[13rem] border-b border-white/[0.08] px-3 py-3 align-top font-mono text-xs text-white/42">
                      <p className="truncate">{visit.session_id}</p>
                      <p className="mt-1 truncate text-white/30">{visit.client_id}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && siteVisitLogs.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/44">
              暂无访问日志。
            </div>
          ) : null}
        </div>
        </> : null}
      </section>
    </main>
  )
}
