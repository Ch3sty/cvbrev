// scripts/qa-rummen-3-konton.mjs
// Kopia av qa-rummen-3c-konton.mjs för design/rummen-3 (bankversion 2, 2026-10-11), ett konto.
// Testkonton och testrader för klicktestet av blandade svarsalternativ i
// matrislogiken (fix/matris-blanda-alternativ, 2026-10-10).
//
//   SCRATCH=<tmp> node scripts/qa-matris-blandning-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-matris-blandning-konton.mjs gamla
//   SCRATCH=<tmp> node scripts/qa-matris-blandning-konton.mjs radera
//
// skapa: två konton (a, b) med Hela paketet via premium_grants, så att
//   expertnivån går att starta.
// gamla: per konto en avslutad och en pågående grundsession i det gamla
//   formatet (före fixen): utan meta, svaren bara med selected.
// radera: bara rader med de egna kontonas user_id och de anonyma prov vars
//   token klicktestet skrev till $SCRATCH/qa-rummen-3-anon-tokens.json. Räknar
//   före varje delete (feedback_testdata_stadning).

import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { hashString, mulberry32 } from './lib/blanda-alternativ.mjs'

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
const FIL = `${SCRATCH}/qa-rummen-3-konton.json`
const ANON = `${SCRATCH}/qa-rummen-3-anon-tokens.json`
const LOSEN = 'QaMatris!2026-10-10x'
const KONTON = ['a']

const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})

async function skapa() {
  const ut = las()
  for (const namn of KONTON) {
    if (ut[namn]) continue
    const email = `qa-rummen-3-${namn}-2026-10-11@jobbcoach-qa.test`
    const fullName = `QA Rummen 3 ${namn.toUpperCase()}`
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
      onboarding_track: 'allt',
      onboarding_track_asked_at: new Date().toISOString(),
    })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)
    const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
    const { data: grant, error: gErr } = await admin
      .from('premium_grants')
      .insert({ user_id: userId, days: 7, source: 'qa-rummen-3', scope: 'allt', premium_until_after: om7 })
      .select('id')
      .single()
    if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
    ut[namn].grantId = grant.id
    spara(ut)
    console.log('skapad', namn, userId)
  }
}

/** Samma urval som selectQuestionsForSession (15 ur grundpoolen). */
function urval(pool, sessionId, n = 15) {
  const s = [...pool]
  const rng = mulberry32(hashString(sessionId))
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[s[i], s[j]] = [s[j], s[i]]
  }
  return s.slice(0, n)
}

async function gamla() {
  const ut = las()
  const grund = JSON.parse(fs.readFileSync('src/lib/logicTestV7/questionBankGrund.v7.json', 'utf8'))
  for (const namn of KONTON) {
    const k = ut[namn]
    if (!k || k.gammalKlar) continue
    // Avslutad: 10 rätt (alternativ A, som banken har facit), 5 fel (B).
    const klarId = randomUUID()
    const fr = urval(grund, klarId)
    const svar = fr.map((q, i) => {
      const selected = i < 10 ? q.correctAnswer : (q.correctAnswer + 1) % 6
      return { q_id: q.id, selected, correct: selected === q.correctAnswer, time_spent: 20 }
    })
    const igar = new Date(Date.now() - 86400000)
    const { error: e1 } = await admin.from('logic_test_v4_sessions').insert({
      id: klarId,
      user_id: k.userId,
      test_type: 'matrislogik',
      answers: svar,
      score: 10,
      time_spent: 300,
      started_at: igar.toISOString(),
      created_at: igar.toISOString(),
      completed_at: new Date(igar.getTime() + 300000).toISOString(),
    })
    if (e1) throw new Error(`gammal klar ${namn}: ${e1.message}`)
    // Pågående: två svar, C och E (bankens ordning).
    const pagId = randomUUID()
    const fr2 = urval(grund, pagId)
    const { error: e2 } = await admin.from('logic_test_v4_sessions').insert({
      id: pagId,
      user_id: k.userId,
      test_type: 'matrislogik',
      answers: [
        { q_id: fr2[0].id, selected: 2, correct: fr2[0].correctAnswer === 2, time_spent: 15 },
        { q_id: fr2[1].id, selected: 4, correct: fr2[1].correctAnswer === 4, time_spent: 15 },
      ],
      started_at: igar.toISOString(),
      created_at: igar.toISOString(),
    })
    if (e2) throw new Error(`gammal pågående ${namn}: ${e2.message}`)
    k.gammalKlar = klarId
    k.gammalPagaende = pagId
    spara(ut)
    console.log('gamla sessioner', namn, klarId, pagId)
  }
}

const TABELLER = [
  'logic_test_v4_sessions',
  'user_activities',
  'onboarding_progress',
  'scheduled_emails',
  'premium_grants',
  'daily_usage',
]

async function radera() {
  const konton = las()
  const rapport = {}
  for (const [namn, k] of Object.entries(konton)) {
    if (!k.email?.startsWith('qa-rummen-3-') || !k.email.endsWith('@jobbcoach-qa.test')) {
      console.log('hoppar över, inte ett eget QA-konto', namn)
      continue
    }
    rapport[namn] = {}
    for (const tabell of TABELLER) {
      const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error) continue
      if (count) {
        const { error: dErr } = await admin.from(tabell).delete().eq('user_id', k.userId)
        rapport[namn][tabell] = count
        console.log(`  ${namn} ${tabell}: ${count} rader`, dErr ? dErr.message : 'raderade')
      }
    }
    const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    await admin.from('profiles').delete().eq('id', k.userId)
    rapport[namn].profiles = pc
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, `profiler: ${pc}`, error ? error.message : 'ok')
  }
  if (fs.existsSync(ANON)) {
    const tokens = JSON.parse(fs.readFileSync(ANON, 'utf8'))
    if (tokens.length) {
      const { count } = await admin.from('anon_test_sessions').select('*', { count: 'exact', head: true }).in('token', tokens)
      const { error } = await admin.from('anon_test_sessions').delete().in('token', tokens)
      rapport.anon_test_sessions = count
      console.log(`  anon_test_sessions: ${count} rader (${tokens.length} token)`, error ? error.message : 'raderade')
    }
  }
  fs.writeFileSync(`${SCRATCH}/qa-rummen-3-raderingsrapport.json`, JSON.stringify(rapport, null, 2))
  if (fs.existsSync(FIL)) fs.renameSync(FIL, FIL.replace('.json', '-raderade.json'))
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'gamla') await gamla()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa, gamla eller radera')
  process.exit(1)
}
