create table if not exists public.site_visit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  client_id text not null,
  path text not null,
  referrer text,
  user_agent text
);

create index if not exists site_visit_logs_created_at_idx
  on public.site_visit_logs (created_at desc);

create index if not exists site_visit_logs_client_created_at_idx
  on public.site_visit_logs (client_id, created_at desc);

revoke all on table public.chat_question_logs from anon, authenticated;
revoke all on table public.chat_rate_limit_events from anon, authenticated;
revoke all on table public.site_visit_logs from anon, authenticated;

grant select, insert, update, delete on table public.chat_question_logs to service_role;
grant select, insert, update, delete on table public.chat_rate_limit_events to service_role;
grant select, insert, update, delete on table public.site_visit_logs to service_role;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
