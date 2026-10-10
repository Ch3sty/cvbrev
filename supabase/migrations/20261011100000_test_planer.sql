-- Testträningens plan per konto: testtyper, leverantör, provdatum, sikte och
-- utfallet efter provet (docs/design/spec-rummen-2026-10-10.md, våg 2 och 3a).
--
-- Skriven i våg 3a (design/rummen-3a) enligt specens våg 2-definition, så att
-- våg 2 kan ta filen som den är. Ändras definitionen i våg 2 ska den ändras
-- här, inte i en andra migrering med samma tabell.
--
-- Säkerhet, samma mönster som skrivspärren på testsessionerna
-- (20261010211000_testsessioner_skrivsparr.sql):
--   * RLS på. Ägaren läser sin egen rad. Inga INSERT/UPDATE/DELETE-policyer
--     och inga skrivrättigheter för anon eller authenticated.
--   * Skrivningar görs av /api/traning/plan, /api/traning/sikte och
--     /api/traning/efter-provet med service role, efter att rutten har
--     kontrollerat inloggningen.
--   * En BEFORE-trigger avvisar skrivningar från anon/authenticated om någon
--     senare lägger tillbaka en policy eller rättighet.
--
-- profiles.traning_sedd_at: när hemvyn senast ritades med en ny nivåpunkt
-- (rörelsen på kurvan, avsnitt 3.2). Inte en skyddad kolumn: att sätta den
-- själv ger bara att kurvan inte ritar sig, inget annat.
--
-- Additiv. Kör på Supabase-branch först; prod bara efter ägarens ja.

create table if not exists public.test_planer (
  user_id uuid primary key references auth.users(id) on delete cascade,
  testtyper text[] not null default '{}',
  leverantor text null,
  variant text null,
  provdatum date null,
  sikte numeric(3,1) null,
  utfall text null,
  utfall_svarat_at timestamptz null,
  utfall_fraga_igen_at date null,
  skapad_at timestamptz not null default now(),
  uppdaterad_at timestamptz not null default now(),
  constraint test_planer_testtyper_check
    check (testtyper <@ array['matris', 'numerisk', 'verbal', 'personlighet']::text[]),
  constraint test_planer_leverantor_check
    check (leverantor is null or leverantor in ('matrigma', 'alva', 'shl', 'aon', 'annat')),
  constraint test_planer_variant_check
    check (variant is null or variant in ('klassisk', 'adaptiv')),
  constraint test_planer_sikte_check
    check (sikte is null or (sikte >= 1 and sikte <= 10)),
  constraint test_planer_utfall_check
    check (utfall is null or utfall in ('vidare', 'vet_inte', 'inte_vidare'))
);

comment on table public.test_planer is
  'Testträningens plan per konto (spec-rummen avsnitt 6, våg 2/3a). Skrivs bara av servern.';
comment on column public.test_planer.sikte is
  'Siktet på nivåskalan 1-10, en decimal. Föreslås efter mätningen, ändras av användaren.';
comment on column public.test_planer.utfall_fraga_igen_at is
  'Vid "vet inte än": dagen frågan "Hur gick det?" ställs igen (svaret + 7 dagar).';

alter table public.test_planer enable row level security;

drop policy if exists test_planer_las_egen on public.test_planer;
create policy test_planer_las_egen on public.test_planer
  for select to authenticated using (auth.uid() = user_id);

revoke all on public.test_planer from anon;
revoke insert, update, delete, truncate on public.test_planer from authenticated;
grant select on public.test_planer to authenticated;
grant all on public.test_planer to service_role;

-- Sista spärren: samma mönster som testsession_skydda_skrivning, men en egen
-- funktion så att den här migreringen inte beror på skrivspärrens.
create or replace function public.traning_skydda_skrivning()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return coalesce(new, old);
  end if;

  raise exception 'Testträningens data i % skrivs bara av servern', tg_table_name
    using errcode = '42501',
          hint = 'Plan, nivå, milstolpar och frågestatistik sparas av /api/traning med service role.';
end;
$$;

comment on function public.traning_skydda_skrivning() is
  'Avvisar INSERT/UPDATE/DELETE från anon/authenticated på testträningens tabeller (test_planer, test_nivapunkter, test_milstolpar, fraga_statistik).';

drop trigger if exists traning_skydda_skrivning on public.test_planer;
create trigger traning_skydda_skrivning
  before insert or update or delete on public.test_planer
  for each row execute function public.traning_skydda_skrivning();

alter table public.profiles
  add column if not exists traning_sedd_at timestamptz null;

comment on column public.profiles.traning_sedd_at is
  'När Träningens hemvy senast ritades med den senaste nivåpunkten. Ny punkt efter detta = kurvan ritar sig (nyPunkt).';

-- Rollback:
--   drop trigger traning_skydda_skrivning on public.test_planer;
--   drop table public.test_planer;
--   alter table public.profiles drop column traning_sedd_at;
--   (traning_skydda_skrivning() används också av 20261011101000_testmotorn.sql.)
