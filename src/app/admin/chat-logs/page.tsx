"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
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

export default function ChatLogsPage() {
  const [token, setToken] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [logs, setLogs] = useState<ChatLog[]>([])
  const [rateLimitEvents, setRateLimitEvents] = useState<RateLimitEvent[]>([])
  const [siteVisitLogs, setSiteVisitLogs] = useState<SiteVisitLog[]>([])
  const [configured, setConfigured] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setToken(window.sessionStorage.getItem(tokenStorageKey) ?? "")
  }, [])

  const filteredSummary = useMemo(() => {
    const completedCount = logs.filter((log) => log.status === "completed").length
    const failedCount = logs.filter((log) => log.status === "failed" || log.error_message).length
    const timedLogs = logs.filter(
      (log): log is ChatLog & { duration_ms: number } => typeof log.duration_ms === "number"
    )
    const totalDuration = timedLogs.reduce((sum, log) => sum + log.duration_ms, 0)
    const rejectedRateLimitCount = rateLimitEvents.filter((event) => event.event === "rejected").length

    return {
      count: logs.length,
      visitCount: siteVisitLogs.length,
      completedCount,
      failedCount,
      averageDuration: timedLogs.length ? Math.round(totalDuration / timedLogs.length) : 0,
      rejectedRateLimitCount,
    }
  }, [logs, rateLimitEvents, siteVisitLogs])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const searchParams = new URLSearchParams({
        limit: "80",
        status,
      })

      if (query.trim()) {
        searchParams.set("q", query.trim())
      }

      const response = await fetch(`/api/admin/chat-logs?${searchParams}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      const payload = (await response.json()) as ChatLogResponse

      if (!response.ok) {
        throw new Error(payload.error ?? "读取日志失败。")
      }

      setConfigured(payload.configured)
      setLogs(payload.logs)
      setRateLimitEvents(payload.rateLimitEvents ?? [])
      setSiteVisitLogs(payload.siteVisitLogs ?? [])
      setMessage(payload.message ?? payload.rateLimitError ?? payload.siteVisitError ?? "")

      if (token) {
        window.sessionStorage.setItem(tokenStorageKey, token)
      }
    } catch (requestError) {
      setLogs([])
      setRateLimitEvents([])
      setSiteVisitLogs([])
      setError(requestError instanceof Error ? requestError.message : "读取日志失败。")
    } finally {
      setLoading(false)
    }
  }, [query, status, token])

  useEffect(() => {
    void loadLogs()
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
                聊天日志
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
                只看问题、命中资料和错误状态，不在这里展示完整对话。
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="relative block">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/36" />
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  type="password"
                  placeholder="后台访问口令"
                  className="h-11 w-full min-w-64 rounded-2xl border border-white/10 bg-white/[0.05] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-100/32"
                />
              </label>
              <button
                type="button"
                onClick={() => void loadLogs()}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-100/20 bg-cyan-100/12 px-4 text-sm text-cyan-50 transition hover:bg-cyan-100/18 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                刷新
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索问题关键词"
                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-cyan-100/32"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-2xl border border-white/10 bg-[#111827] px-3 text-sm text-white outline-none focus:border-cyan-100/32"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100/78">
              <AlertTriangle className="size-4" />
              {error}
            </div>
          ) : null}

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
                      <p className="line-clamp-2 leading-6">{log.question_preview}</p>
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
                      {log.source_count}
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
      </section>
    </main>
  )
}
