-- Migration: Add user feature usage statistics view for admin panel
-- Created: 2025-02-03
-- Purpose: Aggregate user activity metrics for admin dashboard

-- Create view for user feature usage statistics
CREATE OR REPLACE VIEW user_feature_usage_stats AS
SELECT
  p.id as user_id,
  p.email,
  p.full_name,
  p.subscription_tier,
  p.premium_until,
  p.premium_source,
  p.created_at,
  p.last_active,

  -- PRIMARY METRICS: Usage per feature (shows activity!)
  COALESCE(letter_usage.count, 0) as letters_generated_count,
  COALESCE(cv_analysis_usage.count, 0) as cv_analyses_count,
  COALESCE(job_match_usage.count, 0) as job_matches_count,
  COALESCE(linkedin_usage.count, 0) as linkedin_optimizations_count,

  -- SECONDARY METRICS: Saved documents (shows retention)
  COALESCE(saved_letters.count, 0) as saved_letters_count,
  COALESCE(saved_cvs.count, 0) as saved_cvs_count,

  -- Last usage timestamps per feature
  letter_usage.last_used as last_letter_generated,
  cv_analysis_usage.last_used as last_cv_analysis,
  job_match_usage.last_used as last_job_match,
  linkedin_usage.last_used as last_linkedin_optimization

FROM profiles p

-- Letter generation (total number generated, not just saved!)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as count,
    MAX(created_at) as last_used
  FROM letters
  WHERE user_id = p.id
) letter_usage ON true

-- CV analyses
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as count,
    MAX(created_at) as last_used
  FROM user_activities
  WHERE user_id = p.id
    AND activity_type = 'cv_analysis_completed'
) cv_analysis_usage ON true

-- Job matching (will work once edge function is updated)
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as count,
    MAX(created_at) as last_used
  FROM user_activities
  WHERE user_id = p.id
    AND activity_type = 'job_match_searched'
) job_match_usage ON true

-- LinkedIn optimization
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) as count,
    MAX(created_at) as last_used
  FROM user_activities
  WHERE user_id = p.id
    AND activity_type = 'linkedin_optimization_completed'
) linkedin_usage ON true

-- Saved letters (secondary metric)
LEFT JOIN LATERAL (
  SELECT COUNT(*) as count
  FROM letters
  WHERE user_id = p.id AND is_saved = true
) saved_letters ON true

-- Saved CVs (secondary metric)
LEFT JOIN LATERAL (
  SELECT COUNT(*) as count
  FROM cv_texts
  WHERE user_id = p.id
) saved_cvs ON true;

-- Grant access for authenticated users
-- Note: Views don't support RLS policies - access control must be handled at application level
GRANT SELECT ON user_feature_usage_stats TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW user_feature_usage_stats IS
'Aggregates user activity metrics for admin dashboard.
Shows usage counts for each feature (letters, CV analysis, job matching, LinkedIn optimization)
and secondary metrics for saved documents.
Note: job_matches_count will show 0 until edge function is updated to log activity_type = job_match_searched';
