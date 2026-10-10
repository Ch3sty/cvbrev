// scripts/sparr-testsessioner-prod.mjs
// Visar mot produktionen att en vanlig inloggad användare i dag kan skriva
// sina egna testsessioner direkt med anon-nyckeln (före
// 20261010211000_testsessioner_skrivsparr.sql), och efter att migreringen är
// körd att hon inte längre kan det.
//
//   node scripts/sparr-testsessioner-prod.mjs
//
// Skapar ett eget QA-konto (qa-sparr-<tid>@jobbcoach-qa.test), en avslutad
// session med poäng 3 via service role, och försöker sedan som användaren:
//   1. PATCH score till 15 på sin session
//   2. INSERT en redan avslutad session med poäng 15
//   3. ändra sin Big Five-profil
//   4. spara ett svar med spara_testsvar (gamla RPC:n)
// Allt återställs och raderas sedan: bara rader med det egna kontots user_id
// och de id skriptet själv skapat, räknade före delete
// (feedback_testdata_stadning). Resultatet skrivs som JSON till stdout.

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
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const admin = createClient(URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const anvandare = createClient(URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const tid = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const email = `qa-sparr-${tid}@jobbcoach-qa.test`
const losen = `QaSparr!${tid}x`
const resultat = { email, steg: {} }
const skapadeSessioner = []
let userId = null

try {
  const { data: u, error: uErr } = await admin.auth.admin.createUser({
    email,
    password: losen,
    email_confirm: true,
    user_metadata: { full_name: 'QA Spärr' },
  })
  if (uErr) throw new Error(uErr.message)
  userId = u.user.id
  resultat.userId = userId
  await new Promise((r) => setTimeout(r, 800))
  await admin.from('profiles').upsert({ id: userId, email, full_name: 'QA Spärr' })

  const { data: s, error: sErr } = await admin
    .from('logic_test_v4_sessions')
    .insert({ user_id: userId, test_type: 'matrislogik', score: 3, completed_at: new Date().toISOString(), answers: [], meta: { alternativ_blandade: true } })
    .select('id, score')
    .single()
  if (sErr) throw new Error(sErr.message)
  skapadeSessioner.push(s.id)

  const { error: inErr } = await anvandare.auth.signInWithPassword({ email, password: losen })
  if (inErr) throw new Error(inErr.message)

  // 1. PATCH score
  const patch = await anvandare
    .from('logic_test_v4_sessions')
    .update({ score: 15, time_spent: 1 })
    .eq('id', s.id)
    .select('id, score')
  const efter = await admin.from('logic_test_v4_sessions').select('score, time_spent').eq('id', s.id).single()
  resultat.steg.patch_score = {
    fel: patch.error?.message ?? null,
    rader: patch.data?.length ?? 0,
    score_fore: 3,
    score_i_databasen_efter: efter.data?.score,
    kunde_forfalska: efter.data?.score === 15,
  }
  // Återställ direkt
  await admin.from('logic_test_v4_sessions').update({ score: 3, time_spent: null }).eq('id', s.id).eq('user_id', userId)
  const aterstalld = await admin.from('logic_test_v4_sessions').select('score').eq('id', s.id).single()
  resultat.steg.patch_score.aterstalld_till = aterstalld.data?.score

  // 2. INSERT en avslutad session med poäng
  const ins = await anvandare
    .from('logic_test_v4_sessions')
    .insert({ user_id: userId, test_type: 'matrislogik', score: 15, completed_at: new Date().toISOString(), meta: { alternativ_blandade: true } })
    .select('id')
  if (ins.data?.[0]?.id) skapadeSessioner.push(ins.data[0].id)
  resultat.steg.insert_avslutad = { fel: ins.error?.message ?? null, kunde_skapa: Boolean(ins.data?.length) }

  // 3. Big Five-profilen
  const prof = await anvandare
    .from('user_personality_profile')
    .insert({ user_id: userId, source_test_type: 'personlighet-avancerad', openness: 99, conscientiousness: 99, extraversion: 99, agreeableness: 99, neuroticism: 1 })
    .select('user_id')
  resultat.steg.big_five = { fel: prof.error?.message ?? null, kunde_skriva: Boolean(prof.data?.length) }

  // 4. Gamla RPC:n med användarens session
  const rpc = await anvandare.rpc('spara_testsvar', {
    p_tabell: 'logic_test_v4_sessions',
    p_session: s.id,
    p_nycklar: ['q_id'],
    p_svar: { q_id: 'qa-sparr', selected: 0, visat: 0, correct: true },
    p_krav_oavslutad: false,
  })
  resultat.steg.spara_testsvar_som_anvandare = { fel: rpc.error?.message ?? null, svar: rpc.data }

  // 5. Nya serverfunktionen (finns först när 20261010210000 är körd)
  const srv = await admin.rpc('spara_testsvar_server', {
    p_tabell: 'logic_test_v4_sessions',
    p_session: s.id,
    p_user: userId,
    p_nycklar: ['q_id'],
    p_svar: { q_id: 'qa-sparr-server', selected: 0, visat: 0, correct: false },
    p_krav_oavslutad: false,
  })
  resultat.steg.spara_testsvar_server_som_admin = { fel: srv.error?.message ?? null, kod: srv.error?.code ?? null, svar: srv.data }
  const srvAnv = await anvandare.rpc('spara_testsvar_server', {
    p_tabell: 'logic_test_v4_sessions',
    p_session: s.id,
    p_user: userId,
    p_nycklar: ['q_id'],
    p_svar: { q_id: 'x' },
    p_krav_oavslutad: false,
  })
  resultat.steg.spara_testsvar_server_som_anvandare = { fel: srvAnv.error?.message ?? null, kod: srvAnv.error?.code ?? null }
} finally {
  // Städning: bara egna rader, räknade före delete.
  const stad = {}
  if (userId) {
    for (const tabell of ['logic_test_v4_sessions', 'personality_test_sessions', 'user_personality_profile']) {
      const { count } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', userId)
      if (count) {
        const { error } = await admin.from(tabell).delete().eq('user_id', userId)
        stad[tabell] = { raknade: count, fel: error?.message ?? null }
      }
    }
    const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', userId)
    await admin.from('profiles').delete().eq('id', userId)
    stad.profiles = pc
    const { error } = await admin.auth.admin.deleteUser(userId)
    stad.auth_user = error ? error.message : 'raderad'
  }
  stad.sessioner_skapade_av_skriptet = skapadeSessioner
  resultat.stadning = stad
  console.log(JSON.stringify(resultat, null, 2))
}
