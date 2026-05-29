import type { Metadata } from "next"
import { ChatRoom } from "@/components/chat/ChatRoom"

export const metadata: Metadata = {
  title: "Chat",
  description:
    "公开开发侧 Profile Agent，结合公开技术资料回答开发能力、项目、Agent 设计、MCP、Skills 和合作方向。",
  openGraph: {
    title: "Chat | zhiqiang.chat",
    description:
      "公开开发侧 Profile Agent，回答开发能力、项目、Agent 设计和合作方向。",
  },
}

export default function ChatPage() {
  return <ChatRoom />
}
