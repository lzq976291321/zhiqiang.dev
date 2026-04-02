import type { Metadata } from "next"
import { getAllMcpServers } from "@/lib/content"
import { McpList } from "@/components/mcp/McpList"

export const metadata: Metadata = {
  title: "MCP",
  description: "从 20000+ MCP Server 中精选真正好用的，GitHub、Context7、Supabase、Figma 等",
  openGraph: { title: "MCP Server 推荐 | zhiqiang.dev", description: "从 20000+ MCP Server 中精选真正好用的" },
}

export default function McpPage() {
  const servers = getAllMcpServers()
  return <McpList servers={servers} />
}
