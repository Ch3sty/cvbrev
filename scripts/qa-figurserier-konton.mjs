// scripts/qa-figurserier-konton.mjs
// Testkonton för klicktestet av figurserier (feat/figurserier, 2026-10-12).
//
//   SCRATCH=<tmp> node scripts/qa-figurserier-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-figurserier-konton.mjs radera
//
// skapa: två konton qa-c-<ts>-gratis och qa-c-<ts>-premium@jobbcoach-qa.test;
//   premium får Hela paketet via premium_grants.
// radera: bara de egna kontonas rader, via deras user_id och grantens id.
//   Räknar före varje delete (feedback_testdata_stadning).

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SCRATCH = process.env.SCRATCH
if (!SCRATCH) throw new Error('Sätt SCRATCH')
const FIL = `${SCRATCH}/qa-figurserier-konton.json`
const LOSEN = 'QaFigurserier!2026-10-12x'
const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})

async function skapa() {
  const ut = las()
  const ts = ut.ts ?? Date.now()
  ut.ts = ts
  for (const namn of ['gratis', 'premium']) {
    if (ut[namn]) continue
    const email = `qa-c-${ts}-${namn}@jobbcoach-qa.test`
    const fullName = `QA Figurserier ${namn}`
    const { data, error } = await admin.auth.admin.createUser({ email, password: LOSEN, email_confirm: true, user_metadata: { full_name: fullName } })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId }
    spara(ut)
    await new Promise((r) => setTimeout(r, 800))
    const { error: pErr } = await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      email_verified_at: new Date().toISOString(),
      onboarding_track: 'allt',
      onboarding_track_asked_at: new Date().toISOString(),
    })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)
    if (namn === 'premium') {
      const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
      const { data: grant, error: gErr } = await admin
        .from('premium_grants')
        .insert({ user_id: userId, days: 7, source: 'qa-figurserier', scope: 'allt', premium_until_after: om7 })
        .select('id')
        .single()
      if (gErr) throw new Error(`grant: ${gErr.message}`)
      ut[namn].grantId = grant.id
      spara(ut)
    }
    console.log('skapad', namn, email, userId)
  }
}

/** Tabeller med user_id som klicktestet kan ha skrivit till. */
const TABELLER = ['logic_test_v4_sessions', 'fraga_rapporter', 'user_activities', 'user_activity', 'user_activity_log', 'test_planer', 'premium_grants', 'profiles']

async function radera() {
  const ut = las()
  for (const namn of ['gratis', 'premium']) {
    const k = ut[namn]
    if (!k) continue
    for (const t of TABELLER) {
      const kol = t === 'profiles' ? 'id' : 'user_id'
      const { count, error } = await admin.from(t).select('*', { count: 'exact', head: true }).eq(kol, k.userId)
      if (error) { console.log(`${t}: ${error.message} (hoppas över)`); continue }
      if (!count) continue
      const { error: dErr } = await admin.from(t).delete().eq(kol, k.userId)
      console.log(`${namn}: ${t} ${count} rader ${dErr ? 'FEL ' + dErr.message : 'raderade'}`)
    }
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log(`${namn}: kontot ${error ? 'FEL ' + error.message : 'raderat'}`)
    delete ut[namn]
    spara(ut)
  }
}

const steg = process.argv[2]
if (steg === 'skapa') await skapa()
else if (steg === 'radera') await radera()
else throw new Error('skapa eller radera')
