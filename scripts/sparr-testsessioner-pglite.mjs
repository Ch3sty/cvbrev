// scripts/sparr-testsessioner-pglite.mjs
// Lokal verifiering av skrivspärren i PGlite (Postgres i Node, ingen databas
// behövs): prod-schemat för testsessionerna som det såg ut 2026-10-10
// (policyer, rättigheter, triggrar, spara_testsvar), sedan migreringarna
// 20261010210000_testsvar_server.sql och 20261010211000_testsessioner_skrivsparr.sql.
//
//   npm i --no-save @electric-sql/pglite && node scripts/sparr-testsessioner-pglite.mjs
import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const MIG = fileURLToPath(new URL('../supabase/migrations/', import.meta.url))
const db = new PGlite()
const U1 = '11111111-1111-1111-1111-111111111111'
const U2 = '22222222-2222-2222-2222-222222222222'
const ADM = '99999999-9999-9999-9999-999999999999'
let fel = 0
const ok = (namn, villkor, extra = '') => {
  console.log(`${villkor ? 'OK  ' : 'FEL '} ${namn}${extra ? '  ' + extra : ''}`)
  if (!villkor) fel++
}

async function som(roll, uid, sql, params = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`)
  if (roll) await db.exec(`set role ${roll};`)
  try {
    const r = await db.query(sql, params)
    return { ok: true, rows: r.rows, affected: r.affectedRows }
  } catch (e) {
    return { ok: false, error: e.message }
  } finally {
    await db.exec('reset role;')
  }
}

await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{}'::jsonb $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
create table public.admins(user_id uuid primary key);
create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;
insert into public.admins values ('${ADM}');

create table public.logic_test_v4_sessions(
  id uuid primary key default gen_random_uuid(), user_id uuid, started_at timestamptz default now(),
  completed_at timestamptz, score int, time_spent int, answers jsonb default '[]'::jsonb,
  created_at timestamptz default now(), updated_at timestamptz default now(),
  test_type text default 'matrislogik', meta jsonb default '{}'::jsonb);
create table public.personality_test_sessions(
  id uuid primary key default gen_random_uuid(), user_id uuid, test_type text, answers jsonb default '[]'::jsonb,
  scores jsonb, facet_scores jsonb, started_at timestamptz default now(), completed_at timestamptz, time_spent int,
  created_at timestamptz default now());
create table public.user_personality_profile(
  user_id uuid primary key, source_session_id uuid, source_test_type text, openness int, conscientiousness int,
  extraversion int, agreeableness int, neuroticism int, facet_scores jsonb, ai_analysis jsonb,
  computed_at timestamptz, updated_at timestamptz);
create table public.anon_test_sessions(token uuid primary key default gen_random_uuid(), answers jsonb, score int, claimed_by uuid, meta jsonb default '{}'::jsonb);

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

create function public.upsert_personality_profile() returns trigger language plpgsql as $$
begin
  if new.completed_at is null or new.scores is null then return new; end if;
  if old.completed_at is not null then return new; end if;
  insert into public.user_personality_profile(user_id, source_session_id, source_test_type, openness, computed_at, updated_at)
  values (new.user_id, new.id, new.test_type, coalesce((new.scores->>'openness')::int, 50), now(), now())
  on conflict (user_id) do update set openness = excluded.openness, source_session_id = excluded.source_session_id;
  return new;
end $$;
create trigger after_personality_session_complete after update on public.personality_test_sessions for each row execute function public.upsert_personality_profile();
`)
await db.exec(fs.readFileSync(MIG + '20261010180000_spara_testsvar.sql', 'utf8'))

// ---------------------------------------------------------------- Före spärren
console.log('\n== Före migrationerna (som prod i dag) ==')
let r = await som('authenticated', U1, `insert into public.logic_test_v4_sessions(user_id, test_type, score, completed_at) values ($1, 'matrislogik', 15, now()) returning id`, [U1])
ok('authenticated kan skapa en redan avslutad session med poäng 15', r.ok, r.error)
const forfalskad = r.rows?.[0]?.id
r = await som('service_role', null, `insert into public.logic_test_v4_sessions(user_id) values ($1) returning id`, [U1])
const s1 = r.rows[0].id
r = await som('authenticated', U1, `update public.logic_test_v4_sessions set score = 15, completed_at = now(), meta = '{"alternativ_blandade": true}' where id = $1`, [s1])
ok('authenticated kan sätta score/completed_at/meta på egen session', r.ok && r.affected === 1, r.error)
r = await som('authenticated', U1, `select public.spara_testsvar('logic_test_v4_sessions', $1, array['q_id'], '{"q_id":"x","selected":2,"visat":4,"correct":true}'::jsonb, false) as n`, [s1])
ok('spara_testsvar (gamla) fungerar med användarens session', r.ok && r.rows[0].n === 1, r.error)
r = await som('authenticated', U1, `insert into public.user_personality_profile(user_id, openness) values ($1, 99)`, [U1])
ok('authenticated kan skriva egen Big Five-profil direkt', r.ok, r.error)

// ---------------------------------------------------------------- Steg 1
console.log('\n== Steg 1: 20261010210000_testsvar_server.sql ==')
await db.exec(fs.readFileSync(MIG + '20261010210000_testsvar_server.sql', 'utf8'))
r = await som('service_role', null, `insert into public.logic_test_v4_sessions(user_id, meta) values ($1, '{"alternativ_blandade": true}') returning id`, [U1])
const s2 = r.rows[0].id
const svar = (q, sel, vis) => JSON.stringify({ q_id: q, selected: sel, visat: vis, correct: false, time_spent: 3 })
r = await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb) n`, [s2, U1, svar('a', 1, 4)])
ok('service_role sparar svar åt U1', r.ok && r.rows[0].n === 1, r.error)
await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb)`, [s2, U1, svar('b', 0, 2)])
r = await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb) n`, [s2, U1, svar('a', 3, 0)])
ok('omval ersätter svaret, två unika svar', r.ok && r.rows[0].n === 2, JSON.stringify(r.rows ?? r.error))
r = await som('service_role', null, `select answers from public.logic_test_v4_sessions where id = $1`, [s2])
const a = r.rows[0].answers.find((x) => x.q_id === 'a')
ok('visat och selected sparas (q a: selected 3, visat 0)', a?.selected === 3 && a?.visat === 0, JSON.stringify(r.rows[0].answers))
r = await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb) n`, [s2, U2, svar('c', 1, 1)])
ok('fel användare ger null (ingen rad)', r.ok && r.rows[0].n === null, JSON.stringify(r.rows ?? r.error))
r = await som('authenticated', U1, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb)`, [s2, U1, svar('c', 1, 1)])
ok('authenticated får inte köra spara_testsvar_server', !r.ok, r.error)
r = await som('anon', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb)`, [s2, U1, svar('c', 1, 1)])
ok('anon får inte köra spara_testsvar_server', !r.ok, r.error)
r = await som('authenticated', U1, `select public.spara_testsvar('logic_test_v4_sessions', $1, array['q_id'], '{"q_id":"z","selected":1}'::jsonb) n`, [s2])
ok('steg 1 rör inte gamla spara_testsvar (prod-koden fungerar)', r.ok && r.rows[0].n === 3, r.error)

// ---------------------------------------------------------------- Steg 2
console.log('\n== Steg 2: 20261010211000_testsessioner_skrivsparr.sql ==')
await db.exec(fs.readFileSync(MIG + '20261010211000_testsessioner_skrivsparr.sql', 'utf8'))
r = await som('authenticated', U1, `update public.logic_test_v4_sessions set score = 15 where id = $1`, [s2])
ok('authenticated kan INTE uppdatera score', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `update public.logic_test_v4_sessions set answers = '[]' where id = $1`, [s2])
ok('authenticated kan INTE uppdatera answers', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `insert into public.logic_test_v4_sessions(user_id, score, completed_at) values ($1, 15, now())`, [U1])
ok('authenticated kan INTE skapa session', !r.ok, r.error)
r = await som('authenticated', U1, `delete from public.logic_test_v4_sessions where id = $1`, [s2])
ok('authenticated kan INTE radera session', !r.ok || r.affected === 0, r.error)
r = await som('anon', null, `update public.logic_test_v4_sessions set score = 15 where id = $1`, [s2])
ok('anon kan INTE uppdatera', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', ADM, `update public.logic_test_v4_sessions set score = 1 where id = $1`, [s2])
ok('admin via authenticated: rättighet indragen, ingen skrivning', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `select id, score from public.logic_test_v4_sessions where id = $1`, [s2])
ok('authenticated kan fortfarande läsa egen session', r.ok && r.rows.length === 1, r.error)
r = await som('authenticated', U2, `select id from public.logic_test_v4_sessions where id = $1`, [s2])
ok('annan användare ser inte sessionen', r.ok && r.rows.length === 0, r.error)
r = await som('authenticated', U1, `select public.spara_testsvar('logic_test_v4_sessions', $1, array['q_id'], '{"q_id":"z","selected":1}'::jsonb)`, [s2])
ok('gamla spara_testsvar finns inte längre', !r.ok, r.error)
r = await som('authenticated', U1, `update public.personality_test_sessions set scores = '{}'`)
ok('authenticated kan INTE uppdatera personlighetssession', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `update public.user_personality_profile set openness = 1 where user_id = $1`, [U1])
ok('authenticated kan INTE ändra Big Five-profilen', !r.ok || r.affected === 0, r.error)
r = await som('authenticated', U1, `insert into public.anon_test_sessions(answers) values ('[]')`)
ok('authenticated kan INTE skriva anon_test_sessions', !r.ok, r.error)

// Servern
r = await som('service_role', null, `insert into public.logic_test_v4_sessions(user_id, meta) values ($1, '{"alternativ_blandade": true}') returning id`, [U1])
ok('service_role skapar session', r.ok, r.error)
const s3 = r.rows?.[0]?.id
r = await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb) n`, [s3, U1, svar('a', 1, 4)])
ok('service_role sparar svar efter spärren', r.ok && r.rows[0].n === 1, r.error)
r = await som('service_role', null, `update public.logic_test_v4_sessions set completed_at = now(), score = 1, time_spent = 3 where id = $1 and user_id = $2`, [s3, U1])
ok('service_role avslutar session', r.ok && r.affected === 1, r.error)
r = await som('service_role', null, `select public.spara_testsvar_server('logic_test_v4_sessions', $1, $2, array['q_id'], $3::jsonb) n`, [s3, U1, svar('b', 1, 4)])
ok('svar på avslutad session ger null', r.ok && r.rows[0].n === null, r.error)
r = await som('service_role', null, `insert into public.personality_test_sessions(user_id, test_type) values ($1, 'personlighet-grund') returning id`, [U2])
const p1 = r.rows[0].id
r = await som('service_role', null, `update public.personality_test_sessions set completed_at = now(), scores = '{"openness": 61}' where id = $1 and user_id = $2`, [p1, U2])
ok('service_role avslutar personlighetstest', r.ok && r.affected === 1, r.error)
r = await som('service_role', null, `select openness from public.user_personality_profile where user_id = $1`, [U2])
ok('triggern skriver Big Five-profilen som service_role', r.ok && r.rows[0]?.openness === 61, JSON.stringify(r.rows ?? r.error))
r = await som(null, null, `update public.logic_test_v4_sessions set score = 2 where id = $1`, [s3])
ok('postgres (migreringar, cron) påverkas inte', r.ok && r.affected === 1, r.error)

// Triggern som sista spärr: någon lägger tillbaka rättighet och policy.
await db.exec(`grant update on public.logic_test_v4_sessions to authenticated;
  create policy aterinford on public.logic_test_v4_sessions for update using (true) with check (true);`)
r = await som('authenticated', U1, `update public.logic_test_v4_sessions set score = 15 where id = $1`, [s3])
ok('trigger stoppar authenticated även om policy och rättighet återinförs', !r.ok && /skrivs bara av servern/.test(r.error), r.error)
r = await som('authenticated', ADM, `update public.logic_test_v4_sessions set score = 5 where id = $1`, [s3])
ok('trigger släpper igenom is_admin()', r.ok && r.affected === 1, r.error)

console.log(fel === 0 ? '\nALLA KONTROLLER GICK IGENOM' : `\n${fel} KONTROLLER MISSLYCKADES`)
void forfalskad
process.exit(fel ? 1 : 0)
