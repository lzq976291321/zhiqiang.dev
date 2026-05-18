import type { Metadata } from "next"
import { PromptStudioIndex } from "@/components/prompt-studio/PromptStudioIndex"
import { getAllPromptCases } from "@/lib/content"

export const metadata: Metadata = {
  title: "Prompt Studio",
  description:
    "基于 OpenNana 提示词图库抽样重写的 AI 生图和生视频案例，包含完整 prompt、参考样本、负向约束、参数和迭代方式。",
  openGraph: {
    title: "Prompt Studio | zhiqiang.dev",
    description: "基于 OpenNana 抽样重写的生图 / 生视频精品 Prompt 案例库",
  },
}

export default function PromptsPage() {
  const cases = getAllPromptCases()

  return <PromptStudioIndex cases={cases} />
}
