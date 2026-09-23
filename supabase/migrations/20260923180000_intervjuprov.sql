-- Intervjuprovet i artiklarna (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 6).
--
-- Ett svar per rad: besökarens text, hela bedömningen och det omskrivna
-- svaret. Före claim lämnar bara nivå, mening, works och missing servern;
-- full, improved_answer och improved_why visas först på
-- /dashboard/intervju/[token] för den som gjort anspråk på raden.
--
-- Inga policies: bara admin-klienten läser och skriver. Dashboardsidan
-- kontrollerar claimed_by själv. Raderna rensas sju dygn efter skapandet i
-- cronens midnattsslot (api/cron/pricing-sync), aldrig ett eget cron-jobb.
create table if not exists public.anon_interview_samples (
  token uuid primary key default gen_random_uuid(),
  question text not null check (question in ('styrkor','star')),
  answer text not null,
  level smallint not null check (level between 1 and 5),
  summary text not null,
  works text not null,
  missing text not null,
  missing_kind text not null,
  "full" jsonb not null,  -- reserverat ord i Postgres, därför citerat
  improved_answer text not null,
  improved_why text,
  ip_hash text not null,
  user_id uuid references auth.users (id) on delete set null,
  claimed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create index if not exists anon_interview_samples_expires_idx on public.anon_interview_samples (expires_at);
create index if not exists anon_interview_samples_user_idx on public.anon_interview_samples (user_id, created_at);
alter table public.anon_interview_samples enable row level security;
