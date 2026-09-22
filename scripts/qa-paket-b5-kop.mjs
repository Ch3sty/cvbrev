// scripts/qa-paket-b5-kop.mjs
// Simulerar webhookens köpgren för QA-kontona (B5).
//
//   node scripts/qa-paket-b5-kop.mjs
//
// Stripe-nyckeln i miljön är en live-nyckel, så klicktestet får aldrig
// fullfölja en riktig betalning. Den här filen gör exakt det webhooken hade
// gjort efter invoice.payment_succeeded: sätter premium_scope och
// premium_until på profilen och anropar onWeekStarted, så att veckoserien
// schemaläggs. Inget annat.

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

const konton = JSON.parse(fs.readFileSync('/tmp/qa-b5.json', 'utf8'))

/** En vecka fram, precis som en veckoprenumerations första period. */
const enVecka = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

const KOP = [
  { nyckel: 'ny', scope: 'cv', track: 'cv' },
  { nyckel: 'cv', scope: 'cv', track: 'cv' },
  { nyckel: 'tester', scope: 'tester', track: 'tester' },
]

for (const k of KOP) {
  const konto = konton[k.nyckel]
  if (!konto) continue

  const { error } = await admin
    .from('profiles')
    .update({
      premium_scope: k.scope,
      premium_until: enVecka,
      subscription_tier: 'premium',
      subscription_status: 'active',
      onboarding_track: k.track,
      week_started_at: new Date().toISOString(),
      week_progress_day: 1,
    })
    .eq('id', konto.userId)

  console.log(k.nyckel, k.scope, error ? `FEL ${error.message}` : 'ok')
}

// Veckoserien: samma anrop webhooken gör. Importeras efter uppdateringen så
// att hooken ser samma tillstånd som den hade sett i skarpt läge.
const { onWeekStarted } = await import('../src/lib/email/lifecycle/hooks.ts').catch(() => ({
  onWeekStarted: null,
}))

if (onWeekStarted) {
  for (const k of KOP) {
    const konto = konton[k.nyckel]
    if (!konto) continue
    await onWeekStarted(admin, konto.userId, k.track)
    console.log('veckoserie schemalagd', k.nyckel, k.track)
  }
} else {
  console.log('onWeekStarted kunde inte importeras direkt (ts), hoppar schemaläggningen')
}
