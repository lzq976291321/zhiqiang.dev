import type { NextRequest } from "next/server"
import { clearCompanionMemories, deleteCompanionMemory, listCompanionMemories } from "@/lib/companion/memory-store"
import { createSupabaseServerClient, getChatUser } from "@/lib/supabase/server"

export const runtime = "nodejs"
// 读取当前会话 cookie；避免 GET 在构建期被当成静态响应。
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  const user = await getChatUser()
  if (!user) return Response.json({ error: "请先登录。" }, { status: 401, headers: NO_STORE })

  try {
    const supabase = await createSupabaseServerClient()
    const memories = await listCompanionMemories(supabase, user.id)
    return Response.json({ memories }, { headers: NO_STORE })
  } catch {
    return Response.json({ error: "暂时读不到记忆，请稍后再试。" }, { status: 500, headers: NO_STORE })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getChatUser()
  if (!user) return Response.json({ error: "请先登录。" }, { status: 401, headers: NO_STORE })

  const id = request.nextUrl.searchParams.get("id")
  const all = request.nextUrl.searchParams.get("all") === "1"
  if (!all && (!id || !UUID.test(id))) {
    return Response.json({ error: "记忆标识不正确。" }, { status: 400, headers: NO_STORE })
  }

  try {
    const supabase = await createSupabaseServerClient()
    if (all) await clearCompanionMemories(supabase, user.id)
    else await deleteCompanionMemory(supabase, user.id, id!)
    return Response.json({ ok: true }, { headers: NO_STORE })
  } catch {
    return Response.json({ error: "暂时删不掉，请稍后再试。" }, { status: 500, headers: NO_STORE })
  }
}
