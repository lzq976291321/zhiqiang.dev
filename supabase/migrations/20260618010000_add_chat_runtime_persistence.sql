alter table public.chat_question_logs
  add column if not exists client_id text,
  add column if not exists message_count integer,
  add column if not exists total_message_length integer,
  add column if not exists response_length integer,
  add column if not exists upstream_status integer,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists chat_question_logs_client_created_at_idx
  on public.chat_question_logs (client_id, created_at desc);

create table if not exists public.chat_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id text not null,
  session_id text,
  event text not null,
  window_ms integer not null,
  limit_count integer not null,
  request_count integer not null
);

create index if not exists chat_rate_limit_events_client_created_at_idx
  on public.chat_rate_limit_events (client_id, created_at desc);

create index if not exists chat_rate_limit_events_created_at_idx
  on public.chat_rate_limit_events (created_at desc);
