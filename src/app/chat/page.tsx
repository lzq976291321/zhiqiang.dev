import type { Metadata } from "next"
import { ChatRoom } from "@/features/chat/components/ChatRoom"

export const metadata: Metadata = {
  title: "知识对话",
  description: "围绕公开知识、工程实践与技术判断继续提问。",
  alternates: { canonical: "/chat" },
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; question?: string }>
}) {
  const { topic, question } = await searchParams
  return (
    <ChatRoom
      key={JSON.stringify([topic, question])}
      topic={typeof topic === "string" ? topic.slice(0, 200) : undefined}
      question={typeof question === "string" ? question.slice(0, 1000) : undefined}
    />
  )
}
