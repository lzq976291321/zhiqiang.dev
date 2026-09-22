import type { LightColor } from "../lib/light-settings"

export type LightPreset = { id: string; name: string; color: LightColor }

// 参考原应用的补光色卡，以网页色彩近似呈现；不宣称改变肤质。
export const presets: LightPreset[] = [
  { id: "pink", name: "少女感", color: { hue: 350, saturation: 100, lightness: 86 } },
  { id: "purple", name: "氛围感", color: { hue: 270, saturation: 86, lightness: 64 } },
  { id: "cool", name: "冷白皮", color: { hue: 185, saturation: 80, lightness: 82 } },
  { id: "white", name: "百搭光", color: { hue: 40, saturation: 0, lightness: 100 } },
  { id: "soft", name: "柔雾光", color: { hue: 28, saturation: 100, lightness: 92 } },
  { id: "warm", name: "日落灯", color: { hue: 30, saturation: 100, lightness: 77 } },
  { id: "lavender", name: "网感紫", color: { hue: 280, saturation: 100, lightness: 83 } },
  { id: "blue", name: "DeepSeek 蓝", color: { hue: 221, saturation: 100, lightness: 76 } },
  { id: "mint", name: "薄荷绿", color: { hue: 155, saturation: 75, lightness: 82 } },
  { id: "red", name: "哪吒红", color: { hue: 4, saturation: 100, lightness: 70 } },
  { id: "lemon", name: "奶油黄", color: { hue: 49, saturation: 100, lightness: 85 } },
]
