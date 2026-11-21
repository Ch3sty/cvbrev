// scripts/qa-cv-rummet-konton.mjs
// Testkonton för CV-rummet, omgång 1 (docs/bygg-noter-cv-rummet.md): ett
// konto per läge på Ditt CV, så att skärmdumparna visar riktiga rader.
//
//   SCRATCH=<mapp> node scripts/qa-cv-rummet-konton.mjs skapa
//   SCRATCH=<mapp> node scripts/qa-cv-rummet-konton.mjs radera
//
//   ny            gratis, inget CV (Två sätt att börja)
//   oanalyserat   gratis, ett CV utan analys, språken inlästa och tomma
//   gratis        gratis, tre CV: det analyserade (nyast), ett utan struktur
//                 och ett låst; gratisanalysen använd
//   premium       Premium, två CV: ett analyserat med språk och ett utkast
//                 ur CV-byggaren
//   nedladdat     gratis, ett analyserat CV, gratisnedladdningen använd
//                 (Mallar: merförsäljningen i stället för filen)
//
// QA_TAGG=<tagg> ger egna adresser (qa-cv-rummet-<namn><tagg>-...), så att
// två agenter kan ha egna konton samtidigt.
//
// Id:n skrivs till $SCRATCH/qa-cv-rummet-konton.json direkt efter varje
// rad. Raderingen tar bara rader med de egna kontonas user_id, räknar före
// varje delete och rör aldrig något annat konto (feedback_testdata_stadning).

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
const FIL = `${SCRATCH}/qa-cv-rummet-konton.json`
const LOSEN = 'QaCvRummet!2026-11-21x'
const DAG = '2026-11-21'

const ERFARENHET = [
  {
    position: 'Senior Projektledare',
    company: 'Nordea Bank',
    location: 'Stockholm',
    startDate: '2021',
    endDate: 'Nu',
    description: [
      'Ledde införandet av ett nytt kundsystem för 1 200 användare, i tid och under budget.',
      'Samordnade fyra team med totalt 28 personer i en agil leveransmodell.',
    ],
  },
  {
    position: 'Projektledare',
    company: 'Tieto Sverige',
    location: 'Stockholm',
    startDate: '2017',
    endDate: '2021',
    description: ['Ansvarade för migrering av ekonomisystem för tre kommuner.', 'Budgetansvar upp till 14 miljoner kronor.'],
  },
  {
    position: 'Biträdande projektledare',
    company: 'Tieto Sverige',
    location: 'Stockholm',
    startDate: '2014',
    endDate: '2017',
    description: ['Planering, uppföljning och rapportering till styrgrupp.'],
  },
]
const UTBILDNING = [
  { degree: 'Civilingenjör, Industriell ekonomi', institution: 'KTH', startDate: '2009', endDate: '2014' },
]
const KOMPETENSER = [{ category: 'Kompetenser', skills: ['Projektledning', 'Agila metoder', 'Scrum', 'Budgetansvar', 'Upphandling', 'Jira'] }]

function cvData(namn, email, sprak) {
  const d = {
    personalInfo: { fullName: namn, email, phone: '070 123 45 67', address: 'Stockholm', title: 'Projektledare inom IT' },
    summary:
      'Erfaren projektledare med tio år i bank och offentlig sektor. Leder införanden av verksamhetssystem från förstudie till förvaltning.',
    experience: ERFARENHET,
    education: UTBILDNING,
    skills: KOMPETENSER,
  }
  if (sprak !== undefined) d.languages = sprak
  return d
}

const CV_TEXT = (namn) => `${namn}
Projektledare inom IT

Erfaren projektledare med tio år i bank och offentlig sektor.

ARBETSLIVSERFARENHET
Senior Projektledare, Nordea Bank, 2021 till nu
Projektledare, Tieto Sverige, 2017 till 2021
Biträdande projektledare, Tieto Sverige, 2014 till 2017

UTBILDNING
Civilingenjör, Industriell ekonomi, KTH, 2014

KOMPETENSER
Projektledning, agila metoder, Scrum, budgetansvar, upphandling, Jira`

/** Ett sparat analysresultat i samma form som /api/cv/analyze skriver det. */
const RESULTAT = {
  atsFriendliness: { score: 62, feedback: 'Strukturen går att läsa, men sammanfattningen och rollerna saknar nyckelord.' },
  profileSummary: {
    original: 'Erfaren projektledare med tio år i bank och offentlig sektor.',
    improved:
      'Projektledare inom IT med tio års erfarenhet av att leda införanden av verksamhetssystem i bank och offentlig sektor, från förstudie till förvaltning.',
    atsImpact: 8,
  },
  roleBasedImprovements: [
    { roleTitle: 'Senior Projektledare', company: 'Nordea Bank', atsImpact: 6, improvedDescription: 'Ledde införandet av ett nytt kundsystem för 1 200 användare.' },
    { roleTitle: 'Biträdande projektledare', company: 'Tieto Sverige', atsImpact: 3, improvedDescription: 'Planerade och följde upp leveranser för styrgruppen.' },
  ],
  skillSuggestions: [
    { skill: 'Intressenthantering', atsImpact: 3, relevance: 'high' },
    { skill: 'Power BI', atsImpact: 2, relevance: 'medium' },
  ],
  generalImprovements: [],
}

const KONTON = ['ny', 'oanalyserat', 'gratis', 'premium', 'nedladdat']
const TAGG = process.env.QA_TAGG ?? ''

function spara(data) {
  fs.writeFileSync(FIL, JSON.stringify(data, null, 2))
}

const sekunderSedan = (s) => new Date(Date.now() - s * 1000).toISOString()

async function nyttCv(userId, rad) {
  const { data, error } = await admin.from('cv_texts').insert({ user_id: userId, ...rad }).select('id').single()
  if (error) throw new Error(`cv_texts: ${error.message}`)
  return data.id
}

async function skapa() {
  const ut = fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {}
  for (const namn of KONTON) {
    if (ut[namn]) continue
    const email = `qa-cv-rummet-${namn}${TAGG}-${DAG}@jobbcoach-qa.test`
    const fullName = 'Erik Lindberg'
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: LOSEN,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId, cv: {} }
    spara(ut)

    await new Promise((r) => setTimeout(r, 800))
    const premium = namn === 'premium'
    const { error: pErr } = await admin
      .from('profiles')
      .update({
        full_name: fullName,
        phone: '070 123 45 67',
        location: 'Stockholm',
        email_verified_at: new Date().toISOString(),
        onboarding_track: 'cv',
        onboarding_track_asked_at: new Date().toISOString(),
        free_cv_exports_used: namn === 'nedladdat' ? 1 : 0,
        weekly_competence_analysis_count: namn === 'gratis' ? 1 : 0,
        subscription_tier: premium ? 'premium' : 'free',
        premium_scope: premium ? 'allt' : null,
        premium_until: premium ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
      })
      .eq('id', userId)
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    if (namn === 'oanalyserat') {
      ut[namn].cv.oanalyserat = await nyttCv(userId, {
        file_name: 'Erik Lindberg, projektledare',
        original_file_path: `qa/${userId}/erik.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: cvData(fullName, email, []),
        created_at: sekunderSedan(3600),
      })
      spara(ut)
    }

    if (namn === 'nedladdat') {
      ut[namn].cv.analyserat = await nyttCv(userId, {
        file_name: 'Erik Lindberg, projektledare',
        original_file_path: `qa/${userId}/erik.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: cvData(fullName, email, []),
        created_at: sekunderSedan(2 * 86400),
      })
      spara(ut)
    }

    if (namn === 'gratis') {
      ut[namn].cv.last = await nyttCv(userId, {
        file_name: 'Erik Lindberg 2023',
        original_file_path: `qa/${userId}/erik-2023.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: cvData(fullName, email),
        created_at: sekunderSedan(90 * 86400),
      })
      spara(ut)
      ut[namn].cv.utanStruktur = await nyttCv(userId, {
        file_name: 'Erik Lindberg, gammalt',
        original_file_path: `qa/${userId}/erik-gammalt.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: null,
        created_at: sekunderSedan(30 * 86400),
      })
      spara(ut)
      ut[namn].cv.analyserat = await nyttCv(userId, {
        file_name: 'Erik Lindberg, projektledare',
        original_file_path: `qa/${userId}/erik.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: cvData(fullName, email, []),
        created_at: sekunderSedan(2 * 86400),
      })
      spara(ut)
    }

    if (premium) {
      ut[namn].cv.utkast = await nyttCv(userId, {
        file_name: 'Kundtjänstmedarbetare',
        original_file_path: '',
        cv_text: '',
        structured_data: {
          personalInfo: { fullName, email, phone: '070 123 45 67', address: 'Stockholm', title: 'Kundtjänstmedarbetare' },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
          bygge: { utkast: true },
        },
        created_at: sekunderSedan(5 * 86400),
      })
      spara(ut)
      ut[namn].cv.analyserat = await nyttCv(userId, {
        file_name: 'Erik Lindberg, projektledare',
        original_file_path: `qa/${userId}/erik.pdf`,
        cv_text: CV_TEXT(fullName),
        structured_data: cvData(fullName, email, [
          { language: 'Svenska', proficiency: 'Modersmål' },
          { language: 'Engelska', proficiency: 'Flytande' },
        ]),
        created_at: sekunderSedan(2 * 86400),
      })
      spara(ut)
    }

    const analyserat = ut[namn].cv.analyserat
    if (analyserat) {
      const { data: jobb, error: jErr } = await admin
        .from('cv_analysis_jobs')
        .insert({
          user_id: userId,
          cv_id: analyserat,
          status: 'completed',
          usage_counted: true,
          display_name: 'Erik Lindberg, projektledare',
          completed_at: sekunderSedan(86400),
          result: RESULTAT,
        })
        .select('id')
        .single()
      if (jErr) throw new Error(`analys ${namn}: ${jErr.message}`)
      ut[namn].jobbId = jobb.id
      spara(ut)
    }
    console.log('skapad', namn, userId)
  }
}

const TABELLER = [
  'cv_analysis_jobs',
  'cv_texts',
  'formatted_cv_downloads',
  'letters',
  'user_activities',
  'onboarding_progress',
  'scheduled_emails',
  'premium_grants',
  'ai_usage_logs',
  'ai_usage_costs',
  'daily_usage',
]

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = JSON.parse(fs.readFileSync(FIL, 'utf8'))
  for (const [namn, k] of Object.entries(konton)) {
    if (!k.email?.startsWith('qa-cv-rummet-') || !k.email.endsWith('@jobbcoach-qa.test')) {
      console.log('hoppar över, inte ett eget QA-konto', namn)
      continue
    }
    for (const tabell of TABELLER) {
      const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await admin.from(tabell).delete().eq('user_id', k.userId)
      console.log(`  ${namn} ${tabell}: ${count} rader`, dErr ? dErr.message : 'raderade')
    }
    const { data: filer } = await admin.storage.from('cvs').list(`users/${k.userId}`)
    const vagar = (filer ?? []).map((f) => `users/${k.userId}/${f.name}`)
    if (vagar.length) {
      const { error: sErr } = await admin.storage.from('cvs').remove(vagar)
      console.log(`  ${namn} cvs: ${vagar.length} filer`, sErr ? sErr.message : 'raderade')
    }
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, error ? error.message : 'ok')
  }
  fs.unlinkSync(FIL)
  console.log('tog bort', FIL)
}

const cmd = process.argv[2]
if (cmd === 'skapa') await skapa()
else if (cmd === 'radera') await radera()
else console.log('skapa eller radera')
