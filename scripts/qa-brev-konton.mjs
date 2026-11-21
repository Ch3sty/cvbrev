// scripts/qa-brev-konton.mjs
// Tre testkonton för brevrummet, omgång 1 (BYGGSPEC avsnitt 11).
//
//   SCRATCH=<mapp> npx tsx scripts/qa-brev-konton.mjs skapa
//   SCRATCH=<mapp> npx tsx scripts/qa-brev-konton.mjs radera
// (tsx behövs: content ritas med motorns TypeScript.)
//
// Kontona (avsändaren är påhittad: Erik Lindberg, Stockholm):
//   gratis-ny    CV, inga brev, veckokvoten orörd.
//   gratis-brev  CV, tre brev: Nordanvind Energi (inte skickat, sju krav varav
//                sex har svar, skrivet i går), Hamnstadens Bostäder (sökt
//                14 nov), Tallbacka Logistik (äldst, därmed låst). Veckans
//                gratisbrev är använt (nästa fredag 27 nov).
//   premium      Hela paketet via premium_grants (aldrig Stripe), CV i Koppar,
//                tre brev: Nordanvind i Koppar (nedladdat, inte sökt),
//                Hamnstaden i Kalksten (sökt) och ett gammalt brev utan
//                mall_id i gamla mallen Klassisk.
//
// Breven läggs in som rader direkt, utan AI-anrop. content ritas med motorns
// ritaRad (TypeScript, laddas med tsx), så att raden ser ut som en skriven.
// Id:n och lösenord skrivs till $SCRATCH/qa-konton.json direkt, aldrig i
// repot. Raderingen tar bara rader med de egna id:n ur filen och räknar före
// varje delete (feedback_testdata_stadning).

import fs from 'node:fs'
import path from 'node:path'
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
const FIL = path.join(SCRATCH, 'qa-konton.json')
const LOSEN = 'QaBrevRum!2026-11-21'
const PREFIX = 'qa-brev-2026-11-21-'
const DOMAN = '@jobbcoach-qa.test'

const spara = (d) => fs.writeFileSync(FIL, JSON.stringify(d, null, 2))
const las = () => (fs.existsSync(FIL) ? JSON.parse(fs.readFileSync(FIL, 'utf8')) : {})

// Körs med tsx (som löser @/-sökvägarna); modulerna kommer som CJS-interop.
const modul = (m) => (m.default && !m.ritaRad && !m.exempelBrev ? m.default : m)
const motor = modul(await import('../src/lib/letters/server.ts'))
const exempel = modul(await import('../src/lib/letters/brevmall/exempel.ts'))

// ---------------------------------------------------------------- innehåll

const NAMN = 'Erik Lindberg'
const TELEFON = '070-123 45 67'
const ORT = 'Stockholm'
const TITEL = 'Projektledare inom IT'

const ERFARENHET = [
  {
    position: 'Projektledare, digitala kanaler',
    company: 'Nordea',
    location: 'Stockholm',
    startDate: '2021',
    endDate: 'Nu',
    description: [
      'Ledde införandet av ny mobilbanksplattform för 1,2 miljoner kunder, team på tolv personer och budget på 15 miljoner kronor.',
      'Införde agilt arbetssätt, leveranstakten ökade med 35 procent.',
    ],
  },
  {
    position: 'Projektledare, checkout',
    company: 'Klarna',
    location: 'Stockholm',
    startDate: '2017',
    endDate: '2021',
    description: ['Ledde åtta utvecklingsprojekt inom checkout, tid till lansering kortades med 40 procent.'],
  },
]
const UTBILDNING = [
  { degree: 'Civilingenjör, industriell ekonomi', institution: 'KTH', startDate: '2011', endDate: '2016' },
]
const KOMPETENSER = ['Projektledning', 'Agilt arbetssätt (Scrum, SAFe)', 'Leverantörsstyrning', 'Budgetansvar', 'PMP']

function cvText(epost) {
  return `${NAMN}
${TITEL}
${epost}
${TELEFON}
${ORT}

Projektledare inom IT med tio års erfarenhet av stora införanden i bank och e-handel. Van att hålla ihop utvecklare, leverantörer och verksamhet i samma plan.

ARBETSLIVSERFARENHET
Projektledare, digitala kanaler, Nordea, Stockholm, 2021 till nu
Ledde införandet av ny mobilbanksplattform för 1,2 miljoner kunder, team på tolv personer och budget på 15 miljoner kronor. Införde agilt arbetssätt, leveranstakten ökade med 35 procent.

Projektledare, checkout, Klarna, Stockholm, 2017 till 2021
Ledde åtta utvecklingsprojekt inom checkout, tid till lansering kortades med 40 procent.

UTBILDNING
Civilingenjör, industriell ekonomi, KTH, 2016

KOMPETENSER
${KOMPETENSER.join(', ')}`
}

function cvStrukturerad(epost, mall) {
  return {
    personalInfo: { fullName: NAMN, email: epost, phone: TELEFON, address: ORT, title: TITEL },
    summary:
      'Projektledare inom IT med tio års erfarenhet av stora införanden i bank och e-handel. Van att hålla ihop utvecklare, leverantörer och verksamhet i samma plan.',
    experience: ERFARENHET,
    education: UTBILDNING,
    skills: [{ category: 'Kompetenser', skills: KOMPETENSER }],
    bygge: { mall },
  }
}

const ANNONS = {
  nordanvind: `IT-projektledare till kundplattformen, Nordanvind Energi, Sundsvall

Vi bygger om vår kundplattform och söker en IT-projektledare som kan leda bytet utan att våra 400 000 kunder märker av det.

Du kommer att:
- leda ett stort införande från plan till drift
- ha ansvar för budget och ett team på cirka tio personer
- hålla ihop leverantörer, utvecklare och verksamhet
- arbeta agilt och rapportera till styrgrupp

Vi tror att du har erfarenhet av att leda stora införanden, gärna i en reglerad bransch där driftsäkerhet och regelefterlevnad är viktiga. Du uttrycker dig väl i tal och skrift på svenska och engelska.

Kontaktperson: Maria Ekström, rekryterande chef. Sista ansökningsdag 30 november.`,
  hamnstaden: `Projektledare, digitala hyresgästtjänster, Hamnstadens Bostäder, Malmö

Vi är ett allmännyttigt bostadsbolag med 22 000 lägenheter. Nu tar vi våra hyresgästtjänster från blanketter till en app.

Som projektledare leder du utvecklingen tillsammans med vår IT-avdelning och externa leverantörer. Du har erfarenhet av att leda utvecklingsprojekt, arbetar nära användarna och testar tidigt. Erfarenhet av offentlig sektor är meriterande.

Frågor: Jonas Wikström, IT-chef.`,
  tallbacka: `Projektledare IT, Tallbacka Logistik, Göteborg

Tallbacka Logistik byter affärssystem på tre lager. Vi söker en projektledare som håller ihop systembytet, leverantören och lagerpersonalen. Du har lett systembyten tidigare och trivs ute i verksamheten.`,
}

const HAMNSTADEN_STYCKEN = [
  'Ni söker en projektledare som kan ta era hyresgästtjänster från blanketter till en app som folk faktiskt använder. Det är samma resa som jag ledde på Klarna, där åtta utvecklingsprojekt inom checkout kortade tiden till lansering med 40 procent.',
  'Jag arbetar nära både utvecklare och verksamhet, och jag är van vid att användarna inte alltid vill ha det beställaren tror. Därför testar jag tidigt och ofta, helst med riktiga hyresgäster i rummet.',
  'Allmännyttan har ett uppdrag jag gärna bidrar till: tjänster som fungerar för alla, även den som inte är van vid appar.',
  'Jag ser fram emot att berätta mer vid ett möte.',
]
const HAMNSTADEN_KRAV = [
  { krav: 'Leda utvecklingsprojekt', citat: 'åtta utvecklingsprojekt inom checkout kortade tiden till lansering med 40 procent' },
  { krav: 'Arbeta nära verksamheten', citat: 'Jag arbetar nära både utvecklare och verksamhet' },
  { krav: 'Testa tidigt med användare', citat: 'testar jag tidigt och ofta, helst med riktiga hyresgäster i rummet' },
]

const TALLBACKA_STYCKEN = [
  'Ett systembyte på tre lager samtidigt kräver att alla vet vad som händer och när. Det har jag erfarenhet av från Nordea, där jag ledde införandet av en ny plattform med ett team på tolv personer.',
  'Jag trivs bäst nära verksamheten och lägger gärna en dag på lagret innan planen är klar. Leverantören ska veta vad vi förväntar oss, och personalen ska veta varför vi byter.',
  'Jag berättar gärna mer om hur jag har lagt upp tidigare systembyten.',
]

const dag = (iso) => new Date(iso).toISOString()

/** Brevet som rad. content ritas med motorns ritaRad. */
function brevRad(userId, cvId, profil, epost, b) {
  const rad = {
    user_id: userId,
    cv_id: cvId,
    title: b.job_title,
    company: b.company,
    job_title: b.job_title,
    job_description: b.annons,
    tonality: 'professional',
    language: 'sv',
    is_saved: true,
    template_id: b.template_id ?? null,
    mall_id: b.mall_id ?? null,
    font_id: null,
    body_stycken: b.stycken ?? null,
    halsning: b.halsning ?? null,
    mottagare_person: b.mottagare_person ?? null,
    krav: b.krav ?? null,
    forberett_at: b.forberett_at ?? null,
    forberett_som: b.forberett_som ?? null,
    created_at: b.created_at,
    updated_at: b.updated_at,
    ai_model: 'qa-fixtur',
  }
  // Gamla brev har bara content; styckena läses ur stycken-fältet här och
  // ritas i gamla mallen, men sparas inte i body_stycken.
  const forRitning = { ...rad, body_stycken: b.stycken ?? b.gamlaStycken ?? null }
  rad.content = motor.ritaRad(forRitning, profil, { email: epost })
  return rad
}

function breven(konto) {
  const ex = exempel.exempelBrev('normal')
  const nordanvind = {
    company: 'Nordanvind Energi',
    job_title: 'IT-projektledare till kundplattformen',
    annons: ANNONS.nordanvind,
    halsning: 'Hej Maria,',
    mottagare_person: 'Maria Ekström, rekryterande chef',
    stycken: ex.stycken,
    krav: exempel.EXEMPEL_KRAV,
  }
  const hamnstaden = {
    company: 'Hamnstadens Bostäder',
    job_title: 'Projektledare, digitala hyresgästtjänster',
    annons: ANNONS.hamnstaden,
    halsning: 'Hej Jonas,',
    mottagare_person: 'Jonas Wikström, IT-chef',
    stycken: HAMNSTADEN_STYCKEN,
    krav: HAMNSTADEN_KRAV,
  }
  if (konto === 'gratis-brev') {
    return [
      { nyckel: 'nordanvind', ...nordanvind, mall_id: 'linne', created_at: dag('2026-11-20T14:12:00Z'), updated_at: dag('2026-11-20T14:20:00Z') },
      { nyckel: 'hamnstaden', ...hamnstaden, mall_id: 'linne', created_at: dag('2026-11-13T09:30:00Z'), updated_at: dag('2026-11-14T08:05:00Z'), forberett_at: dag('2026-11-14T08:00:00Z'), forberett_som: 'kopierat', sokt: '2026-11-14' },
      { nyckel: 'tallbacka', company: 'Tallbacka Logistik', job_title: 'Projektledare IT', annons: ANNONS.tallbacka, halsning: null, stycken: TALLBACKA_STYCKEN, krav: null, mall_id: 'linne', created_at: dag('2026-11-02T10:00:00Z'), updated_at: dag('2026-11-02T10:05:00Z') },
    ]
  }
  if (konto === 'premium') {
    return [
      { nyckel: 'nordanvind', ...nordanvind, mall_id: 'koppar', created_at: dag('2026-11-20T14:12:00Z'), updated_at: dag('2026-11-20T15:02:00Z'), forberett_at: dag('2026-11-20T15:00:00Z'), forberett_som: 'nedladdat' },
      { nyckel: 'hamnstaden', ...hamnstaden, mall_id: 'kalksten', created_at: dag('2026-11-13T09:30:00Z'), updated_at: dag('2026-11-14T08:05:00Z'), forberett_at: dag('2026-11-14T08:00:00Z'), forberett_som: 'nedladdat', sokt: '2026-11-14' },
      { nyckel: 'gammalt', company: 'Tallbacka Logistik', job_title: 'Projektledare IT', annons: ANNONS.tallbacka, mall_id: null, template_id: 'classic', gamlaStycken: TALLBACKA_STYCKEN, krav: null, created_at: dag('2026-10-02T10:00:00Z'), updated_at: dag('2026-10-02T10:05:00Z') },
    ]
  }
  return []
}

const KONTON = {
  'gratis-ny': { premium: false, cvMall: 'linne', har: 'CV i Linne, inga brev, veckokvoten orörd' },
  'gratis-brev': {
    premium: false,
    cvMall: 'linne',
    har: 'CV i Linne. Tre brev: Nordanvind Energi (Linne, inte skickat, 6 av 7 krav, skrivet 20 nov), Hamnstadens Bostäder (Linne, sökt 14 nov), Tallbacka Logistik (Linne, äldst, låst). Veckans gratisbrev använt, nästa fredag 27 nov.',
  },
  premium: {
    premium: true,
    cvMall: 'koppar',
    har: 'Hela paketet via premium_grants (7 dygn). CV i Koppar. Tre brev: Nordanvind Energi (Koppar, nedladdat, inte sökt), Hamnstadens Bostäder (Kalksten, sökt 14 nov), Tallbacka Logistik (gammalt brev utan mall_id, gamla mallen Klassisk).',
  },
}

// ---------------------------------------------------------------- skapa

async function skapa() {
  const ut = las()
  for (const [namn, k] of Object.entries(KONTON)) {
    if (ut[namn]?.klart) continue
    const email = `${PREFIX}${namn}${DOMAN}`
    let userId = ut[namn]?.userId
    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: LOSEN,
        email_confirm: true,
        user_metadata: { full_name: NAMN },
      })
      if (error) throw new Error(`createUser ${namn}: ${error.message}`)
      userId = data.user.id
      ut[namn] = { email, password: LOSEN, userId, har: k.har, letterIds: {}, applicationIds: [] }
      spara(ut)
      await new Promise((r) => setTimeout(r, 800))
    }

    const nu = new Date().toISOString()
    const profilPatch = {
      id: userId,
      email,
      full_name: NAMN,
      email_verified_at: nu,
      onboarding_track: 'allt',
      onboarding_track_asked_at: nu,
      phone: TELEFON,
      location: ORT,
      include_phone_in_letters: true,
      include_location_in_letters: true,
    }
    if (namn === 'gratis-brev') {
      // Veckans gratisbrev skrevs fredag 20 nov: nästa öppnar fredag 27 nov.
      profilPatch.weekly_letter_count = 1
      profilPatch.weekly_letter_first_used_at = dag('2026-11-20T14:12:00Z')
    }
    const { error: pErr } = await admin.from('profiles').upsert(profilPatch)
    if (pErr) throw new Error(`profil ${namn}: ${pErr.message}`)

    if (k.premium && !ut[namn].grantId) {
      const om7 = new Date(Date.now() + 7 * 86400000).toISOString()
      const { data: grant, error: gErr } = await admin
        .from('premium_grants')
        .insert({ user_id: userId, days: 7, source: 'qa-brev-rummet', scope: 'allt', premium_until_after: om7 })
        .select('id')
        .single()
      if (gErr) throw new Error(`grant ${namn}: ${gErr.message}`)
      ut[namn].grantId = grant.id
      spara(ut)
    }

    if (!ut[namn].cvId) {
      const { data: cv, error: cvErr } = await admin
        .from('cv_texts')
        .insert({
          user_id: userId,
          file_name: 'Erik Lindberg, projektledare',
          original_file_path: `qa/${userId}/qa-brev-cv.json`,
          cv_text: cvText(email),
          structured_data: cvStrukturerad(email, k.cvMall),
          created_at: dag('2026-11-01T09:00:00Z'),
          updated_at: dag('2026-11-01T09:00:00Z'),
        })
        .select('id')
        .single()
      if (cvErr) throw new Error(`cv ${namn}: ${cvErr.message}`)
      ut[namn].cvId = cv.id
      spara(ut)
    }

    const profil = { full_name: NAMN, email, phone: TELEFON, location: ORT, include_phone_in_letters: true, include_location_in_letters: true, titel: TITEL }
    for (const b of breven(namn)) {
      if (ut[namn].letterIds[b.nyckel]) continue
      const rad = brevRad(userId, ut[namn].cvId, profil, email, b)
      const { data: l, error: lErr } = await admin.from('letters').insert(rad).select('id').single()
      if (lErr) throw new Error(`brev ${namn}/${b.nyckel}: ${lErr.message}`)
      ut[namn].letterIds[b.nyckel] = l.id
      spara(ut)
      if (b.sokt) {
        const { data: a, error: aErr } = await admin
          .from('job_applications')
          .insert({
            user_id: userId,
            job_title: b.job_title,
            company: b.company,
            location: 'Malmö',
            application_channel: 'ad',
            letter_id: l.id,
            cv_id: ut[namn].cvId,
            applied_at: b.sokt,
          })
          .select('id')
          .single()
        if (aErr) throw new Error(`ansökan ${namn}/${b.nyckel}: ${aErr.message}`)
        ut[namn].applicationIds.push(a.id)
        spara(ut)
      }
    }
    // Letters-triggern kan ha satt updated_at vid insert: skriv tillbaka datumen.
    for (const b of breven(namn)) {
      const id = ut[namn].letterIds[b.nyckel]
      await admin.from('letters').update({ updated_at: b.updated_at }).eq('id', id).eq('user_id', userId)
    }
    ut[namn].klart = true
    spara(ut)
    console.log('skapad', namn, userId)
  }
  await matchningar(ut)
}

/**
 * Tre påhittade jobb i matchningarnas cache (job_matchings_cache), så att
 * avsnittet "Jobb att skriva till" går att se. Samma form som edge-funktionen
 * match-jobs sparar (JobTech-annonser). Ett jobb till Nordanvind med en
 * annan tjänst än brevet, så att avdubbleringen mot breven syns.
 */
function qaJobb() {
  const dag = (d) => new Date(Date.now() - d * 86400000).toISOString()
  const jobb = (id, headline, employer, ort, pub, deadline, text) => ({
    id: `qa-brev-${id}`,
    headline,
    employer: { name: employer },
    workplace_address: { municipality: ort, region: ort },
    publication_date: dag(pub),
    application_deadline: deadline,
    description: { text },
    webpage_url: null,
    relevance: 80 - id,
    occupation: { label: 'IT-projektledare' },
    must_have: { skills: [] },
  })
  return [
    jobb(1, 'Projektledare, systembyte', 'Tallbacka Logistik', 'Göteborg', 0, '2026-12-06T23:59:00Z', 'Vi byter affärssystem och söker en projektledare med erfarenhet av införandeprojekt och leverantörsstyrning.'),
    jobb(2, 'Agil projektledare', 'Hamnstadens Bostäder', 'Malmö', 1, '2026-12-09T23:59:00Z', 'Du leder ett team på tolv personer med agilt arbetssätt.'),
    jobb(3, 'Programledare, digitalisering', 'Nordanvind Energi', 'Sundsvall', 4, '2026-11-30T23:59:00Z', 'Programledning med budget på 15 miljoner och rapportering till styrgrupp.'),
    jobb(4, 'IT-projektledare till kundplattformen', 'Nordanvind Energi', 'Sundsvall', 5, '2026-11-30T23:59:00Z', 'Samma annons som brevet.'),
  ]
}

async function matchningar(ut) {
  for (const namn of Object.keys(KONTON)) {
    const k = ut[namn]
    if (!k?.userId || k.matchningar) continue
    const { error } = await admin.from('job_matchings_cache').insert({
      user_id: k.userId,
      cv_id: k.cvId,
      jobs: qaJobb(),
      search_params: { qa: 'brevrummet' },
      total_jobs_found: 4,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
    if (error) {
      console.error('matchningar', namn, error.message)
      continue
    }
    k.matchningar = true
    spara(ut)
    console.log('matchningar', namn)
  }
}

// ---------------------------------------------------------------- radera

// Tabeller med user_id som QA-flödena kan ha skrivit till.
const TABELLER = [
  'job_application_events',
  'job_applications',
  'letters',
  'job_matchings_cache',
  'cv_texts',
  'user_activities',
  'onboarding_progress',
  'scheduled_emails',
  'premium_grants',
  'ai_usage_logs',
  'letter_generation_logs',
  'daily_usage',
  'quota_walls',
  'betalvagg_visad',
  'user_ui_flags',
  'notifications',
]

async function radera() {
  if (!fs.existsSync(FIL)) {
    console.log('inget att radera')
    return
  }
  const konton = las()
  const rapport = {}
  for (const [namn, k] of Object.entries(konton)) {
    if (!k?.email?.startsWith(PREFIX) || !k.email.endsWith(DOMAN) || !k.userId) {
      console.log('hoppar över, inte ett eget QA-konto', namn)
      continue
    }
    rapport[namn] = {}
    for (const tabell of TABELLER) {
      if (tabell === 'job_application_events') {
        const ids = k.applicationIds ?? []
        if (!ids.length) continue
        const { count } = await admin.from(tabell).select('*', { count: 'exact', head: true }).in('application_id', ids)
        if (count) {
          const { error } = await admin.from(tabell).delete().in('application_id', ids)
          rapport[namn][tabell] = count
          console.log(`  ${tabell}: ${count}`, error ? error.message : 'raderade')
        }
        continue
      }
      const { count, error } = await admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', k.userId)
      if (error || !count) continue
      const { error: dErr } = await admin.from(tabell).delete().eq('user_id', k.userId)
      rapport[namn][tabell] = count
      console.log(`  ${tabell}: ${count}`, dErr ? dErr.message : 'raderade')
    }
    const { count: pc } = await admin.from('profiles').select('*', { count: 'exact', head: true }).eq('id', k.userId)
    await admin.from('profiles').delete().eq('id', k.userId)
    rapport[namn].profiles = pc
    const { error } = await admin.auth.admin.deleteUser(k.userId)
    console.log('raderad', namn, k.userId, error ? error.message : 'ok')
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
