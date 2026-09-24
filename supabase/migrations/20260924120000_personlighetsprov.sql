-- Röd tråd för proven (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 6).
--
-- 1. anon_personality_samples: personlighetsprovets tjugo svar och poängen,
--    en rad per token. Inga policies: bara admin-klienten läser och skriver,
--    och sidorna kontrollerar claimed_by själva. Raden skrivs aldrig till
--    user_personality_profile: tjugo påståenden räcker inte för den profil
--    Bli upptäckt visar rekryterare.
-- 2. Intervjuprovet får sju frågor. Constraint-namnet kontrollerat i
--    databasen 2026-09-24 (anon_interview_samples_question_check).
-- 3. Ägarens beslut 2: en claimad rad är permanent. expires_at blir null vid
--    claim, och rensningen i cronens midnattsslot tar bara expires_at < now(),
--    så claimade rader rörs aldrig. Redan claimade intervjurader görs
--    permanenta här.
--
-- Inga tabeller eller kolumner tas bort.

create table if not exists public.anon_personality_samples (
  token uuid primary key,
  answers jsonb not null,
  scores jsonb not null,
  ip_hash text not null,
  source_slug text,
  user_id uuid references auth.users (id) on delete set null,
  claimed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- null = claimad och permanent (beslut 2)
  expires_at timestamptz default (now() + interval '7 days')
);
create index if not exists anon_personality_samples_expires_idx on public.anon_personality_samples (expires_at);
create index if not exists anon_personality_samples_claimed_idx on public.anon_personality_samples (claimed_by, created_at);
alter table public.anon_personality_samples enable row level security;

alter table public.anon_interview_samples drop constraint if exists anon_interview_samples_question_check;
alter table public.anon_interview_samples add constraint anon_interview_samples_question_check
  check (question in ('beratta','styrkor','varfor_vi','varfor_jobbet','star','konflikt','misstag'));

alter table public.anon_interview_samples alter column expires_at drop not null;
create index if not exists anon_interview_samples_claimed_idx on public.anon_interview_samples (claimed_by, created_at);

update public.anon_interview_samples set expires_at = null where claimed_by is not null;
