const defaultSiteVisitTable = "site_visit_logs"
const MAX_CLIENT_ID_LENGTH = 120
const MAX_SESSION_ID_LENGTH = 64
const MAX_PATH_LENGTH = 240
const MAX_REFERRER_LENGTH = 240
const MAX_USER_AGENT_LENGTH = 180

interface SiteVisitLogInput {
  path: string
  sessionId?: string
  clientId: string
  userAgent?: string | null
  referrer?: string | null
}

function getRemoteVisitConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tableName = process.env.SUPABASE_SITE_VISIT_TABLE || defaultSiteVisitTable

  if (!supabaseUrl || !serviceRoleKey) return null

  return {
    tableUrl: `${supabaseUrl}/rest/v1/${tableName}`,
    serviceRoleKey,
  }
}

function normalizeClientId(clientId: string) {
  return clientId.trim().slice(0, MAX_CLIENT_ID_LENGTH) || "anonymous"
}

function normalizePath(path: string) {
  const normalized = path.replace(/\s+/g, " ").trim().slice(0, MAX_PATH_LENGTH)
  return normalized.startsWith("/") ? normalized : "/"
}

export async function recordSiteVisit({
  path,
  sessionId,
  clientId,
  userAgent,
  referrer,
}: SiteVisitLogInput) {
  const timestamp = new Date().toISOString()
  const record = {
    event: "site_visit",
    timestamp,
    sessionId: sessionId?.slice(0, MAX_SESSION_ID_LENGTH) || "anonymous",
    clientId: normalizeClientId(clientId),
    path: normalizePath(path),
    userAgent: userAgent?.slice(0, MAX_USER_AGENT_LENGTH) || null,
    referrer: referrer?.slice(0, MAX_REFERRER_LENGTH) || null,
  }

  console.info(JSON.stringify(record))

  const remoteConfig = getRemoteVisitConfig()
  if (!remoteConfig) return

  const response = await fetch(remoteConfig.tableUrl, {
    method: "POST",
    headers: {
      apikey: remoteConfig.serviceRoleKey,
      Authorization: `Bearer ${remoteConfig.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      created_at: record.timestamp,
      session_id: record.sessionId,
      client_id: record.clientId,
      path: record.path,
      user_agent: record.userAgent,
      referrer: record.referrer,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to write remote site visit log: ${response.status}`)
  }
}
