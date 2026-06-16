-- Vyer för admin-aktivitetsflödet (/admin/activity).

-- 1. Test-statistik per testtyp: påbörjade, avslutade, completion-grad.
--    Avslöjar var användare hoppar av (t.ex. matrislogik ~48% completion).
CREATE OR REPLACE VIEW public.admin_test_stats AS
SELECT
  'logik'::text AS kategori,
  test_type,
  count(*) AS started,
  count(*) FILTER (WHERE completed_at IS NOT NULL) AS completed,
  count(DISTINCT user_id) AS unique_users,
  max(started_at) AS last_started
FROM public.logic_test_v4_sessions
GROUP BY test_type
UNION ALL
SELECT
  'personlighet'::text AS kategori,
  test_type,
  count(*) AS started,
  count(*) FILTER (WHERE completed_at IS NOT NULL) AS completed,
  count(DISTINCT user_id) AS unique_users,
  max(started_at) AS last_started
FROM public.personality_test_sessions
GROUP BY test_type;

-- 2. Kombinerat aktivitetsflöde: en rad per händelse tvärs över funktioner,
--    med användarens e-post. Sorteras på tid i queryn (sidan hämtar senaste N).
CREATE OR REPLACE VIEW public.admin_activity_feed AS
SELECT * FROM (
  SELECT l.user_id, p.email, p.full_name,
         'Logiktest'::text AS funktion,
         l.test_type AS detalj,
         (l.completed_at IS NOT NULL) AS slutford,
         COALESCE(l.completed_at, l.started_at) AS tidpunkt
  FROM public.logic_test_v4_sessions l JOIN public.profiles p ON p.id = l.user_id
  UNION ALL
  SELECT pt.user_id, p.email, p.full_name,
         'Personlighetstest', pt.test_type,
         (pt.completed_at IS NOT NULL),
         COALESCE(pt.completed_at, pt.started_at)
  FROM public.personality_test_sessions pt JOIN public.profiles p ON p.id = pt.user_id
  UNION ALL
  SELECT c.user_id, p.email, p.full_name,
         'Jobbcoach', COALESCE(c.topic, c.title), true, c.created_at
  FROM public.ai_conversations c JOIN public.profiles p ON p.id = c.user_id
  UNION ALL
  SELECT cj.user_id, p.email, p.full_name,
         'CV-analys', cj.display_name, (cj.status = 'completed'),
         COALESCE(cj.completed_at, cj.created_at)
  FROM public.cv_analysis_jobs cj JOIN public.profiles p ON p.id = cj.user_id
  UNION ALL
  SELECT le.user_id, p.email, p.full_name,
         'Brev', le.job_title, true, le.created_at
  FROM public.letters le JOIN public.profiles p ON p.id = le.user_id
  UNION ALL
  SELECT d.user_id, p.email, p.full_name,
         'CV-mall', d.template_id, true, d.downloaded_at
  FROM public.formatted_cv_downloads d JOIN public.profiles p ON p.id = d.user_id
  UNION ALL
  SELECT lo.user_id, p.email, p.full_name,
         'LinkedIn-opt', NULL::text, true, lo.created_at
  FROM public.linkedin_optimizations lo JOIN public.profiles p ON p.id = lo.user_id
) feed;
