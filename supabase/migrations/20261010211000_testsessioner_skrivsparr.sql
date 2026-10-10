-- Skrivspärr på testsessionerna, steg 2 (fix/samlad-2026-10-10).
--
-- KÖRS FÖRST NÄR fix/samlad-2026-10-10 ÄR DEPLOYAD, och efter
-- 20261010210000_testsvar_server.sql. Där skapar, besvarar och avslutar
-- test-rutterna sessionerna med admin-klienten. Körs den före deployen kan
-- ingen starta, svara på eller avsluta ett test.
--
-- Före spärren kunde en inloggad användare med anon-nyckeln och sin egen JWT
-- köra till exempel
--   PATCH /rest/v1/logic_test_v4_sessions?id=eq.<egen session>
--   {"score": 15, "completed_at": "...", "meta": {"alternativ_blandade": true}}
-- eller skapa en redan avslutad session med valfri poäng via INSERT. Poängen
-- och percentilen syns i Bli upptäckt och rekryterarvyn. Samma gällde
-- personality_test_sessions (scores, facet_scores) och
-- user_personality_profile, som Big Five-profilen i rekryterarvyn läses ur.
--
-- Efter spärren:
--   * anon och authenticated får bara läsa egna rader (SELECT-policyerna och
--     admins läspolicy står kvar). INSERT- och UPDATE-policyerna tas bort och
--     skrivrättigheterna dras in, så både RLS och tabellrättigheterna säger nej.
--   * user_personality_profile skrivs bara av triggern
--     upsert_personality_profile, som nu körs som service_role när
--     complete-rutten avslutar sessionen.
--   * anon_test_sessions har redan RLS utan policyer (bara servern kommer åt
--     den). Skrivrättigheterna dras in även där, så att en framtida policy
--     inte råkar öppna dem.
--   * spara_testsvar (security invoker, körd med användarens session) tas
--     bort. Servern använder spara_testsvar_server.
--   * En BEFORE INSERT OR UPDATE-trigger, samma mönster som
--     profiles_skydda_kolumner, avvisar skrivningar från anon/authenticated
--     om någon senare lägger tillbaka en policy eller rättighet. is_admin()
--     undantas, som i profiles.
--
-- Servern (service_role) och postgres påverkas inte.
--
-- Rollback: kör om policyerna och grant-raderna längst ned i kommentaren.

-- 1. Policyer -----------------------------------------------------------------

drop policy if exists "Users can insert own sessions" on public.logic_test_v4_sessions;
drop policy if exists "Users can update own sessions" on public.logic_test_v4_sessions;
drop policy if exists "Users can insert own personality sessions" on public.personality_test_sessions;
drop policy if exists "Users can update own personality sessions" on public.personality_test_sessions;
drop policy if exists "Users can insert own personality profile" on public.user_personality_profile;
drop policy if exists "Users can update own personality profile" on public.user_personality_profile;

-- 2. Rättigheter --------------------------------------------------------------

revoke insert, update, delete, truncate on public.logic_test_v4_sessions from anon, authenticated;
revoke insert, update, delete, truncate on public.personality_test_sessions from anon, authenticated;
revoke insert, update, delete, truncate on public.user_personality_profile from anon, authenticated;
revoke insert, update, delete, truncate on public.anon_test_sessions from anon, authenticated;

-- 3. Gamla svarsfunktionen ----------------------------------------------------

drop function if exists public.spara_testsvar(text, uuid, text[], jsonb, boolean);

-- 4. Trigger som sista spärr --------------------------------------------------

create or replace function public.testsession_skydda_skrivning()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return coalesce(new, old);
  end if;

  if public.is_admin() then
    return coalesce(new, old);
  end if;

  raise exception 'Testsessioner i % skrivs bara av servern', tg_table_name
    using errcode = '42501',
          hint = 'Svar, poäng och avslut sparas av test-rutterna med service role.';
end;
$$;

comment on function public.testsession_skydda_skrivning() is
  'Avvisar INSERT/UPDATE/DELETE från anon/authenticated (utom admin) på testsessionstabellerna. Se 20261010211000_testsessioner_skrivsparr.';

drop trigger if exists testsession_skydda_skrivning on public.logic_test_v4_sessions;
create trigger testsession_skydda_skrivning
  before insert or update or delete on public.logic_test_v4_sessions
  for each row execute function public.testsession_skydda_skrivning();

drop trigger if exists testsession_skydda_skrivning on public.personality_test_sessions;
create trigger testsession_skydda_skrivning
  before insert or update or delete on public.personality_test_sessions
  for each row execute function public.testsession_skydda_skrivning();

drop trigger if exists testsession_skydda_skrivning on public.user_personality_profile;
create trigger testsession_skydda_skrivning
  before insert or update or delete on public.user_personality_profile
  for each row execute function public.testsession_skydda_skrivning();

drop trigger if exists testsession_skydda_skrivning on public.anon_test_sessions;
create trigger testsession_skydda_skrivning
  before insert or update or delete on public.anon_test_sessions
  for each row execute function public.testsession_skydda_skrivning();

-- Rollback (körs bara om spärren måste lyftas):
--   drop trigger testsession_skydda_skrivning on public.logic_test_v4_sessions;
--   drop trigger testsession_skydda_skrivning on public.personality_test_sessions;
--   drop trigger testsession_skydda_skrivning on public.user_personality_profile;
--   drop trigger testsession_skydda_skrivning on public.anon_test_sessions;
--   grant insert, update on public.logic_test_v4_sessions to authenticated;
--   grant insert, update on public.personality_test_sessions to authenticated;
--   grant insert, update on public.user_personality_profile to authenticated;
--   create policy "Users can insert own sessions" on public.logic_test_v4_sessions
--     for insert with check (auth.uid() = user_id);
--   create policy "Users can update own sessions" on public.logic_test_v4_sessions
--     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   create policy "Users can insert own personality sessions" on public.personality_test_sessions
--     for insert with check (auth.uid() = user_id);
--   create policy "Users can update own personality sessions" on public.personality_test_sessions
--     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   create policy "Users can insert own personality profile" on public.user_personality_profile
--     for insert with check (auth.uid() = user_id);
--   create policy "Users can update own personality profile" on public.user_personality_profile
--     for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   (spara_testsvar återskapas med 20261010180000_spara_testsvar.sql.)
