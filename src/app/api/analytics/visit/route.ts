import type { NextRequest } from "next/server"
import { recordSiteVisit } from "@/lib/analytics/site-visit-log"

export const runtime = "nodejs"

const MAX_BODY_LENGTH = 2_000

function getClientId(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local"
}

function isRequestBodyTooLarge(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length"))
  return Number.isFinite(contentLength) && contentLength > MAX_BODY_LENGTH
}

function isSafePath(value: unknown): value is string {
  if (typeof value !== "string") return false

  const path = value.trim()
  return path.startsWith("/") && !path.startsWith("//") && path.length <= 240
}

export async function POST(request: NextRequest) {
  if (isRequestBodyTooLarge(request)) {
    return Response.json({ error: "请求体太大。" }, { status: 413 })
  }

  let body: { path?: unknown; sessionId?: unknown; referrer?: unknown } | null = null

  try {
    body = (await request.json()) as {
      path?: unknown
      sessionId?: unknown
      referrer?: unknown
    }
  } catch {
    return Response.json({ error: "请求体不是有效 JSON。" }, { status: 400 })
  }

  if (!isSafePath(body?.path)) {
    return Response.json({ error: "path 格式不正确。" }, { status: 400 })
  }

  try {
    await recordSiteVisit({
      path: body.path,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      clientId: getClientId(request),
      userAgent: request.headers.get("user-agent"),
      referrer: typeof body.referrer === "string"
        ? body.referrer
        : request.headers.get("referer"),
    })
  } catch (error) {
    console.error("Failed to record site visit", error)
  }

  return Response.json({ ok: true })
}
