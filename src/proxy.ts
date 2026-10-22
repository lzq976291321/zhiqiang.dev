import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { safeNextPath } from "@/lib/auth/next-path"
import { createTimeoutFetch } from "@/lib/supabase/fetch"

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

  return response
}

export const config = {
  matcher: ["/chat/:path*", "/login"],
}
