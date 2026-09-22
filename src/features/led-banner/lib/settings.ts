export type BannerMode = "scroll" | "airport" | "concert" | "sports" | "shop" | "big" | "countdown" | "teleprompter" | "scoreboard" | "glowstick" | "wedding"
export type BannerEffect = "clean" | "led" | "neon" | "rainbow" | "digital" | "glow" | "glowstick"
export type BannerMotion = "left" | "right" | "up" | "down" | "bounce" | "pulse" | "still"

export interface BannerSettings {
  mode: BannerMode
  text: string
  subtext: string
  effect: BannerEffect
  motion: BannerMotion
  color: string
  background: string
  secondaryColor: string
  gradient: boolean
  fontSize: number
  speed: number
  glow: number
  letterSpacing: number
  font: "sans" | "serif" | "mono"
  mirror: boolean
  uppercase: boolean
  blink: boolean
  autoFit: boolean
  dotSize: number
  dotShape: "round" | "square" | "diamond"
  duration: number
  teamA: string
  teamB: string
}

export interface BannerLiveData {
  countdown?: number
  scoreA?: number
  scoreB?: number
  period?: number
}

export const DEFAULT_SETTINGS: BannerSettings = {
  mode: "scroll", text: "让热爱，被看见 ✦", subtext: "", effect: "led", motion: "left",
  color: "#c6ff36", background: "#080c12", secondaryColor: "#182c34", gradient: false,
  fontSize: 124, speed: 4, glow: 45, letterSpacing: 3, font: "sans", mirror: false,
  uppercase: false, blink: false, autoFit: false, dotSize: 7, dotShape: "round",
  duration: 300, teamA: "主队", teamB: "客队",
}

export const STORAGE_KEY = "zhiqiang-led-banner-v1"
export const DESIGNS_KEY = "zhiqiang-led-designs-v1"
const choices = {
  mode: ["scroll", "airport", "concert", "sports", "shop", "big", "countdown", "teleprompter", "scoreboard", "glowstick", "wedding"],
  effect: ["clean", "led", "neon", "rainbow", "digital", "glow", "glowstick"],
  motion: ["left", "right", "up", "down", "bounce", "pulse", "still"],
  font: ["sans", "serif", "mono"], dotShape: ["round", "square", "diamond"],
} as const

// 本地存档和分享链接都经过同一边界校验，不把任意外部字段带入画布。
export function sanitizeSettings(value: unknown): BannerSettings {
  const result = { ...DEFAULT_SETTINGS }
  if (!value || typeof value !== "object" || Array.isArray(value)) return result
  const data = value as Record<string, unknown>
  for (const key of Object.keys(choices) as (keyof typeof choices)[]) {
    const candidate = data[key]
    if (typeof candidate === "string" && (choices[key] as readonly string[]).includes(candidate)) Object.assign(result, { [key]: candidate })
  }
  for (const key of ["text", "subtext", "teamA", "teamB"] as const) {
    if (typeof data[key] === "string") result[key] = data[key].slice(0, key === "text" ? 4000 : key === "subtext" ? 160 : 32).replace(/[\uD800-\uDBFF]$/, "")
  }
  for (const key of ["color", "background", "secondaryColor"] as const) {
    if (typeof data[key] === "string" && /^#[\da-f]{6}$/i.test(data[key])) result[key] = data[key]
  }
  for (const key of ["gradient", "mirror", "uppercase", "blink", "autoFit"] as const) {
    if (typeof data[key] === "boolean") result[key] = data[key]
  }
  const ranges = { fontSize: [32, 240], speed: [1, 10], glow: [0, 100], letterSpacing: [0, 20], dotSize: [4, 16], duration: [1, 359999] }
  for (const key of Object.keys(ranges) as (keyof typeof ranges)[]) {
    const candidate = data[key]
    if (typeof candidate === "number" && Number.isFinite(candidate)) result[key] = Math.round(Math.max(ranges[key][0], Math.min(ranges[key][1], candidate)))
  }
  return result
}

export function decodeSettings(hash: string): BannerSettings | null {
  try {
    if (!hash.startsWith("#design=") || hash.length > 45000) return null
    return sanitizeSettings(JSON.parse(decodeURIComponent(hash.slice(8))))
  } catch { return null }
}

export function shareUrl(settings: BannerSettings): string {
  const url = new URL(window.location.href)
  url.search = ""
  url.hash = `design=${encodeURIComponent(JSON.stringify(settings))}`
  return url.toString()
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor(total % 3600 / 60)
  const rest = String(total % 60).padStart(2, "0")
  return hours ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${rest}` : `${String(minutes).padStart(2, "0")}:${rest}`
}
