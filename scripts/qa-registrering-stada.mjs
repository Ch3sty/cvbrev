// scripts/qa-registrering-stada.mjs
// Städar QA-kontona från klicktestet av registreringen och profilen, PER ID
// (docs/design/profil-registrering-spec-2026-09-24.md, "Städregel").
//
//   QA_KONTON_FIL=<scratchpad>/qa-konton.json node scripts/qa-registrering-stada.mjs [--kor]
//
// Utan --kor räknas bara raderna. Med --kor:
//   1. listar tabellerna med kolumnen user_id (information_schema)
//   2. per tabell: räknar rader med user_id i (id-listan), raderar exakt dem
//   3. anonyma testprov och intervjuprov raderas per token ur filen
//   4. auth.admin.deleteUser(id) per konto, sist
//   5. kontrollfråga: profilraderna är borta
// Aldrig mönster, aldrig tidsfönster. Loggen skrivs till docs/qa/registrering/.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const FIL = process.env.QA_KONTON_FIL
if (!FIL) throw new Error('QA_KONTON_FIL saknas')
const KOR = process.argv.includes('--kor')
const TOKEN = process.env.SUPABASE_TOKEN_JOBBCOACH
if (!TOKEN) throw new Error('SUPABASE_TOKEN_JOBBCOACH saknas')

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
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

const data = JSON.parse(fs.readFileSync(FIL, 'utf8'))
const ids = (data.konton ?? []).map((k) => k.id)
for (const id of ids) if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error(`ogiltigt id ${id}`)
const lista = ids.map((x) => `'${x}'`).join(',')
const logg = { tid: new Date().toISOString(), kor: KOR, konton: data.konton, tabeller: [], anon: [], auth: [], kontroll: null }

if (ids.length) {
  const tabeller = (
    await sql(
      "select table_name from information_schema.columns where table_schema = 'public' and column_name = 'user_id' and table_name in (select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE') order by table_name"
    )
  ).map((r) => r.table_name)

  // Två varv: tabeller med främmande nycklar till andra QA-rader kan behöva
  // raderas efter dem de pekar på.
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
}

// Anonyma prov, per token.
for (const [typ, tabell, kolumn] of [
  ['anonTest', 'anon_test_sessions', 'token'],
  ['anonIntervju', 'anon_interview_samples', 'token'],
  ['anonPersonlighet', 'anon_personality_samples', 'token'],
]) {
  const tokens = data[typ] ?? []
  if (!tokens.length) continue
  for (const tk of tokens) if (!/^[A-Za-z0-9_-]{8,128}$/.test(tk)) throw new Error(`ogiltig token ${tk}`)
  const tl = tokens.map((x) => `'${x}'`).join(',')
  const n = (await sql(`select count(*)::int n from public.${tabell} where ${kolumn}::text in (${tl})`))[0].n
  if (KOR && n > 0) {
    const del = await sql(`delete from public.${tabell} where ${kolumn}::text in (${tl}) returning 1`)
    logg.anon.push({ tabell, raknat: n, raderat: del.length })
  } else logg.anon.push({ tabell, raknat: n })
}

if (KOR) {
  const adminKlient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  // Profilraden kan ha user_id-lösa beroenden; profilen raderas per id före auth.
  if (ids.length) {
    const n = (await sql(`select count(*)::int n from public.profiles where id::text in (${lista})`))[0].n
    const del = await sql(`delete from public.profiles where id::text in (${lista}) returning 1`)
    logg.tabeller.push({ tabell: 'profiles (id)', raknat: n, raderat: del.length })
  }
  for (const id of ids) {
    const { error } = await adminKlient.auth.admin.deleteUser(id)
    logg.auth.push({ id, resultat: error ? `fel: ${error.message}` : 'raderad' })
  }
  if (ids.length) {
    logg.kontroll = {
      profiler: (await sql(`select count(*)::int n from public.profiles where id::text in (${lista})`))[0].n,
      auth: (await sql(`select count(*)::int n from auth.users where id::text in (${lista})`))[0].n,
    }
  }
}

fs.mkdirSync('docs/qa/registrering', { recursive: true })
fs.writeFileSync(`docs/qa/registrering/stadning-${KOR ? 'kord' : 'torrkorning'}.json`, JSON.stringify(logg, null, 2))
console.log(JSON.stringify(logg, null, 1))
