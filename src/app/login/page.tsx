import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { safeNextPath } from "@/lib/auth/next-path"
import { getChatUser, hasSupabaseAuthConfig } from "@/lib/supabase/server"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "登录",
  description: "用邮箱登录，继续和 Mori 聊天。",
  robots: { index: false, follow: false },
}

const errors: Record<string, string> = {
  auth: "登录链接无效或已过期，请重新发送。",
  missing_code: "登录链接不完整，请重新发送。",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const destination = safeNextPath(next)
  if (await getChatUser()) redirect(destination)

  return (
    <main className="grid min-h-screen place-items-center bg-[#050913] px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-baseline gap-1 text-lg font-semibold tracking-tight text-white/85" aria-label="zhiqiang 首页">
          zhiqiang<span className="text-[#9FE8FF]">.</span>
        </Link>
        <div className="mt-10 space-y-3">
          <p className="text-xs tracking-[0.18em] text-white/35">MORI / 陪伴</p>
          <h1 className="text-3xl font-semibold tracking-tight">和 Mori 继续聊</h1>
          <p className="text-sm leading-6 text-white/50">
            登录后可以继续聊，Mori 会把聊过的事记在账号里。前 2 轮可以先不登录。
          </p>
        </div>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/40 sm:p-7">
          <LoginForm next={destination} enabled={hasSupabaseAuthConfig()} initialError={error ? errors[error] : undefined} />
        </div>
        <p className="mt-5 text-[11px] leading-5 text-white/30">
          记忆只保存事实片段，可随时查看或删除；生成回答时会随对话发送给模型服务商。
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-white/35">
          <Link href="/chat" className="underline-offset-4 hover:text-white/65 hover:underline">先不登录，回去看看</Link>
          <span>AI 陪伴，不是真人</span>
        </div>
      </div>
    </main>
  )
}
