import { createClient } from "@supabase/supabase-js"
import { createTimeoutFetch } from "./fetch"

// 仅服务端使用；用于响应结束后的记忆写入和后台读取，不把 service role 下发到客户端。
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createTimeoutFetch() },
  })
}
