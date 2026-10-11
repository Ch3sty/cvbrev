-- Kalibreringen av frågornas svårighet (beställningen "svarare frågor",
-- docs/design/tester-v2-2026-10-11/bestallning-svarare-fragor.md avsnitt 3,
-- kontraktet i docs/design/tester-v2-2026-10-11/kontrakt-kalibrering.md).
--
-- KÖRS EFTER 20261011101000_testmotorn.sql (fraga_statistik och
-- uppdatera_fraga_statistik) och 20260922220000_admin_undantagna_konton.sql.
-- Additiv: en ny kolumn, en ny vy, och uppdatera_fraga_statistik får räkna
-- svarstypen. Inga rader ändras, inga rättigheter vidgas.
--
--   fraga_statistik.per_typ    antal svar per typ (matning, pass, riktat,
--                              ommatning, general, kalibrering, klassisk, okand)
--   uppdatera_fraga_statistik  samma kropp som förut plus per_typ; typ ur
--                              svarsraden, 'okand' när den saknas
--   fraga_kalibrering_vy       råsvaren ur logic_test_v4_sessions per fråga:
--                              svar, olika konton, rätt, p, p utan
--                              övningsprov (p_lugn), median av svarstiden,
--                              antal per typ och antal "Vet inte". Bara
--                              service_role läser den.
--
-- fraga_statistik förblir motorns källa för p (pForFraga, 30 svar). Vyn är
-- kalibreringens sanning och underlaget för scripts/kalibrering-rapport.mjs.
-- För en fråga utan kalibreringssvar gäller svar + vet_inte = antal och
-- ratt = ratt mellan vyn och fraga_statistik (vyn räknar inte "Vet inte" som
-- svar, fraga_statistik gör det under nyckeln vet_inte).
--
-- KÖRS INTE I PROD UTAN ÄGARENS JA. Kör på Supabase-branch först.

-- 1. Kolumnen ------------------------------------------------------------------

alter table public.fraga_statistik
  add column if not exists per_typ jsonb not null default '{}'::jsonb;

comment on column public.fraga_statistik.per_typ is
  'Antal svar per typ: matning, pass, riktat, ommatning, general, kalibrering, klassisk, okand (saknad typ).';

-- 2. Frågestatistiken räknar typen ---------------------------------------------

create or replace function public.uppdatera_fraga_statistik(p_svar jsonb, p_user uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  e jsonb;
  nyckel text;
  typ text;
  antal integer := 0;
begin
  if p_svar is null or jsonb_typeof(p_svar) <> 'array' then
    return 0;
  end if;
  if p_user is null then
    raise exception 'anvandare saknas';
  end if;
  if exists (select 1 from public.admin_undantagna_konton() u where u.user_id = p_user) then
    return 0;
  end if;

  for e in select * from jsonb_array_elements(p_svar) loop
    if coalesce(e ->> 'fraga_id', '') = '' then
      continue;
    end if;
    nyckel := case
      when (e ->> 'selected') is null or (e ->> 'selected')::int < 0 then 'vet_inte'
      else (e ->> 'selected')
    end;
    typ := coalesce(nullif(e ->> 'typ', ''), 'okand');
    insert into public.fraga_statistik as f (fraga_id, test_kind, antal, ratt, tid_summa, valfordelning, per_typ, uppdaterad_at)
    values (
      e ->> 'fraga_id',
      coalesce(e ->> 'test_kind', 'matris'),
      1,
      case when (e ->> 'correct')::boolean then 1 else 0 end,
      greatest(0, coalesce((e ->> 'tid_s')::int, 0)),
      jsonb_build_object(nyckel, 1),
      jsonb_build_object(typ, 1),
      now()
    )
    on conflict (fraga_id) do update set
      antal = f.antal + 1,
      ratt = f.ratt + excluded.ratt,
      tid_summa = f.tid_summa + excluded.tid_summa,
      valfordelning = f.valfordelning
        || jsonb_build_object(nyckel, coalesce((f.valfordelning ->> nyckel)::int, 0) + 1),
      per_typ = f.per_typ
        || jsonb_build_object(typ, coalesce((f.per_typ ->> typ)::int, 0) + 1),
      uppdaterad_at = now();
    antal := antal + 1;
  end loop;

  return antal;
end;
$$;

revoke all on function public.uppdatera_fraga_statistik(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.uppdatera_fraga_statistik(jsonb, uuid) to service_role;

-- 3. Vyn -----------------------------------------------------------------------
--
-- Bara blandade, avslutade sessioner; undantagna konton borta; upprepade
-- frågor borta; "Vet inte" (selected < 0 eller saknas) räknas för sig och
-- ingår inte i svar, p eller tid. typ per rad: kalibrering när raden har
-- kalibrering: true, annars meta.typ, annars klassisk (nivåtesten).
-- Dubbletter per fråga och session finns inte (unikaSvar och
-- spara_testsvar_server ger ett svar per nyckel).

create or replace view public.fraga_kalibrering_vy
with (security_invoker = true)
as
with s as (
  select id, user_id, meta, answers
    from public.logic_test_v4_sessions
   where completed_at is not null
     and coalesce((meta ->> 'alternativ_blandade')::boolean, false)
     and not exists (select 1 from public.admin_undantagna_konton() u where u.user_id = logic_test_v4_sessions.user_id)
),
rader as (
  select s.id as session_id,
         s.user_id,
         a ->> 'q_id' as fraga_id,
         case
           when coalesce((a ->> 'kalibrering')::boolean, false) then 'kalibrering'
           when nullif(s.meta ->> 'typ', '') is not null then s.meta ->> 'typ'
           else 'klassisk'
         end as typ,
         coalesce((a ->> 'correct')::boolean, false) as correct,
         greatest(0, coalesce((a ->> 'time_spent')::int, 0)) as tid_s,
         ((a ->> 'selected') is null or (a ->> 'selected')::int < 0) as vet_inte
    from s
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(s.answers) = 'array' then s.answers else '[]'::jsonb end
    ) a
   where coalesce(a ->> 'q_id', '') <> ''
     and not (coalesce(s.meta -> 'upprepade', '[]'::jsonb) ? (a ->> 'q_id'))
),
svar as (
  select * from rader where not vet_inte
),
per_typ as (
  select fraga_id, jsonb_object_agg(typ, n) as per_typ
    from (select fraga_id, typ, count(*)::int as n from svar group by fraga_id, typ) t
   group by fraga_id
),
vet as (
  select fraga_id, count(*)::int as vet_inte from rader where vet_inte group by fraga_id
),
agg as (
  select fraga_id,
         count(*)::int as svar,
         count(distinct user_id)::int as konton,
         sum(case when correct then 1 else 0 end)::int as ratt,
         round(avg(case when correct then 1 else 0 end)::numeric, 3) as p,
         round(
           (sum(case when typ <> 'general' and correct then 1 else 0 end)::numeric
             / nullif(sum(case when typ <> 'general' then 1 else 0 end), 0)),
           3
         ) as p_lugn,
         percentile_cont(0.5) within group (order by tid_s) as tid_median_s
    from svar
   group by fraga_id
)
select coalesce(agg.fraga_id, vet.fraga_id) as fraga_id,
       coalesce(agg.svar, 0) as svar,
       coalesce(agg.konton, 0) as konton,
       coalesce(agg.ratt, 0) as ratt,
       agg.p,
       agg.p_lugn,
       agg.tid_median_s,
       coalesce(per_typ.per_typ, '{}'::jsonb) as per_typ,
       coalesce(vet.vet_inte, 0) as vet_inte
  from agg
  full join vet on vet.fraga_id = agg.fraga_id
  left join per_typ on per_typ.fraga_id = coalesce(agg.fraga_id, vet.fraga_id);

comment on view public.fraga_kalibrering_vy is
  'Kalibreringens sanning per fråga ur råsvaren: bara blandade avslutade sessioner, utan undantagna konton, upprepade och Vet inte. p_lugn räknar bort övningsprov (general). Bara service_role.';

revoke all on public.fraga_kalibrering_vy from public, anon, authenticated;
grant select on public.fraga_kalibrering_vy to service_role;

-- Rollback:
--   drop view public.fraga_kalibrering_vy;
--   kör om avsnitt 3 i 20261011101000_testmotorn.sql (uppdatera_fraga_statistik utan per_typ);
--   alter table public.fraga_statistik drop column per_typ;
