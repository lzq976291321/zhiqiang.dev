import type { Metadata, Viewport } from "next"
import { FillLight } from "@/features/fill-light/components/FillLight"

export const metadata: Metadata = {
  title: "补光灯 · UI Lab",
  description: "把屏幕变成补光灯。切换色卡、调节颜色和亮度，体验双色补光与相机自拍。参考小猫补光灯制作的独立网页练习。",
  alternates: { canonical: "/lab/fill-light" },
  manifest: "/fill-light/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "补光灯",
    statusBarStyle: "default",
  },
  icons: {
    icon: { url: "/fill-light/icon-192.png", sizes: "192x192", type: "image/png" },
    apple: { url: "/fill-light/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  // Next 16 的 capable 只生成通用标签，补充旧版 iOS 使用的 Apple 标签。
  other: { "apple-mobile-web-app-capable": "yes" },
  openGraph: {
    title: "补光灯 · UI Lab",
    description: "一块屏幕，一点好光。色卡、双色补光与自拍。",
    url: "/lab/fill-light",
  },
}

export const viewport: Viewport = { themeColor: "#ffb8c4", viewportFit: "cover" }

export default function FillLightPage() {
  return <FillLight />
}
