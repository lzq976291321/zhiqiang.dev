"use client"

import { useState, type FormEvent } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

const errorMessage = (message: string) => {
  const normalized = message.toLowerCase()
  if (normalized.includes("rate limit") || normalized.includes("too many")) return "发送太频繁了，过一会儿再试。"
  if (normalized.includes("invalid email") || normalized.includes("email address")) return "这个邮箱地址看起来不对。"
  if (normalized.includes("redirect")) return "登录回跳地址未获授权，请检查 Supabase 的 URL 配置。"
  return "暂时没能发送登录邮件，请稍后再试。"
}

export function LoginForm({ next, enabled, initialError }: {
  next: string
  enabled: boolean
  initialError?: string
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [error, setError] = useState(initialError ?? "")
  const [link, setLink] = useState("")

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!enabled || status === "sending") return
    const address = email.trim()
    if (!address) return

    setStatus("sending")
    setError("")
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: address,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (sendError) {
        setError(errorMessage(sendError.message))
        setStatus("idle")
        return
      }
      setStatus("sent")
    } catch {
      setError("登录服务暂时不可用，请稍后再试。")
      setStatus("idle")
    }
  }

  function openPastedLink(event: FormEvent) {
    event.preventDefault()
    const value = link.trim()
    try {
      const target = new URL(value)
      const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
      if (target.host !== project.host) throw new Error("wrong host")
      if (!target.pathname.startsWith("/auth/v1/verify") && !target.pathname.startsWith("/auth/v1/confirm")) {
        throw new Error("wrong path")
      }
      window.location.assign(target.toString())
    } catch {
      setError("请粘贴邮件里的完整登录链接。")
    }
  }

  if (status === "sent") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/6 px-5 py-4 text-sm leading-6 text-emerald-100/85">
          登录邮件已发送到 <strong className="font-medium text-emerald-50">{email.trim()}</strong>。请在这个浏览器里打开邮件中的链接。
        </div>
        <div className="space-y-3">
          <p className="text-xs leading-5 text-white/45">
            如果邮件是在别的设备上打开的，把邮件里的登录链接复制到下面，仍然可以在这个浏览器完成登录。
          </p>
          <form onSubmit={openPastedLink} className="flex gap-2">
            <label htmlFor="login-link" className="sr-only">粘贴登录链接</label>
            <input
              id="login-link"
              value={link}
              onChange={(event) => { setLink(event.target.value); setError("") }}
              placeholder="粘贴邮件里的登录链接"
              className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
              autoComplete="off"
            />
            <button type="submit" disabled={!link.trim()} className="shrink-0 rounded-xl border border-white/15 px-4 text-sm text-white/80 transition hover:bg-white/8 disabled:opacity-40">
              打开
            </button>
          </form>
        </div>
        {error ? <p role="alert" className="text-sm text-rose-200/90">{error}</p> : null}
        <button type="button" onClick={() => { setStatus("idle"); setLink("") }} className="text-xs text-white/40 underline-offset-4 hover:text-white/70 hover:underline">
          换个邮箱或重新发送
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={send} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm text-white/65">邮箱</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => { setEmail(event.target.value); setError("") }}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={!enabled || status === "sending"}
          className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-white/30 disabled:opacity-50"
        />
      </div>
      {error ? <p role="alert" className="text-sm text-rose-200/90">{error}</p> : null}
      <button
        type="submit"
        disabled={!enabled || status === "sending" || !email.trim()}
        className="w-full rounded-xl bg-[#9FE8FF] px-4 py-3 text-sm font-medium text-[#06111F] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        {status === "sending" ? "正在发送…" : "发送登录链接"}
      </button>
      <p className="text-xs leading-5 text-white/38">
        不会设置密码。登录邮件里是一条一次性链接，几分钟内有效。
        {enabled ? "" : " 登录服务尚未配置。"}
      </p>
    </form>
  )
}
