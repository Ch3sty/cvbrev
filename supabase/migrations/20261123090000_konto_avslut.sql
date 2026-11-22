-- Anonym avslutsstatistik och kön för radering i PostHog
-- (docs/beslut-mejl-och-radering-2026-11-22.md, Del 2).
-- Båda tabellerna nås bara med servernyckeln: RLS på, inga policyer,
-- och rättigheterna tagna från anon och authenticated.

create table public.konto_avslut (
  id uuid primary key default gen_random_uuid(),
  kvartal date not null check (kvartal = date_trunc('quarter', kvartal)::date),
  kalla text not null check (kalla in ('webb', 'app')),
  kontots_alder text not null check (kontots_alder in ('under_1_dag', '1_7_dagar', '8_30_dagar', '31_90_dagar', '91_365_dagar', 'over_1_ar')),
  hade_premium boolean not null,
  har_betalat boolean not null,
  antal_cv text not null check (antal_cv in ('0', '1', '2_5', '6_plus')),
  antal_brev text not null check (antal_brev in ('0', '1', '2_5', '6_plus')),
  antal_test text not null check (antal_test in ('0', '1_5', '6_20', '21_plus')),
  antal_sokta text not null check (antal_sokta in ('0', '1', '2_5', '6_plus')),
  dagar_sedan_aktivitet text not null check (dagar_sedan_aktivitet in ('under_1', '1_7', '8_30', '31_90', 'over_90', 'okant')),
  anledning text check (anledning in ('fick_jobb', 'soker_inte', 'for_dyrt', 'annan_tjanst', 'fungerade_inte', 'integritet'))
);

comment on table public.konto_avslut is
  'En rad per konto som raderats av användaren själv. Inget id, ingen e-post, ingen IP, ingen tid utöver kvartal. Läses bara aggregerat i /admin/anvandare.';

alter table public.konto_avslut enable row level security;
revoke all on table public.konto_avslut from anon, authenticated;
grant select, insert on table public.konto_avslut to service_role;

create table public.posthog_raderingar (
  distinct_id uuid primary key,
  forsok integer not null default 0,
  senaste_fel text
);

comment on table public.posthog_raderingar is
  'Konton som raderats men där PostHog inte svarade. Raden tas bort när PostHog bekräftat raderingen. Bara id, ingen e-post.';

alter table public.posthog_raderingar enable row level security;
revoke all on table public.posthog_raderingar from anon, authenticated;
grant select, insert, update, delete on table public.posthog_raderingar to service_role;
