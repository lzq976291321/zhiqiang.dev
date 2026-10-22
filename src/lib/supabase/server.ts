import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createTimeoutFetch } from "./fetch"

export function hasSupabaseAuthConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error("Supabase auth is not configured")

  const cookieStore = await cookies()
  return createServerClient(url, key, {
    global: { fetch: createTimeoutFetch() },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Component 不能写 cookie；会话刷新交给 proxy。
        }
      },
    },
  })
}

export async function getChatUser() {
  if (!hasSupabaseAuthConfig()) return null
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Failed to read chat user", error instanceof Error ? error.message : error)
    return null
  }
}
