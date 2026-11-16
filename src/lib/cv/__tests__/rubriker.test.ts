import { describe, it, expect } from 'vitest'
import {
  BIBLIOTEK,
  RUBRIK_MAX,
  SEKTIONER,
  STANDARD,
  UPPSATTNINGAR,
  UPPSATTNING_IDS,
  forvalFor,
  rensaRubrik,
  rensaRubriker,
  rubrik,
  rubriker,
  uppsattningForTitel,
} from '../rubriker'
import { normalizeStructuredData } from '../normalize-structured-data'
import type { CVMetadata } from '../cv-metadata'
import { KORT_CV, NORMALT_CV, LANGT_CV } from '../word/__tests__/fixtures'

const cvMed = (titel: string, extra: Partial<CVMetadata> = {}): CVMetadata => ({
  personalInfo: { fullName: 'Test Testsson', email: 't@exempel.se', title: titel },
  experience: [{ position: titel, company: 'Företaget AB', startDate: '2020', description: ['Gör saker'] }],
  education: [],
  skills: [],
  ...extra,
})

describe('biblioteket och uppsättningarna', () => {
  it('varje avsnitt har ett förval, inga och-tecken och inga dubbletter', () => {
    for (const s of SEKTIONER) {
      const lista = BIBLIOTEK[s]
      expect(lista.length).toBeGreaterThan(0)
      expect(STANDARD[s]).toBe(lista[0])
      expect(new Set(lista).size).toBe(lista.length)
      for (const r of lista) {
        expect(r).not.toMatch(/&/)
        expect(r.length).toBeLessThanOrEqual(RUBRIK_MAX)
      }
    }
  })

  it('förvalen är dagens standardrubriker', () => {
    expect(STANDARD.erfarenhet).toBe('Arbetslivserfarenhet')
    expect(STANDARD.utbildning).toBe('Utbildning')
    expect(STANDARD.kompetenser).toBe('Kompetenser')
    expect(STANDARD.sprak).toBe('Språk')
  })

  it('tolv uppsättningar, och varje rubrik i dem finns i biblioteket', () => {
    expect(UPPSATTNING_IDS).toHaveLength(12)
    for (const id of UPPSATTNING_IDS) {
      for (const [s, r] of Object.entries(UPPSATTNINGAR[id])) {
        expect(BIBLIOTEK[s as keyof typeof BIBLIOTEK]).toContain(r)
      }
    }
  })
})

describe('förvalet per uppsättning', () => {
  const fall: [string, string][] = [
    ['Undersköterska', 'vard'],
    ['Legitimerad sjuksköterska', 'vard'],
    ['Systemutvecklare', 'it'],
    ['Projektledare inom IT', 'it'],
    ['Butikssäljare', 'butik'],
    ['Snickare', 'bygg'],
    ['Elektriker', 'bygg'],
    ['Lagerarbetare', 'lager'],
    ['Truckförare', 'lager'],
    ['Redovisningsekonom', 'ekonomi'],
    ['Socialsekreterare', 'offentlig'],
    ['Handläggare', 'offentlig'],
    ['Förskollärare', 'skola'],
    ['Lärare i matematik', 'skola'],
    ['Kock', 'restaurang'],
    ['Servitör', 'restaurang'],
    ['Student', 'student'],
    ['Enhetschef', 'chef'],
    ['Ekonomichef', 'chef'],
    ['VD', 'chef'],
  ]
  for (const [titel, vantat] of fall) {
    it(`${titel} ger ${vantat}`, () => {
      expect(forvalFor(cvMed(titel))).toBe(vantat)
      expect(uppsattningForTitel(titel)).toBe(vantat)
    })
  }

  it('fixturerna får rimliga förval', () => {
    expect(forvalFor(KORT_CV)).toBe('vard')
    expect(forvalFor(NORMALT_CV)).toBe('it')
    // Ekonomichef med redovisning och controlling i titeln: facket väger tyngst.
    expect(forvalFor(LANGT_CV)).toBe('ekonomi')
  })

  it('svag signal ger allmän', () => {
    expect(forvalFor(cvMed(''))).toBe('allman')
    expect(forvalFor(cvMed('Konsult'))).toBe('allman')
    expect(forvalFor(cvMed('Koordinator'))).toBe('allman')
    expect(forvalFor(null)).toBe('allman')
    expect(uppsattningForTitel('')).toBe('allman')
    expect(uppsattningForTitel(undefined)).toBe('allman')
    // "kvalitet" innehåller "it" men är inget IT-ord.
    expect(uppsattningForTitel('Kvalitetssamordnare')).toBe('allman')
  })

  it('ett enda kompetensord räcker inte', () => {
    expect(forvalFor(cvMed('', { experience: [], skills: [{ category: 'Övrigt', skills: ['Python'] }] }))).toBe('allman')
  })

  it('utan erfarenhet men med utbildning blir det student', () => {
    const cv = cvMed('', {
      experience: [],
      education: [{ degree: 'Kandidatprogram i statistik', institution: 'Umeå universitet', startDate: '2023' }],
    })
    expect(forvalFor(cv)).toBe('student')
  })
})

describe('rubrik()', () => {
  it('följer ordningen val, sparat, uppsättning, standard', () => {
    const cv = { ...cvMed('Undersköterska'), sectionTitles: { kompetenser: 'Mina styrkor' } }
    expect(rubrik('kompetenser', cv, { rubriker: { kompetenser: 'Det jag kan' } })).toBe('Det jag kan')
    expect(rubrik('kompetenser', cv)).toBe('Mina styrkor')
    expect(rubrik('erfarenhet', cv)).toBe('Klinisk erfarenhet')
    expect(rubrik('erfarenhet', cv, { uppsattning: 'allman' })).toBe('Arbetslivserfarenhet')
    expect(rubrik('sprak', cv)).toBe('Språk')
  })

  it('en okänd uppsättning ignoreras', () => {
    expect(rubrik('erfarenhet', cvMed('Undersköterska'), { uppsattning: 'finns-inte' })).toBe('Klinisk erfarenhet')
  })

  it('egen rubrik högst 40 tecken, utan taggar och radbrytningar', () => {
    const lang = 'Det här är en mycket lång rubrik som inte får plats på raden'
    const r = rubrik('profil', cvMed(''), { rubriker: { profil: lang } })
    expect(r.length).toBeLessThanOrEqual(RUBRIK_MAX)
    expect(lang.startsWith(r)).toBe(true)
    expect(rensaRubrik('<b>Om</b>\n mig ')).toBe('Om mig')
    expect(rensaRubrik('   ')).toBe('')
    expect(rensaRubrik(42)).toBe('')
  })

  it('tom vald rubrik faller tillbaka till förslaget', () => {
    expect(rubrik('profil', cvMed('Kock'), { rubriker: { profil: '  ' } })).toBe('Om mig')
  })

  it('rensaRubriker släpper bara kända avsnitt', () => {
    expect(rensaRubriker({ profil: 'Om mig', okand: 'x', erfarenhet: '', sprak: 4 })).toEqual({ profil: 'Om mig' })
    expect(rensaRubriker(null)).toEqual({})
    expect(rensaRubriker(['a'])).toEqual({})
  })

  it('rubriker() ger en rubrik per avsnitt', () => {
    const r = rubriker(NORMALT_CV)
    expect(Object.keys(r).sort()).toEqual([...SEKTIONER].sort())
    expect(r.kompetenser).toBe('Tekniska kompetenser')
  })
})

describe('alla tre CV-formaten', () => {
  it('CVMetadata med sparade rubriker', () => {
    const cv = normalizeStructuredData({ ...KORT_CV, sectionTitles: { erfarenhet: 'Anställningar' } })!
    expect(rubrik('erfarenhet', cv)).toBe('Anställningar')
    expect(rubrik('intyg', cv)).toBe('Legitimation och behörigheter')
  })

  it('gammalt ParsedCV-format normaliseras och får förval', () => {
    const gammalt = {
      name: 'Åsa Öberg',
      contact: { email: 'asa@exempel.se' },
      profile: 'Undersköterska med lång erfarenhet.',
      roles: [{ title: 'Undersköterska', company: 'Region Västmanland', period: '2019 – Pågående', responsibilities: ['Omvårdnad'] }],
      education: [],
      skills: ['Omvårdnad'],
    }
    const cv = normalizeStructuredData(gammalt)
    expect(cv).not.toBeNull()
    expect(forvalFor(cv)).toBe('vard')
    expect(rubrik('erfarenhet', cv)).toBe('Klinisk erfarenhet')
  })

  it('CV utan strukturerad data (null) ger standardrubriker', () => {
    expect(rubriker(null)).toEqual(STANDARD)
  })
})
