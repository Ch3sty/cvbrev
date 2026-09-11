-- Konverteringsomgången 2026-09-11 (docs/plan-konvertering.md). Applicerad via MCP samma dag.
alter table public.profiles
  add column if not exists free_cv_exports_used integer not null default 0,
  add column if not exists acquisition_source jsonb;
create index if not exists profiles_acquisition_landing_idx on public.profiles ((acquisition_source->>'landing_path'));

create table if not exists public.premium_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_event_id text unique,
  days integer not null,
  source text,
  granted_at timestamptz not null default now(),
  premium_until_after timestamptz
);
create index if not exists premium_grants_user_idx on public.premium_grants(user_id, granted_at desc);
alter table public.premium_grants enable row level security;
create policy premium_grants_owner_read on public.premium_grants for select using (auth.uid() = user_id);

create table if not exists public.email_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email_type text not null,
  send_after timestamptz not null,
  sent_at timestamptz,
  canceled_at timestamptz,
  cancel_reason text,
  attempts smallint not null default 0,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists email_schedule_user_type_uniq on public.email_schedule (user_id, email_type);
create index if not exists email_schedule_due_idx on public.email_schedule (send_after) where sent_at is null and canceled_at is null;
alter table public.email_schedule enable row level security;

create table if not exists public.cancel_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  free_text text,
  offer_shown text,
  offer_accepted boolean not null default false,
  completed_cancel boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists cancel_intents_user_idx on public.cancel_intents(user_id, created_at desc);
alter table public.cancel_intents enable row level security;

create table if not exists public.public_letter_drafts (
  token uuid primary key default gen_random_uuid(),
  yrke_slug text, role text not null, employer text not null,
  letter_text text not null, preview_paragraph text not null, ip_hash text not null,
  claimed_by uuid references auth.users(id) on delete set null, claimed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists public_letter_drafts_expires_idx on public.public_letter_drafts (expires_at);
create index if not exists public_letter_drafts_ip_idx on public.public_letter_drafts (ip_hash, created_at);
alter table public.public_letter_drafts enable row level security;

create table if not exists public.public_rate_limits (
  ip_hash text not null, scope text not null, window_start timestamptz not null,
  count integer not null default 0, primary key (ip_hash, scope, window_start)
);
alter table public.public_rate_limits enable row level security;

create table if not exists public.public_generation_budget (
  day date not null, scope text not null, count integer not null default 0, primary key (day, scope)
);
alter table public.public_generation_budget enable row level security;

create table if not exists public.anon_test_sessions (
  token uuid primary key default gen_random_uuid(),
  questions jsonb not null, answers jsonb, score integer, ip_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists anon_test_sessions_expires_idx on public.anon_test_sessions (expires_at);
alter table public.anon_test_sessions enable row level security;
