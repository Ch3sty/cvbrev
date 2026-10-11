-- Rapportknappen "Något ser fel ut" (docs/design/tester-v2-2026-10-11/
-- tillagg-variation.md 3.2).
--
-- KÖRS INTE I PROD UTAN ÄGARENS JA (reference_prod_migreringar_sakerhet).
-- Additiv: en ny tabell, inget i befintliga tabeller ändras. Koden
-- (/api/traning/fraga-rapport) fungerar tyst utan tabellen: rapporten
-- loggas på servern och svaret till klienten är detsamma.
--
-- Tabell:
--   fraga_rapporter  en rad per rapport: konto, fråga (q_id), session,
--                    testsort, bankversion, orsak och en frivillig kommentar
--                    om högst 200 tecken.
--
-- Säkerhet: RLS på och inga policyer. Bara servern (service_role) läser och
-- skriver; anon och authenticated har inga rättigheter. Ägarens och
-- testkontonas rapporter tas bort vid läsning (admin_undantagna_konton()),
-- inte här, så att vi ser dem i testplanen.

create table if not exists public.fraga_rapporter (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  q_id text not null check (char_length(q_id) between 1 and 120),
  session_id uuid,
  test_kind text not null check (test_kind in ('matris', 'verbal', 'numerisk')),
  bank_version smallint,
  orsak text not null check (orsak in ('ratt_svar_fel', 'gar_inte_att_lasa', 'annat')),
  kommentar text check (kommentar is null or char_length(kommentar) <= 200),
  created_at timestamptz not null default now()
);

comment on table public.fraga_rapporter is
  'Rapporter från "Något ser fel ut" i frågevyn (tillagg-variation 3.2). Bara servern läser och skriver.';

create index if not exists fraga_rapporter_q_id on public.fraga_rapporter (q_id, created_at desc);
create index if not exists fraga_rapporter_user_dag on public.fraga_rapporter (user_id, created_at desc);

alter table public.fraga_rapporter enable row level security;
revoke all on public.fraga_rapporter from anon, authenticated;
grant select, insert on public.fraga_rapporter to service_role;

-- Rollback:
-- drop table if exists public.fraga_rapporter;
