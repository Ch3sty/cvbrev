-- Admin-läspolicies så admin-vyerna (user_feature_usage_stats, admin_activity_feed,
-- admin_test_stats) ser ALLA användares data, inte bara adminens egen.
--
-- Bakgrund: dessa tabeller hade bara "auth.uid() = user_id"-SELECT, utan en
-- "OR is_admin()"-gren (till skillnad från t.ex. letters). Det gjorde att
-- admin-statistiken för CV-analys och CV-mallar tyst bara räknade adminens egna
-- rader, och de nya test/coach-kolumnerna hade samma problem. Mönstret matchar
-- letters_select_policy. Additivt — vanliga användare påverkas inte.

DROP POLICY IF EXISTS "admins_read_all_logic_tests" ON public.logic_test_v4_sessions;
CREATE POLICY "admins_read_all_logic_tests"
  ON public.logic_test_v4_sessions FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admins_read_all_personality_tests" ON public.personality_test_sessions;
CREATE POLICY "admins_read_all_personality_tests"
  ON public.personality_test_sessions FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admins_read_all_ai_conversations" ON public.ai_conversations;
CREATE POLICY "admins_read_all_ai_conversations"
  ON public.ai_conversations FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admins_read_all_cv_analysis_jobs" ON public.cv_analysis_jobs;
CREATE POLICY "admins_read_all_cv_analysis_jobs"
  ON public.cv_analysis_jobs FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "admins_read_all_cv_downloads" ON public.formatted_cv_downloads;
CREATE POLICY "admins_read_all_cv_downloads"
  ON public.formatted_cv_downloads FOR SELECT TO authenticated
  USING (is_admin());
