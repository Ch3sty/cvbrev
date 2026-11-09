-- "Mitt test är …" i ingången (brief-tester-steg2-2026-11-09.md avsnitt 6,
-- skissen skiss-tester-steg2-2026-11-09.html). Ägaren sa ja 2026-11-09.
--
-- Bara additiv: tre nya kolumner med egna villkor. Inga befintliga villkor
-- byts och inga rader ändras, så gamla planer läses som förut (leverantor,
-- variant och testtyper står kvar och skrivs som i dag för de val som har en
-- motsvarighet där).
--
--   mitt_test          valet i ingången, åtta värden. Null: planen är från
--                      före steg 2 och läses ur leverantor som i dag.
--   mitt_test_variant  varianten under valet: polis, varnplikt, officer för
--                      I-prov 2025, klassisk och adaptiv för Matrigma.
--   extra_typer        de nya deltesterna som kryssas under "Annat eller vet
--                      inte" (figurserie, deduktiv, talserie, spatial,
--                      ordforrad). testtyper behåller sina fyra värden.
--
-- fraga_rapporter ändras inte: rapporter för talserie, spatial och ordforrad
-- sparas med test_kind matris (som figurserie och deduktiv före sina
-- migreringar) och skiljs åt på id:t (ts-, sp-, of-).
--
-- Säkerheten ärvs: RLS, ingen skrivpolicy och triggern traning_skydda_skrivning
-- gäller hela raden (20261011100000_test_planer.sql).

alter table public.test_planer
  add column if not exists mitt_test text null,
  add column if not exists mitt_test_variant text null,
  add column if not exists extra_typer text[] not null default '{}';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'test_planer_mitt_test_check') then
    alter table public.test_planer
      add constraint test_planer_mitt_test_check
        check (mitt_test is null or mitt_test in ('iprov', 'matrigma', 'alva', 'shl', 'aon', 'lokforare', 'annat', 'personlighet'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'test_planer_mitt_test_variant_check') then
    alter table public.test_planer
      add constraint test_planer_mitt_test_variant_check
        check (mitt_test_variant is null or mitt_test_variant in ('polis', 'varnplikt', 'officer', 'klassisk', 'adaptiv'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'test_planer_extra_typer_check') then
    alter table public.test_planer
      add constraint test_planer_extra_typer_check
        check (extra_typer <@ array['figurserie', 'deduktiv', 'talserie', 'spatial', 'ordforrad']::text[]);
  end if;
end
$$;

comment on column public.test_planer.mitt_test is
  'Valet "Mitt test är …" i ingången (steg 2, 2026-11-09). Null: plan från före steg 2, läses ur leverantor.';
comment on column public.test_planer.mitt_test_variant is
  'Varianten under valet: polis, varnplikt, officer (I-prov 2025), klassisk, adaptiv (Matrigma).';
comment on column public.test_planer.extra_typer is
  'Nya deltester valda under "Annat eller vet inte": figurserie, deduktiv, talserie, spatial, ordforrad.';

-- Rollback (kräver ägarens ja, tar bort data):
--   alter table public.test_planer drop column extra_typer;
--   alter table public.test_planer drop column mitt_test_variant;
--   alter table public.test_planer drop column mitt_test;
