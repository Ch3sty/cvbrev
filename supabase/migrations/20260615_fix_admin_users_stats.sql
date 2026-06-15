-- Fix för admin/users-statistiken (user_feature_usage_stats).
--
-- 1) linkedin_optimizations_count visade alltid 0 eftersom vyn läste
--    user_activities med activity_type 'linkedin_optimization_completed'
--    som aldrig loggas. Den riktiga datan finns i tabellen
--    linkedin_optimizations. Byter källa till den tabellen.
--    (Övriga räknare verifierade korrekta och oförändrade.)
--
-- 2) Backfill av profiles.last_active från senaste user_activities-händelse
--    per användare. last_active uppdateras numera live av middleware
--    (src/middleware.ts -> updateSession -> updateLastActive), men var tom
--    historiskt. Backfillen ger en ärlig "senast aktiv" direkt för de 143
--    användare som har aktivitetshistorik; resten förblir NULL ("Aldrig").

CREATE OR REPLACE VIEW public.user_feature_usage_stats AS
SELECT p.id AS user_id,
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
    linkedin_usage.last_used AS last_linkedin_optimization
   FROM profiles p
     LEFT JOIN LATERAL ( SELECT count(*) AS count,
            max(letters.created_at) AS last_used
           FROM letters
          WHERE letters.user_id = p.id) letter_usage ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count,
            max(user_activities.created_at) AS last_used
           FROM user_activities
          WHERE user_activities.user_id = p.id AND user_activities.activity_type = 'cv_analysis_completed'::text) cv_analysis_usage ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count,
            max(formatted_cv_downloads.downloaded_at) AS last_used
           FROM formatted_cv_downloads
          WHERE formatted_cv_downloads.user_id = p.id) cv_template_usage ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count,
            max(user_activities.created_at) AS last_used
           FROM user_activities
          WHERE user_activities.user_id = p.id AND user_activities.activity_type = 'job_match_searched'::text) job_match_usage ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count,
            max(linkedin_optimizations.created_at) AS last_used
           FROM linkedin_optimizations
          WHERE linkedin_optimizations.user_id = p.id) linkedin_usage ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count
           FROM letters
          WHERE letters.user_id = p.id AND letters.is_saved = true) saved_letters ON true
     LEFT JOIN LATERAL ( SELECT count(*) AS count
           FROM cv_texts
          WHERE cv_texts.user_id = p.id) saved_cvs ON true;

-- Backfill last_active (engångs). Endast där det är tomt, så live-uppdaterade
-- rader inte skrivs över.
WITH la AS (
  SELECT user_id, max(created_at) AS last_act
  FROM user_activities
  WHERE user_id IS NOT NULL
  GROUP BY user_id
)
UPDATE profiles p
SET last_active = la.last_act
FROM la
WHERE p.id = la.user_id
  AND p.last_active IS NULL;
