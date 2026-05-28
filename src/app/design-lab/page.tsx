import type { Metadata } from "next"
import { DesignTokenLab } from "@/components/design-lab/DesignTokenLab"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Design Token Lab",
  description:
    "先预览真实 HTML 风格样张，再提取可复用的 design-tokens.md，服务 Tailwind v4、CSS variables 和 Agent 项目落地。",
  alternates: {
    canonical: `${siteConfig.url}/design-lab`,
  },
  openGraph: {
    title: "Design Token Lab | zhiqiang.chat",
    description: "从真实 UI 样张提取 Design Tokens MD，而不是先写变量再猜它好不好看。",
    url: `${siteConfig.url}/design-lab`,
  },
}

export default function DesignLabPage() {
  return <DesignTokenLab />
}
