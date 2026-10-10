-- Blandade svarsalternativ i matrislogiken (fix/matris-blanda-alternativ).
--
-- Rätt svar låg på index 0 i 81 av 84 V7-frågor och alternativens ordning
-- var fast. Från och med fixen visas alternativen i en ordning seedad på
-- sessionId (token i smakprovet) + frågans id, och varje ny session får
-- meta.alternativ_blandade = true när den skapas.
--
-- Rader utan flaggan (allt före fixen) tolkas som identitetsordningen och
-- visas och rättas som förut. Ingen historik ändras eller raderas.
--
-- Additivt: en ny kolumn med konstant default är en ren katalogändring i
-- Postgres 11+, ingen omskrivning av tabellen.
--
-- Ordning vid deploy: kör migreringen FÖRE koden. Koden klarar sig utan
-- kolumnen (nya sessioner skapas då oblandade, som före fixen), men först
-- med kolumnen blandas alternativen.

alter table public.logic_test_v4_sessions
  add column if not exists meta jsonb not null default '{}'::jsonb;

alter table public.anon_test_sessions
  add column if not exists meta jsonb not null default '{}'::jsonb;

comment on column public.logic_test_v4_sessions.meta is
  'Sessionens metadata. alternativ_blandade = true: svarsalternativen visas blandade (src/lib/logicTestV7/blanda.ts), answers[].selected är originalindex och answers[].visat visat index. Saknas flaggan: identitetsordningen.';

comment on column public.anon_test_sessions.meta is
  'Provets metadata. alternativ_blandade = true: alternativen visas blandade, seedat på token + frågans id. answers lagrar originalindex.';

-- Percentilen räknas bara på blandade, slutförda sessioner per testtyp
-- (/api/logicTestV4/percentile och getResultsData). Delindex för de två
-- count-frågorna.
create index if not exists logic_test_v4_sessions_percentil_blandade_idx
  on public.logic_test_v4_sessions (test_type, score)
  where completed_at is not null
    and (meta ->> 'alternativ_blandade') = 'true';
