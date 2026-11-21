import { describe, it, expect } from 'vitest'
import {
  raknaPoang,
  poangFor,
  kanonisktCv,
  byggForbattratCv,
  poangMedVal,
  poangsattAnalys,
  medSammanfattning,
  poangForRad,
  allaVal,
  forvaltVal,
  stadaKompetenser,
  KATEGORIER,
  POANG_VERSION,
  harTal,
  ersattPahittadeTal,
} from '@/lib/cv/poang'
import { talIText } from '@/lib/cv/poang/matt'
import { aterupptagning } from '@/app/dashboard/cv-analys/aterupptagning'
import { gateAnalysisResult } from '@/lib/cv/gateAnalysisResult'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { FIXTURER, type Fixtur } from './fixturer'

/** Samma data med nycklarna i omvänd ordning på varje nivå. */
function omkastad(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(omkastad)
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.keys(v as object)
        .reverse()
        .map((k) => [k, omkastad((v as Record<string, unknown>)[k])])
    )
  }
  return v
}

const analysFor = (f: Fixtur) => poangsattAnalys(f.analys, { structured_data: f.structured_data, cv_text: f.cv_text })

const cvAv = (over: Partial<CVMetadata> = {}): CVMetadata => ({
  personalInfo: { fullName: '', email: '' },
  experience: [],
  education: [],
  skills: [],
  ...over,
})

const kat = (cv: CVMetadata, id: string) => raknaPoang(cv).kategorier.find((k) => k.id === id)!.poang

describe('poängmodellen: grunder', () => {
  it('kategoriernas max summerar till 100', () => {
    expect(KATEGORIER.reduce((s, k) => s + k.max, 0)).toBe(100)
  })

  it('kategorierna summerar exakt till totalen och håller sig inom max', () => {
    for (const f of FIXTURER) {
      const p = poangFor(f.structured_data, f.cv_text)!
      expect(p.kategorier.reduce((s, k) => s + k.poang, 0)).toBe(p.total)
      for (const k of p.kategorier) {
        expect(k.poang).toBeGreaterThanOrEqual(0)
        expect(k.poang).toBeLessThanOrEqual(k.max)
        expect(Number.isInteger(k.poang)).toBe(true)
      }
    }
  })

  it('samma CV ger samma poäng, varje gång och med omkastad nyckelordning', () => {
    for (const f of FIXTURER) {
      const forsta = poangFor(f.structured_data, f.cv_text)
      for (let i = 0; i < 5; i++) expect(poangFor(f.structured_data, f.cv_text)).toEqual(forsta)
      expect(poangFor(omkastad(f.structured_data), f.cv_text)).toEqual(forsta)
    }
  })

  it('det kanoniska CV:t är idempotent', () => {
    for (const f of FIXTURER) {
      const k1 = kanonisktCv(f.structured_data, f.cv_text)!
      const k2 = kanonisktCv(k1, 'annan text som inte ska spela roll')!
      expect(k2).toEqual(k1)
      expect(raknaPoang(k2)).toEqual(raknaPoang(k1))
    }
  })

  it('städningen av kompetenser vid sparandet ändrar inte poängen', () => {
    for (const f of FIXTURER) {
      const cv = kanonisktCv(f.structured_data, f.cv_text)!
      expect(raknaPoang({ ...cv, skills: stadaKompetenser(cv.skills) }).total).toBe(raknaPoang(cv).total)
    }
  })

  it('saknad struktur ger ingen poäng alls, inte en gissning', () => {
    expect(poangFor(null)).toBeNull()
    expect(poangFor('text')).toBeNull()
    expect(poangForRad({ structured_data: null, cv_text: 'Johan' })).toBeNull()
  })

  it('ett tomt CV får 0 och 100 kräver att allt är uppfyllt', () => {
    expect(raknaPoang(cvAv()).total).toBe(0)
    const starkt = FIXTURER.find((f) => f.namn === 'starkt')!
    const p = poangFor(starkt.structured_data)!
    expect(p.total).toBe(100)
    for (const k of p.kategorier) for (const x of k.kontroller) expect(x.poang).toBe(x.max)
  })
})

describe('poängmodellen: kategorierna', () => {
  it('kontaktuppgifter: namn 2, e-post 3, telefon 3, ort 2', () => {
    expect(kat(cvAv(), 'kontakt')).toBe(0)
    expect(kat(cvAv({ personalInfo: { fullName: 'Sara Lind', email: '' } }), 'kontakt')).toBe(2)
    expect(kat(cvAv({ personalInfo: { fullName: 'Sara Lind', email: 'sara@x.se' } }), 'kontakt')).toBe(5)
    expect(kat(cvAv({ personalInfo: { fullName: 'Sara Lind', email: 'sara@x.se', phone: '070-1234567' } }), 'kontakt')).toBe(8)
    expect(
      kat(cvAv({ personalInfo: { fullName: 'Sara Lind', email: 'sara@x.se', phone: '070-1234567', location: 'Umeå' } }), 'kontakt')
    ).toBe(10)
    expect(kat(cvAv({ personalInfo: { fullName: 'Sara', email: 'inte-en-adress' } }), 'kontakt')).toBe(2)
  })

  it('kontaktuppgifter i roles-formatet läses lokalt ur CV-texten', () => {
    const p = poangFor({ roles: [], skills: [], education: [] }, 'Johan Berg\njohan@exempel.se\n070-123 45 67\n752 31 Uppsala')!
    expect(p.kategorier.find((k) => k.id === 'kontakt')!.poang).toBe(10)
  })

  it('personbeskrivning: finns, lagom lång, säger rollen, något konkret', () => {
    const roll = [{ position: 'Undersköterska', company: 'Region', startDate: '2020', description: [] }]
    const kort = 'Undersköterska med fyra års erfarenhet från äldreomsorg som trivs med att hjälpa människor varje dag.'
    expect(kat(cvAv({ summary: 'För kort.' }), 'profil')).toBe(0)
    // En rad (fem till fjorton ord) är en början: 2 för finns, plus roll och tal.
    expect(kat(cvAv({ summary: 'Undersköterska med fyra års erfarenhet', experience: roll }), 'profil')).toBe(8)
    // 15 ord: finns 5, längd 0 (under 20), roll 3, tal ("fyra") 3
    expect(kat(cvAv({ summary: kort, experience: roll }), 'profil')).toBe(11)
    const lagom = `${kort} ${kort} ${kort}`
    expect(kat(cvAv({ summary: lagom, experience: roll }), 'profil')).toBe(15)
    // Utfyllnad ger inte fler poäng: 165 ord ger noll i längd.
    const lang = Array(11).fill(kort).join(' ')
    expect(kat(cvAv({ summary: lang, experience: roll }), 'profil')).toBe(11)
  })

  it('erfarenhet: rubrikrad, beskrivning, antal punkter, siffror och verb', () => {
    const tom = cvAv({ experience: [{ position: 'Säljare', company: '', startDate: '', description: [] }] })
    // Bara "minst en roll".
    expect(kat(tom, 'erfarenhet')).toBe(5)
    const bra = cvAv({
      experience: [
        {
          position: 'Säljare',
          company: 'Elgiganten',
          startDate: '2019',
          endDate: '2023',
          description: ['Sålde hemelektronik för 4 MSEK per år', 'Ledde kampanjer i butiken', 'Utbildade nya säljare'],
        },
      ],
    })
    expect(kat(bra, 'erfarenhet')).toBe(35)
    // Utan siffror: tappar 6.
    const utanTal = cvAv({
      experience: [{ ...bra.experience[0], description: ['Sålde hemelektronik till kunder', 'Ledde kampanjer i butiken'] }],
    })
    expect(kat(utanTal, 'erfarenhet')).toBe(29)
    // Fler punkter än åtta ger inte mer: tio punkter ger halva antalpoängen.
    const manga = cvAv({
      experience: [{ ...bra.experience[0], description: Array(10).fill('Sålde hemelektronik för 4 MSEK') }],
    })
    expect(kat(manga, 'erfarenhet')).toBe(33)
  })

  it('erfarenhet: bara de fem första rollerna räknas', () => {
    const roll = (i: number, beskrivning: string[]) => ({
      position: `Roll ${i}`,
      company: 'Bolag',
      startDate: String(2020 - i),
      endDate: String(2021 - i),
      description: beskrivning,
    })
    const bra = ['Ledde 3 projekt i tid', 'Byggde en ny rutin']
    const sex = cvAv({ experience: [0, 1, 2, 3, 4].map((i) => roll(i, bra)).concat([roll(5, [])]) })
    expect(kat(sex, 'erfarenhet')).toBe(35)
  })

  it('kompetenser: finns, lagom många, korta termer', () => {
    const med = (skills: string[]) => cvAv({ skills: [{ category: '', skills }] })
    expect(kat(cvAv(), 'kompetenser')).toBe(0)
    expect(kat(med(['Excel', 'Word']), 'kompetenser')).toBe(3 + 1 + 3)
    expect(kat(med(['a1', 'b2', 'c3', 'd4', 'e5', 'f6']), 'kompetenser')).toBe(12)
    // Dubbletter räknas en gång.
    expect(kat(med(['Excel', 'excel', 'EXCEL']), 'kompetenser')).toBe(3 + 1 + 3)
    // Fler än 30 drar ner.
    expect(kat(med(Array.from({ length: 31 }, (_, i) => `Term${i}`)), 'kompetenser')).toBe(3 + 2 + 3)
    // Meningar i stället för termer drar ner.
    expect(kat(med(['Har lätt för att samarbeta med andra människor', 'Excel']), 'kompetenser')).toBe(3 + 1 + 2)
  })

  it('utbildning: finns, namn och skola, år', () => {
    expect(kat(cvAv(), 'utbildning')).toBe(0)
    expect(kat(cvAv({ education: [{ degree: 'Ekonomiprogrammet', institution: '' }] }), 'utbildning')).toBe(4)
    expect(kat(cvAv({ education: [{ degree: 'Ekonomiprogrammet', institution: 'Polhem', graduationYear: '2016' }] }), 'utbildning')).toBe(8)
  })

  it('språk: via sprakLage, nivå på varje språk', () => {
    expect(kat(cvAv(), 'sprak')).toBe(0)
    expect(kat(cvAv({ languages: [] }), 'sprak')).toBe(0)
    expect(kat(cvAv({ languages: [{ language: 'Svenska', proficiency: '' }] }), 'sprak')).toBe(3)
    expect(kat(cvAv({ languages: [{ language: 'Svenska', proficiency: 'Modersmål' }] }), 'sprak')).toBe(5)
  })

  it('språk i roles-format utan språknyckel letas upp under en språkrubrik i texten', () => {
    const p = poangFor({ roles: [], skills: [], education: [] }, 'Namn\n\nSpråk\nSvenska (modersmål), Engelska (flytande)\n')!
    expect(p.kategorier.find((k) => k.id === 'sprak')!.poang).toBe(5)
    // "svenska kunder" i löptext är inget språk.
    const q = poangFor({ roles: [], skills: [], education: [] }, 'Sålde till svenska kunder')!
    expect(q.kategorier.find((k) => k.id === 'sprak')!.poang).toBe(0)
  })

  it('format: tolkbara datum, samma format, senaste först, längd, punktlängd', () => {
    const roll = (start: string, slut?: string) => ({
      position: 'Säljare',
      company: 'Bolag',
      startDate: start,
      ...(slut ? { endDate: slut } : {}),
      description: ['Sålde varor för 2 MSEK per år'],
    })
    const omvand = cvAv({ experience: [roll('2020'), roll('2015', '2019')] })
    const rak = cvAv({ experience: [roll('2015', '2019'), roll('2020')] })
    const f = (cv: CVMetadata) => raknaPoang(cv).kategorier.find((k) => k.id === 'format')!.kontroller
    expect(f(omvand).find((k) => k.id === 'ordning')!.poang).toBe(3)
    expect(f(rak).find((k) => k.id === 'ordning')!.poang).toBe(0)
    const blandat = cvAv({ experience: [roll('mars 2020'), roll('2015', '2019')] })
    expect(f(blandat).find((k) => k.id === 'enhetligt')!.poang).toBe(0)
    expect(f(omvand).find((k) => k.id === 'enhetligt')!.poang).toBe(2)
    const otolkbar = cvAv({ experience: [roll('Period ej angiven'), roll('2015', '2019')] })
    expect(f(otolkbar).find((k) => k.id === 'datum')!.poang).toBe(2)
  })

  it('beror inte på dagens datum', () => {
    const f = FIXTURER[1]
    const forst = poangFor(f.structured_data, f.cv_text)
    const verklig = Date.now
    try {
      Date.now = () => new Date('2040-01-01').getTime()
      expect(poangFor(f.structured_data, f.cv_text)).toEqual(forst)
    } finally {
      Date.now = verklig
    }
  })
})

describe('förslagen: plus som stämmer', () => {
  it('egenskapstest: för varje fixtur och förslag är plus = poäng(infört) − poäng(nu)', () => {
    for (const f of FIXTURER) {
      const a = analysFor(f)
      const nu = raknaPoang(a.structuredCV as CVMetadata).total
      const roller = (a.roleBasedImprovements as Array<{ plus: number; atsImpact: number }>) ?? []
      roller.forEach((r, i) => {
        const med = poangMedVal(a, { profil: false, roller: [i], kompetenser: [] })!.total
        expect(med - nu).toBe(r.plus)
        expect(r.atsImpact).toBe(Math.max(0, r.plus))
      })
      const komp = (a.skillSuggestions as Array<{ plus: number }>) ?? []
      komp.forEach((s, i) => {
        const med = poangMedVal(a, { profil: false, roller: [], kompetenser: [i] })!.total
        expect(med - nu).toBe(s.plus)
      })
      const profil = a.profileSummary as { plus: number } | null
      if (profil) {
        const med = poangMedVal(a, { profil: true, roller: [], kompetenser: [] })!.total
        expect(med - nu).toBe(profil.plus)
      }
    }
  })

  it('potentialen är poängen med alla förslag införda, inte summan av plusen', () => {
    for (const f of FIXTURER) {
      const a = analysFor(f)
      const s = a.poang as { idag: number; medAlla: number; kategorier: Array<{ idag: number; medAlla: number; plus: number }> }
      expect(s.medAlla).toBe(poangMedVal(a, forvaltVal(a))!.total)
      expect(s.idag).toBe(poangForRad({ structured_data: f.structured_data, cv_text: f.cv_text }))
      expect(s.kategorier.reduce((x, k) => x + k.idag, 0)).toBe(s.idag)
      expect(s.kategorier.reduce((x, k) => x + k.medAlla, 0)).toBe(s.medAlla)
      for (const k of s.kategorier) expect(k.plus).toBe(k.medAlla - k.idag)
    }
  })

  it('införa, spara och läsa tillbaka ger exakt den utlovade poängen', () => {
    for (const f of FIXTURER) {
      const a = analysFor(f)
      const val = allaVal(a)
      const lovat = poangMedVal(a, val)!.total
      // Så som analysflödet sparar det: byggt CV, JSON till databasen,
      // CV-texten är förhandsvisningen (spelar ingen roll för poängen).
      const sparat = JSON.parse(JSON.stringify(byggForbattratCv(a, val)))
      expect(poangForRad({ structured_data: sparat, cv_text: 'Förhandsvisning med andra kontaktuppgifter 070-999 99 99' })).toBe(lovat)
      // Och den sparade analysraden för det nya CV:t visar samma tal.
      const ny = poangsattAnalys({ ...a, atsFriendliness: { score: 99 } }, { structured_data: sparat, cv_text: '' })
      expect((ny.atsFriendliness as { score: number }).score).toBe(lovat)
    }
  })

  it('redigerad text räknas på det som faktiskt sparas', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const a = analysFor(f)
    const red = { roller: new Map([[0, 'Svarade i telefon']]) }
    const val = { profil: false, roller: [0], kompetenser: [] }
    const lovat = poangMedVal(a, val, red)!.total
    const sparat = JSON.parse(JSON.stringify(byggForbattratCv(a, val, red)))
    expect(poangForRad({ structured_data: sparat })).toBe(lovat)
    expect(lovat).not.toBe(poangMedVal(a, val)!.total)
  })

  it('ett förslag utan effekt får inget plus', () => {
    const tunt = analysFor(FIXTURER.find((x) => x.namn === 'tunt')!)
    const truck = (tunt.skillSuggestions as Array<{ skill: string; atsImpact: number; plus: number }>).find(
      (s) => s.skill === 'Truckkort'
    )!
    expect(truck.plus).toBe(0)
    expect(truck.atsImpact).toBe(0)
    // Ett förslag som redan står i CV:t (samma profiltext, samma rolltext)
    // är inget kvar att göra och tas bort.
    const starkt = analysFor(FIXTURER.find((x) => x.namn === 'starkt')!)
    expect(starkt.profileSummary).toBeUndefined()
    expect(starkt.roleBasedImprovements).toEqual([])
    for (const g of (tunt.generalImprovements as Array<{ atsImpact: number }>) ?? []) expect(g.atsImpact).toBe(0)
  })

  it('förslag sorteras efter verkligt plus och sparade val följer med', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const a = poangsattAnalys(
      { ...f.analys, selectedImprovements: { profile: true, roles: [2], skills: [0, 3], general: [] } },
      { structured_data: f.structured_data, cv_text: f.cv_text }
    )
    const roller = a.roleBasedImprovements as Array<{ plus: number; roleTitle: string }>
    for (let i = 1; i < roller.length; i++) expect(roller[i - 1].plus).toBeGreaterThanOrEqual(roller[i].plus)
    const valt = a.selectedImprovements as { roles: number[]; skills: number[] }
    expect(valt.roles.map((i) => roller[i].roleTitle)).toEqual(['Servitör'])
    const komp = a.skillSuggestions as Array<{ skill: string }>
    expect(valt.skills.map((i) => komp[i].skill).sort()).toEqual(['Kundtjänst', 'Visual merchandising'])
  })

  it('rollförslag som inte matchar någon roll i CV:t tas bort', () => {
    const a = analysFor(FIXTURER.find((x) => x.namn === 'utan-struktur')!)
    expect(a.roleBasedImprovements).toEqual([])
  })
})

describe('förslagen hittar aldrig på fakta', () => {
  it('en platshållare räknas aldrig som ett tal', () => {
    expect(harTal('Besvarade [antal] kundärenden per dag')).toBe(false)
    expect(harTal('Ökade försäljningen med [X %]')).toBe(false)
    expect(harTal('Besvarade 60 kundärenden per dag')).toBe(true)
    const roll = (d: string[]) =>
      cvAv({ experience: [{ position: 'Säljare', company: 'Bolag', startDate: '2020', description: d }] })
    const tal = (cv: CVMetadata) =>
      raknaPoang(cv).kategorier.find((k) => k.id === 'erfarenhet')!.kontroller.find((x) => x.id === 'tal')!.poang
    expect(tal(roll(['Sålde [antal] abonnemang i månaden', 'Ledde kampanjer i butiken']))).toBe(0)
    expect(tal(roll(['Sålde 40 abonnemang i månaden', 'Ledde kampanjer i butiken']))).toBe(6)
  })

  it('tal som inte står i CV:t byts mot [antal] och förslaget märks fyllI', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const a = analysFor(f)
    const kanda = new Set(talIText(JSON.stringify({ ...(f.structured_data as object), personalInfo: undefined })))
    const roller = a.roleBasedImprovements as Array<{ roleTitle: string; suggestedText: string; fyllI: boolean; ersattaTal: number }>
    for (const r of roller) {
      for (const t of talIText(r.suggestedText)) expect(kanda.has(t)).toBe(true)
    }
    const telia = roller.find((r) => r.roleTitle === 'Kundtjänstmedarbetare')!
    expect(telia.suggestedText).toContain('[antal] kundärenden')
    expect(telia.suggestedText).not.toMatch(/\b60\b|8 av 10/)
    expect(telia.fyllI).toBe(true)
    expect(telia.ersattaTal).toBeGreaterThan(0)
    // Profilen granskas likadant: "60 kunder" står inte i CV:t.
    const profil = a.profileSummary as { improvedText: string; fyllI: boolean }
    expect(profil.improvedText).not.toMatch(/\b60\b/)
    expect(profil.fyllI).toBe(true)
  })

  it('tal som står i CV:t får förslaget behålla', () => {
    const a = analysFor(FIXTURER.find((x) => x.namn === 'langt')!)
    const chef = (a.roleBasedImprovements as Array<{ roleTitle: string; suggestedText: string; fyllI: boolean }>).find(
      (r) => r.roleTitle === 'Ekonomichef'
    )!
    expect(chef.suggestedText).toContain('450 anställda')
    expect(chef.fyllI).toBe(false)
  })

  it('granskningen är idempotent och kontaktuppgifternas siffror räknas inte som kända tal', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const en = analysFor(f)
    const tva = poangsattAnalys(en, { structured_data: f.structured_data, cv_text: f.cv_text })
    expect(tva.roleBasedImprovements).toEqual(en.roleBasedImprovements)
    // 070-555 12 34 i kontaktuppgifterna gör inte "555 kunder" till ett känt tal.
    const pa = poangsattAnalys(
      { ...f.analys, roleBasedImprovements: [{ roleTitle: 'Butikssäljare', company: 'Lindex', suggestedText: 'Sålde till 555 kunder i veckan' }] },
      { structured_data: f.structured_data, cv_text: f.cv_text }
    )
    expect((pa.roleBasedImprovements as Array<{ suggestedText: string }>)[0].suggestedText).toBe('Sålde till [antal] kunder i veckan')
  })

  it('ersattPahittadeTal lämnar platshållare och kända tal orörda', () => {
    const r = ersattPahittadeTal('Ledde 12 personer, [antal] projekt och 3,5 MSEK', new Set(['12']))
    expect(r.text).toBe('Ledde 12 personer, [antal] projekt och [antal] MSEK')
    expect(r.ersatta).toBe(1)
  })
})

describe('förslag som sänker poängen och förslag som överlappar', () => {
  it('ett förslag som sänker poängen är inte förvalt och räknas inte in i potentialen', () => {
    const starkt = FIXTURER.find((x) => x.namn === 'starkt')!
    const a = poangsattAnalys(
      {
        ...starkt.analys,
        // En omskrivning som tar bort siffrorna och punkterna sänker poängen.
        roleBasedImprovements: [{ roleTitle: 'Senior Projektledare', company: 'Nordea Bank', suggestedText: 'Var projektledare på banken.' }],
      },
      { structured_data: starkt.structured_data }
    )
    const roll = (a.roleBasedImprovements as Array<{ plus: number; forvald: boolean }>)[0]
    expect(roll.plus).toBeLessThan(0)
    expect(roll.forvald).toBe(false)
    const s = a.poang as { idag: number; medAlla: number }
    expect(s.medAlla).toBe(s.idag)
    expect(s.medAlla).toBeGreaterThanOrEqual(s.idag)
    expect(forvaltVal(a).roller).toEqual([])
    // Den återupptagna analysen förväljer det inte heller.
    expect(aterupptagning({ id: 'j', cvId: 'c', displayName: null, result: a }).val.roller).toEqual([])
  })

  it('potentialen är aldrig lägre än i dag eller än det bästa enskilda förslaget', () => {
    for (const f of FIXTURER) {
      const a = analysFor(f)
      const s = a.poang as { idag: number; medAlla: number }
      expect(s.medAlla).toBeGreaterThanOrEqual(s.idag)
      const alla = allaVal(a)
      const enskilda = [
        ...(alla.profil ? [poangMedVal(a, { profil: true, roller: [], kompetenser: [] })!.total] : []),
        ...alla.roller.map((i) => poangMedVal(a, { profil: false, roller: [i], kompetenser: [] })!.total),
        ...alla.kompetenser.map((i) => poangMedVal(a, { profil: false, roller: [], kompetenser: [i] })!.total),
      ]
      for (const e of enskilda) expect(s.medAlla).toBeGreaterThanOrEqual(e)
    }
  })

  it('två förslag som var för sig höjer men tillsammans sänker: bara det ena är förvalt', () => {
    // Ett CV nära gränsen 1500 ord, med fem korta kompetenser. En sjätte
    // kompetens lyfter antalet (3 till 6 poäng) och ryms under gränsen; två
    // till tar CV:t över 1500 ord och längdpoängen faller. Fyllnadstexten
    // justeras tills just det fallet uppstår.
    const ord = (n: number) => Array.from({ length: n }, (_, i) => `ord${i}`).join(' ')
    let hittad: Record<string, unknown> | null = null
    for (let n = 1460; n <= 1500 && !hittad; n++) {
      const cv = cvAv({
        personalInfo: { fullName: 'Test Person', email: 'test@exempel.se' },
        skills: [{ category: '', skills: ['Excel', 'Word', 'Visma', 'Fortnox', 'Bokföring'] }],
        projects: [{ name: 'Projekt', description: ord(n) }],
      })
      const analys = {
        structuredCV: cv,
        skillSuggestions: [
          { skill: 'Lönehantering' },
          { skill: 'Kundreskontra' },
        ],
      }
      const a = poangsattAnalys(analys, null)
      const idag = (a.poang as { idag: number }).idag
      const en = poangMedVal(a, { profil: false, roller: [], kompetenser: [0] })!.total - idag
      const tva = poangMedVal(a, { profil: false, roller: [], kompetenser: [0, 1] })!.total - idag
      if (en > 0 && tva < en) hittad = a
    }
    expect(hittad).not.toBeNull()
    const a = hittad!
    const s = a.poang as { idag: number; medAlla: number }
    const komp = a.skillSuggestions as Array<{ plus: number; forvald: boolean }>
    expect(komp.every((k) => k.plus > 0)).toBe(true)
    expect(komp.filter((k) => k.forvald)).toHaveLength(1)
    // "Med våra förslag" är sant för det som faktiskt är förvalt ...
    expect(s.medAlla).toBe(poangMedVal(a, forvaltVal(a))!.total)
    // ... och inte lägre än det bästa enskilda förslaget.
    expect(s.medAlla - s.idag).toBe(Math.max(...komp.map((k) => k.plus)))
    expect(s.medAlla).toBeGreaterThan(poangMedVal(a, allaVal(a))!.total)
  })
})

describe('gamla analyser och gratisnivån', () => {
  it('sparade analyser visas med modellens tal, aldrig AI:ns', () => {
    for (const f of FIXTURER) {
      const a = analysFor(f)
      const nu = poangForRad({ structured_data: f.structured_data, cv_text: f.cv_text })
      expect((a.atsFriendliness as { score: number }).score).toBe(nu)
      expect((a.atsFriendliness as { feedback: string }).feedback).not.toMatch(/ATS-poäng på/)
      expect(a.poangVersion).toBe(POANG_VERSION)
    }
  })

  it('utan CV-rad används analysens egen sparade struktur', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const a = poangsattAnalys({ ...f.analys, structuredCV: f.structured_data }, null)
    expect((a.atsFriendliness as { score: number }).score).toBe(poangForRad({ structured_data: f.structured_data }))
  })

  it('gratisfiltreringen behåller ett fynd, nu det med störst verkligt plus', () => {
    const f = FIXTURER.find((x) => x.namn === 'normalt')!
    const a = analysFor(f)
    const gated = medSammanfattning(gateAnalysisResult(a, false) as Record<string, unknown>)
    const profilSynlig = gated.profileSummary ? 1 : 0
    const synliga =
      profilSynlig +
      (gated.roleBasedImprovements as unknown[]).length +
      (gated.skillSuggestions as unknown[]).length +
      (gated.generalImprovements as unknown[]).length
    // Exakt ett fynd med åtgärd: profilförslaget räknas som ett fynd.
    expect(synliga).toBe(1)
    const meta = gated.gated as { findingsTotal: number; lockedFindings: Array<{ id: string; title: string }> }
    expect(meta.findingsTotal).toBe(10)
    expect(meta.lockedFindings).toHaveLength(9)
    // Det synliga fyndet är det med störst plus bland profil, roller och kompetenser.
    const allaPlus = [
      a.profileSummary as { atsImpact: number },
      ...(a.roleBasedImprovements as Array<{ atsImpact: number }>),
      ...(a.skillSuggestions as Array<{ atsImpact: number }>),
    ].map((x) => x.atsImpact)
    const synlig = [
      ...(gated.profileSummary ? [gated.profileSummary as { atsImpact: number }] : []),
      ...(gated.roleBasedImprovements as Array<{ atsImpact: number }>),
      ...(gated.skillSuggestions as Array<{ atsImpact: number }>),
    ][0]
    expect(synlig.atsImpact).toBe(Math.max(...allaPlus))
    // Potentialen räknas bara på det hon ser.
    const s = gated.poang as { medAlla: number }
    expect(s.medAlla).toBe(poangMedVal(gated, forvaltVal(gated))!.total)
    // Premium får allt orört.
    expect(gateAnalysisResult(a, true)).toBe(a)
  })
})

describe('kalibrering', () => {
  it('sprider sig rimligt: tunt lågt, genomarbetat högt', () => {
    const p = Object.fromEntries(FIXTURER.map((f) => [f.namn, poangFor(f.structured_data, f.cv_text)!.total]))
    expect(p.tunt).toBeLessThan(40)
    expect(p['utan-struktur']).toBeLessThan(40)
    expect(p.normalt).toBeGreaterThan(p.tunt)
    expect(p.normalt).toBeLessThan(p.starkt)
    expect(p.starkt).toBeGreaterThanOrEqual(90)
    expect(p.langt).toBeGreaterThanOrEqual(75)

    // Tabellen till byggnoterna och rapporten.
    const rader = FIXTURER.map((f) => {
      const a = analysFor(f)
      const s = a.poang as { idag: number; medAlla: number; kategorier: Array<{ id: string; idag: number; max: number; plus: number }> }
      return `${f.namn.padEnd(14)} ${String(s.idag).padStart(3)} -> ${String(s.medAlla).padStart(3)}  ${s.kategorier
        .map((k) => `${k.id} ${k.idag}/${k.max}${k.plus ? ` (+${k.plus})` : ''}`)
        .join(', ')}`
    })
    console.log(`\n${rader.join('\n')}\n`)
  })
})
