-- Filter-medveten cache för jobbmatchning.
-- Tidigare nyckel (user_id, cv_id) skrevs över oavsett vilka filter användaren
-- valt → byte av filter returnerade fel cachat resultat. Nu ingår filter_hash
-- i nyckeln: en cache-rad per filteruppsättning. Tom sträng = ingen filtrering
-- (standard CV-matchning, dagens beteende oförändrat).
ALTER TABLE public.job_matchings_cache
  ADD COLUMN IF NOT EXISTS filter_hash text NOT NULL DEFAULT '';

ALTER TABLE public.job_matchings_cache
  DROP CONSTRAINT IF EXISTS job_matchings_cache_pkey;

ALTER TABLE public.job_matchings_cache
  ADD CONSTRAINT job_matchings_cache_pkey PRIMARY KEY (user_id, cv_id, filter_hash);

COMMENT ON COLUMN public.job_matchings_cache.filter_hash IS
  'SHA-256 (hex) av normaliserade anvandarvalda filter. Tom strang = ingen filtrering (standard CV-matchning).';
