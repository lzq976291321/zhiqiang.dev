import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Supabase auth is not configured")
  // 魔法链接使用 PKCE：验证码由浏览器保存，回调时在同一浏览器完成交换。
  return createBrowserClient(url, key, { isSingleton: true })
}
