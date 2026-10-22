-- 伴侣资料与长期记忆。
-- 只允许本人通过 RLS 读写；不保存对话全文。已存在的项目里，
-- 20260618020000 迁移把 authenticated 的默认权限收回了，所以这里要显式授权。

create table if not exists public.companion_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  persona text not null default 'mori',
  call_me text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companion_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'preference'
    check (kind in ('preference', 'event', 'person', 'ongoing', 'boundary')),
  content text not null check (char_length(content) between 1 and 240),
  weight integer not null default 1 check (weight between 1 and 5),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  deleted_at timestamptz
);

create index if not exists companion_memories_user_created_idx
  on public.companion_memories (user_id, created_at desc)
  where deleted_at is null;

-- 同一用户的有效记忆不重复；软删除后可以重新写入同一条。
create unique index if not exists companion_memories_user_content_idx
  on public.companion_memories (user_id, content)
  where deleted_at is null;

alter table public.companion_profiles enable row level security;
alter table public.companion_memories enable row level security;

drop policy if exists "companion_profiles_own" on public.companion_profiles;
create policy "companion_profiles_own" on public.companion_profiles
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "companion_memories_own" on public.companion_memories;
create policy "companion_memories_own" on public.companion_memories
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on table public.companion_profiles from anon, authenticated;
revoke all on table public.companion_memories from anon, authenticated;

grant select, insert, update, delete on table public.companion_profiles to authenticated;
grant select, insert, update, delete on table public.companion_memories to authenticated;
grant all on table public.companion_profiles to service_role;
grant all on table public.companion_memories to service_role;

comment on table public.companion_profiles is '伴侣资料：人格、称呼与首次引导状态，只允许本人读写';
comment on table public.companion_memories is '伴侣长期记忆：只存事实片段，不存对话全文';
