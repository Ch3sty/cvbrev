-- Trigger-funktionen ska aldrig exponeras via PostgREST-RPC (advisor-fynd:
-- anon/authenticated kunde i teorin anropa den som SECURITY DEFINER).
-- Applicerad mot produktion 2026-07-29 via Supabase MCP (apply_migration: sokta_tjanster_revoke_trigger_fn).
revoke all on function public.sync_job_application_current_status() from public;
revoke all on function public.sync_job_application_current_status() from anon, authenticated;
