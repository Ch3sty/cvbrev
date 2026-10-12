-- Deduktiv slutledning som testtyp i rapporterna (beställningen omgång 3, B1).
-- fraga_rapporter.test_kind får värdet deduktiv. Additiv: bara
-- kontrollvillkoret byts, inga rader ändras.
--
-- Koden tål att den inte är körd: /api/traning/fraga-rapport sparar då
-- deduktivens rapporter med test_kind matris (id:t dd-... skiljer dem åt).
-- fraga_statistik.test_kind har inget villkor och tar deduktiv redan.
--
-- KÖRS INTE I PROD UTAN ÄGARENS JA. Kör efter
-- 20261012130000_fraga_rapporter_figurserie.sql.

alter table public.fraga_rapporter drop constraint if exists fraga_rapporter_test_kind_check;
alter table public.fraga_rapporter
  add constraint fraga_rapporter_test_kind_check
  check (test_kind in ('matris', 'verbal', 'numerisk', 'figurserie', 'deduktiv'));

-- Rollback:
--   update public.fraga_rapporter set test_kind = 'matris' where test_kind = 'deduktiv';
--   alter table public.fraga_rapporter drop constraint fraga_rapporter_test_kind_check;
--   alter table public.fraga_rapporter add constraint fraga_rapporter_test_kind_check
--     check (test_kind in ('matris', 'verbal', 'numerisk', 'figurserie'));
