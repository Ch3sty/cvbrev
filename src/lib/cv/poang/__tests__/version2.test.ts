/**
 * Poängmodellen version 2 (docs/poangmodell-cv-analys.md, 2026-11-21):
 * kontaktuppgifterna som arket visar dem, nya trösklar och genomgången.
 */
import { describe, it, expect, vi } from 'vitest'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import {
  raknaPoang,
  poangFor,
  poangForRad,
  poangsattAnalys,
  poangMedVal,
  kanonisktCv,
  arkKontakt,
  genomgang,
  POANG_VERSION,
  KATEGORIER,
  type KontaktKalla,
} from '@/lib/cv/poang'
import { profilenNamnerRollen } from '@/lib/cv/poang/modell'
import { FIXTURER } from './fixturer'

vi.mock('server-only', () => ({}))

const cvAv = (over: Partial<CVMetadata> = {}): CVMetadata => ({
  personalInfo: { fullName: '', email: '' },
  experience: [],
  education: [],
  skills: [],
  ...over,
})
const kontroll = (cv: CVMetadata, kat: string, id: string) =>
  raknaPoang(cv).kategorier.find((k) => k.id === kat)!.kontroller.find((x) => x.id === id)!.poang
const ordText = (n: number) => Array.from({ length: n }, (_, i) => `ord${i}`).join(' ')

/** Ett vanligt, korrekt CV: allt det en rekryterare vill se. Ska nå 100. */
const VANLIGT: CVMetadata = {
  personalInfo: { fullName: 'Sara Lind', email: 'sara.lind@exempel.se', phone: '070-123 45 67', address: 'Göteborg', title: 'IT-konsult' },
  summary:
    'IT-konsult med sex års erfarenhet av systemutveckling och drift åt kunder inom handel och logistik. Jag tar ansvar för helheten, från kravställning till leverans, och trivs i team där jag får coacha yngre kollegor.',
  experience: [
    {
      position: 'IT-konsult',
      company: 'Konsultbolaget',
      startDate: 'mars 2021',
      description: [
        'Ledde införandet av ett nytt lagersystem hos 3 kunder',
        'Utvecklade integrationer mot affärssystem och e-handel',
        'Coachade två juniora utvecklare i kodgranskning',
        'Ansvarade för kravställning tillsammans med kundernas verksamhet och leverantörer',
        'Planerade och genomförde utbildningar för slutanvändare på plats hos kunden',
      ],
    },
    // Ett extrajobb som pågår samtidigt, startat senare: får stå efter huvudjobbet.
    {
      position: 'Lärare i programmering',
      company: 'Folkuniversitetet',
      startDate: 'augusti 2022',
      description: ['Undervisade 20 vuxenstuderande i grundläggande programmering', 'Planerade kursens upplägg och examination'],
    },
    {
      position: 'Systemutvecklare',
      company: 'Handelsbolaget',
      startDate: 'juni 2016',
      endDate: 'februari 2021',
      description: [
        'Byggde ett kassasystem för 40 butiker',
        'Ansvarade för driften av webbutiken under högsäsong och kampanjer',
        'Förbättrade svarstiderna med 30 procent genom att se över databasen',
        'Dokumenterade rutiner för drift, backup och incidenthantering',
        'Utbildade butikspersonal i det nya kassasystemet inför lanseringen',
      ],
    },
  ],
  // Utbildningar med bara examensår, roller med månad och år: enhetligt.
  education: [
    { degree: 'Systemvetenskap, kandidat', institution: 'Göteborgs universitet', graduationYear: '2016', description: 'Examensarbete om integrationer i detaljhandeln.' },
    { degree: 'Teknikprogrammet', institution: 'Hvitfeldtska gymnasiet', graduationYear: '2013' },
  ],
  skills: [{ category: 'Kompetenser', skills: ['TypeScript', 'C#', 'SQL', 'Azure', 'Integrationer', 'Kravställning', 'Scrum'] }],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Flytande' },
  ],
}

describe('version 2: kontaktuppgifterna som arket visar dem', () => {
  const profil: NonNullable<KontaktKalla['profil']> = {
    full_name: 'Profilnamn Efternamn',
    email: 'konto@exempel.se',
    contact_email: null,
    phone: '070-765 43 21',
    location: 'Stockholm',
  }
  const utanKontakt = { ...VANLIGT, personalInfo: { fullName: 'Sara Lind', email: '' } }

  it('det som står på arket är det som poängsätts', async () => {
    const { forberedInloggatCv } = await import('@/lib/cv/forbered-inloggat-cv')
    // Förhandsvisningens uppslag med en låtsasklient som bara svarar med profilen.
    const klient = {
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: profil }), maybeSingle: async () => ({ data: profil }) }) }) }),
    }
    const fall: unknown[] = [
      utanKontakt,
      VANLIGT,
      { ...VANLIGT, personalInfo: { fullName: '[NAMN]', email: '[E-POST]', phone: '070-123 45 67' } },
      { ...VANLIGT, personalInfo: { fullName: 'Sara Lind', email: 'din@email.com', location: 'Malmö' } },
      // Inläsningens roles-format.
      { name: 'Sara Lind', roles: [], contact: { email: '', phone: '' }, profile: 'Text' },
      ...FIXTURER.map((f) => f.structured_data),
    ]
    for (const sd of fall) {
      const ark = await forberedInloggatCv(klient as never, { id: 'u', email: 'konto@exempel.se' } as never, { structuredData: sd })
      if (!ark.ok) continue
      const pi = ark.cv.personalInfo
      expect(arkKontakt(sd, { profil, anvandare: { email: 'konto@exempel.se' } })).toEqual({
        namn: pi.fullName,
        epost: pi.email,
        telefon: pi.phone ?? '',
        ort: pi.address ?? '',
      })
    }
  })

  it('ett CV utan egna kontaktuppgifter får full poäng när arket fyller dem ur profilen', () => {
    const kalla: KontaktKalla = { profil }
    const utan = poangFor(utanKontakt, null)!
    const med = poangFor(utanKontakt, null, arkKontakt(utanKontakt, kalla))!
    expect(utan.kategorier[0].poang).toBe(2)
    expect(med.kategorier[0].poang).toBe(10)
    expect(poangForRad({ structured_data: utanKontakt, kontakt: kalla })).toBe(med.total)
  })

  it('analysens tal, väljsteget och sparandet räknar med samma kontaktuppgifter', () => {
    const kalla: KontaktKalla = { profil }
    const a = poangsattAnalys(
      { structuredCV: utanKontakt, profileSummary: { improvedText: VANLIGT.summary } },
      { structured_data: utanKontakt, kontakt: kalla }
    )
    expect(a.arkKontakt).toEqual(arkKontakt(utanKontakt, kalla))
    const s = a.poang as { idag: number }
    expect(s.idag).toBe(poangForRad({ structured_data: utanKontakt, kontakt: kalla }))
    // Klienten räknar på resultatet, utan profilen: samma tal.
    expect(poangMedVal(a, { profil: false, roller: [], kompetenser: [] })!.total).toBe(s.idag)
    // CV:t som sparas har inga profilvärden införda.
    const cv = kanonisktCv(a.structuredCV)!
    expect(cv.personalInfo.email).toBe('')
  })

  it('utan profil (publika snabbpoängen) räknas CV:ts egna fält som förut', () => {
    expect(poangForRad({ structured_data: utanKontakt })).toBe(poangFor(utanKontakt)!.total)
  })
})

describe('version 2: trösklarna', () => {
  const roll = [{ position: 'Undersköterska', company: 'Region', startDate: '2020', description: [] }]

  it('version 2', () => {
    expect(POANG_VERSION).toBe(2)
  })

  it('personbeskrivning: 30 till 110 ord ger 4, 20 till 29 och 111 till 150 ger 2', () => {
    const langd = (n: number) => kontroll(cvAv({ summary: ordText(n), experience: roll }), 'profil', 'langd')
    expect(langd(19)).toBe(0)
    expect(langd(20)).toBe(2)
    expect(langd(29)).toBe(2)
    expect(langd(30)).toBe(4)
    expect(langd(110)).toBe(4)
    expect(langd(111)).toBe(2)
    expect(langd(150)).toBe(2)
    expect(langd(151)).toBe(0)
  })

  it('CV:ts längd: 150 till 1100 ord ger 3, 100 till 149 och 1101 till 1500 ger 1,5', () => {
    const langd = (n: number) => kontroll(cvAv({ projects: [{ name: '', description: ordText(n) }] }), 'format', 'langd')
    expect(langd(99)).toBe(0)
    expect(langd(100)).toBe(1.5)
    expect(langd(149)).toBe(1.5)
    expect(langd(150)).toBe(3)
    expect(langd(1100)).toBe(3)
    expect(langd(1101)).toBe(1.5)
    expect(langd(1500)).toBe(1.5)
    expect(langd(1501)).toBe(0)
  })

  it('datumformat: roller och utbildningar jämförs var för sig', () => {
    const r = (start: string, slut?: string) => ({ position: 'Säljare', company: 'Bolag', startDate: start, ...(slut ? { endDate: slut } : {}), description: [] })
    const u = (ar: string) => ({ degree: 'Ekonomi', institution: 'Skolan', graduationYear: ar })
    const enhetligt = (cv: CVMetadata) => kontroll(cv, 'format', 'enhetligt')
    // Roller med månad och år, utbildningar med bara år: enhetligt.
    expect(enhetligt(cvAv({ experience: [r('mars 2020'), r('juni 2015', 'maj 2019')], education: [u('2014')] }))).toBe(2)
    // Rollerna blandar: inte enhetligt.
    expect(enhetligt(cvAv({ experience: [r('mars 2020'), r('2015', '2019')], education: [u('2014')] }))).toBe(0)
    // Utbildningarna blandar: inte enhetligt.
    expect(
      enhetligt(cvAv({ experience: [r('2020')], education: [u('2014'), { degree: 'X', institution: 'Y', startDate: 'aug 2010', endDate: 'juni 2013' }] }))
    ).toBe(0)
  })

  it('personbeskrivningen hittar titlar med bindestreck och korta titlar', () => {
    expect(profilenNamnerRollen('Erfaren IT-konsult med fokus på drift.', ['IT-konsult'])).toBe(true)
    expect(profilenNamnerRollen('Jag är HR-chef sedan tio år.', ['HR-chef'])).toBe(true)
    expect(profilenNamnerRollen('Konsult inom IT med fokus på drift.', ['IT-konsult'])).toBe(true)
    expect(profilenNamnerRollen('Kock med passion för råvaror.', ['Kock'])).toBe(true)
    expect(profilenNamnerRollen('Jag har varit VD i fem år.', ['VD'])).toBe(true)
    // Korta titelord träffar inte mitt i andra ord.
    expect(profilenNamnerRollen('Jag har lång erfarenhet av service.', ['VD'])).toBe(false)
    expect(profilenNamnerRollen('Jag trivs med kundkontakt.', ['Säljare'])).toBe(false)
    const cv = cvAv({
      summary: 'Erfaren IT-konsult med sex års erfarenhet av drift och utveckling åt kunder.',
      experience: [{ position: 'IT-konsult', company: 'Bolag', startDate: '2020', description: [] }],
    })
    expect(kontroll(cv, 'profil', 'roll')).toBe(3)
  })

  it('roller som pågår samtidigt får stå i valfri ordning, avslutade efter pågående', () => {
    const r = (start: string, slut?: string) => ({ position: 'Säljare', company: 'Bolag', startDate: start, ...(slut ? { endDate: slut } : {}), description: [] })
    const ordning = (exp: CVMetadata['experience']) => kontroll(cvAv({ experience: exp }), 'format', 'ordning')
    expect(ordning([r('2018'), r('2021')])).toBe(3)
    expect(ordning([r('2015', '2019'), r('2018', '2019')])).toBe(3)
    expect(ordning([r('2015', '2019'), r('2020')])).toBe(0)
  })
})

describe('version 2: 100 går att nå, och varje tappad poäng syns', () => {
  it('ett vanligt, korrekt CV får 100', () => {
    const p = raknaPoang(VANLIGT)
    const tappat = p.kategorier.flatMap((k) => k.kontroller.filter((x) => x.poang < x.max).map((x) => `${k.id}.${x.id}`))
    expect(tappat).toEqual([])
    expect(p.total).toBe(100)
  })

  it('för varje fixtur: alla kontroller uppfyllda ger exakt 100, och tappade poäng summerar till 100 minus totalen', () => {
    expect(KATEGORIER.reduce((s, k) => s + k.max, 0)).toBe(100)
    for (const f of FIXTURER) {
      const p = poangFor(f.structured_data, f.cv_text)!
      // Kontrollernas max per del är delens max: allt uppfyllt är exakt 100.
      let allt = 0
      for (const k of p.kategorier) {
        expect(k.kontroller.reduce((s, x) => s + x.max, 0)).toBe(k.max)
        allt += k.kontroller.reduce((s, x) => s + x.max, 0)
      }
      expect(allt).toBe(100)
      expect(p.kategorier.reduce((s, k) => s + (k.max - k.poang), 0)).toBe(100 - p.total)
      const delar = genomgang(kanonisktCv(f.structured_data, f.cv_text)!)
      expect(delar.reduce((s, d) => s + (d.max - d.poang), 0)).toBe(100 - p.total)
    }
  })
})

describe('genomgången', () => {
  const alla: Array<{ namn: string; cv: CVMetadata }> = [
    ...FIXTURER.map((f) => ({ namn: f.namn, cv: kanonisktCv(f.structured_data, f.cv_text)! })),
    { namn: 'vanligt', cv: VANLIGT },
    { namn: 'tomt', cv: cvAv() },
  ]

  it('delarna är de sju, i dokumentets ordning, med samma poäng som modellen', () => {
    for (const { cv } of alla) {
      const p = raknaPoang(cv)
      const delar = genomgang(cv)
      expect(delar.map((d) => d.id)).toEqual(KATEGORIER.map((k) => k.id))
      expect(delar.map((d) => d.nr)).toEqual([1, 2, 3, 4, 5, 6, 7])
      expect(delar.map((d) => d.poang)).toEqual(p.kategorier.map((k) => k.poang))
    }
  })

  it('en del med tappad poäng har minst en ouppfylld kontroll med text, en del med full poäng har inga', () => {
    for (const { namn, cv } of alla) {
      for (const d of genomgang(cv)) {
        const ouppfyllda = d.kontroller.filter((k) => k.status !== 'klar')
        if (d.poang < d.max) {
          expect(ouppfyllda.length, `${namn} ${d.id}`).toBeGreaterThan(0)
          expect(ouppfyllda.some((k) => k.brister.some((b) => b.text.length > 0)), `${namn} ${d.id}`).toBe(true)
        } else {
          expect(ouppfyllda, `${namn} ${d.id}`).toEqual([])
        }
      }
    }
  })

  it('texterna har inga tankstreck och säger aldrig AI', () => {
    for (const { cv } of alla) {
      for (const d of genomgang(cv)) {
        for (const k of d.kontroller) {
          for (const t of [k.rubrik, ...k.brister.map((b) => b.text)]) {
            expect(t).not.toMatch(/[—–]/)
            expect(t).not.toMatch(/\bAI\b/)
          }
        }
      }
    }
  })

  it('pekar ut rollen och utbildningen bristen gäller', () => {
    const cv = cvAv({
      experience: [
        { position: 'Säljare', company: 'ICA', startDate: '2020', description: ['Sålde varor i butiken varje dag', 'Fyllde på hyllorna i butiken'] },
        { position: 'Kassör', company: 'Coop', startDate: '2018', endDate: '2019', description: ['Tog betalt för 300 kunder per dag', 'Räknade kassan varje kväll'] },
      ],
      education: [{ degree: 'Handelsprogrammet', institution: '' }],
    })
    const erf = genomgang(cv).find((d) => d.id === 'erfarenhet')!
    const tal = erf.kontroller.find((k) => k.id === 'tal')!
    expect(tal.status).toBe('delvis')
    expect(tal.brister).toEqual([
      { text: 'Säljare, ICA: ingen siffra. Skriv hur många, hur mycket eller hur ofta.', avsnitt: 'erfarenhet', rollIndex: 0 },
    ])
    const utb = genomgang(cv).find((d) => d.id === 'utbildning')!
    expect(utb.kontroller.find((k) => k.id === 'namn')!.brister[0]).toEqual({
      text: 'Handelsprogrammet: skolan saknas.',
      avsnitt: 'utbildning',
      utbildningIndex: 0,
    })
    expect(utb.kontroller.find((k) => k.id === 'period')!.brister[0].text).toBe('Handelsprogrammet: år saknas.')
    expect(utb.avsnitt).toBe('utbildning')
    expect(utb.post).toBe(0)
  })

  it('Öppna i CV:t får rollen som första bristen gäller', () => {
    const cv = cvAv({
      experience: [
        { position: 'Säljare', company: 'ICA', startDate: '2020', description: ['Sålde för 40 000 kronor i veckan', 'Ledde 3 kollegor i kassan'] },
        { position: 'Kassör', company: 'Coop', startDate: '2018', endDate: '2019', description: ['Tog betalt i kassan', 'Räknade kassan varje kväll'] },
      ],
    })
    const erf = genomgang(cv).find((d) => d.id === 'erfarenhet')!
    const forsta = erf.kontroller.flatMap((k) => k.brister)[0]
    expect(forsta.rollIndex).toBe(1)
    expect(erf.avsnitt).toBe('erfarenhet')
    expect(erf.post).toBe(1)
    // En del utan brist på en post får ingen post.
    const kontakt = genomgang(cv).find((d) => d.id === 'kontakt')!
    expect(kontakt.post).toBeUndefined()
  })

  it('språk och kontaktuppgifter säger vad som saknas', () => {
    const delar = genomgang(cvAv({ personalInfo: { fullName: 'Sara Lind', email: '' } }))
    const kontakt = delar.find((d) => d.id === 'kontakt')!
    expect(kontakt.kontroller.flatMap((k) => k.brister.map((b) => b.text))).toEqual([
      'E-postadress saknas.',
      'Telefonnummer saknas.',
      'Ort saknas. Det räcker med staden.',
    ])
    expect(delar.find((d) => d.id === 'sprak')!.kontroller[0].brister[0].text).toBe('Språk saknas. Lägg till dem du kan, med nivå.')
    const niva = genomgang(cvAv({ languages: [{ language: 'Svenska', proficiency: 'Modersmål' }, { language: 'Arabiska', proficiency: '' }] }))
    expect(niva.find((d) => d.id === 'sprak')!.kontroller[1].brister[0].text).toBe('Arabiska saknar nivå.')
  })

  it('fler än fem roller: upplysningen att de fem första räknas', () => {
    const roll = (i: number) => ({ position: `Roll ${i}`, company: 'Bolag', startDate: String(2020 - i), endDate: String(2021 - i), description: [] })
    const erf = genomgang(cvAv({ experience: [0, 1, 2, 3, 4, 5].map(roll) })).find((d) => d.id === 'erfarenhet')!
    expect(erf.not).toBe('De fem första rollerna räknas.')
  })

  it('kontaktuppgifterna i genomgången följer arket', () => {
    const cv = cvAv({ personalInfo: { fullName: 'Sara Lind', email: '' } })
    const ark = { namn: 'Sara Lind', epost: 'sara@exempel.se', telefon: '070-123 45 67', ort: 'Umeå' }
    const kontakt = genomgang(cv, ark).find((d) => d.id === 'kontakt')!
    expect(kontakt.poang).toBe(10)
    expect(kontakt.kontroller.every((k) => k.status === 'klar')).toBe(true)
  })
})
