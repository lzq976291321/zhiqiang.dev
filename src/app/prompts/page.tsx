import type { Metadata } from "next"
import { PromptStudioIndex } from "@/components/prompt-studio/PromptStudioIndex"
import { getAllPromptCases } from "@/lib/content"

export const metadata: Metadata = {
  title: "Prompt Studio",
  description: "高质量生图和生视频 Prompt 案例库，每个案例包含成品预览、完整 prompt、参数和失败修正。",
  openGraph: {
    title: "Prompt Studio | zhiqiang.dev",
    description: "生图 / 生视频精品 Prompt 案例库",
  },
}

export default function PromptsPage() {
  const cases = getAllPromptCases()

  return <PromptStudioIndex cases={cases} />
}
