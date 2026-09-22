// scripts/qa-paket-d1-konton.mjs
// Skapar och raderar QA-kontona för klicktestet av prissidan och köpvägen (D1).
//
//   node scripts/qa-paket-d1-konton.mjs skapa
//   node scripts/qa-paket-d1-konton.mjs radera
//
// Tre konton: gratis, CV-veckan och Allt-veckan. Spår- och Allt-kontona får
// en löpande prenumeration direkt i profiles (premium_scope, premium_until,
// subscription_status, subscription_id), så kontosidan visar rätt läge utan
// Stripe. Kontona skrivs till scratchpad-filen och raderas i samma omgång.

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

const FIL = process.env.QA_KONTON_FIL || path.resolve('scripts/.qa-d1-konton.json')
const LOSEN = 'QaPaketD1!2026'

const KONTON = [
  { namn: 'gratis', scope: null },
  { namn: 'cv', scope: 'cv' },
  { namn: 'allt', scope: 'allt' },
]

async function skapa() {
  const ut = {}
  for (const k of KONTON) {
    const email = `qa-d1-${k.namn}-${Date.now()}@jobbcoach-qa.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: `QA D1 ${k.namn}` },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id

    // Profilraden skapas av en trigger. Vi väntar in den och fyller på.
    await new Promise((r) => setTimeout(r, 600))
    const profil = { id: userId, email, full_name: `QA D1 ${k.namn}` }
    if (k.scope) {
      const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      Object.assign(profil, {
        subscription_tier: 'premium',
        premium_scope: k.scope,
        premium_until: om7,
        premium_source: 'stripe',
        subscription_status: 'active',
        subscription_id: `sub_qa_d1_${k.namn}`,
        onboarding_track: k.scope === 'cv' ? 'cv' : 'allt',
      })
    }
    const { error: pErr } = await admin.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${k.namn}: ${pErr.message}`)

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
    for (const tabell of ['premium_grants', 'cv_analysis_jobs', 'scheduled_emails', 'onboarding_progress']) {
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
