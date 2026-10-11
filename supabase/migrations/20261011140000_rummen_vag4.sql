-- Rummen, våg 4 (docs/design/spec-rummen-2026-10-10.md avsnitt 5, 6 och 16.2
-- fråga 3): landningen i det senast besökta rummet och "N nya" på Matchade
-- jobb.
--
--   profiles.senaste_rum            Rummet /dashboard öppnar vid en landning:
--                                   'tran', 'cv', 'brev' eller 'jobb'. Skrivs av
--                                   POST /api/rum/senaste när användaren byter
--                                   rum. Null tills första bytet; då avgör
--                                   provdatum och registreringens val.
--   profiles.matchningar_sedda_at   När Matchade jobb senast visades. Skrivs av
--                                   sidan /dashboard/jobbmatchning och efter en
--                                   sökning där.
--   public.matchningar_nya()        Antal träffar i job_matchings_cache som
--                                   skapats efter matchningar_sedda_at, för den
--                                   inloggade. Null innan sidan visats en gång.
--
-- Ingen av kolumnerna är skyddad (profiles_skydda_kolumner): att sätta dem
-- själv ändrar bara vilken vy man landar i och om ett chip visas.
--
-- Additiv. Koden klarar att kolumnerna och funktionen saknas (läsningar ger
-- null, skrivningar sväljer 42703/PGRST204). Kör på Supabase-branch först;
-- prod bara efter ägarens ja.
--
-- Rollback:
--   drop function if exists public.matchningar_nya();
--   alter table public.profiles drop column if exists matchningar_sedda_at;
--   alter table public.profiles drop column if exists senaste_rum;

alter table public.profiles
  add column if not exists senaste_rum text null,
  add column if not exists matchningar_sedda_at timestamptz null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_senaste_rum_check'
  ) then
    alter table public.profiles
      add constraint profiles_senaste_rum_check
      check (senaste_rum is null or senaste_rum in ('tran', 'cv', 'brev', 'jobb'));
  end if;
end
$$;

comment on column public.profiles.senaste_rum is
  'Rummen (spec-rummen våg 4): rummet /dashboard öppnar vid en landning. tran, cv, brev eller jobb.';
comment on column public.profiles.matchningar_sedda_at is
  'Rummen (spec-rummen 16.2 fråga 3): när Matchade jobb senast visades. Grunden för "N nya".';

-- Security invoker: RLS på profiles och job_matchings_cache gäller som för
-- den inloggade själv. auth.uid() avgör raden; ingen parameter att förfalska.
create or replace function public.matchningar_nya()
returns integer
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when p.matchningar_sedda_at is null then null
    else coalesce((
      select sum(jsonb_array_length(c.jobs::jsonb))::integer
      from public.job_matchings_cache c
      where c.user_id = p.id
        and c.created_at > p.matchningar_sedda_at
        and jsonb_typeof(c.jobs::jsonb) = 'array'
    ), 0)
  end
  from public.profiles p
  where p.id = auth.uid()
$$;

revoke all on function public.matchningar_nya() from public, anon;
grant execute on function public.matchningar_nya() to authenticated;

comment on function public.matchningar_nya() is
  'Rummen våg 4: nya träffar i job_matchings_cache sedan profiles.matchningar_sedda_at, för auth.uid(). Null innan sidan visats.';
