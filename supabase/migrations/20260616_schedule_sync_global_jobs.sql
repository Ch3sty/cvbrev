-- Schemalägg refresh av global_job_cache 3 ggr/dag via pg_net → edge function.
-- Förutsätter att secret 'cron_secret_sync_global_jobs' finns i vault och att
-- samma värde är satt som edge-funktionens CRON_SECRET-env (görs manuellt vid
-- driftsättning, inte i migration — secret ska inte checkas in).
--
-- Secret skapas en gång (om den saknas) och läses ur vault i cron-anropet så
-- inget hemligt hårdkodas här.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Skapa secret om den saknas (värdet sätts även som edge-env separat, se ovan).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'cron_secret_sync_global_jobs') THEN
    PERFORM vault.create_secret(
      encode(gen_random_bytes(32), 'hex'),
      'cron_secret_sync_global_jobs',
      'Secret för att trigga sync-global-jobs edge function via cron'
    );
  END IF;
END $$;

-- Avschemalägg ev. tidigare jobb med samma namn (idempotent).
SELECT cron.unschedule('sync-global-jobs-refresh')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sync-global-jobs-refresh');

SELECT cron.schedule(
  'sync-global-jobs-refresh',
  '0 5,13,21 * * *',  -- 05:00, 13:00, 21:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://dbvbnbkvadvlhjhomibg.supabase.co/functions/v1/sync-global-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret_sync_global_jobs')
    ),
    body := jsonb_build_object('type', 'all')
  );
  $$
);
