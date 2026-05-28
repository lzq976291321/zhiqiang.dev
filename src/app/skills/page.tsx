import type { Metadata } from "next"
import { getAllSkills } from "@/lib/content"
import { SkillsList } from "@/components/skills/SkillsList"

export const metadata: Metadata = {
  title: "Skills",
  description: "Claude Code Skills 按角色分类收集，覆盖 Agent 工程师、前端、后端、独立开发者、产品经理、安全合规",
  openGraph: { title: "Skills 工具库 | zhiqiang.chat", description: "按角色判断 Claude Code Skills 是否值得使用" },
}

export default function SkillsPage() {
  const skills = getAllSkills()
  return <SkillsList skills={skills} />
}
