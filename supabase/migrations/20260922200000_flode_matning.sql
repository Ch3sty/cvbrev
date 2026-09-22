-- Flodet: matning av kopflodet och onboardingen (D3, docs/plan-paket-och-onboarding.md avsnitt 6).
--
-- Tva delar:
--   1. admin_flode_daily: en rad per dag, handelse och dimension, fylld av
--      collect.ts ur PostHog i midnattsslotten. Dimensionen ar planen for
--      kopstegen, sparet for track_selected, funktionen for feature_blocked
--      och gray_option_tapped, "paket|steg" for onboarding_step_completed
--      och tom strang for totalen. Sidan /admin/flode laser harifran och
--      aldrig fran PostHog i kritiska vagen.
--   2. profiles.paket_started_at: nar det senaste paketet borjade. Skrivs av
--      Stripe-webhooken vid forsta fakturan och vid Allt-dagens grant, sa att
--      "kommit igang inom 24 timmar" gar att rakna utan ett Stripe-anrop.
--
-- Hela filen ar idempotent.

create table if not exists public.admin_flode_daily (
  dag date not null,
  handelse text not null,
  dimension text not null default '',
  antal int not null default 0,
  personer int not null default 0,
  uppdaterad timestamptz not null default now(),
  primary key (dag, handelse, dimension)
);

comment on table public.admin_flode_daily is
  'Kopflodet och onboardingen per dag ur PostHog. dimension: plan, spar, funktion, paket|steg eller tom strang for totalen. Raden (dag, _samlad, ) markerar att dagen ar insamlad aven om inget hande.';

create index if not exists admin_flode_daily_handelse_idx
  on public.admin_flode_daily (handelse, dag desc);

alter table public.admin_flode_daily enable row level security;
revoke all on public.admin_flode_daily from anon, authenticated;

alter table public.profiles
  add column if not exists paket_started_at timestamptz;

comment on column public.profiles.paket_started_at is
  'Nar det senaste paketet borjade: forsta fakturan pa en prenumeration eller Allt-dagens grant. Skrivs av Stripe-webhooken. Underlag for hours_since_purchase och Kom igang-matningen i adminen.';
