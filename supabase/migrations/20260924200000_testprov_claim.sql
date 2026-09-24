-- Logiktestprovets landning (docs/qa/qa-slutflode-2026-09-24.md, K1).
--
-- anon_test_sessions får claimed_by och claimed_at, så att resultatsidan
-- /dashboard/tester/prov/[token] kan visa provet för kontot som hämtade det
-- och svara 404 för alla andra. Som intervjuprovet och personlighetsprovet
-- (ägarens beslut 2) är en hämtad rad permanent: expires_at blir null vid
-- claim, och rensningen tar bara expires_at < now(). Raden följer kontot
-- vid radering (on delete cascade).
--
-- Inga tabeller eller kolumner tas bort.

alter table public.anon_test_sessions
  add column if not exists claimed_by uuid references auth.users (id) on delete cascade;
alter table public.anon_test_sessions
  add column if not exists claimed_at timestamptz;
alter table public.anon_test_sessions alter column expires_at drop not null;
create index if not exists anon_test_sessions_claimed_idx on public.anon_test_sessions (claimed_by, created_at);
