-- Ett svar per fråga och session, oberoende av i vilken ordning klientens
-- anrop landar (fix/kontaktepost-numeriskt, 2026-10-10).
--
-- Svars-API:erna läste hela answers-listan, lade till eller bytte ett svar i
-- Node och skrev tillbaka listan. Två anrop som överlappade läste samma lista
-- och det senare skrev över det förras svar. Det numeriska testet tappade 4 av
-- 32 svar i QA-körningen före fixen.
--
-- Nu sker läs, byt och skriv i en enda UPDATE. Postgres låser raden, och ett
-- anrop som fick vänta räknar om uttrycket mot den nya versionen av raden
-- (READ COMMITTED), så inget svar går förlorat. Svaret som finns för samma
-- nyckel tas bort först, så samma fråga aldrig står två gånger. Nycklarna
-- jämförs som text: "0" och 0 är samma påstående.
--
-- security invoker: tabellernas RLS gäller som förut, och funktionen kräver
-- dessutom att raden tillhör den inloggade användaren.
--
-- Returnerar antalet sparade svar, eller null när ingen rad matchade (fel
-- session, annan användare eller redan avslutad när p_krav_oavslutad).

create or replace function public.spara_testsvar(
  p_tabell text,
  p_session uuid,
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
  if auth.uid() is null then
    raise exception 'inte inloggad';
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
                  select bool_and((t.e ->> k) is not distinct from ($3 ->> k))
                    from unnest($2) as k
                )
             ),
             '[]'::jsonb
           ) || jsonb_build_array($3)
     where s.id = $1
       and s.user_id = auth.uid()
       and ($4 = false or s.completed_at is null)
    returning jsonb_array_length(s.answers)
    $f$,
    p_tabell
  )
  into antal
  using p_session, p_nycklar, p_svar, p_krav_oavslutad;

  return antal;
end;
$$;

revoke all on function public.spara_testsvar(text, uuid, text[], jsonb, boolean) from public, anon;
grant execute on function public.spara_testsvar(text, uuid, text[], jsonb, boolean) to authenticated;

comment on function public.spara_testsvar(text, uuid, text[], jsonb, boolean) is
  'Sparar ett testsvar atomärt: tar bort tidigare svar med samma nycklar och lägger till det nya i samma UPDATE.';
