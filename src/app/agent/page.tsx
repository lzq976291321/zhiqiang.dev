import type { Metadata } from "next"
import { AgentIndex } from "@/components/agent/AgentIndex"
import { PageShell } from "@/components/shared/PageShell"
import { getAllAgentArticles } from "@/lib/content"

export const metadata: Metadata = {
  title: "Agent Engineering",
  description: "从 Claude Code 学智能体设计、工具调用、上下文工程与工程化落地",
}

export default function AgentPage() {
  const articles = getAllAgentArticles()

  return (
    <PageShell
      title="Agent Engineering"
      subtitle="从 Claude Code 的真实工程工作流里提炼 Agent 设计方法，再迁移到 OpenClaw、MCP、Skills 和自己的产品系统。"
      accent="#9FE8FF"
    >
      <AgentIndex articles={articles} />
    </PageShell>
  )
}
