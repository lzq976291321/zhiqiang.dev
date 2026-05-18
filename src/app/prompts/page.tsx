import type { Metadata } from "next"
import { PromptStudioIndex } from "@/components/prompt-studio/PromptStudioIndex"
import { getAllPromptCases } from "@/lib/content"

export const metadata: Metadata = {
  title: "Prompt Studio",
  description: "娱乐性和美学向生图、生视频 Prompt 案例库，覆盖电影海报、胶片写真、美食大片、音乐视觉和品牌短片。",
  openGraph: {
    title: "Prompt Studio | zhiqiang.dev",
    description: "娱乐性和美学向生图 / 生视频精品 Prompt 案例库",
  },
}

export default function PromptsPage() {
  const cases = getAllPromptCases()

  return <PromptStudioIndex cases={cases} />
}
