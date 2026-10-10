// scripts/testmotorn-pglite-schema.mjs
// Prod-schemat för testsessionerna i PGlite (som i
// scripts/sparr-testsessioner-pglite.mjs, 2026-10-10), plus det testmotorn
// rör: auth.users, profiles, admin_users och admin_undantagna_konton() i
// förenklad form. Kör sedan migreringarna i den ordning de ska köras i prod:
//   20261010180000_spara_testsvar.sql      (finns i prod)
//   20261010200000_alternativ_blandade.sql (samlade branchen)
//   20261010210000_testsvar_server.sql     (samlade branchen)
//   20261010211000_testsessioner_skrivsparr.sql (samlade branchen)
//   20261011100000_test_planer.sql         (våg 3a)
//   20261011101000_testmotorn.sql          (våg 3a)
//
// Används av scripts/testmotorn-pglite.mjs (RLS och SQL) och
// src/lib/traning/__tests__/integration.pglite.test.ts (hela flödet).

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

export const MIG = fileURLToPath(new URL('../supabase/migrations/', import.meta.url))

export const MIGRERINGAR = [
  '20261010180000_spara_testsvar.sql',
  '20261010200000_alternativ_blandade.sql',
  '20261010210000_testsvar_server.sql',
  '20261010211000_testsessioner_skrivsparr.sql',
  '20261011100000_test_planer.sql',
  '20261011101000_testmotorn.sql',
]

/** PostgREST-lika värden: datum och tider som text, numeric som tal. */
export const PARSERS = {
  1082: (v) => v, // date -> 'YYYY-MM-DD'
  1114: (v) => new Date(v.replace(' ', 'T') + 'Z').toISOString(), // timestamp
  1184: (v) => new Date(v.replace(' ', 'T').replace(/([+-]\d\d)$/, '$1:00')).toISOString(), // timestamptz
  1700: (v) => Number(v), // numeric
}

export async function byggSchema(db, { admin = [], konton = [] } = {}) {
  await db.exec(`
set timezone = 'UTC';
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant select on auth.users to service_role;

create table public.admins(user_id uuid primary key);
create table public.admin_users(id uuid primary key, role text default 'admin');
create table public.profiles(id uuid primary key, email text);
alter table public.profiles enable row level security;
create policy profiles_egen on public.profiles for select using (auth.uid() = id);
grant select, update on public.profiles to authenticated;
grant all on public.profiles, public.admin_users to service_role;
create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;

-- Samma regel som 20260922220000_admin_undantagna_konton.sql, utan vyerna.
create or replace function public.admin_undantagna_konton()
returns table (user_id uuid, email text, skal text)
language sql stable security definer set search_path = public, auth
as $$
  select a.id, null::text, 'admin'::text from public.admin_users a
  union
  select u.id, u.email, 'test'::text from auth.users u
   where lower(coalesce(u.email, '')) like any (array['%.test', '%jobbcoach-qa%', 'qa-%'])
$$;
revoke all on function public.admin_undantagna_konton() from public, anon, authenticated;
grant execute on function public.admin_undantagna_konton() to service_role;

create table public.logic_test_v4_sessions(
  id uuid primary key default gen_random_uuid(), user_id uuid, started_at timestamptz default now(),
  completed_at timestamptz, score int, time_spent int, answers jsonb default '[]'::jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  test_type text default 'matrislogik');
create table public.personality_test_sessions(
  id uuid primary key default gen_random_uuid(), user_id uuid, test_type text, answers jsonb default '[]'::jsonb,
  scores jsonb, facet_scores jsonb, started_at timestamptz default now(), completed_at timestamptz, time_spent int,
  created_at timestamptz default now());
create table public.user_personality_profile(
  user_id uuid primary key, source_session_id uuid, source_test_type text, openness int, conscientiousness int,
  extraversion int, agreeableness int, neuroticism int, facet_scores jsonb, ai_analysis jsonb,
  computed_at timestamptz, updated_at timestamptz);
create table public.anon_test_sessions(token uuid primary key default gen_random_uuid(), answers jsonb, score int, claimed_by uuid, created_at timestamptz not null default now());

alter table public.logic_test_v4_sessions enable row level security;
alter table public.personality_test_sessions enable row level security;
alter table public.user_personality_profile enable row level security;
alter table public.anon_test_sessions enable row level security;
grant all on public.logic_test_v4_sessions, public.personality_test_sessions, public.user_personality_profile, public.anon_test_sessions to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

create policy "Users can insert own sessions" on public.logic_test_v4_sessions for insert with check (auth.uid() = user_id);
create policy "Users can view own sessions" on public.logic_test_v4_sessions for select using (auth.uid() = user_id);
create policy admins_read_all_logic_tests on public.logic_test_v4_sessions for select to authenticated using (is_admin());
create policy "Users can update own sessions" on public.logic_test_v4_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can insert own personality sessions" on public.personality_test_sessions for insert with check (auth.uid() = user_id);
create policy "Users can view own personality sessions" on public.personality_test_sessions for select using (auth.uid() = user_id);
create policy "Users can update own personality sessions" on public.personality_test_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can insert own personality profile" on public.user_personality_profile for insert with check (auth.uid() = user_id);
create policy "Users can update own personality profile" on public.user_personality_profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can view own personality profile" on public.user_personality_profile for select using (auth.uid() = user_id);
`)
  for (const [id, email] of konton) {
    await db.query('insert into auth.users(id, email) values ($1, $2)', [id, email])
    await db.query('insert into public.profiles(id, email) values ($1, $2)', [id, email])
  }
  for (const id of admin) {
    await db.query('insert into public.admin_users(id) values ($1)', [id])
    await db.query('insert into public.admins(user_id) values ($1)', [id])
  }
  for (const fil of MIGRERINGAR) {
    await db.exec(fs.readFileSync(MIG + fil, 'utf8'))
  }
}

/** Kör en fråga som en roll (anon, authenticated, service_role) eller som postgres (null). */
export async function som(db, roll, uid, sql, params = []) {
  return db.transaction(async (tx) => {
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid ?? ''])
    if (roll) await tx.exec(`set local role ${roll};`)
    try {
      await tx.exec('savepoint s')
      const r = await tx.query(sql, params)
      return { ok: true, rows: r.rows, affected: r.affectedRows }
    } catch (e) {
      await tx.exec('rollback to savepoint s')
      return { ok: false, error: e.message }
    }
  })
}
