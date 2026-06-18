import fs from "fs"
import path from "path"
import type { ChatStreamMode } from "./types"

const MAX_LOGGED_QUESTION_LENGTH = 500
const MAX_LOGGED_ERROR_LENGTH = 500
const MAX_CLIENT_ID_LENGTH = 120
const MAX_SESSION_ID_LENGTH = 64
const localLogPath = path.join(process.cwd(), ".local", "chat-questions.local.jsonl")
const defaultRemoteLogTable = "chat_question_logs"

interface ChatQuestionLogInput {
  question: string
  sourceIds: string[]
  sessionId?: string
  clientId: string
  messageCount: number
  totalMessageLength: number
  userAgent?: string | null
  referrer?: string | null
}

interface ChatQuestionLogUpdateInput {
  id: string | null
  status: "completed" | "failed"
  durationMs: number
  mode?: ChatStreamMode
  responseLength?: number
  errorMessage?: string
  upstreamStatus?: number
}

function normalizeQuestion(question: string) {
  return question.replace(/\s+/g, " ").trim().slice(0, MAX_LOGGED_QUESTION_LENGTH)
}

function normalizeErrorMessage(errorMessage: string | undefined) {
  return errorMessage?.replace(/\s+/g, " ").trim().slice(0, MAX_LOGGED_ERROR_LENGTH) || null
}

function normalizeClientId(clientId: string) {
  return clientId.trim().slice(0, MAX_CLIENT_ID_LENGTH) || "anonymous"
}

function getRemoteLogConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const tableName = process.env.SUPABASE_CHAT_LOG_TABLE || defaultRemoteLogTable

  if (!supabaseUrl || !serviceRoleKey) return null

  return {
    tableUrl: `${supabaseUrl}/rest/v1/${tableName}`,
    serviceRoleKey,
  }
}

function writeLocalQuestionLog(record: unknown) {
  if (process.env.NODE_ENV === "production") return

  try {
    fs.mkdirSync(path.dirname(localLogPath), { recursive: true })
    fs.appendFileSync(localLogPath, `${JSON.stringify(record)}\n`, "utf-8")
  } catch (error) {
    console.error("Failed to write local chat question log", error)
  }
}

export async function createChatQuestionLog({
  question,
  sourceIds,
  sessionId,
  clientId,
  messageCount,
  totalMessageLength,
  userAgent,
  referrer,
}: ChatQuestionLogInput) {
  const timestamp = new Date().toISOString()
  const record = {
    event: "chat_question",
    timestamp,
    sessionId: sessionId?.slice(0, MAX_SESSION_ID_LENGTH) || "anonymous",
    clientId: normalizeClientId(clientId),
    question: normalizeQuestion(question),
    questionLength: question.length,
    messageCount,
    totalMessageLength,
    sourceIds: sourceIds.slice(0, 12),
    sourceCount: sourceIds.length,
    userAgent: userAgent?.slice(0, 180) || null,
    referrer: referrer?.slice(0, 240) || null,
  }

  console.info(JSON.stringify(record))
  writeLocalQuestionLog(record)

  const remoteConfig = getRemoteLogConfig()
  if (!remoteConfig) return null

  const response = await fetch(`${remoteConfig.tableUrl}?select=id`, {
    method: "POST",
    headers: {
      apikey: remoteConfig.serviceRoleKey,
      Authorization: `Bearer ${remoteConfig.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      created_at: record.timestamp,
      session_id: record.sessionId,
      client_id: record.clientId,
      question_preview: record.question,
      question_length: record.questionLength,
      message_count: record.messageCount,
      total_message_length: record.totalMessageLength,
      source_ids: record.sourceIds,
      source_count: record.sourceCount,
      status: "received",
      user_agent: record.userAgent,
      referrer: record.referrer,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to write remote chat question log: ${response.status}`)
  }

  const payload = (await response.json()) as Array<{ id?: string }>
  return payload[0]?.id ?? null
}

export async function updateChatQuestionLog({
  id,
  status,
  durationMs,
  mode,
  responseLength,
  errorMessage,
  upstreamStatus,
}: ChatQuestionLogUpdateInput) {
  if (!id) return

  const remoteConfig = getRemoteLogConfig()
  if (!remoteConfig) return

  const timestamp = new Date().toISOString()
  const response = await fetch(`${remoteConfig.tableUrl}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      apikey: remoteConfig.serviceRoleKey,
      Authorization: `Bearer ${remoteConfig.serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      updated_at: timestamp,
      completed_at: timestamp,
      status,
      mode: mode ?? null,
      duration_ms: durationMs,
      response_length: responseLength ?? null,
      error_message: normalizeErrorMessage(errorMessage),
      upstream_status: upstreamStatus ?? null,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update remote chat question log: ${response.status}`)
  }
}
