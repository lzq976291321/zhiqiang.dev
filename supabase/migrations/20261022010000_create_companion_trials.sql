-- 匿名体验计数：前 2 轮不登录，第 3 轮要求登录。
-- 只存 session id 的 SHA-256，不存原始标识；仅 service_role 可读写。

create table if not exists public.companion_trials (
  trial_key text primary key,
  rounds integer not null default 0 check (rounds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companion_trials enable row level security;
revoke all on table public.companion_trials from anon, authenticated;
grant all on table public.companion_trials to service_role;

create or replace function public.consume_companion_trial(p_key text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_round integer;
begin
  insert into public.companion_trials (trial_key, rounds)
  values (p_key, 1)
  on conflict (trial_key) do update
    set rounds = public.companion_trials.rounds + 1,
        updated_at = now()
  returning rounds into next_round;
  return next_round;
end;
$$;

revoke all on function public.consume_companion_trial(text) from public, anon, authenticated;
grant execute on function public.consume_companion_trial(text) to service_role;

comment on table public.companion_trials is '匿名伴侣体验计数；键为 session id 的 SHA-256';
