-- Antal konton per grupp i Anvandare, i en enda fraga (admin/lcp 2026-09-22).
--
-- hamtaOversikt i src/app/admin/anvandare/data.ts gjorde tidigare sex
-- count-fragor mot vyn admin_user_rows, en per grupp. Varje fraga var en
-- egen rundtur till Supabase. Funktionen svarar med en rad per grupp och
-- laser bara profiles och admin_undantagna_konton(), inte vyns aggregat.
--
-- Villkoren ar exakt de i tillampaGrupp (samma data.ts) och ska andras
-- tillsammans med dem. NULL beter sig som i PostgREST: ett villkor som blir
-- null raknas inte, precis som en rad som filtret inte slapper igenom.
--
-- Bara service role. Anon och authenticated har ingen exekveringsratt.

create or replace function public.admin_user_grupper(nu timestamptz default now())
returns table (grupp text, antal bigint)
language sql
stable
security invoker
set search_path = public
as $$
  with f as (
    select
      und.skal is not null as undantagen,
      (p.subscription_status is null
        or p.subscription_status not in ('active', 'past_due', 'trialing')) as ingen_pren,
      p.subscription_status as s,
      p.premium_source as src,
      p.premium_until as pu
    from profiles p
    left join admin_undantagna_konton() und on und.user_id = p.id
  ),
  t as (
    select
      count(*) filter (where not undantagen) as alla,
      count(*) filter (where not undantagen and (
        s in ('active', 'past_due')
        or (src like 'onetime_%' and pu > nu and (s is null or s <> 'trialing'))
      )) as betalande,
      count(*) filter (where not undantagen and (
        s = 'trialing'
        or (src in ('signup_trial', 'oauth_signup_trial') and pu > nu
            and (s is null or s not in ('active', 'past_due')))
      )) as provperiod,
      count(*) filter (where not undantagen and (
        src in ('signup_trial', 'oauth_signup_trial')
        and (pu is null or pu <= nu)
        and ingen_pren
      )) as provperiod_slut,
      count(*) filter (where not undantagen and (
        (ingen_pren and src is null)
        or (ingen_pren and src not in ('signup_trial', 'oauth_signup_trial') and pu <= nu)
        or (ingen_pren and src not in ('signup_trial', 'oauth_signup_trial', 'admin') and pu is null)
      )) as gratis,
      count(*) filter (where undantagen) as undantagna
    from f
  )
  select v.grupp, v.antal
  from t
  cross join lateral (values
    ('alla', t.alla),
    ('betalande', t.betalande),
    ('provperiod', t.provperiod),
    ('provperiod_slut', t.provperiod_slut),
    ('gratis', t.gratis),
    ('undantagna', t.undantagna)
  ) as v(grupp, antal);
$$;

revoke all on function public.admin_user_grupper(timestamptz) from public;
revoke all on function public.admin_user_grupper(timestamptz) from anon, authenticated;
grant execute on function public.admin_user_grupper(timestamptz) to service_role;
