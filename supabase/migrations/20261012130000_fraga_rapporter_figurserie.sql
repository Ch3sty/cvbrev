-- Figurserier som testtyp i rapporterna (beställningen omgång 2, A2).
-- fraga_rapporter.test_kind får värdet figurserie. Additiv: bara
-- kontrollvillkoret byts, inga rader ändras.
--
-- Koden tål att den inte är körd: /api/traning/fraga-rapport sparar då
-- figurseriernas rapporter med test_kind matris (id:t fs-... skiljer dem åt).
-- fraga_statistik.test_kind har inget villkor och tar figurserie redan.
--
-- KÖRS INTE I PROD UTAN ÄGARENS JA. Kör efter 20261012110000_fraga_rapporter.sql.

alter table public.fraga_rapporter drop constraint if exists fraga_rapporter_test_kind_check;
alter table public.fraga_rapporter
  add constraint fraga_rapporter_test_kind_check
  check (test_kind in ('matris', 'verbal', 'numerisk', 'figurserie'));

-- Rollback:
--   update public.fraga_rapporter set test_kind = 'matris' where test_kind = 'figurserie';
--   alter table public.fraga_rapporter drop constraint fraga_rapporter_test_kind_check;
--   alter table public.fraga_rapporter add constraint fraga_rapporter_test_kind_check
--     check (test_kind in ('matris', 'verbal', 'numerisk'));
