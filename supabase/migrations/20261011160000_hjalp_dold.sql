-- Tester-lyftet (docs/design/tester-lyft-2026-10-11/skiss.html, avsnitt 4
-- och beslut 5): "Dölj hjälpen" stänger av hjälprutorna i
-- Rekryteringstester tills användaren slår på dem igen i profilen.
--
--   profiles.hjalp_dold   Sant när användaren dolt hjälpen. Null eller falskt:
--                         hjälpen syns (öppen första gången, hopfälld sedan).
--                         Skrivs av POST /api/profile/hjalp.
--
-- Inte skyddad (profiles_skydda_kolumner): att sätta den själv ändrar bara om
-- förklaringstexter visas.
--
-- Additiv. Koden klarar att kolumnen saknas (läsningar ger null, skrivningen
-- sväljer 42703/PGRST204, localStorage bär valet). Kör på Supabase-branch
-- först; prod bara efter ägarens ja.
--
-- Rollback:
--   alter table public.profiles drop column if exists hjalp_dold;

alter table public.profiles
  add column if not exists hjalp_dold boolean null;

comment on column public.profiles.hjalp_dold is
  'Sant när användaren valt Dölj hjälpen i Rekryteringstester (tester-lyftet 2026-10-11).';
