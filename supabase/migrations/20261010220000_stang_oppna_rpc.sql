-- Stänger SECURITY DEFINER-funktioner som anon och authenticated kunde anropa
-- via /rest/v1/rpc (2026-10-10).
--
-- Verifierat i prod med den publika anon-nyckeln, utan inloggning:
--   get_latest_users       -> e-post, namn och plan för de senaste användarna
--   get_latest_activities  -> aktiviteter med e-post
--   get_revenue_stats, calculate_mrr -> intäktsstatistik
-- activate_user_reward(p_user_id, ...) och get_or_create_ai_conversation(p_user_id, ...)
-- tar dessutom ett godtyckligt användar-id och körs med ägarens rättigheter,
-- vilket går förbi spärren profiles_skydda_kolumner.
--
-- Ingen av funktionerna nedan anropas av appen (grep i src, supabase/functions
-- och scripts 2026-10-10). Triggerfunktionerna (handle_new_user,
-- handle_premium_upgrade, upsert_personality_profile,
-- set_recruiter_contact_email) fortsätter fungera som triggers: EXECUTE prövas
-- inte när en trigger avfyras. Cron och servern kör som postgres/service_role.
--
-- Står kvar öppna med avsikt:
--   is_admin, is_super_admin: används i RLS-policyer.
--   update_onboarding_progress, get_weekly_linkedin_optimizations_count:
--     anropas av API-rutter och edge-funktioner med användarens session.
--     anon tas bort, authenticated står kvar.
--
-- Rollback: grant execute on function <namn>(<argument>) to anon, authenticated;

do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace
       and p.proname in (
         'activate_user_reward', 'calculate_mrr', 'cleanup_expired_login_tokens',
         'cleanup_old_logic_data', 'complete_worker', 'get_cv_counts_by_user',
         'get_dashboard_overview', 'get_invitation_analytics', 'get_latest_activities',
         'get_latest_users', 'get_letter_counts_by_user', 'get_or_create_ai_conversation',
         'get_plan_study_progress', 'get_revenue_stats', 'get_user_reward_status',
         'get_user_study_stats', 'handle_new_user', 'handle_premium_upgrade',
         'increment_active_workers', 'merge_learning_suggestions',
         'set_recruiter_contact_email', 'set_weekly_goal_xp', 'update_worker_progress',
         'upsert_personality_profile'
       )
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;

  for f in
    select p.oid::regprocedure
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace
       and p.proname in ('update_onboarding_progress', 'get_weekly_linkedin_optimizations_count')
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end
$$;
