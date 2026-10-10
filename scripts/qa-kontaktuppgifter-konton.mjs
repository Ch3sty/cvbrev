// scripts/qa-kontaktuppgifter-konton.mjs
// Testkonton för klicktestet av kontaktuppgifterna i CV och brev och
// svarssparningen i testerna (fix/kontaktepost-numeriskt, 2026-10-10).
//
//   SCRATCH=<tmp> node scripts/qa-kontaktuppgifter-konton.mjs skapa
//   SCRATCH=<tmp> node scripts/qa-kontaktuppgifter-konton.mjs radera
//
// Ett konto per vy (pixel7, desktop), så att körningarna inte delar värden.
// Hela paketet ges via en rad i premium_grants, aldrig via profilens
// premium- eller Stripe-kolumner. Varje konto får:
//   - ett CV från CV-byggaren (structured_data med profilens värden, som
//     förifyllningen sätter dem)
//   - ett CV importerat från LinkedIn före fixen ("Ditt namn",
//     din@email.com, "Professionell titel")
// Id:n skrivs till $SCRATCH/qa-kontaktuppgifter-konton.json direkt. Raderingen
// tar bara rader med de egna kontonas user_id och räknar före varje delete
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
const FIL = `${SCRATCH}/qa-kontaktuppgifter-konton.json`
const LOSEN = 'QaKontakt!2026-10-10x'

const ERFARENHET = [
  { position: 'Lagerarbetare', company: 'Nordlager AB', location: 'Örebro', startDate: '2021', endDate: 'Nu', description: ['Plock och pack av order, truckkörning, inventering i WMS.'] },
  { position: 'Terminalarbetare', company: 'Bring', location: 'Jönköping', startDate: '2019', endDate: '2021', description: ['Lastning och lossning, sortering, kontroll av fraktsedlar.'] },
]
const UTBILDNING = [{ degree: 'Gymnasieexamen, Handels- och administrationsprogrammet', institution: 'Rudbecksgymnasiet', startDate: '2016', endDate: '2019' }]

const CV_TEXT = `Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.

ARBETSLIVSERFARENHET
Lagerarbetare, Nordlager AB, Örebro, 2021 till nu
Plock och pack av order, truckkörning (A- och B-behörighet), inventering i WMS.

Terminalarbetare, Bring, Jönköping, 2019 till 2021
Lastning och lossning, sortering, kontroll av fraktsedlar.

UTBILDNING
Gymnasieexamen, Handels- och administrationsprogrammet, 2019

KOMPETENSER
Truckkort A och B, WMS, inventering, ordning och reda, säkerhetstänk`

const KONTON = ['pixel7', 'desktop']

function spara(data) {
  fs.writeFileSync(FIL, JSON.stringify(data, null, 2))
}

async function skapa() {
  const ut = fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {}
  for (const namn of KONTON) {
    if (ut[namn]) continue
    const email = `qa-kontakt-${namn}-2026-10-10@jobbcoach-qa.test`
    const fullName = `QA Kontakt ${namn}`
    const phone = '070 111 22 33'
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId, fullName, phone }
    spara(ut)

    await new Promise((r) => setTimeout(r, 800))
    const { error: pErr } = await admin.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      email_verified_at: new Date().toISOString(),
      onboarding_track: 'allt',
      onboarding_track_asked_at: new Date().toISOString(),
      phone,
      location: 'Örebro',
      include_phone_in_letters: true,
      include_location_in_letters: true,
    })
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    const om7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: grant, error: gErr } = await admin
      .from('premium_grants')
      .insert({ user_id: userId, days: 7, source: 'qa-kontaktuppgifter', scope: 'allt', premium_until_after: om7 })
      .select('id')
      .single()
    if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
    ut[namn].grantId = grant.id
    spara(ut)

    // CV-byggaren: förifyllt med profilens värden.
    const { data: cv, error: cvErr } = await admin
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: 'QA-CV byggaren.pdf',
        original_file_path: `qa/${userId}/qa-cv-byggaren.json`,
        cv_text: `${fullName}\n${email}\n${phone}\nÖrebro\n\n${CV_TEXT}`,
        structured_data: {
          personalInfo: { fullName, email, phone, address: 'Örebro', title: 'Lagerarbetare' },
          summary: 'Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.',
          experience: ERFARENHET,
          education: UTBILDNING,
          skills: [{ category: 'Kompetenser', skills: ['Truckkort A och B', 'WMS', 'Inventering'] }],
        },
      })
      .select('id')
      .single()
    if (cvErr) throw new Error(`cv ${namn}: ${cvErr.message}`)
    ut[namn].cvId = cv.id
    spara(ut)

    // LinkedIn-import före fixen: platshållarna sparades i structured_data.
    const { data: li, error: liErr } = await admin
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: 'LinkedIn CV 2026-09-30',
        original_file_path: `linkedin/${userId}/qa-gammal.json`,
        cv_text: `Ditt namn\ndin@email.com\n\n${CV_TEXT}`,
        structured_data: {
          personalInfo: { fullName: 'Ditt namn', email: 'din@email.com', title: 'Professionell titel' },
          summary: 'Erfaren lagerarbetare med fem års erfarenhet av truckkörning, plock och inventering.',
          experience: ERFARENHET,
          education: UTBILDNING,
          skills: [{ category: 'Kompetenser', skills: ['Truckkort A och B', 'WMS', 'Inventering'] }],
        },
      })
      .select('id')
      .single()
    if (liErr) throw new Error(`linkedin-cv ${namn}: ${liErr.message}`)
    ut[namn].linkedinGammalId = li.id
    spara(ut)
    console.log('skapad', namn, userId)
  }
}

// Tabeller med user_id som QA-flödena kan ha skrivit till.
const TABELLER = [
  'letters',
  'cv_texts',
  'logic_test_v4_sessions',
  'personality_test_sessions',
  'formatted_cv_downloads',
  'user_activities',
  'job_applications',
  'onboarding_progress',
  'scheduled_emails',
  'premium_grants',
  'ai_usage_logs',
  'letter_generation_logs',
  'daily_usage',
]

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  const rapport = {}
  for (const [namn, k] of Object.entries(konton)) {
    if (!k.email?.startsWith('qa-kontakt-') || !k.email.endsWith('@jobbcoach-qa.test')) {
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
        console.log(`  ${tabell}: ${count} rader`, dErr ? dErr.message : 'raderade')
      }
    }
    const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    await admin.from('profiles').delete().eq('id', k.userId)
    rapport[namn].profiles = pc
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, `profiler: ${pc}`, error ? error.message : 'ok')
  }
  fs.writeFileSync(FIL.replace('.json', '-raderingsrapport.json'), JSON.stringify(rapport, null, 2))
  fs.renameSync(FIL, FIL.replace('.json', '-raderade.json'))
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else {
  console.error('ange skapa eller radera')
  process.exit(1)
}
