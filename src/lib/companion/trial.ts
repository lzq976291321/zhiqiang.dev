import { createHash } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export const ANONYMOUS_TRIAL_LIMIT = 2

// 只把 session id 的摘要写入数据库，不保存原始标识。
export function trialKey(sessionId: string) {
  return createHash("sha256").update(sessionId).digest("hex")
}

// 数据库是权威计数；调用方在数据库不可用时用签名 cookie 兜底。
export async function consumeAnonymousTrial(
  sessionId: string,
  admin: SupabaseClient | null = createSupabaseAdminClient(),
): Promise<{ rounds: number }> {
  if (!admin) throw new Error("Trial store is not configured")

  const { data, error } = await admin.rpc("consume_companion_trial", { p_key: trialKey(sessionId) })
  if (error) throw error

  const rounds = typeof data === "number" ? data : Number(data)
  if (!Number.isFinite(rounds)) throw new Error("Trial store returned an invalid count")
  return { rounds }
}
