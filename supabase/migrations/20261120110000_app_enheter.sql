-- Appens enheter och påminnelsen om dagens test (docs/plan-app.md, avsnitt 2.7).
-- En rad per telefon: push-token från Firebase Cloud Messaging, plattform,
-- vald tid (svensk tid) och om påminnelsen är på. Rutten /api/app/enheter
-- skriver med service role efter inloggningskontrollen; RLS släpper bara
-- ägarens egna rader för den som läser med sin egen session.
--
-- senast_paminnd är spärren mot dubbla notiser samma dag om cron körs två
-- gånger i samma kvart (edge-funktionen app-paminnelse).

create table if not exists public.app_enheter (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  plattform text not null default 'android' check (plattform in ('android', 'ios')),
  paminnelse_tid time not null default '18:30',
  aktiv boolean not null default true,
  skapad timestamptz not null default now(),
  senast_sedd timestamptz not null default now(),
  senast_paminnd date
);

-- En token hör till en telefon. Loggar någon annan in på samma telefon tar
-- den över raden (upsert på token).
create unique index if not exists app_enheter_token_idx on public.app_enheter (token);
create index if not exists app_enheter_user_idx on public.app_enheter (user_id);
-- Utskickets fråga: aktiva rader per tid.
create index if not exists app_enheter_utskick_idx on public.app_enheter (paminnelse_tid) where aktiv;

alter table public.app_enheter enable row level security;

drop policy if exists app_enheter_egen_las on public.app_enheter;
create policy app_enheter_egen_las on public.app_enheter
  for select using ((select auth.uid()) = user_id);

drop policy if exists app_enheter_egen_skriv on public.app_enheter;
create policy app_enheter_egen_skriv on public.app_enheter
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists app_enheter_egen_andra on public.app_enheter;
create policy app_enheter_egen_andra on public.app_enheter
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists app_enheter_egen_radera on public.app_enheter;
create policy app_enheter_egen_radera on public.app_enheter
  for delete using ((select auth.uid()) = user_id);

comment on table public.app_enheter is
  'Testklar-appens telefoner: FCM-token och påminnelsetid (svensk tid). Utskick: edge-funktionen app-paminnelse via pg_cron var 15:e minut.';

-- Ingen anonym åtkomst alls; inloggade bara det policyerna släpper.
revoke all on public.app_enheter from anon;
revoke truncate, references, trigger on public.app_enheter from authenticated;
