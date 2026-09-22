-- Hjalpredan "Kom igang" (docs/design/spec-onboarding-2026-09-22.html, sektion 2).
--
-- Provade brickor per nyckel: {"cv_upp": "2026-09-22T10:00:00Z", ...}.
-- Skrivs bara av servern (service role) nar handlingen faktiskt sker,
-- aldrig av en manuell knapp. Idempotent: en nyckel som redan finns rors inte,
-- sa forsta gangen star kvar som tidsstampel.

alter table public.profiles
  add column if not exists onboarding_steps jsonb not null default '{}'::jsonb;

comment on column public.profiles.onboarding_steps is
  'Kom igang-hjalpredan: provade brickor per nyckel med tidsstampel for forsta gangen. Skrivs av komigang_markera.';

create or replace function public.komigang_markera(p_user uuid, p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set onboarding_steps = coalesce(onboarding_steps, '{}'::jsonb)
       || jsonb_build_object(p_key, to_jsonb(now()))
   where id = p_user
     and not (coalesce(onboarding_steps, '{}'::jsonb) ? p_key);
$$;

revoke all on function public.komigang_markera(uuid, text) from public, anon, authenticated;
grant execute on function public.komigang_markera(uuid, text) to service_role;
