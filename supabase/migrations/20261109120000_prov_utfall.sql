-- Provets utfall, anonymt (ägarens beslut 2026-11-09, plan-efter-analys punkt 30).
--
-- Percentilraden på provets resultat ("Bland de N procent som löser flest")
-- visas först vid 200 avslutade prov. anon_test_sessions räcker inte som
-- underlag: cronen rensar ohämtade prov efter sju dagar, så antalet växer
-- aldrig. Här sparas bara utfallet, för alltid:
--
--   skapad   provets dag (svensk tid), inte klockslag
--   testtyp  'matris-prova' i dag
--   ratt     antal rätt
--   totalt   antal frågor
--   version  frågebankens version (v1, v2, v3)
--
-- Inget user_id, ingen IP, ingen token. Raden går inte att föra tillbaka till
-- en person eller ett prov. Id är en slumpad uuid, så inte ens ordningen
-- avslöjar något.
--
-- Bara servern kommer åt tabellen: RLS på utan policyer, och anon och
-- authenticated har inga rättigheter alls.
--
-- spara_prov_utfall(token) skriver en rad för ett rättat prov, en gång:
--   * provet måste ha score,
--   * meta.utfall_sparat på provets rad hindrar en andra rad (omrättning,
--     dubbla anrop, backfill som körs igen),
--   * ägaren och testkontona undantas som i percentilen: prov hämtade till
--     ett konto i admin_undantagna_konton(), och prov från en IP-hash som har
--     ett prov hämtat till ett sådant konto.
-- Samma funktion används av rättningen (api/public/test-session) och av
-- backfillen (20261109120100_prov_utfall_backfill.sql), så regeln finns på
-- ett ställe.
--
-- Additiv: ny tabell och ny funktion. Inget befintligt ändras.

create table if not exists public.prov_utfall (
  id uuid primary key default gen_random_uuid(),
  skapad date not null default ((now() at time zone 'Europe/Stockholm')::date),
  testtyp text not null,
  ratt smallint not null,
  totalt smallint not null,
  version text,
  constraint prov_utfall_ratt_giltig check (ratt >= 0 and totalt > 0 and ratt <= totalt)
);

create index if not exists prov_utfall_testtyp_idx on public.prov_utfall (testtyp);

alter table public.prov_utfall enable row level security;
revoke all on public.prov_utfall from public, anon, authenticated;
grant select, insert on public.prov_utfall to service_role;

comment on table public.prov_utfall is
  'Provets utfall utan personuppgifter (ägarens beslut 2026-11-09). Underlag för percentilraden. Bara service_role.';

create or replace function public.spara_prov_utfall(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select token, questions, score, ip_hash, claimed_by, created_at, meta
    into r
    from public.anon_test_sessions
    where token = p_token
    for update;

  if not found or r.score is null then
    return false;
  end if;

  if coalesce(r.meta ->> 'utfall_sparat', '') = 'true' then
    return false;
  end if;

  if exists (
    select 1 from public.admin_undantagna_konton() u
    where u.user_id = r.claimed_by
  ) or exists (
    select 1
    from public.anon_test_sessions s
    join public.admin_undantagna_konton() u on u.user_id = s.claimed_by
    where s.ip_hash = r.ip_hash
  ) then
    return false;
  end if;

  insert into public.prov_utfall (skapad, testtyp, ratt, totalt, version)
  values (
    (r.created_at at time zone 'Europe/Stockholm')::date,
    'matris-prova',
    r.score,
    case
      when jsonb_typeof(r.questions) = 'array' and jsonb_array_length(r.questions) > 0
        then jsonb_array_length(r.questions)
      else 5
    end,
    'v' || case coalesce(r.meta ->> 'bank_version', '') when '3' then '3' when '2' then '2' else '1' end
  );

  update public.anon_test_sessions
    set meta = coalesce(meta, '{}'::jsonb) || '{"utfall_sparat": true}'::jsonb
    where token = p_token;

  return true;
end;
$$;

revoke execute on function public.spara_prov_utfall(uuid) from public, anon, authenticated;
grant execute on function public.spara_prov_utfall(uuid) to service_role;
