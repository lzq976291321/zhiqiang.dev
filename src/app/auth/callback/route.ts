import { NextResponse } from "next/server"
import { safeNextPath } from "@/lib/auth/next-path"
import { createSupabaseServerClient, hasSupabaseAuthConfig } from "@/lib/supabase/server"

// 魔法链接回调：用 PKCE code 换 cookie 会话，然后回到登录前的位置。
export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeNextPath(url.searchParams.get("next"))

  if (!hasSupabaseAuthConfig()) {
    return NextResponse.redirect(new URL("/login?error=config", url.origin))
  }

  const code = url.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin))
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, url.origin))
    console.error("Auth code exchange failed", { code: error.code })
  } catch {
    console.error("Auth code exchange failed")
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin))
}
