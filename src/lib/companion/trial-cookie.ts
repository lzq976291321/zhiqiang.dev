import { createHmac, timingSafeEqual } from "node:crypto"
import { TRIAL_COOKIE } from "./trial-constants"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function trialSecret() {
  return process.env.COMPANION_TRIAL_SECRET
    || process.env.ADMIN_ACCESS_TOKEN
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ""
}

function sign(payload: string) {
  const secret = trialSecret()
  if (!secret) return ""
  return createHmac("sha256", secret).update(payload).digest("base64url")
}

// 数据库不可达时用签名 cookie 继续执行 2 轮限制；签名防止访客改计数。
export function serializeTrialCookie(count: number) {
  const payload = Buffer.from(JSON.stringify({ count, iat: Date.now() })).toString("base64url")
  const signature = sign(payload)
  if (!signature) return null
  // 本地 next start 也是 production；只在本机以外的部署加 Secure，避免 localhost 收不到 cookie。
  const secure = process.env.VERCEL === "1" ? "; Secure" : ""
  return `${TRIAL_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`
}

export function parseTrialCookie(value: string | undefined | null, now = Date.now()): number | null {
  if (!value) return null
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null

  const expected = sign(payload)
  if (!expected) return null
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { count?: unknown; iat?: unknown }
    if (typeof data.count !== "number" || !Number.isInteger(data.count) || data.count < 0 || data.count > 10) return null
    if (typeof data.iat !== "number" || !Number.isFinite(data.iat) || now - data.iat > MAX_AGE_SECONDS * 1000) return null
    return data.count
  } catch {
    return null
  }
}
