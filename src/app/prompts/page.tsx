import type { Metadata } from "next"
import { PromptStudioIndex } from "@/components/prompt-studio/PromptStudioIndex"
import { getAllPromptCases } from "@/lib/content"

export const metadata: Metadata = {
  title: "Prompt Studio",
  description:
    "面向 AI 生图和生视频的高质量 Prompt 案例库，包含完整 prompt、参考媒体、负向约束、参数和迭代方式。",
  openGraph: {
    title: "Prompt Studio | zhiqiang.dev",
    description: "生图 / 生视频 Prompt 案例库，沉淀可复用的镜头、光线、结构和迭代方法",
  },
}

export default function PromptsPage() {
  const cases = getAllPromptCases()

  return <PromptStudioIndex cases={cases} />
}
