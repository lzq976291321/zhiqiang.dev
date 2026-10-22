// 登录后的回跳只允许站内路径，避免 next 参数被拿来做开放重定向。
export function safeNextPath(value: string | null | undefined, fallback = "/chat"): string {
  if (!value) return fallback
  if (value.length > 300) return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  if (/[\\\u0000-\u001f]/.test(value)) return fallback
  return value
}
