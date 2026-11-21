// scripts/qa-cv-analys-konton.mjs
// Testkonton för Analys-sidan (CV-rummet steg 4, docs/bygg-noter-cv-rummet.md):
// ett konto per läge, med en analysrad i samma form som analysfunktionen
// skriver den (förslagstexter, inga tal: talen räknas av poängmodellen).
//
//   SCRATCH=<mapp> node scripts/qa-cv-analys-konton.mjs skapa
//   SCRATCH=<mapp> node scripts/qa-cv-analys-konton.mjs radera
//
//   gratis     gratis, ett analyserat CV (gratisanalysen använd)
//   sparr      gratis, ett CV utan analys, gratisanalysen använd
//   struktur   gratis, ett CV utan struktur med en analys utan egen struktur
//   intro      gratis, ett CV utan analys, analysen kvar
//   premium    Premium, ett analyserat CV och ett utan analys
//
// Id:n skrivs till $SCRATCH/qa-cv-analys-konton.json direkt efter varje rad.
// Raderingen tar bara rader med de egna kontonas user_id, räknar före varje
// delete och rör aldrig något annat konto. Ingen analys körs: raderna är
// testdata (inga AI-anrop).

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
const FIL = `${SCRATCH}/qa-cv-analys-konton.json`
const LOSEN = 'QaCvAnalys4!2026-11-21x'
const PREFIX = 'qa-cv-analys4-'
const DOMAN = '@jobbcoach-qa.test'

const NAMN = 'Erik Lindberg'

function cvData(email) {
  return {
    personalInfo: { fullName: NAMN, email, phone: '070 123 45 67', address: 'Stockholm', title: 'Projektledare inom IT' },
    summary:
      'Erfaren projektledare med 6+ års erfarenhet av att leda digitala transformationsprojekt inom bank och fintech. Certifierad i Scrum, SAFe och PMP. Stark kommunikatör.',
    experience: [
      {
        position: 'Senior Projektledare',
        company: 'Nordea Bank',
        startDate: '2021',
        description: [
          'Leder ett tvärfunktionellt team på 12 personer i införandet av en ny mobilbanksplattform',
          'Ansvarig för budget på 15 MSEK och rapportering till styrgrupp',
        ],
      },
      {
        position: 'Projektledare',
        company: 'Klarna',
        startDate: '2018',
        endDate: '2021',
        description: ['Projekt inom checkout och betalningslösningar.'],
      },
      {
        position: 'Biträdande projektledare',
        company: 'Tieto Sverige',
        startDate: '2016',
        endDate: '2018',
        description: ['Planering och uppföljning av leveranser.', 'Användartester och utbildning av handläggare.'],
      },
    ],
    education: [{ degree: 'Civilingenjör, Industriell ekonomi', institution: 'KTH', startDate: '2011', endDate: '2016' }],
    skills: [{ category: 'Kompetenser', skills: ['Scrum', 'Kanban', 'SAFe', 'Jira', 'Confluence'] }],
    languages: [
      { language: 'Svenska', proficiency: 'Modersmål' },
      { language: 'Engelska', proficiency: '' },
    ],
  }
}

const CV_TEXT = `${NAMN}
Projektledare inom IT
Stockholm

PROFIL
Erfaren projektledare med 6+ års erfarenhet av att leda digitala transformationsprojekt.

ARBETSLIVSERFARENHET
Senior Projektledare, Nordea Bank, 2021 till nu
Projektledare, Klarna, 2018 till 2021
Biträdande projektledare, Tieto Sverige, 2016 till 2018`

/** Ett analysresultat i analysfunktionens form (förslagstexter, inga tal). */
const RESULTAT = {
  analysisType: 'full',
  profileSummary: {
    currentText: 'Erfaren projektledare med 6+ års erfarenhet.',
    improvedText:
      'Jag är senior projektledare inom bank och fintech med sex års erfarenhet av digitala transformationsprojekt. På Nordea Bank leder jag ett team på 12 personer och ansvarar för en budget på 15 MSEK. Jag är certifierad i Scrum, SAFe och PMP och söker nu en roll som programledare.',
    changes: ['Rollen står först', 'Resultat med siffra'],
  },
  roleBasedImprovements: [
    {
      roleTitle: 'Projektledare',
      company: 'Klarna',
      period: '2018 - 2021',
      suggestedText:
        'Ledde 8 produktutvecklingsprojekt inom checkout och betalningslösningar\nInförde Scrum i [antal] team och kortade tiden till lansering\nSamordnade releaseplaneringen för utvecklingsteamen',
      improvements: { hasQuantification: false, keywords: ['Scrum', 'checkout'], grammarIssues: [], atsOptimization: true },
    },
    {
      roleTitle: 'Biträdande projektledare',
      company: 'Tieto Sverige',
      period: '2016 - 2018',
      suggestedText:
        'Planerade och följde upp leveranser i ett byte av ärendehanteringssystem\nHöll i användartester och utbildade 40 handläggare i det nya systemet',
      improvements: { hasQuantification: false, keywords: ['Användartester'], grammarIssues: [], atsOptimization: true },
    },
  ],
  skillSuggestions: [
    { skill: 'Riskhantering', relevance: 'high', source: 'Senior Projektledare på Nordea Bank', reasoning: 'Efterfrågas ofta för rollen.' },
    { skill: 'Intressenthantering', relevance: 'high', source: 'Senior Projektledare på Nordea Bank', reasoning: 'Efterfrågas ofta för rollen.' },
    { skill: 'Budgetuppföljning', relevance: 'medium', source: 'Senior Projektledare på Nordea Bank', reasoning: 'Efterfrågas ofta för rollen.' },
  ],
  generalImprovements: [{ title: 'Ange nivå på engelskan', description: 'Skriv vilken nivå du har på engelska.', category: 'Innehåll' }],
  keywords: ['Projektledning', 'Scrum', 'SAFe'],
  atsFriendliness: { score: null, feedback: '', missingKeywords: [] },
}

const KONTON = ['gratis', 'sparr', 'struktur', 'intro', 'premium']

const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const sekunderSedan = (s) => new Date(Date.now() - s * 1000).toISOString()

async function nyttCv(userId, rad) {
  const { data, error } = await admin.from('cv_texts').insert({ user_id: userId, ...rad }).select('id').single()
  if (error) throw new Error(`cv_texts: ${error.message}`)
  return data.id
}

async function nyAnalys(userId, cvId, result, usageCounted) {
  const { data, error } = await admin
    .from('cv_analysis_jobs')
    .insert({
      user_id: userId,
      cv_id: cvId,
      status: 'completed',
      usage_counted: usageCounted,
      completion_handled: true,
      display_name: 'Erik Lindberg, projektledare',
      completed_at: sekunderSedan(3 * 86400),
      result,
    })
    .select('id')
    .single()
  if (error) throw new Error(`analys: ${error.message}`)
  return data.id
}

async function skapa() {
  const ut = fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {}
  for (const namn of KONTON) {
    if (ut[namn]) continue
    const email = `${PREFIX}${namn}${DOMAN}`
    const { data, error } = await admin.auth.admin.createUser({ email, password: LOSEN, email_confirm: true, user_metadata: { full_name: NAMN } })
    if (error) throw new Error(error.message)
    const userId = data.user.id
    ut[namn] = { email, password: LOSEN, userId, cv: {}, jobb: {} }
    spara(ut)
    await new Promise((r) => setTimeout(r, 800))
    const premium = namn === 'premium'
    const { error: pErr } = await admin
      .from('profiles')
      .update({
        full_name: NAMN,
        phone: '070 123 45 67',
        location: 'Stockholm',
        email_verified_at: new Date().toISOString(),
        onboarding_track: 'cv',
        onboarding_track_asked_at: new Date().toISOString(),
        subscription_tier: premium ? 'premium' : 'free',
        premium_scope: premium ? 'allt' : null,
        premium_until: premium ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
      })
      .eq('id', userId)
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    const cv = (fil, struktur = true, dagar = 4) =>
      nyttCv(userId, {
        file_name: fil,
        original_file_path: `qa/${userId}/${fil.replace(/\W+/g, '-')}.pdf`,
        cv_text: CV_TEXT,
        structured_data: struktur ? cvData(email) : null,
        created_at: sekunderSedan(dagar * 86400),
      })

    if (namn === 'gratis' || namn === 'premium') {
      ut[namn].cv.analyserat = await cv('Erik Lindberg, projektledare')
      spara(ut)
      ut[namn].jobb.analyserat = await nyAnalys(userId, ut[namn].cv.analyserat, RESULTAT, true)
      spara(ut)
    }
    if (namn === 'premium') {
      ut[namn].cv.oanalyserat = await cv('Erik Lindberg, utan analys')
      spara(ut)
    }
    if (namn === 'sparr') {
      // Gratisanalysen använd på ett äldre CV; det nyaste saknar analys.
      ut[namn].cv.gammalt = await cv('Erik Lindberg, 2023', true, 30)
      spara(ut)
      ut[namn].jobb.anvand = await nyAnalys(userId, ut[namn].cv.gammalt, RESULTAT, true)
      spara(ut)
      ut[namn].cv.oanalyserat = await cv('Erik Lindberg, projektledare', true, 1)
      spara(ut)
    }
    if (namn === 'struktur') {
      ut[namn].cv.utanStruktur = await cv('Erik Lindberg, gammalt', false)
      spara(ut)
      const { structuredCV: _s, ...utan } = RESULTAT
      ut[namn].jobb.utanStruktur = await nyAnalys(userId, ut[namn].cv.utanStruktur, utan, false)
      spara(ut)
    }
    if (namn === 'intro') {
      ut[namn].cv.oanalyserat = await cv('Erik Lindberg, projektledare')
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
    if (!k.email?.startsWith(PREFIX) || !k.email.endsWith(DOMAN)) {
      console.log('hoppar över, inte ett eget QA-konto', namn)
      continue
    }
    for (const tabell of TABELLER) {
      const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await admin.from(tabell).delete().eq('user_id', k.userId)
      console.log(`  ${namn} ${tabell}: ${count} rader`, dErr ? dErr.message : 'raderade')
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
