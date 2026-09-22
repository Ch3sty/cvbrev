// scripts/qa-paket-b6-konton.mjs
// Skapar och raderar QA-kontot för klicktestet av ångerrättssamtycket (B7).
//
//   node scripts/qa-paket-b6-konton.mjs skapa
//   node scripts/qa-paket-b6-konton.mjs radera
//
// Ett konto räcker: testet köper aldrig, det klickar fram till Stripe och
// vänder. Kontot skrivs till /tmp/qa-b7.json och raderas i samma omgång.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((r) => r.includes('=') && !r.trim().startsWith('#'))
    .map((r) => {
      const i = r.indexOf('=')
      return [r.slice(0, i).trim(), r.slice(i + 1).trim()]
    })
)

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const FIL = '/tmp/qa-b7.json'
const LOSEN = 'QaPaketB7!2026'

async function skapa() {
  const email = `qa-b7-${Date.now()}@jobbcoach-qa.test`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: LOSEN,
    email_confirm: true,
    user_metadata: { full_name: 'QA Rensning B7' },
  })
  if (error) throw new Error(error.message)
  const userId = data.user.id

  // Profilraden skapas av en trigger. Vi väntar in den och fyller på.
  await new Promise((r) => setTimeout(r, 500))
  await admin.from('profiles').upsert({ id: userId, email, full_name: 'QA Rensning B7' })

  fs.writeFileSync(FIL, JSON.stringify({ email, password: LOSEN, userId }, null, 2))
  console.log('skapad', email, userId)
}

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const k = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const tabell of ['premium_grants', 'cv_analysis_jobs', 'scheduled_emails']) {
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
  console.log('raderad', k.userId, error ? error.message : 'ok')
  fs.unlinkSync(FIL)
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa eller radera')
  process.exit(1)
}
