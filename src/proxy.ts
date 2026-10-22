import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { safeNextPath } from "@/lib/auth/next-path"
import { createTimeoutFetch } from "@/lib/supabase/fetch"
import { TRIAL_BOOTSTRAP_COOKIE, TRIAL_COOKIE } from "@/lib/companion/trial-constants"

// 只刷新 /chat 与 /login 的会话，不拿 proxy 当完整鉴权层。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    global: { fetch: createTimeoutFetch() },
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (request.nextUrl.pathname === "/login" && user) {
      return NextResponse.redirect(new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url))
    }
  } catch {
    // Supabase 暂时不可达时放行页面，聊天页会按未登录处理。
  }

  // 进入聊天页时先发一个计数 cookie；接口没有它就不放行。
  // 这里不签名，避免在 Edge proxy 里使用 node:crypto；接口会把它升级为签名 cookie。
  if (request.nextUrl.pathname.startsWith("/chat") && !request.cookies.get(TRIAL_COOKIE)) {
    response.headers.append("Set-Cookie", TRIAL_BOOTSTRAP_COOKIE)
  }

  return response
}

export const config = {
  matcher: ["/chat/:path*", "/login"],
}
