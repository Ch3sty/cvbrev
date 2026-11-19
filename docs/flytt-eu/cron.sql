begin;
-- Job 1 har misslyckats varje natt i GAMLA (http_post med fyra argument finns inte).
-- Här skrivet om till net.http_post med vault-värden. Avstängt tills ägaren beslutar.
select cron.schedule('aggregate-daily-metrics', '0 2 * * *', $c$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/aggregate-metrics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
$c$);
select cron.schedule('send-verification-reminders-daily', '0 9 * * *', $c$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-verification-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
      ),
      body := jsonb_build_object('time', now()),
      timeout_milliseconds := 300000
    ) as request_id;
$c$);
select cron.schedule('sync-global-jobs-refresh', '0 5,13,21 * * *', $c$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/sync-global-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret_sync_global_jobs')
    ),
    body := jsonb_build_object('type', 'all')
  );
$c$);
select cron.alter_job(jobid, active := false) from cron.job;
commit;
select jobid, jobname, schedule, active from cron.job;
select count(*) as net_queue from net.http_request_queue;
select count(*) as runs from cron.job_run_details;
