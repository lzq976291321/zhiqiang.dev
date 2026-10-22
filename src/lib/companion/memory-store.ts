import type { SupabaseClient } from "@supabase/supabase-js"
import type { CompanionMemoryFact } from "@/lib/chat/companion-memory"

export interface StoredCompanionMemory {
  id: string
  kind: string
  content: string
  createdAt: string
}

const DEFAULT_MEMORY_LIMIT = 12

export async function ensureCompanionProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("companion_profiles")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true })
  if (error) throw error
}

// 注入时只取最近的记忆；相关性排序留给后续版本，避免伪精确的评分。
export async function loadCompanionMemory(
  supabase: SupabaseClient,
  userId: string,
  limit = DEFAULT_MEMORY_LIMIT,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("companion_memories")
    .select("content")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return ((data ?? []) as Array<{ content: string }>)
    .map((row) => row.content)
    .filter((content) => typeof content === "string" && content.length > 0)
}

export async function listCompanionMemories(
  supabase: SupabaseClient,
  userId: string,
): Promise<StoredCompanionMemory[]> {
  const { data, error } = await supabase
    .from("companion_memories")
    .select("id, kind, content, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(60)

  if (error) throw error
  return ((data ?? []) as Array<{ id: string; kind: string; content: string; created_at: string }>)
    .map((row) => ({ id: row.id, kind: row.kind, content: row.content, createdAt: row.created_at }))
}

// 导出必须覆盖全部记忆，不能用面板列表的 60 条上限。
export async function listAllCompanionMemories(
  supabase: SupabaseClient,
  userId: string,
  pageSize = 1000,
): Promise<StoredCompanionMemory[]> {
  const rows: StoredCompanionMemory[] = []
  const maxRows = 50_000

  for (let from = 0; from < maxRows; from += pageSize) {
    const { data, error } = await supabase
      .from("companion_memories")
      .select("id, kind, content, created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1)

    if (error) throw error
    const page = ((data ?? []) as Array<{ id: string; kind: string; content: string; created_at: string }>)
      .map((row) => ({ id: row.id, kind: row.kind, content: row.content, createdAt: row.created_at }))
    rows.push(...page)
    if (page.length < pageSize) break
  }

  return rows
}

export async function saveCompanionMemories(
  supabase: SupabaseClient,
  userId: string,
  facts: CompanionMemoryFact[],
) {
  if (!facts.length) return

  const contents = facts.map((fact) => fact.content)
  const { data: existing, error } = await supabase
    .from("companion_memories")
    .select("content")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .in("content", contents)

  if (error) throw error
  const seen = new Set(((existing ?? []) as Array<{ content: string }>).map((row) => row.content))
  const rows = facts
    .filter((fact) => !seen.has(fact.content))
    .map((fact) => ({ user_id: userId, kind: fact.kind, content: fact.content }))

  // 逐条写入，遇到并发重复只跳过这一条，不让整批失败。
  for (const row of rows) {
    const { error: insertError } = await supabase.from("companion_memories").insert(row)
    if (insertError && insertError.code !== "23505") throw insertError
  }
}

export async function deleteCompanionMemory(supabase: SupabaseClient, userId: string, id: string) {
  const { error } = await supabase
    .from("companion_memories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
  if (error) throw error
}

export async function clearCompanionMemories(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase
    .from("companion_memories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("deleted_at", null)
  if (error) throw error
}
