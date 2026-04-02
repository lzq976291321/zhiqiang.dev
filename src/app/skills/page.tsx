import { getAllSkills } from "@/lib/content"
import { SkillsList } from "@/components/skills/SkillsList"

export const metadata = { title: "Skills" }

export default function SkillsPage() {
  const skills = getAllSkills()
  return <SkillsList skills={skills} />
}
