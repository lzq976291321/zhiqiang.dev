import { getAllMcpServers } from "@/lib/content"
import { McpList } from "@/components/mcp/McpList"

export const metadata = { title: "MCP" }

export default function McpPage() {
  const servers = getAllMcpServers()
  return <McpList servers={servers} />
}
