// scripts/qa-rummen-vag2-konton.mjs
// Testkonton för klicktestet av Rummen våg 2 (ingången, provdatumet och
// hemvyn i Rekryteringstester).
//
//   SCRATCH=<tmp> node scripts/qa-rummen-vag2-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-rummen-vag2-konton.mjs radera
//
// Tre konton, som avsnitt 1.4 kräver:
//   gratis   ny användare som valde tester vid registreringen (onboarding_intent)
//   hela     Hela paketet via en rad i premium_grants (aldrig profilens kolumner)
//   mycket   gamla testsessioner skrivs inte här: kontot används för
//            förhandsvisningen och ingången (fixturdata), eftersom
//            test_planer och testmotorns tabeller inte finns i prod än
// Id:n skrivs till $SCRATCH/qa-rummen-vag2-konton.json direkt. Raderingen tar
// bara de egna kontonas rader, via id, och räknar före varje delete
// (feedback_testdata_stadning).

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
const FIL = `${SCRATCH}/qa-rummen-vag2-konton.json`
const LOSEN = 'QaRummenVag2!2026-10-11x'
const KONTON = ['gratis', 'hela', 'mycket']

function spara(data) {
  fs.writeFileSync(FIL, JSON.stringify(data, null, 2))
}

async function skapa() {
  const ut = fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {}
  for (const namn of KONTON) {
    if (ut[namn]) continue
    const email = `qa-rummen-vag2-${namn}-2026-10-11@jobbcoach-qa.test`
    const fullName = `QA Vag2 ${namn}`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId, fullName }
    spara(ut)
    await new Promise((r) => setTimeout(r, 800))
    const { error: pErr } = await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      email_verified_at: new Date().toISOString(),
      onboarding_track: namn === 'gratis' ? 'tester' : 'allt',
      onboarding_track_asked_at: new Date().toISOString(),
      onboarding_intent: 'tester',
    })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)
    if (namn === 'hela') {
      const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: grant, error: gErr } = await admin
        .from('premium_grants')
        .insert({ user_id: userId, days: 7, source: 'qa-rummen-vag2', scope: 'allt', premium_until_after: om7 })
        .select('id')
        .single()
      if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
      ut[namn].grantId = grant.id
      spara(ut)
    }
    console.log('skapat', namn, userId)
  }
}

async function raknaOchRadera(tabell, kolumn, varde) {
  const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq(kolumn, varde)
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return console.log(`  ${tabell}: finns inte`)
    throw new Error(`${tabell}: ${error.message}`)
  }
  console.log(`  ${tabell}: ${count} rader`)
  if (!count) return
  if (count > 500) throw new Error(`${tabell}: ${count} rader är fler än ett testkonto kan ha, avbryter`)
  const { error: dErr } = await admin.from(tabell).delete().eq(kolumn, varde)
  if (dErr) throw new Error(`${tabell} delete: ${dErr.message}`)
}

async function radera() {
  if (!fs.existsSync(FIL)) return console.log('inga konton')
  const ut = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const namn of KONTON) {
    const k = ut[namn]
    if (!k) continue
    if (!/^qa-rummen-vag2-.*@jobbcoach-qa\.test$/.test(k.email)) throw new Error(`fel konto ${k.email}`)
    console.log('raderar', namn, k.userId)
    for (const t of ['test_planer', 'test_nivapunkter', 'test_milstolpar', 'logic_test_v4_sessions', 'premium_grants', 'user_activity_log']) {
      await raknaOchRadera(t, 'user_id', k.userId)
    }
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    if (error) throw new Error(`deleteUser ${namn}: ${error.message}`)
    delete ut[namn]
    spara(ut)
  }
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else console.log('skapa | radera')
