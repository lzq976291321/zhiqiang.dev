import type { Metadata } from "next"
import { ChatRoom } from "@/features/chat/components/ChatRoom"

export const metadata: Metadata = {
  title: "聊聊",
  description: "和 AI 聊聊日常、开个脑洞、交换不同看法，也可以沿着正在读的文章继续讨论。",
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
