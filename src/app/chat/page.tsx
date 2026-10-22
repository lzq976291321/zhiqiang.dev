import type { Metadata } from "next"
import { ChatRoom } from "@/features/chat/components/ChatRoom"
import { getChatUser, hasSupabaseAuthConfig } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Mori · 陪伴",
  description: "和 Mori 聊聊天。她记得你说过的事，也会在你想说话的时候陪着你。",
  alternates: { canonical: "/chat" },
  openGraph: {
    type: "website",
    url: "/chat",
    title: "Mori · 陪伴",
    description: "和 Mori 聊聊天。她记得你说过的事，也会在你想说话的时候陪着你。",
  },
}

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ question?: string }>
}) {
  const { question } = await searchParams
  const signedIn = Boolean(await getChatUser())
  return (
    <ChatRoom
      key={question ?? ""}
      question={typeof question === "string" ? question.slice(0, 1000) : undefined}
      signedIn={signedIn}
      authEnabled={hasSupabaseAuthConfig()}
    />
  )
}
