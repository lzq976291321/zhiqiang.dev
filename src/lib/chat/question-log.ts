import fs from "fs"
import path from "path"
import type { ChatClassification } from "./types"

const MAX_LOGGED_QUESTION_LENGTH = 500
const localLogPath = path.join(process.cwd(), "chat-questions.local.jsonl")

interface ChatQuestionLogInput {
  question: string
  classification: ChatClassification
  sessionId?: string
  userAgent?: string | null
  referrer?: string | null
}

function normalizeQuestion(question: string) {
  return question.replace(/\s+/g, " ").trim().slice(0, MAX_LOGGED_QUESTION_LENGTH)
}

export function logChatQuestion({
  question,
  classification,
  sessionId,
  userAgent,
  referrer,
}: ChatQuestionLogInput) {
  const record = {
    event: "chat_question",
    timestamp: new Date().toISOString(),
    sessionId: sessionId?.slice(0, 64) || "anonymous",
    classification,
    question: normalizeQuestion(question),
    questionLength: question.length,
    userAgent: userAgent?.slice(0, 180) || null,
    referrer: referrer?.slice(0, 240) || null,
  }

  console.info(JSON.stringify(record))

  if (process.env.VERCEL) return

  try {
    fs.appendFileSync(localLogPath, `${JSON.stringify(record)}\n`, "utf-8")
  } catch (error) {
    console.error("Failed to write local chat question log", error)
  }
}
