import { getAllPrompts } from "@/lib/content"
import { PromptList } from "@/components/prompts/PromptList"
import { PageShell } from "@/components/shared/PageShell"

export const metadata = { title: "生视频 Prompt" }

export default function VideoPromptsPage() {
  const prompts = getAllPrompts("prompt-video")
  return (
    <PageShell title="生视频 Prompt" subtitle="Sora · Runway · Veo · Kling 通用模板" accent="#FB923C">
      <PromptList prompts={prompts} type="prompt-video" />
    </PageShell>
  )
}
