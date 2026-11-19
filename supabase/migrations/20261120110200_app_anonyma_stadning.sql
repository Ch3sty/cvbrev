-- Nivåkollen före kontot i appen (docs/plan-app.md, beslut 2026-11-13).
-- Appen gör Nivåkollen i en anonym Supabase-session (auth "Allow anonymous
-- sign-ins" måste vara på). Den som aldrig skapar konto lämnar en anonym
-- användare med profil, mätning och plan efter sig. De raderas efter 30
-- dagar.
--
-- Vad som händer med raderna som pekar på auth.users (kontrollerat i
-- produktion 2026-11-19): allt i public som hör till användaren går med
-- (ON DELETE CASCADE, 84 tabeller i kedjan, ingen NO ACTION eller RESTRICT
-- någonstans i den). Fjorton kolumner har ON DELETE SET NULL och är alla
-- nullbara: admin_actions (admin_id, target_user_id),
-- anon_interview_samples och anon_personality_samples (user_id, claimed_by),
-- api_metrics, audit_logs och email_log (user_id), guest_invitations
-- (guest_user_id), public_letter_drafts (claimed_by), system_alerts
-- (acknowledged_by, resolved_by) och auth.scim_users (user_id). De raderna
-- blir kvar utan användare, precis som när ett vanligt konto raderas.
--
-- Ändå raderas en användare i taget, var och en i sin egen undertransaktion.
-- Läggs det senare till en främmande nyckel utan kaskad, eller en trigger
-- som stoppar raderingen, stannar bara den användaren kvar (med en varning i
-- loggen), aldrig resten av natten. Högst 1000 per körning, så att en
-- eftersläpning betas av över flera nätter i stället för i en lång
-- transaktion.
--
-- En anonym användare som blivit ett konto har is_anonymous = false och rörs
-- aldrig. Körs en gång om natten. Kör filen först när anonym inloggning är på.

create extension if not exists pg_cron;

create or replace function public.app_stada_anonyma(max_antal integer default 1000)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  anv uuid;
  raderade integer := 0;
begin
  for anv in
    select u.id
    from auth.users u
    where u.is_anonymous is true
      and u.created_at < now() - interval '30 days'
    order by u.created_at
    limit max_antal
  loop
    begin
      delete from auth.users where id = anv and is_anonymous is true;
      raderade := raderade + 1;
    exception when others then
      raise warning '[app-anonyma-stadning] % kunde inte raderas: % (%)', anv, sqlerrm, sqlstate;
    end;
  end loop;
  return raderade;
end;
$$;

-- Bara cron (postgres) kör städningen, aldrig klienterna via RPC.
revoke all on function public.app_stada_anonyma(integer) from public;
revoke all on function public.app_stada_anonyma(integer) from anon, authenticated;

comment on function public.app_stada_anonyma(integer) is
  'Testklar: raderar anonyma användare äldre än 30 dagar, en i taget, högst max_antal per körning. Körs av pg_cron (app-anonyma-stadning).';

select cron.unschedule('app-anonyma-stadning')
where exists (select 1 from cron.job where jobname = 'app-anonyma-stadning');

select cron.schedule(
  'app-anonyma-stadning',
  '17 3 * * *',
  $$ select public.app_stada_anonyma(1000); $$
);
