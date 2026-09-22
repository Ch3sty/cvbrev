// scripts/qa-paket-b5-konton.mjs
// Skapar och raderar QA-konton för klicktestet av paketreleasen (B5).
//
//   node scripts/qa-paket-b5-konton.mjs skapa
//   node scripts/qa-paket-b5-konton.mjs radera
//
// Kontona skrivs till /tmp/qa-b5.json. De är bara till för klicktestet och
// raderas i samma körning som testet avslutas.

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

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const FIL = '/tmp/qa-b5.json'
const LOSEN = 'QaPaketB5!2026'

/** De fyra konton flödena behöver. */
const KONTON = [
  { nyckel: 'ny', namn: 'QA Ny Anvandare' },
  { nyckel: 'gratis', namn: 'QA Gratis' },
  { nyckel: 'cv', namn: 'QA CV-veckan' },
  { nyckel: 'tester', namn: 'QA Testveckan' },
]

async function skapa() {
  const stamp = Date.now()
  const ut = {}

  for (const k of KONTON) {
    const email = `qa-b5-${k.nyckel}-${stamp}@jobbcoach-qa.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: k.namn },
    })
    if (error) throw new Error(`${k.nyckel}: ${error.message}`)

    const userId = data.user.id

    // Profilraden skapas av en trigger. Vi väntar in den och fyller på.
    await new Promise((r) => setTimeout(r, 400))
    await admin.from('profiles').upsert({ id: userId, email, full_name: k.namn })

    ut[k.nyckel] = { email, password: LOSEN, userId }
    console.log('skapad', k.nyckel, email, userId)
  }

  fs.writeFileSync(FIL, JSON.stringify(ut, null, 2))
  console.log('skrev', FIL)
}

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const [nyckel, k] of Object.entries(konton)) {
    // Radera beroende rader först, annars stoppar främmande nycklar.
    for (const tabell of [
      'premium_grants',
      'cv_analysis_jobs',
      'letters',
      'cv_texts',
      'logic_test_v4_sessions',
      'personality_test_sessions',
      'formatted_cv_downloads',
      'scheduled_emails',
      'profiles',
    ]) {
      await admin.from(tabell).delete().eq('user_id', k.userId).then(
        () => {},
        () => {}
      )
    }
    await admin.from('profiles').delete().eq('id', k.userId).then(
      () => {},
      () => {}
    )
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', nyckel, k.userId, error ? error.message : 'ok')
  }
  fs.unlinkSync(FIL)
  console.log('tog bort', FIL)
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa eller radera')
  process.exit(1)
}
