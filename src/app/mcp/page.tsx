import type { Metadata } from "next"
import { getAllMcpServers } from "@/lib/content"
import { McpList } from "@/components/mcp/McpList"
import { PageShell } from "@/components/shared/PageShell"

export const metadata: Metadata = {
  title: "MCP",
  description: "按角色筛选值得接入的 MCP Server，覆盖 GitHub、Context7、Playwright、Supabase、Vercel、Figma 等",
  openGraph: { title: "MCP Server 推荐 | zhiqiang.chat", description: "按角色判断 MCP 是否值得接入" },
}

export default function McpPage() {
  const servers = getAllMcpServers()
  return (
    <PageShell
      title="MCP"
      subtitle="按角色筛选值得接入的 MCP：优先官方、只读、低权限、可审计"
      accent="#B8F7D4"
    >
      <McpList servers={servers} />
    </PageShell>
  )
}
