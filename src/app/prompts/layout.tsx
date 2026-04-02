import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prompts",
  description: "AI 生图与生视频 Prompt 模板库，覆盖 Midjourney、ChatGPT、Sora、Runway、Kling 等主流平台",
}

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
