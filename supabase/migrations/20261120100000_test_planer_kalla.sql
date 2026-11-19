-- Planens källa (tester v4, docs/plan-tester-v4-bygg.md A5 och 9):
-- 'artikel' när planen skapades ur provkällan i en artikel
-- (mittTestFranKalla.server.ts), 'installningar' när användaren valt testet
-- själv i Plan inför provet (PUT /api/traning/plan). Hem visar första steget
-- och "Lägg till provdatum" för en artikelplan utan datum.
--
-- Additiv: en ny kolumn som får vara null (äldre planer: okänd källa) och ett
-- villkor på den. Inga befintliga värden ändras. Skrivs bara av servern.

alter table public.test_planer
  add column if not exists kalla text null;

alter table public.test_planer drop constraint if exists test_planer_kalla_check;
alter table public.test_planer
  add constraint test_planer_kalla_check check (kalla is null or kalla in ('artikel', 'installningar'));

comment on column public.test_planer.kalla is
  'Var planen skapades: artikel (provkällan i en artikel) eller installningar (valt i Plan inför provet). Null: okänt, före 2026-11-19.';

-- Rollback:
--   alter table public.test_planer drop constraint test_planer_kalla_check;
--   alter table public.test_planer drop column kalla;
