import type { Metadata, Viewport } from "next"
import { LedBanner } from "@/features/led-banner/components/LedBanner"

export const metadata: Metadata = {
  title: "LED 灯牌 · UI Lab",
  description: "把屏幕变成 LED 灯牌。输入文字，调整颜色与滚动速度，全屏展示你的消息。",
  alternates: { canonical: "/lab/led-banner" },
  openGraph: {
    title: "LED 灯牌 · UI Lab",
    description: "写下文字，让屏幕发光。",
    url: "/lab/led-banner",
  },
}

export const viewport: Viewport = { themeColor: "#080c12", viewportFit: "cover" }

export default function LedBannerPage() {
  return <LedBanner />
}
