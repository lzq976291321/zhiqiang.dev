export type LightColor = { hue: number; saturation: number; lightness: number }
export type LightSettings = {
  colors: [LightColor, LightColor]
  brightness: number
  split: boolean
  axis: "horizontal" | "vertical"
}

export const defaultSettings: LightSettings = {
  colors: [
    { hue: 350, saturation: 100, lightness: 86 },
    { hue: 185, saturation: 80, lightness: 82 },
  ],
  brightness: 100,
  split: false,
  axis: "horizontal",
}

export function colorCSS(color: LightColor) {
  return `hsl(${color.hue} ${color.saturation}% ${color.lightness}%)`
}

export function sameColor(a: LightColor, b: LightColor) {
  return a.hue === b.hue && a.saturation === b.saturation && a.lightness === b.lightness
}

export function colorHex({ hue, saturation, lightness }: LightColor, brightness = 100) {
  const light = lightness / 100
  const amplitude = saturation / 100 * Math.min(light, 1 - light)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    return Math.round(255 * brightness / 100 * (light - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0")
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function colorFromHex(hex: string): LightColor {
  const [r, g, b] = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min
  const lightness = (max + min) / 2
  let hue = 0
  if (delta) {
    hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
    hue = (hue * 60 + 360) % 360
  }
  return { hue, saturation: delta ? delta / (1 - Math.abs(2 * lightness - 1)) * 100 : 0, lightness: lightness * 100 }
}

function inRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
}

export function isLightColor(value: unknown): value is LightColor {
  if (!value || typeof value !== "object") return false
  const color = value as Partial<LightColor>
  return inRange(color.hue, 0, 360) && inRange(color.saturation, 0, 100) && inRange(color.lightness, 0, 100)
}

export function parseSettings(value: string | null): LightSettings {
  if (!value) return defaultSettings
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed?.colors) && parsed.colors.length === 2 && parsed.colors.every(isLightColor)
      && inRange(parsed.brightness, 10, 100) && typeof parsed.split === "boolean"
      && ["horizontal", "vertical"].includes(parsed.axis)) return parsed as LightSettings
  } catch { /* 损坏的本地设置回退到默认色卡。 */ }
  return defaultSettings
}
