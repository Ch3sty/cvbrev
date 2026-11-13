// scripts/qa-kampanj-konton.mjs
// Testkonton för klicktestet av Black Week och Cyber Monday (lib/kampanj),
// 2026-11-13.
//
//   SCRATCH=<tmp> node scripts/qa-kampanj-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-kampanj-konton.mjs radera
//
// skapa: två konton qa-kampanj-<ts>-gratis och -betalt@jobbcoach-qa.test.
//   betalt har subscription_status 'canceled', alltså en före detta kund
//   som inte ska få kampanjpriset.
// radera: bara de egna kontonas rader, via deras user_id. Räknar före varje
//   delete (feedback_testdata_stadning).

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
const FIL = `${SCRATCH}/qa-kampanj-konton.json`
const LOSEN = 'QaKampanj!2026-11-13'
const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})
const NAMN = ['gratis', 'betalt']

async function skapa() {
  const ut = las()
  const ts = ut.ts ?? Date.now()
  ut.ts = ts
  for (const namn of NAMN) {
    if (ut[namn]) continue
    const email = `qa-kampanj-${ts}-${namn}@jobbcoach-qa.test`
    const fullName = `QA Kampanj ${namn}`
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
      ...(namn === 'betalt' ? { subscription_status: 'canceled' } : {}),
    })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)
    console.log('skapad', namn, email, userId)
  }
}

const TABELLER = ['user_activities', 'user_activity', 'user_activity_log', 'email_log', 'email_schedule', 'test_planer', 'profiles']

async function radera() {
  const ut = las()
  for (const namn of NAMN) {
    const k = ut[namn]
    if (!k) continue
    for (const t of TABELLER) {
      const kol = t === 'profiles' ? 'id' : 'user_id'
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
