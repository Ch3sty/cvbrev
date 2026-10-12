// scripts/qa-deduktiv-konton.mjs
// Testkonton för klicktestet av omgång 3 spår F (deduktiv, parti 04, admin
// Frågor), 2026-10-12.
//
//   SCRATCH=<tmp> node scripts/qa-deduktiv-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-deduktiv-konton.mjs radera
//
// skapa: tre konton qa-f-<ts>-gratis, -premium och -admin@jobbcoach-qa.test;
//   premium får Hela paketet via premium_grants, admin får super_admin i
//   admin_users (som scripts/qa-admin.ts).
// radera: bara de egna kontonas rader, via deras user_id, grantens id och
//   admin_users-raden. Räknar före varje delete (feedback_testdata_stadning).

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
const FIL = `${SCRATCH}/qa-deduktiv-konton.json`
const LOSEN = 'QaDeduktiv!2026-10-12f'
const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})
const NAMN = ['gratis', 'gratis2', 'premium', 'admin']

async function skapa() {
  const ut = las()
  const ts = ut.ts ?? Date.now()
  ut.ts = ts
  for (const namn of NAMN) {
    if (ut[namn]) continue
    const email = `qa-f-${ts}-${namn}@jobbcoach-qa.test`
    const fullName = `QA Deduktiv ${namn}`
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
        .insert({ user_id: userId, days: 7, source: 'qa-deduktiv', scope: 'allt', premium_until_after: om7 })
        .select('id')
        .single()
      if (gErr) throw new Error(`grant: ${gErr.message}`)
      ut[namn].grantId = grant.id
      spara(ut)
    }
    if (namn === 'admin') {
      const { error: aErr } = await admin.from('admin_users').insert({ id: userId, role: 'super_admin' })
      if (aErr) throw new Error(`admin_users: ${aErr.message}`)
    }
    console.log('skapad', namn, email, userId)
  }
}

/** Tabeller med user_id som klicktestet kan ha skrivit till. */
const TABELLER = [
  'logic_test_v4_sessions',
  'fraga_rapporter',
  'test_nivapunkter',
  'test_milstolpar',
  'user_activities',
  'user_activity',
  'user_activity_log',
  'test_planer',
  'premium_grants',
  'admin_users',
  'profiles',
]

async function radera() {
  const ut = las()
  for (const namn of NAMN) {
    const k = ut[namn]
    if (!k) continue
    for (const t of TABELLER) {
      const kol = t === 'profiles' || t === 'admin_users' ? 'id' : 'user_id'
      const { count, error } = await admin.from(t).select('*', { count: 'exact', head: true }).eq(kol, k.userId)
      if (error) {
        console.log(`${t}: ${error.message} (hoppas över)`)
        continue
      }
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
