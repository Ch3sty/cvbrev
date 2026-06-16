-- Gör admin-statistiken (user_feature_usage_stats) korrekt och komplett.
--
-- 1. CV-analys räknades tidigare från user_activities.cv_analysis_completed, en
--    opålitlig klient-loggning (fire-and-forget, tappas när tabben stängs) som
--    dessutom överrapporterade pga ett gammalt flöde. Räknas nu från
--    cv_analysis_jobs (status='completed') — den faktiska sanningskällan.
-- 2. Tre nya räknare för funktioner som inte syntes i admin trots hög användning:
--    jobbcoach (ai_conversations), logiktest (logic_test_v4_sessions),
--    personlighetstest (personality_test_sessions).
--
-- Nya kolumner läggs SIST eftersom CREATE OR REPLACE VIEW kräver att befintlig
-- kolumnordning bevaras. Admin-UI:t väljer kolumner by-name så ordningen spelar
-- ingen roll där.
CREATE OR REPLACE VIEW public.user_feature_usage_stats AS
SELECT
  p.id AS user_id,
  p.email,
  p.full_name,
  p.subscription_tier,
  p.premium_until,
  p.premium_source,
  p.created_at,
  p.last_active,
  COALESCE(letter_usage.count, 0::bigint) AS letters_generated_count,
  COALESCE(cv_analysis_usage.count, 0::bigint) AS cv_analyses_count,
  COALESCE(cv_template_usage.count, 0::bigint) AS cv_templates_downloaded_count,
  COALESCE(job_match_usage.count, 0::bigint) AS job_matches_count,
  COALESCE(linkedin_usage.count, 0::bigint) AS linkedin_optimizations_count,
  COALESCE(saved_letters.count, 0::bigint) AS saved_letters_count,
  COALESCE(saved_cvs.count, 0::bigint) AS saved_cvs_count,
  letter_usage.last_used AS last_letter_generated,
  cv_analysis_usage.last_used AS last_cv_analysis,
  cv_template_usage.last_used AS last_cv_template_downloaded,
  job_match_usage.last_used AS last_job_match,
  linkedin_usage.last_used AS last_linkedin_optimization,
  COALESCE(coach_usage.count, 0::bigint) AS coach_conversations_count,
  COALESCE(logic_test_usage.count, 0::bigint) AS logic_tests_count,
  COALESCE(personality_test_usage.count, 0::bigint) AS personality_tests_count,
  coach_usage.last_used AS last_coach_conversation,
  logic_test_usage.last_used AS last_logic_test,
  personality_test_usage.last_used AS last_personality_test
FROM profiles p
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(letters.created_at) AS last_used
    FROM letters WHERE letters.user_id = p.id
  ) letter_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(cv_analysis_jobs.completed_at) AS last_used
    FROM cv_analysis_jobs
    WHERE cv_analysis_jobs.user_id = p.id AND cv_analysis_jobs.status = 'completed'
  ) cv_analysis_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(formatted_cv_downloads.downloaded_at) AS last_used
    FROM formatted_cv_downloads WHERE formatted_cv_downloads.user_id = p.id
  ) cv_template_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(user_activities.created_at) AS last_used
    FROM user_activities
    WHERE user_activities.user_id = p.id AND user_activities.activity_type = 'job_match_searched'
  ) job_match_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(linkedin_optimizations.created_at) AS last_used
    FROM linkedin_optimizations WHERE linkedin_optimizations.user_id = p.id
  ) linkedin_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count
    FROM letters WHERE letters.user_id = p.id AND letters.is_saved = true
  ) saved_letters ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count FROM cv_texts WHERE cv_texts.user_id = p.id
  ) saved_cvs ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(ai_conversations.created_at) AS last_used
    FROM ai_conversations WHERE ai_conversations.user_id = p.id
  ) coach_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(logic_test_v4_sessions.started_at) AS last_used
    FROM logic_test_v4_sessions WHERE logic_test_v4_sessions.user_id = p.id
  ) logic_test_usage ON true
  LEFT JOIN LATERAL (
    SELECT count(*) AS count, max(personality_test_sessions.started_at) AS last_used
    FROM personality_test_sessions WHERE personality_test_sessions.user_id = p.id
  ) personality_test_usage ON true;
