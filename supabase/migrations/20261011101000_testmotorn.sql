-- Testmotorn, våg 3a av Rummen (docs/design/spec-rummen-2026-10-10.md,
-- avsnitt 6 våg 3a och 12.5).
--
-- KÖRS EFTER 20261011100000_test_planer.sql (traning_skydda_skrivning) och
-- efter skrivspärren 20261010211000 (testsessionerna skrivs av servern).
-- Additiv: tre nya tabeller och tre funktioner, ingenting i befintliga
-- tabeller ändras. Koden i src/lib/traning och /api/traning kräver den.
--
-- Tabeller:
--   test_nivapunkter  en nivåpunkt per konto, testtyp, dag och typ
--                     (mätning, pass, ommätning, generalrepetition).
--                     Kurvan ritas ur den.
--   test_milstolpar   ett märke per konto och nyckel, visad_at när kvittot
--                     visats.
--   fraga_statistik   uppmätt svårighet per fråga: antal, rätt, tidssumma
--                     och fördelningen av valen per ORIGINALINDEX. p = rätt /
--                     antal när antal >= 30, annars prior ur bankens
--                     svarighet_prior (src/lib/traning/svarighet.ts).
--
-- Säkerhet, samma mönster som skrivspärren: RLS på, ägaren läser sina egna
-- nivåpunkter och milstolpar, fraga_statistik läses bara av servern. Inga
-- skrivpolicyer, inga skrivrättigheter för anon/authenticated, och triggern
-- traning_skydda_skrivning som sista spärr. Alla skrivningar går genom
-- funktionerna nedan, som bara service_role får köra.
--
-- Testansvarigs krav (12.5) sitter i databasen, inte bara i koden:
--   * frågestatistik skrivs bara när sessionen har meta.alternativ_blandade;
--   * nivåpunkter skrivs aldrig för oblandade sessioner;
--   * ägarens och testkontonas svar räknas aldrig in i frågestatistiken
--     (admin_undantagna_konton()).
--
-- Kör på Supabase-branch först; prod bara efter ägarens ja.

-- 1. Tabeller -----------------------------------------------------------------

create table if not exists public.test_nivapunkter (
  user_id uuid not null references auth.users(id) on delete cascade,
  test_kind text not null,
  dag date not null,
  typ text not null,
  niva numeric(3,1) not null,
  session_id uuid null,
  skapad_at timestamptz not null default now(),
  primary key (user_id, test_kind, dag, typ),
  constraint test_nivapunkter_typ_check
    check (typ in ('matning', 'pass', 'ommatning', 'general')),
  constraint test_nivapunkter_niva_check
    check (niva >= 1 and niva <= 10)
);

comment on table public.test_nivapunkter is
  'Nivåpunkter för kurvan. En per konto, testtyp, dag och typ; senaste passet samma dag skriver över. Skrivs bara av slutfor_traningssession.';

create table if not exists public.test_milstolpar (
  user_id uuid not null references auth.users(id) on delete cascade,
  nyckel text not null,
  nadd_at timestamptz not null default now(),
  visad_at timestamptz null,
  primary key (user_id, nyckel),
  constraint test_milstolpar_nyckel_check
    check (nyckel in ('forsta_matningen', 'forsta_veckan', 'nivan_upp', 'generalrepetitionen', 'provdagen'))
);

comment on table public.test_milstolpar is
  'Testträningens fem märken (spec-rummen bilaga, Milstolparna). Visas aldrig i Jobbsöket, Bli upptäckt eller mot rekryterare.';

create table if not exists public.fraga_statistik (
  fraga_id text primary key,
  test_kind text not null,
  antal integer not null default 0,
  ratt integer not null default 0,
  tid_summa integer not null default 0,
  valfordelning jsonb not null default '{}'::jsonb,
  uppdaterad_at timestamptz not null default now()
);

comment on table public.fraga_statistik is
  'Uppmätt svårighet per fråga, bara ur blandade sessioner och utan undantagna konton. valfordelning: antal val per originalindex ("vet_inte" för Vet inte).';

create index if not exists test_nivapunkter_anvandare_idx
  on public.test_nivapunkter (user_id, test_kind, dag);

-- 2. RLS och rättigheter ------------------------------------------------------

alter table public.test_nivapunkter enable row level security;
alter table public.test_milstolpar enable row level security;
alter table public.fraga_statistik enable row level security;

drop policy if exists test_nivapunkter_las_egna on public.test_nivapunkter;
create policy test_nivapunkter_las_egna on public.test_nivapunkter
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists test_milstolpar_las_egna on public.test_milstolpar;
create policy test_milstolpar_las_egna on public.test_milstolpar
  for select to authenticated using (auth.uid() = user_id);

-- fraga_statistik: inga policyer alls, bara servern.

revoke all on public.test_nivapunkter, public.test_milstolpar, public.fraga_statistik from anon;
revoke insert, update, delete, truncate on public.test_nivapunkter, public.test_milstolpar, public.fraga_statistik from authenticated;
revoke select on public.fraga_statistik from authenticated;
grant select on public.test_nivapunkter, public.test_milstolpar to authenticated;
grant all on public.test_nivapunkter, public.test_milstolpar, public.fraga_statistik to service_role;

drop trigger if exists traning_skydda_skrivning on public.test_nivapunkter;
create trigger traning_skydda_skrivning
  before insert or update or delete on public.test_nivapunkter
  for each row execute function public.traning_skydda_skrivning();

drop trigger if exists traning_skydda_skrivning on public.test_milstolpar;
create trigger traning_skydda_skrivning
  before insert or update or delete on public.test_milstolpar
  for each row execute function public.traning_skydda_skrivning();

drop trigger if exists traning_skydda_skrivning on public.fraga_statistik;
create trigger traning_skydda_skrivning
  before insert or update or delete on public.fraga_statistik
  for each row execute function public.traning_skydda_skrivning();

-- 3. Frågestatistiken ---------------------------------------------------------
--
-- p_svar: [{ "fraga_id": "v7g-q1-...", "test_kind": "matris", "correct": true,
--            "tid_s": 31, "selected": 2 }, ...]  selected är ORIGINALINDEX,
--          -1 för "Vet inte".
-- Returnerar antalet rader som räknades in (0 för undantagna konton).

create or replace function public.uppdatera_fraga_statistik(p_svar jsonb, p_user uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  e jsonb;
  nyckel text;
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
    insert into public.fraga_statistik as f (fraga_id, test_kind, antal, ratt, tid_summa, valfordelning, uppdaterad_at)
    values (
      e ->> 'fraga_id',
      coalesce(e ->> 'test_kind', 'matris'),
      1,
      case when (e ->> 'correct')::boolean then 1 else 0 end,
      greatest(0, coalesce((e ->> 'tid_s')::int, 0)),
      jsonb_build_object(nyckel, 1),
      now()
    )
    on conflict (fraga_id) do update set
      antal = f.antal + 1,
      ratt = f.ratt + excluded.ratt,
      tid_summa = f.tid_summa + excluded.tid_summa,
      valfordelning = f.valfordelning
        || jsonb_build_object(nyckel, coalesce((f.valfordelning ->> nyckel)::int, 0) + 1),
      uppdaterad_at = now();
    antal := antal + 1;
  end loop;

  return antal;
end;
$$;

revoke all on function public.uppdatera_fraga_statistik(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.uppdatera_fraga_statistik(jsonb, uuid) to service_role;

-- 4. Milstolpar ---------------------------------------------------------------
--
-- Registrerar märken som nåtts. Returnerar bara de som var nya.

create or replace function public.registrera_milstolpar(p_user uuid, p_nycklar text[])
returns text[]
language plpgsql
security invoker
set search_path = public
as $$
declare
  nya text[];
begin
  if p_user is null then
    raise exception 'anvandare saknas';
  end if;
  if p_nycklar is null or cardinality(p_nycklar) = 0 then
    return '{}'::text[];
  end if;
  with ins as (
    insert into public.test_milstolpar (user_id, nyckel)
    select p_user, k from unnest(p_nycklar) as k
    on conflict (user_id, nyckel) do nothing
    returning nyckel
  )
  select coalesce(array_agg(nyckel), '{}'::text[]) into nya from ins;
  return nya;
end;
$$;

revoke all on function public.registrera_milstolpar(uuid, text[]) from public, anon, authenticated;
grant execute on function public.registrera_milstolpar(uuid, text[]) to service_role;

-- 5. Avslutet, atomärt --------------------------------------------------------
--
-- Allt complete-rutten skriver, i en transaktion (acceptans 3a.3):
--   * sessionen: completed_at, score, time_spent, meta || p_meta. Bara om den
--     tillhör p_user och inte redan är avslutad.
--   * nivåpunkten (p_nivapunkt: {test_kind, dag, typ, niva}), om sessionen är
--     blandad;
--   * frågestatistiken (p_statistik, se ovan), om sessionen är blandad;
--   * milstolparna (p_milstolpar).
-- Returnerar {"slutford": false} när sessionen inte gick att avsluta (fel
-- konto, redan avslutad), annars {"slutford": true, "nya_milstolpar": [...],
-- "statistik": n, "nivapunkt": true|false}.

create or replace function public.slutfor_traningssession(
  p_session uuid,
  p_user uuid,
  p_score integer,
  p_time_spent integer,
  p_meta jsonb,
  p_nivapunkt jsonb,
  p_statistik jsonb,
  p_milstolpar text[]
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  ny_meta jsonb;
  blandad boolean;
  statistik integer := 0;
  punkt boolean := false;
  nya text[] := '{}'::text[];
begin
  if p_user is null or p_session is null then
    raise exception 'session eller anvandare saknas';
  end if;

  update public.logic_test_v4_sessions s
     set completed_at = now(),
         score = p_score,
         time_spent = p_time_spent,
         meta = coalesce(s.meta, '{}'::jsonb) || coalesce(p_meta, '{}'::jsonb)
   where s.id = p_session
     and s.user_id = p_user
     and s.completed_at is null
  returning s.meta into ny_meta;

  if not found then
    return jsonb_build_object('slutford', false);
  end if;

  blandad := coalesce((ny_meta ->> 'alternativ_blandade')::boolean, false);

  if blandad and p_nivapunkt is not null and jsonb_typeof(p_nivapunkt) = 'object' then
    insert into public.test_nivapunkter as n (user_id, test_kind, dag, typ, niva, session_id, skapad_at)
    values (
      p_user,
      coalesce(p_nivapunkt ->> 'test_kind', 'matris'),
      (p_nivapunkt ->> 'dag')::date,
      p_nivapunkt ->> 'typ',
      (p_nivapunkt ->> 'niva')::numeric(3,1),
      p_session,
      now()
    )
    on conflict (user_id, test_kind, dag, typ) do update set
      niva = excluded.niva,
      session_id = excluded.session_id,
      skapad_at = now();
    punkt := true;
  end if;

  if blandad then
    statistik := public.uppdatera_fraga_statistik(p_statistik, p_user);
  end if;

  nya := public.registrera_milstolpar(p_user, p_milstolpar);

  return jsonb_build_object(
    'slutford', true,
    'nya_milstolpar', to_jsonb(nya),
    'statistik', statistik,
    'nivapunkt', punkt
  );
end;
$$;

revoke all on function public.slutfor_traningssession(uuid, uuid, integer, integer, jsonb, jsonb, jsonb, text[]) from public, anon, authenticated;
grant execute on function public.slutfor_traningssession(uuid, uuid, integer, integer, jsonb, jsonb, jsonb, text[]) to service_role;

comment on function public.slutfor_traningssession(uuid, uuid, integer, integer, jsonb, jsonb, jsonb, text[]) is
  'Avslutar en träningssession (mätning, pass, riktat, generalrepetition) och skriver nivåpunkt, frågestatistik och milstolpar atomärt. Bara service_role.';

-- Rollback:
--   drop function public.slutfor_traningssession(uuid, uuid, integer, integer, jsonb, jsonb, jsonb, text[]);
--   drop function public.registrera_milstolpar(uuid, text[]);
--   drop function public.uppdatera_fraga_statistik(jsonb, uuid);
--   drop table public.fraga_statistik;
--   drop table public.test_milstolpar;
--   drop table public.test_nivapunkter;
