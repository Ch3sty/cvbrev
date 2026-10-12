// scripts/qa-tratt-stada.mjs
// Raderar kontona och smakprovstoken som qa-tratt-valkommen.mjs skapade, per
// id och token ur scripts/.qa-tratt-konton.json. Räknar raderna före varje
// delete (feedback_testdata_stadning). Inga tidsfönster, inga mönster.
//
//   node scripts/qa-tratt-stada.mjs           # räkna bara
//   node scripts/qa-tratt-stada.mjs --radera  # räkna och radera

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => {
    const i = r.indexOf('=')
    return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
  })
)
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
const FIL = 'scripts/.qa-tratt-konton.json'
const RADERA = process.argv.includes('--radera')
const k = JSON.parse(fs.readFileSync(FIL, 'utf8'))

const TABELLER = [
  'logic_test_v4_sessions', 'test_nivapunkter', 'test_milstolpar', 'test_planer', 'fraga_rapporter', 'test_attempts', 'test_user_stats',
  'user_activities', 'onboarding_progress', 'email_schedule', 'scheduled_emails', 'email_log', 'email_confirmations', 'user_ui_flags',
  'notifications', 'premium_grants', 'daily_usage_stats', 'personality_test_sessions', 'anon_test_sessions',
]

for (const tok of k.tokens) {
  const { count } = await sb.from('anon_test_sessions').select('*', { count: 'exact', head: true }).eq('token', tok)
  console.log(`anon_test_sessions token ${tok}: ${count ?? 0}`)
  if (RADERA && count) {
    const { error } = await sb.from('anon_test_sessions').delete().eq('token', tok)
    console.log('  ', error ? 'FEL ' + error.message : 'raderad')
  }
}
for (const { id, email } of k.konton) {
  console.log(`\n${email} ${id}`)
  for (const t of TABELLER) {
    const kol = t === 'anon_test_sessions' ? 'claimed_by' : 'user_id'
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true }).eq(kol, id)
    if (error || !count) continue
    console.log(`  ${t}: ${count}`)
    if (RADERA) {
      const { error: d } = await sb.from(t).delete().eq(kol, id)
      if (d) console.log('    FEL', d.message)
    }
  }
  const { count: pc } = await sb.from('profiles').select('*', { count: 'exact', head: true }).eq('id', id)
  console.log(`  profiles: ${pc ?? 0}`)
  if (RADERA) {
    if (pc) await sb.from('profiles').delete().eq('id', id)
    const { error } = await sb.auth.admin.deleteUser(id)
    console.log('  auth-kontot', error ? 'FEL ' + error.message : 'raderat')
  }
}
if (RADERA) fs.unlinkSync(FIL)
