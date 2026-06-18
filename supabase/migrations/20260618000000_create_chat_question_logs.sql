create table if not exists public.chat_question_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  client_id text,
  question_preview text not null,
  question_length integer not null,
  message_count integer,
  total_message_length integer,
  source_ids jsonb not null default '[]'::jsonb,
  source_count integer not null default 0,
  mode text,
  status text not null default 'received',
  error_message text,
  duration_ms integer,
  response_length integer,
  upstream_status integer,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  user_agent text,
  referrer text
);

create index if not exists chat_question_logs_created_at_idx
  on public.chat_question_logs (created_at desc);

create index if not exists chat_question_logs_status_idx
  on public.chat_question_logs (status);

create index if not exists chat_question_logs_client_created_at_idx
  on public.chat_question_logs (client_id, created_at desc);
