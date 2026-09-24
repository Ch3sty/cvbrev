// scripts/qa-slutflode-stada.mjs
// Städar slutflödestestet (docs/qa/qa-slutflode-2026-09-24.md) PER ID.
//
//   SCRATCH=<tmp> node scripts/qa-slutflode-stada.mjs [--kor]
//
// Läser $SCRATCH/qa-slut-konton.json (konton med id, Stripe-kunder, tokens,
// sökvägar i lagringen). Utan --kor räknas bara. Med --kor:
//   1. Stripe TESTLÄGE: prenumerationer avslutas, öppna kassor går ut, kunderna raderas
//   2. tabeller med user_id: räkna, radera exakt user_id in (id-listan)
//   3. anonyma prov och brevutkast per token
//   4. localhost-nyckeln i public_rate_limits återställs till läget före testet
//   5. foton i lagringen per sökväg (och det som ligger under users/<id>/)
//   6. profiles per id, auth-användarna sist, kontrollfråga
// Aldrig mönster, aldrig tidsfönster. Loggen skrivs till docs/qa/slutflode/.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('SCRATCH saknas')
const KOR = process.argv.includes('--kor')
const TOKEN = process.env.SUPABASE_TOKEN_JOBBCOACH
if (!TOKEN) throw new Error('SUPABASE_TOKEN_JOBBCOACH saknas')

const lasEnv = (fil) =>
  Object.fromEntries(
    fs
      .readFileSync(fil, 'utf8')
      .split(/\r?\n/)
      .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
      .map((r) => [r.slice(0, r.indexOf('=')).trim(), r.slice(r.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
  )
const env = lasEnv('.env.local')
const envTest = lasEnv('.env.test.local')
if (!envTest.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('ingen testnyckel')
const stripe = new Stripe(envTest.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
if (ref !== 'dbvbnbkvadvlhjhomibg') throw new Error('fel projekt')
async function sql(query) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const j = await r.json()
  if (r.status >= 300) throw new Error(JSON.stringify(j))
  return j
}
const adminKlient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const data = JSON.parse(fs.readFileSync(`${SCRATCH}/qa-slut-konton.json`, 'utf8'))
const konton = Object.entries(data.konton).map(([nyckel, k]) => ({ nyckel, ...k })).filter((k) => k.id)
const ids = konton.map((k) => k.id)
for (const id of ids) if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error(`ogiltigt id ${id}`)
const lista = ids.map((x) => `'${x}'`).join(',')
const logg = { tid: new Date().toISOString(), kor: KOR, konton: konton.map((k) => ({ nyckel: k.nyckel, id: k.id, email: k.email })), stripe: [], tabeller: [], anon: [], rateLimits: null, lagring: [], auth: [], kontroll: null }

/* 1. Stripe testläge */
for (const k of konton.filter((k) => k.customer)) {
  const rad = { kund: k.customer, avslutade: 0, utgangna: 0, raderad: false }
  try {
    await stripe.customers.retrieve(k.customer).then((c) => {
      if (c.deleted) throw Object.assign(new Error('raderad'), { code: 'resource_missing' })
    })
  } catch (e) {
    if (e?.code !== 'resource_missing') throw e
    rad.redanRaderad = true
    logg.stripe.push(rad)
    continue
  }
  try {
  const subs = await stripe.subscriptions.list({ customer: k.customer, status: 'all', limit: 20 })
  const levande = subs.data.filter((s) => !['canceled', 'incomplete_expired'].includes(s.status))
  rad.prenumerationer = subs.data.map((s) => s.status)
  const sessioner = await stripe.checkout.sessions.list({ customer: k.customer, limit: 20 })
  const oppna = sessioner.data.filter((s) => s.status === 'open')
  if (KOR) {
    // Kassan först: en prenumeration med öppen kassa går inte att avsluta.
    for (const s of oppna) {
      await stripe.checkout.sessions.expire(s.id)
      rad.utgangna++
    }
    for (const s of levande.filter((x) => x.status !== 'incomplete')) {
      await stripe.subscriptions.cancel(s.id)
      rad.avslutade++
    }
    const efter = await stripe.subscriptions.list({ customer: k.customer, status: 'all', limit: 20 })
    rad.efter = efter.data.map((s) => s.status)
    await stripe.customers.del(k.customer)
    rad.raderad = true
  } else {
    rad.levande = levande.length
    rad.oppnaKassor = oppna.length
  }
  } catch (e) {
    rad.fel = String(e?.message ?? e).slice(0, 200)
  }
  logg.stripe.push(rad)
}

/* 2. Tabeller med user_id */
const tabeller = (
  await sql(
    "select table_name from information_schema.columns where table_schema = 'public' and column_name = 'user_id' and table_name in (select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE') order by table_name"
  )
).map((r) => r.table_name)

/* 3. Anonyma prov och utkast per token (före user_id-varvet: raderna bär också user_id). */
const tokenTabeller = [
  ['intervju', 'anon_interview_samples'],
  ['personlighet', 'anon_personality_samples'],
  ['test', 'anon_test_sessions'],
  ['draft', 'public_letter_drafts'],
]
for (const [typ, tabell] of tokenTabeller) {
  const tokens = (data.tokens?.[typ] ?? []).filter((t) => /^[0-9a-f-]{36}$/.test(t))
  if (!tokens.length) continue
  const tl = tokens.map((x) => `'${x}'`).join(',')
  const n = (await sql(`select count(*)::int n from public.${tabell} where token::text in (${tl})`))[0].n
  if (KOR && n > 0) {
    const del = await sql(`delete from public.${tabell} where token::text in (${tl}) returning 1`)
    logg.anon.push({ tabell, tokens: tokens.length, raknat: n, raderat: del.length })
  } else logg.anon.push({ tabell, tokens: tokens.length, raknat: n })
}

for (let varv = 0; varv < 2; varv++) {
  for (const t of tabeller) {
    const n = (await sql(`select count(*)::int n from public."${t}" where user_id::text in (${lista})`))[0].n
    if (n === 0) continue
    if (!KOR) {
      logg.tabeller.push({ tabell: t, raknat: n })
      continue
    }
    try {
      const del = await sql(`delete from public."${t}" where user_id::text in (${lista}) returning 1`)
      logg.tabeller.push({ tabell: t, raknat: n, raderat: del.length, varv })
    } catch (e) {
      logg.tabeller.push({ tabell: t, raknat: n, fel: String(e.message).slice(0, 160), varv })
    }
  }
  if (!KOR) break
}

/* 4. localhost-nyckeln i public_rate_limits: tillbaka till läget före testet (anon_test 2, inga andra). */
const IP = 'd6e118b9e1347cd5c4641f6c09122463b652f3b3cae854088c355005a1ee8098'
const fore = await sql(`select scope, count from public.public_rate_limits where ip_hash = '${IP}' and window_start = '2026-09-24 00:00:00+00' order by scope`)
logg.rateLimits = { fore }
if (KOR) {
  await sql(`delete from public.public_rate_limits where ip_hash = '${IP}' and window_start = '2026-09-24 00:00:00+00' and scope <> 'anon_test'`)
  await sql(`update public.public_rate_limits set count = 2 where ip_hash = '${IP}' and window_start = '2026-09-24 00:00:00+00' and scope = 'anon_test'`)
  logg.rateLimits.efter = await sql(`select scope, count from public.public_rate_limits where ip_hash = '${IP}' and window_start = '2026-09-24 00:00:00+00' order by scope`)
}

/* 5. Lagringen: sökvägarna ur filen och det som ligger under users/<id>/ för kontona. */
const sokvagar = new Set((data.lagring ?? []).map((s) => s.replace(/^profile-photos\//, '')))
for (const id of ids) {
  const { data: filer } = await adminKlient.storage.from('profile-photos').list(`users/${id}`)
  for (const f of filer ?? []) sokvagar.add(`users/${id}/${f.name}`)
}
for (const s of sokvagar) if (!ids.some((id) => s.startsWith(`users/${id}/`))) throw new Error(`sökväg utanför QA-kontona: ${s}`)
if (KOR && sokvagar.size) {
  const { data: bort, error } = await adminKlient.storage.from('profile-photos').remove([...sokvagar])
  logg.lagring.push({ begarda: sokvagar.size, raderade: (bort ?? []).length, fel: error?.message ?? null })
} else logg.lagring.push({ sokvagar: [...sokvagar] })

/* 6. Profiler per id, auth sist, kontroll. */
if (KOR) {
  const n = (await sql(`select count(*)::int n from public.profiles where id::text in (${lista})`))[0].n
  const del = await sql(`delete from public.profiles where id::text in (${lista}) returning 1`)
  logg.tabeller.push({ tabell: 'profiles (id)', raknat: n, raderat: del.length })
  for (const id of ids) {
    const { error } = await adminKlient.auth.admin.deleteUser(id)
    logg.auth.push({ id, resultat: error ? `fel: ${error.message}` : 'raderad' })
  }
  const rest = []
  for (const t of tabeller) {
    const m = (await sql(`select count(*)::int n from public."${t}" where user_id::text in (${lista})`))[0].n
    if (m) rest.push({ tabell: t, n: m })
  }
  const kvarFoton = []
  for (const id of ids) {
    const { data: filer } = await adminKlient.storage.from('profile-photos').list(`users/${id}`)
    kvarFoton.push(...(filer ?? []).map((f) => f.name))
  }
  logg.kontroll = {
    profiler: (await sql(`select count(*)::int n from public.profiles where id::text in (${lista})`))[0].n,
    auth: (await sql(`select count(*)::int n from auth.users where id::text in (${lista})`))[0].n,
    authQaSlut: (await sql(`select count(*)::int n from auth.users where email like 'qa-slut-%@jobbcoach.ai'`))[0].n,
    userIdRader: rest,
    foton: kvarFoton.length,
  }
}

fs.mkdirSync('docs/qa/slutflode', { recursive: true })
fs.writeFileSync(`docs/qa/slutflode/stadning-${KOR ? 'kord' : 'torrkorning'}.json`, JSON.stringify(logg, null, 2))
console.log(JSON.stringify(logg, null, 1))
