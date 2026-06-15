-- Persistent cache för SSYK-kod-uppslag (yrkesterm → SSYK-kod via Taxonomy API).
-- Tidigare bara in-memory per edge-anrop → varje kall start slog externt API
-- per yrkesterm, vilket var den största tidstjuven i match-jobs (546-timeouts).
-- Nu globalt persistent: en term slås upp en gång, återanvänds av alla anrop.
--
-- found=false cachas också (negativ cache) så termer utan SSYK inte slås upp
-- om och om igen. Skrivs bara av service-role (edge functions); RLS på men
-- ingen anon-policy behövs (intern cache).
CREATE TABLE IF NOT EXISTS public.ssyk_code_cache (
  occupation_term text PRIMARY KEY,
  ssyk_code text,
  found boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ssyk_code_cache ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.ssyk_code_cache IS 'Persistent cache för yrkesterm→SSYK-kod-uppslag (Taxonomy API). Fylls av match-jobs edge function via service-role.';
