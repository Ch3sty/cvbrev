-- =============================================================================
-- pg_cron: aggregate-daily-metrics skickar cron-hemligheten
-- 2026-11-21
-- =============================================================================
--
-- Varför: edge-funktionen aggregate-metrics gick att anropa med vilken giltig
-- nyckel som helst, också den publika, eftersom jobbet anropade den med just
-- den publika nyckeln och funktionen inte prövade anroparen. Funktionen kräver
-- nu rubriken x-cron-secret (samma värde som funktionsmiljöns CRON_SECRET,
-- som redan ligger i vault under cron_secret_sync_global_jobs och används av
-- sync-global-jobs-refresh).
--
-- Authorization står kvar med den publika nyckeln: funktionen driftsätts med
-- JWT-kontroll i gatewayen, och den kräver en giltig JWT där.
--
-- Ordning: kör den här FÖRE funktionen driftsätts. Den gamla funktionen
-- bryr sig inte om den extra rubriken.
--
-- Idempotent: alter_job skriver samma kommando igen.
-- =============================================================================

select cron.alter_job(
  (select jobid from cron.job where jobname = 'aggregate-daily-metrics'),
  command := $c$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/aggregate-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret_sync_global_jobs')
    ),
    body := '{}'::jsonb
  ) as request_id;
$c$
);

-- Kontroll (bara läsning):
--   select jobname, active, position('x-cron-secret' in command) > 0 as har_rubriken
--     from cron.job where jobname = 'aggregate-daily-metrics';

-- =============================================================================
-- Backa
-- =============================================================================
-- Driftsätt först funktionen utan kontrollen av x-cron-secret, annars svarar
-- den 401 på nattkörningen. Sedan:
--
-- select cron.alter_job(
--   (select jobid from cron.job where jobname = 'aggregate-daily-metrics'),
--   command := $c$
--   select net.http_post(
--     url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/aggregate-metrics',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
--     ),
--     body := '{}'::jsonb
--   ) as request_id;
-- $c$
-- );
