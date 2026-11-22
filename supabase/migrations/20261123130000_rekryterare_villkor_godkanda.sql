-- Rekryterarvillkoren (ägarens ja 2026-11-22): när rekryteraren godkände
-- villkoren, och vilken version. Tomt för konton som registrerats före
-- villkoren fanns; de får godkänna vid nästa inloggning.
--
-- KÖRD i produktionen 2026-11-22. Kontrollerat: båda kolumnerna finns.

alter table public.recruiter_profiles
  add column if not exists villkor_godkanda_at timestamptz,
  add column if not exists villkor_version text;

notify pgrst, 'reload schema';
