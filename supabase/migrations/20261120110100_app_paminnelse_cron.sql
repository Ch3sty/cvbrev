-- Påminnelsen om dagens test, var 15:e minut (docs/plan-app.md, avsnitt 2.7).
-- Max två Vercel-crons, därför pg_cron till edge-funktionen app-paminnelse.
--
-- Körs EFTER att edge-funktionen är driftsatt (med --no-verify-jwt) och
-- 20261120110000_app_enheter.sql är körd. Samma mönster som
-- 20260616_schedule_sync_global_jobs.sql: hemligheten skapas i vault och
-- samma värde sätts som edge-funktionens CRON_SECRET (för hand, aldrig i git):
--
--   select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret_app_paminnelse';
--   supabase secrets set CRON_SECRET_APP_PAMINNELSE=<värdet> --project-ref mnlrpfidyzuaxxlftruf

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'cron_secret_app_paminnelse') then
    perform vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'cron_secret_app_paminnelse',
      'Hemlighet för att anropa edge-funktionen app-paminnelse från pg_cron'
    );
  end if;
end $$;

select cron.unschedule('app-paminnelse')
where exists (select 1 from cron.job where jobname = 'app-paminnelse');

select cron.schedule(
  'app-paminnelse',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://mnlrpfidyzuaxxlftruf.supabase.co/functions/v1/app-paminnelse',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret_app_paminnelse')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
