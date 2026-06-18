import type { NextRequest } from "next/server"

export const runtime = "nodejs"

const defaultRemoteLogTable = "chat_question_logs"
const defaultRateLimitTable = "chat_rate_limit_events"
const defaultSiteVisitTable = "site_visit_logs"
const maxLimit = 100

interface RemoteChatLog {
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

interface RemoteRateLimitEvent {
  id: string
  created_at: string
  client_id: string
  session_id: string | null
  event: string
  window_ms: number
  limit_count: number
  request_count: number
}

interface RemoteSiteVisitLog {
  id: string
  created_at: string
  session_id: string
  client_id: string
  path: string
  referrer: string | null
  user_agent: string | null
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return ""

  return authorization.slice("Bearer ".length).trim()
}

function checkAdminAccess(request: NextRequest) {
  const adminToken = process.env.ADMIN_ACCESS_TOKEN

  if (!adminToken) {
    return process.env.NODE_ENV !== "production"
  }

  return getBearerToken(request) === adminToken
}

function getLimit(value: string | null) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 50

  return Math.min(Math.max(Math.trunc(parsed), 1), maxLimit)
}

function cleanFilterValue(value: string | null) {
  return value?.replace(/[*,]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || ""
}

function jsonResponse(body: unknown, init?: ResponseInit) {
  return Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...init?.headers,
    },
  })
}

export async function GET(request: NextRequest) {
  if (!checkAdminAccess(request)) {
    return jsonResponse({ error: "没有权限查看日志。" }, { status: 401 })
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tableName = process.env.SUPABASE_CHAT_LOG_TABLE || defaultRemoteLogTable
  const rateLimitTableName = process.env.SUPABASE_RATE_LIMIT_TABLE || defaultRateLimitTable
  const siteVisitTableName = process.env.SUPABASE_SITE_VISIT_TABLE || defaultSiteVisitTable

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({
      configured: false,
      logs: [],
      rateLimitEvents: [],
      siteVisitLogs: [],
      message: "还没有配置 Supabase 日志环境变量。",
    })
  }

  const searchParams = request.nextUrl.searchParams
  const status = cleanFilterValue(searchParams.get("status"))
  const query = cleanFilterValue(searchParams.get("q"))
  const limit = getLimit(searchParams.get("limit"))

  const url = new URL(`${supabaseUrl}/rest/v1/${tableName}`)
  url.searchParams.set(
    "select",
    [
      "id",
      "created_at",
      "session_id",
      "client_id",
      "question_preview",
      "question_length",
      "message_count",
      "total_message_length",
      "source_ids",
      "source_count",
      "mode",
      "status",
      "error_message",
      "duration_ms",
      "response_length",
      "upstream_status",
      "completed_at",
      "updated_at",
      "user_agent",
      "referrer",
    ].join(",")
  )
  url.searchParams.set("order", "created_at.desc")
  url.searchParams.set("limit", String(limit))

  if (status && status !== "all") {
    url.searchParams.set("status", `eq.${status}`)
  }

  if (query) {
    url.searchParams.set("question_preview", `ilike.*${query}*`)
  }

  const rateLimitUrl = new URL(`${supabaseUrl}/rest/v1/${rateLimitTableName}`)
  rateLimitUrl.searchParams.set(
    "select",
    [
      "id",
      "created_at",
      "client_id",
      "session_id",
      "event",
      "window_ms",
      "limit_count",
      "request_count",
    ].join(",")
  )
  rateLimitUrl.searchParams.set("order", "created_at.desc")
  rateLimitUrl.searchParams.set("limit", String(limit))

  const siteVisitUrl = new URL(`${supabaseUrl}/rest/v1/${siteVisitTableName}`)
  siteVisitUrl.searchParams.set(
    "select",
    [
      "id",
      "created_at",
      "session_id",
      "client_id",
      "path",
      "referrer",
      "user_agent",
    ].join(",")
  )
  siteVisitUrl.searchParams.set("order", "created_at.desc")
  siteVisitUrl.searchParams.set("limit", String(limit))

  const requestHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  }

  const [response, rateLimitResponse, siteVisitResponse] = await Promise.all([
    fetch(url, { headers: requestHeaders }),
    fetch(rateLimitUrl, { headers: requestHeaders }),
    fetch(siteVisitUrl, { headers: requestHeaders }),
  ])

  if (!response.ok) {
    return jsonResponse(
      { error: `读取 Supabase 日志失败：${response.status}` },
      { status: 502 }
    )
  }

  const logs = (await response.json()) as RemoteChatLog[]
  const rateLimitEvents = rateLimitResponse.ok
    ? ((await rateLimitResponse.json()) as RemoteRateLimitEvent[])
    : []
  const siteVisitLogs = siteVisitResponse.ok
    ? ((await siteVisitResponse.json()) as RemoteSiteVisitLog[])
    : []

  return jsonResponse({
    configured: true,
    logs,
    rateLimitEvents,
    siteVisitLogs,
    rateLimitError: rateLimitResponse.ok
      ? undefined
      : `读取限流事件失败：${rateLimitResponse.status}`,
    siteVisitError: siteVisitResponse.ok
      ? undefined
      : `读取访问日志失败：${siteVisitResponse.status}`,
  })
}
