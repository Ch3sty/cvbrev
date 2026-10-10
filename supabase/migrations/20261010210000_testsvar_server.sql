-- Testsvar sparas av servern, steg 1 av skrivspärren för testsessionerna
-- (fix/samlad-2026-10-10).
--
-- KÖRS FÖRE DEPLOYEN av fix/samlad-2026-10-10. Den är additiv: den lägger
-- bara till en funktion och rör inte spara_testsvar eller några rättigheter,
-- så koden som ligger i produktion i dag påverkas inte.
--
-- Bakgrund: RLS lät en inloggad användare uppdatera sina egna rader i
-- logic_test_v4_sessions och personality_test_sessions direkt med
-- anon-nyckeln, inklusive score, answers, completed_at, meta och time_spent.
-- Poäng och percentil kunde förfalskas och syns i Bli upptäckt och
-- rekryterarvyn. På branchen skriver alla test-rutter med admin-klienten, och
-- steg 2 (20261010211000_testsessioner_skrivsparr.sql) tar bort klientens
-- skrivrätt.
--
-- spara_testsvar_server gör samma sak som spara_testsvar
-- (20261010180000_spara_testsvar.sql): läs, byt och skriv svaret i en enda
-- UPDATE, och ta bort ett tidigare svar med samma nycklar. Skillnaden är att
-- användarens id kommer som argument, eftersom anroparen är service_role och
-- auth.uid() då är null. Bara service_role får köra den. Hela svarsobjektet
-- sparas som det är, så fält som visat följer med.

create or replace function public.spara_testsvar_server(
  p_tabell text,
  p_session uuid,
  p_user uuid,
  p_nycklar text[],
  p_svar jsonb,
  p_krav_oavslutad boolean default true
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  antal integer;
begin
  if p_tabell not in ('logic_test_v4_sessions', 'personality_test_sessions') then
    raise exception 'okand tabell: %', p_tabell;
  end if;
  if p_user is null then
    raise exception 'anvandare saknas';
  end if;
  if p_nycklar is null or cardinality(p_nycklar) = 0 then
    raise exception 'nycklar saknas';
  end if;
  if jsonb_typeof(p_svar) is distinct from 'object' then
    raise exception 'svaret maste vara ett objekt';
  end if;

  execute format(
    $f$
    update public.%I s
       set answers = coalesce(
             (
               select jsonb_agg(t.e order by t.o)
                 from jsonb_array_elements(
                        case when jsonb_typeof(s.answers) = 'array' then s.answers else '[]'::jsonb end
                      ) with ordinality as t(e, o)
                where not (
                  select bool_and((t.e ->> k) is not distinct from ($4 ->> k))
                    from unnest($3) as k
                )
             ),
             '[]'::jsonb
           ) || jsonb_build_array($4)
     where s.id = $1
       and s.user_id = $2
       and ($5 = false or s.completed_at is null)
    returning jsonb_array_length(s.answers)
    $f$,
    p_tabell
  )
  into antal
  using p_session, p_user, p_nycklar, p_svar, p_krav_oavslutad;

  return antal;
end;
$$;

revoke all on function public.spara_testsvar_server(text, uuid, uuid, text[], jsonb, boolean) from public, anon, authenticated;
grant execute on function public.spara_testsvar_server(text, uuid, uuid, text[], jsonb, boolean) to service_role;

comment on function public.spara_testsvar_server(text, uuid, uuid, text[], jsonb, boolean) is
  'Sparar ett testsvar atomärt åt p_user. Bara service_role. Ersätter spara_testsvar när skrivspärren (20261010211000) är körd.';
