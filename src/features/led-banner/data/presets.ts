import { DEFAULT_SETTINGS, type BannerMode, type BannerSettings } from "../lib/settings"

export const MODES: { id: BannerMode; label: string; symbol: string }[] = [
  { id: "scroll", label: "滚动灯牌", symbol: "▦" },
  { id: "airport", label: "接机牌", symbol: "✈" },
  { id: "concert", label: "演唱会", symbol: "♡" },
  { id: "sports", label: "赛事应援", symbol: "★" },
  { id: "shop", label: "店铺招牌", symbol: "%" },
  { id: "big", label: "大字沟通", symbol: "Aa" },
  { id: "countdown", label: "倒计时", symbol: "◷" },
  { id: "teleprompter", label: "提词器", symbol: "↑" },
  { id: "scoreboard", label: "计分板", symbol: "0:0" },
  { id: "glowstick", label: "荧光棒", symbol: "✦" },
  { id: "wedding", label: "婚礼欢迎牌", symbol: "♧" },
]

const modeSettings: Record<BannerMode, Partial<BannerSettings>> = {
  scroll: {},
  airport: { text: "林先生", subtext: "欢迎抵达 · WELCOME", effect: "clean", color: "#ffffff", motion: "still", autoFit: true, fontSize: 190 },
  concert: { text: "为你而来 ♥", effect: "neon", color: "#ff68bf", motion: "bounce", glow: 70 },
  sports: { text: "全力以赴，冲！", effect: "led", color: "#ffbd4a", motion: "left" },
  shop: { text: "好事发生 · 正在营业", effect: "neon", color: "#5de7e0", motion: "left" },
  big: { text: "你好，很高兴见到你", effect: "clean", color: "#ffffff", motion: "still", autoFit: true },
  countdown: { text: "精彩即将开始", effect: "digital", color: "#c6ff36", motion: "still", autoFit: true, fontSize: 200 },
  teleprompter: { text: "大家好，欢迎来到我的分享。\n\n把想说的话写在这里，\n按照自己的节奏，慢慢表达。\n\n保持自然，也保持热爱。", effect: "clean", color: "#ffffff", motion: "up", speed: 2, fontSize: 66 },
  scoreboard: { text: "友谊赛", effect: "clean", color: "#c6ff36", motion: "still", fontSize: 190, autoFit: true },
  glowstick: { text: "一起发光 ✦", effect: "glowstick", color: "#a78bfa", motion: "pulse", fontSize: 110, autoFit: true },
  wedding: { text: "林 & 陈", subtext: "我们结婚啦 · WELCOME TO OUR WEDDING", effect: "clean", color: "#ffe5b6", background: "#29211f", motion: "still", font: "serif", autoFit: true, fontSize: 180 },
}

export function settingsForMode(mode: BannerMode): BannerSettings {
  return { ...DEFAULT_SETTINGS, ...modeSettings[mode], mode }
}

export const TEMPLATES: { id: string; name: string; caption: string; settings: BannerSettings }[] = [
  { id: "hello", name: "经典点阵", caption: "HELLO, WORLD", settings: { ...DEFAULT_SETTINGS, text: "HELLO, WORLD ✦" } },
  { id: "fan", name: "粉色心动", caption: "为你而来 ♥", settings: settingsForMode("concert") },
  { id: "welcome", name: "欢迎抵达", caption: "WELCOME", settings: settingsForMode("airport") },
  { id: "birthday", name: "生日快乐", caption: "HAPPY BIRTHDAY", settings: { ...DEFAULT_SETTINGS, text: "生日快乐 HAPPY BIRTHDAY ✦", effect: "rainbow", color: "#ff80ca", motion: "left" } },
  { id: "open", name: "好事发生", caption: "OPEN, WITH LOVE", settings: settingsForMode("shop") },
  { id: "wedding", name: "爱的仪式", caption: "Better together", settings: settingsForMode("wedding") },
]
