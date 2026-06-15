-- Säkerhetsfix: enriched_occupations + enriched_jobs hade RLS avstängt och noll
-- policies → fullt exponerade mot anon-nyckeln (läs/skriv/radera).
-- Datan är offentlig yrkestaxonomi (ingen PII), men en utomstående kunde
-- radera/förvanska den och bryta jobbmatchningen.
--
-- All FAKTISK skrivning sker från edge functions (match-jobs, match-jobs-v2)
-- via SERVICE_ROLE-nyckeln, som förbigår RLS per design → oförändrad funktion.
-- Ingen Next.js-kod (klient/server/api) läser tabellerna med anon-nyckeln.
-- Read-policyn för authenticated är därför en säker bonus; den bryter inget.
--
-- Verifierat efter applicering:
--   - RLS på, endast SELECT-policy för authenticated (ingen skrivpolicy)
--   - service-role kan fortf. insert/delete (edge functions opåverkade)
--   - anon/authenticated kan inte längre skriva (hålet stängt)

ALTER TABLE public.enriched_occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enriched_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_enriched_occupations"
  ON public.enriched_occupations FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_enriched_jobs"
  ON public.enriched_jobs FOR SELECT TO authenticated USING (true);
