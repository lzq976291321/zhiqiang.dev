const defaultRateLimitTable = "chat_rate_limit_events"
const MAX_CLIENT_ID_LENGTH = 120
const MAX_SESSION_ID_LENGTH = 64

const memoryRateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface ChatRateLimitInput {
  clientId: string
  sessionId?: string
  windowMs: number
  maxRequests: number
}

function getRemoteRateLimitConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tableName = process.env.SUPABASE_RATE_LIMIT_TABLE || defaultRateLimitTable

  if (!supabaseUrl || !serviceRoleKey) return null

  return {
    tableUrl: `${supabaseUrl}/rest/v1/${tableName}`,
    serviceRoleKey,
  }
}

function normalizeClientId(clientId: string) {
  return clientId.trim().slice(0, MAX_CLIENT_ID_LENGTH) || "anonymous"
}

function checkMemoryRateLimit({ clientId, windowMs, maxRequests }: ChatRateLimitInput) {
  const normalizedClientId = normalizeClientId(clientId)
  const now = Date.now()
  const bucket = memoryRateLimitStore.get(normalizedClientId)

  if (!bucket || bucket.resetAt <= now) {
    memoryRateLimitStore.set(normalizedClientId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= maxRequests) return false

  bucket.count += 1
  return true
}

function parseContentRange(value: string | null) {
  const total = value?.split("/")?.[1]
  const count = Number(total)

  return Number.isFinite(count) ? count : 0
}

async function countRecentRateLimitEvents({
  tableUrl,
  serviceRoleKey,
  clientId,
  windowMs,
}: {
  tableUrl: string
  serviceRoleKey: string
  clientId: string
  windowMs: number
}) {
  const url = new URL(tableUrl)
  url.searchParams.set("select", "id")
  url.searchParams.set("client_id", `eq.${clientId}`)
  url.searchParams.set("created_at", `gte.${new Date(Date.now() - windowMs).toISOString()}`)

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to count remote rate limit events: ${response.status}`)
  }

  return parseContentRange(response.headers.get("content-range"))
}

async function writeRateLimitEvent({
  tableUrl,
  serviceRoleKey,
  clientId,
  sessionId,
  event,
  windowMs,
  maxRequests,
  requestCount,
}: {
  tableUrl: string
  serviceRoleKey: string
  clientId: string
  sessionId?: string
  event: "accepted" | "rejected"
  windowMs: number
  maxRequests: number
  requestCount: number
}) {
  const response = await fetch(tableUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      client_id: clientId,
      session_id: sessionId?.slice(0, MAX_SESSION_ID_LENGTH) || null,
      event,
      window_ms: windowMs,
      limit_count: maxRequests,
      request_count: requestCount,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to write remote rate limit event: ${response.status}`)
  }
}

export async function checkChatRateLimit(input: ChatRateLimitInput) {
  const remoteConfig = getRemoteRateLimitConfig()
  const normalizedInput = {
    ...input,
    clientId: normalizeClientId(input.clientId),
  }

  if (!remoteConfig) {
    return checkMemoryRateLimit(normalizedInput)
  }

  try {
    const recentCount = await countRecentRateLimitEvents({
      tableUrl: remoteConfig.tableUrl,
      serviceRoleKey: remoteConfig.serviceRoleKey,
      clientId: normalizedInput.clientId,
      windowMs: normalizedInput.windowMs,
    })
    const allowed = recentCount < normalizedInput.maxRequests

    await writeRateLimitEvent({
      tableUrl: remoteConfig.tableUrl,
      serviceRoleKey: remoteConfig.serviceRoleKey,
      clientId: normalizedInput.clientId,
      sessionId: normalizedInput.sessionId,
      event: allowed ? "accepted" : "rejected",
      windowMs: normalizedInput.windowMs,
      maxRequests: normalizedInput.maxRequests,
      requestCount: recentCount + 1,
    })

    return allowed
  } catch (error) {
    console.error("Remote rate limit failed, falling back to memory", error)
    return checkMemoryRateLimit(normalizedInput)
  }
}
