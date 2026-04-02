import { getAllPrompts } from "@/lib/content"
import { PromptList } from "@/components/prompts/PromptList"
import { PageShell } from "@/components/shared/PageShell"

export const metadata = {
  title: "生图 Prompt",
  description: "Midjourney、ChatGPT、Stable Diffusion、Flux 通用生图提示词模板库",
  openGraph: { title: "生图 Prompt | zhiqiang.dev" },
}

export default function ImagePromptsPage() {
  const prompts = getAllPrompts("prompt-image")
  return (
    <PageShell
      title="生图 Prompt"
      subtitle="Midjourney · ChatGPT · Stable Diffusion · Flux 通用模板"
      parentLink={{ href: "/prompts", label: "Prompts" }}
    >
      <PromptList prompts={prompts} type="prompt-image" />
    </PageShell>
  )
}
