// scripts/qa-paket-d2-konton.mjs
// Skapar och raderar QA-kontona för klicktestet av onboardingen (D2).
//
//   node scripts/qa-paket-d2-konton.mjs skapa
//   node scripts/qa-paket-d2-konton.mjs radera
//
// Fyra konton: gratis, CV-veckan, Testveckan och Allt-veckan. De betalande
// får en löpande prenumeration direkt i profiles (premium_scope,
// premium_until, current_period_end, subscription_status, subscription_id),
// så menyn, hjälpredan och de gråade vyerna visar rätt läge utan Stripe.
// Kontona skrivs till en fil och raderas i samma omgång.

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

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

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const FIL = process.env.QA_KONTON_FIL || path.resolve('scripts/.qa-d2-konton.json')
const LOSEN = 'QaPaketD2!2026'

const KONTON = [
  { namn: 'gratis', scope: null, track: null },
  { namn: 'cv', scope: 'cv', track: 'cv' },
  { namn: 'tester', scope: 'tester', track: 'tester' },
  { namn: 'allt', scope: 'allt', track: 'allt' },
]

async function skapa() {
  const ut = {}
  for (const k of KONTON) {
    const email = `qa-d2-${k.namn}-${Date.now()}@jobbcoach-qa.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: `Anna ${k.namn}` },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id

    await new Promise((r) => setTimeout(r, 600))
    const profil = { id: userId, email, full_name: `Anna ${k.namn}`, goal_role: 'Projektledare', location: 'Göteborg' }
    if (k.scope) {
      const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      Object.assign(profil, {
        subscription_tier: 'premium',
        premium_scope: k.scope,
        premium_until: om7,
        current_period_end: om7,
        premium_source: 'stripe',
        subscription_status: 'active',
        subscription_id: `sub_qa_d2_${k.namn}`,
        onboarding_track: k.track,
      })
    }
    const { error: pErr } = await admin.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${k.namn}: ${pErr.message}`)

    // Ett uppladdat CV på CV-veckan och Allt, så välkomstskärmens variant
    // "Och ett CV redan" och hjälpredans klara brickor går att se.
    if (k.scope === 'cv' || k.scope === 'allt') {
      const { error: cvErr } = await admin.from('cv_texts').insert({
        user_id: userId,
        file_name: 'Anna_CV.pdf',
        original_file_path: `qa/${userId}/Anna_CV.pdf`,
        cv_text: 'Anna Andersson. Projektledare med sju års erfarenhet av IT-projekt i offentlig sektor. Erfarenhet av upphandling, agila team och budgetansvar.',
      })
      if (cvErr) console.warn('cv', k.namn, cvErr.message)
    }

    ut[k.namn] = { email, password: LOSEN, userId }
    console.log('skapad', k.namn, email, userId)
  }
  fs.writeFileSync(FIL, JSON.stringify(ut, null, 2))
}

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const [namn, k] of Object.entries(konton)) {
    for (const tabell of ['cv_texts', 'premium_grants', 'cv_analysis_jobs', 'email_schedule', 'email_log', 'user_activities', 'logic_test_v4_sessions']) {
      await admin
        .from(tabell)
        .delete()
        .eq('user_id', k.userId)
        .then(
          () => {},
          () => {}
        )
    }
    await admin
      .from('profiles')
      .delete()
      .eq('id', k.userId)
      .then(
        () => {},
        () => {}
      )
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, error ? error.message : 'ok')
  }
  fs.unlinkSync(FIL)
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa eller radera')
  process.exit(1)
}
