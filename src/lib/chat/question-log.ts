import { randomUUID } from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import type { ChatStreamMode } from "./types"

const localLogPath = path.join(process.cwd(), ".local", "chat-questions.local.jsonl")
const defaultRemoteLogTable = "chat_question_logs"

export interface ChatQuestionOutcome {
  status: "completed" | "failed"
  durationMs: number
  mode: ChatStreamMode
  responseLength?: number
  sourceIds?: string[]
  errorMessage?: string
  upstreamStatus?: number
}

interface ChatQuestionLogInput {
  question: string
  createdAt: string
  sessionId?: string
  clientId: string
  messageCount: number
  totalMessageLength: number
  userAgent?: string | null
  referrer?: string | null
}

// 仅在 Next.js after 中调用；一次写入问题和最终结果，不占用回答的流式链路。
export async function recordChatQuestion(input: ChatQuestionLogInput, outcome: ChatQuestionOutcome) {
  const sourceIds = (outcome.sourceIds ?? []).slice(0, 12)
  const record = {
    id: randomUUID(),
    created_at: input.createdAt,
    session_id: input.sessionId?.slice(0, 64) || "anonymous",
    client_id: input.clientId.trim().slice(0, 120) || "anonymous",
    // 沿用已有 text 列，保存已通过请求校验的完整问题（最多 1600 字），保留换行。
    question_preview: input.question,
    question_length: input.question.length,
    message_count: input.messageCount,
    total_message_length: input.totalMessageLength,
    source_ids: sourceIds,
    source_count: sourceIds.length,
    status: outcome.status,
    mode: outcome.mode,
    duration_ms: outcome.durationMs,
    response_length: outcome.responseLength ?? null,
    error_message: outcome.errorMessage?.replace(/\s+/g, " ").trim().slice(0, 500) || null,
    upstream_status: outcome.upstreamStatus ?? null,
    completed_at: new Date(Date.parse(input.createdAt) + outcome.durationMs).toISOString(),
    updated_at: new Date().toISOString(),
    user_agent: input.userAgent?.slice(0, 180) || null,
    referrer: input.referrer?.slice(0, 240) || null,
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      fs.mkdirSync(path.dirname(localLogPath), { recursive: true })
      fs.appendFileSync(localLogPath, `${JSON.stringify(record)}\n`, "utf-8")
    } catch {
      console.error("Failed to write local chat question log")
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return
  const tableName = process.env.SUPABASE_CHAT_LOG_TABLE || defaultRemoteLogTable

  // 失败后重试一次，沿用同一 id，避免响应丢失导致重复收集。
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(2500),
      })
      if (response.ok) return
      if (response.status < 500 && response.status !== 429) {
        console.error("Failed to collect chat question", { id: record.id, status: response.status })
        return
      }
    } catch {
      // 网络错误或超时也只重试一次，不把问题正文或凭据写入平台错误日志。
    }
  }
  console.error("Failed to collect chat question after retry", { id: record.id })
}
