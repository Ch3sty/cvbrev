// scripts/qa-kontaktepost-konton.mjs
// Testkonton för klicktestet av "E-post i CV och brev" och det numeriska
// testet (fix/kontaktepost-numeriskt, 2026-10-10).
//
//   SCRATCH=<tmp> node scripts/qa-kontaktepost-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-kontaktepost-konton.mjs radera
//
// Två konton: "allt" (Hela paketet, för brev och CV-mallar) och "gratis"
// (för det numeriska testet). Båda har bekräftad e-post, namn och ett CV.
// Id:n skrivs till $SCRATCH/qa-kontaktepost-konton.json direkt när de
// skapats. Raderingen tar bara rader med de egna kontonas user_id och
// räknar före varje delete (docs: feedback_testdata_stadning).

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
const FIL = `${SCRATCH}/qa-kontaktepost-konton.json`
const LOSEN = 'QaEpost!2026-10-10x'

const CV_TEXT = `Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.

ARBETSLIVSERFARENHET
Lagerarbetare, Nordlager AB, Örebro, 2021 till nu
Plock och pack av order, truckkörning (A- och B-behörighet), inventering i WMS.

Terminalarbetare, Bring, Jönköping, 2019 till 2021
Lastning och lossning, sortering, kontroll av fraktsedlar.

UTBILDNING
Gymnasieexamen, Handels- och administrationsprogrammet, 2019

KOMPETENSER
Truckkort A och B, WMS, inventering, ordning och reda, säkerhetstänk

E-post: [E-POST]
Telefon: [TEL]`

const STRUCTURED = {
  personalInfo: { fullName: 'QA Epost', email: '[E-POST]', phone: '', address: '' },
  summary: 'Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.',
  experience: [
    { title: 'Lagerarbetare', company: 'Nordlager AB', location: 'Örebro', startDate: '2021', endDate: 'Nu', description: ['Plock och pack av order, truckkörning, inventering i WMS.'] },
    { title: 'Terminalarbetare', company: 'Bring', location: 'Jönköping', startDate: '2019', endDate: '2021', description: ['Lastning och lossning, sortering, kontroll av fraktsedlar.'] },
  ],
  education: [{ degree: 'Gymnasieexamen, Handels- och administrationsprogrammet', school: 'Rudbecksgymnasiet', startDate: '2016', endDate: '2019' }],
  skills: ['Truckkort A och B', 'WMS', 'Inventering'],
}

const KONTON = [
  { namn: 'allt', scope: 'allt' },
  { namn: 'gratis', scope: null },
]

function spara(data) {
  fs.writeFileSync(FIL, JSON.stringify(data, null, 2))
}

async function skapa() {
  const ut = fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {}
  for (const k of KONTON) {
    if (ut[k.namn]) continue
    const email = `qa-epost-${k.namn}-2026-10-10@jobbcoach-qa.test`
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: `QA Epost ${k.namn}` },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[k.namn] = { email, password: LOSEN, userId }
    spara(ut)

    await new Promise((r) => setTimeout(r, 800))
    const profil = {
      id: userId,
      email,
      full_name: `QA Epost ${k.namn}`,
      email_verified_at: new Date().toISOString(),
      onboarding_track: k.scope ? 'allt' : 'tester',
      onboarding_track_asked_at: new Date().toISOString(),
      phone: '070 123 45 67',
      location: 'Örebro',
    }
    if (k.scope) {
      const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      Object.assign(profil, {
        subscription_tier: 'premium',
        premium_scope: k.scope,
        premium_until: om7,
        premium_source: 'stripe',
        subscription_status: 'active',
        subscription_id: `sub_qa_epost_${k.namn}`,
      })
    }
    const { error: pErr } = await admin.from('profiles').upsert(profil)
    if (pErr) throw new Error(`profil ${k.namn}: ${pErr.message}`)

    const { data: cv, error: cvErr } = await admin
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: 'QA-CV lagerarbetare.pdf',
        original_file_path: `qa/${userId}/qa-cv.pdf`,
        cv_text: CV_TEXT,
        // Utan structured_data tolkar servern cv_text, som har [E-POST]: platshållarvägen.
        structured_data: null,
      })
      .select('id')
      .single()
    if (cvErr) throw new Error(`cv ${k.namn}: ${cvErr.message}`)
    ut[k.namn].cvId = cv.id
    spara(ut)
    console.log('skapad', k.namn, userId)
  }
}

// Tabeller med user_id som QA-flödena kan ha skrivit till.
const TABELLER = [
  'letters',
  'cv_texts',
  'logic_test_v4_sessions',
  'formatted_cv_downloads',
  'user_activities',
  'job_applications',
  'onboarding_progress',
  'scheduled_emails',
  'premium_grants',
  'ai_usage_logs',
]

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const [namn, k] of Object.entries(konton)) {
    if (!k.email?.startsWith('qa-epost-') || !k.email.endsWith('@jobbcoach-qa.test')) {
      console.log('hoppar över, inte ett eget QA-konto', namn)
      continue
    }
    for (const tabell of TABELLER) {
      const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error) continue
      if (count) {
        const { error: dErr } = await admin.from(tabell).delete().eq('user_id', k.userId)
        console.log(`  ${tabell}: ${count} rader`, dErr ? dErr.message : 'raderade')
      }
    }
    const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    await admin.from('profiles').delete().eq('id', k.userId)
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, `profiler: ${pc}`, error ? error.message : 'ok')
  }
  fs.renameSync(FIL, FIL.replace('.json', '-raderade.json'))
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa eller radera')
  process.exit(1)
}
