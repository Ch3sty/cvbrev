-- Global, delad cache för icke-användarspecifika jobbpooler från JobSearch:
-- 'remote' (distansjobb) och 'no_experience' (jobb utan erfarenhetskrav).
-- Dessa pooler är SAMMA för alla användare, så de hämtas av cron några gånger
-- per dag (sync-global-jobs edge function) i stället för per användarsökning.
-- Frontend läser direkt och rankar mot CV:t klientsidigt.
CREATE TABLE IF NOT EXISTS public.global_job_cache (
  cache_key text PRIMARY KEY,           -- 'remote' | 'no_experience'
  jobs jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_found integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.global_job_cache ENABLE ROW LEVEL SECURITY;

-- Inloggade användare får LÄSA cachen (publik jobbannons-data, inte känslig).
-- Skrivning sker bara av service-role (sync-funktionen), som kringgår RLS.
DROP POLICY IF EXISTS "global_job_cache_read" ON public.global_job_cache;
CREATE POLICY "global_job_cache_read"
  ON public.global_job_cache
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE public.global_job_cache IS
  'Global cache för remote/erfarenhet-fria jobbpooler (icke-användarspecifika). Fylls av sync-global-jobs edge function via cron.';
