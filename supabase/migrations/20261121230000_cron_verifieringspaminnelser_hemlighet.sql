-- =============================================================================
-- pg_cron: send-verification-reminders-daily skickar cron-hemligheten
-- 2026-11-21
-- =============================================================================
--
-- Varför: edge-funktionen send-verification-reminders gick att anropa med
-- vilken giltig nyckel som helst, också den publika, och den har ingen egen
-- spärr mot dubbla utskick. Den som anropade den upprepade gånger under ett
-- påminnelsefönster kunde få samma mejl skickat om och om igen till våra
-- användare. Funktionen kräver nu rubriken x-cron-secret (samma värde som
-- funktionsmiljöns CRON_SECRET, som ligger i vault under
-- cron_secret_sync_global_jobs). Samma lösning som aggregate-daily-metrics
-- fick i 20261121170000.
--
-- Authorization står kvar med den publika nyckeln: gatewayen kräver en giltig
-- JWT. Tidsgränsen 300 s är oförändrad.
--
-- Ordning: kör den här FÖRE funktionen driftsätts. Den gamla funktionen
-- bryr sig inte om den extra rubriken.
--
-- Idempotent: alter_job skriver samma kommando igen.
-- =============================================================================

select cron.alter_job(
  (select jobid from cron.job where jobname = 'send-verification-reminders-daily'),
  command := $c$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-verification-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key'),
        'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret_sync_global_jobs')
      ),
      body := jsonb_build_object('time', now()),
      timeout_milliseconds := 300000
    ) as request_id;
$c$
);

-- Kontroll (bara läsning):
--   select jobname, active, position('x-cron-secret' in command) > 0 as har_rubriken
--     from cron.job where jobname = 'send-verification-reminders-daily';

-- =============================================================================
-- Backa
-- =============================================================================
-- Driftsätt först funktionen utan kontrollen av x-cron-secret, annars svarar
-- den 401 på morgonkörningen. Sedan:
--
-- select cron.alter_job(
--   (select jobid from cron.job where jobname = 'send-verification-reminders-daily'),
--   command := $c$
--   select
--     net.http_post(
--       url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-verification-reminders',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
--       ),
--       body := jsonb_build_object('time', now()),
--       timeout_milliseconds := 300000
--     ) as request_id;
-- $c$
-- );
