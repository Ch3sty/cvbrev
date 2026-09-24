// Hjälpredan Kom igång: listorna, ordningen och kvitteringen
// (docs/design/spec-onboarding-2026-09-22.html, sektion 2 och 6).
import { describe, it, expect } from 'vitest'
import {
  KOM_IGANG_LISTA,
  brickaText,
  komIgangLage,
  komIgangRadText,
  komIgangRubrik,
  valkommen,
  valkommenMedCv,
} from '../komigang'
import { brickorForTestType, harledProvade, sparadeNycklar, type ProvadeUnderlag } from '../komigang-server'
import { menyHuvud, menyRad, mellanskillnadKr, ellerAlltKnapp, graEtikettTest } from '../paket-rader'
import { PLAN_BY_KEY } from '@/lib/plans/plans'

const TOMT: ProvadeUnderlag = {
  sparade: [],
  goalRole: null,
  location: null,
  cvCount: 0,
  analysisCompleted: 0,
  matchCount: 0,
  templateDownloads: 0,
  letterCount: 0,
  linkedinCount: 0,
  visibility: null,
  conversationCount: 0,
  testTypes: [],
  personalityCompleted: 0,
}

describe('listorna', () => {
  // Intervjuprovet tillkom i Test och Allt 2026-09-24 (rod-trad-prov-spec).
  it('har exakt specens antal: CV 8, Test 9, Allt 12, gratis 5', () => {
    expect(KOM_IGANG_LISTA.cv).toHaveLength(8)
    expect(KOM_IGANG_LISTA.tester).toHaveLength(9)
    expect(KOM_IGANG_LISTA.allt).toHaveLength(12)
    expect(KOM_IGANG_LISTA.gratis).toHaveLength(5)
  })

  it('profilen är första brickan i alla paket, och CV:t direkt efter i CV och Allt', () => {
    for (const lista of Object.values(KOM_IGANG_LISTA)) expect(lista[0]).toBe('profil')
    expect(KOM_IGANG_LISTA.cv[1]).toBe('cv_upp')
    expect(KOM_IGANG_LISTA.allt[1]).toBe('cv_upp')
    expect(KOM_IGANG_LISTA.tester[1]).toBe('matris_grund')
  })

  it('Allt är CV-listan med jobbmatchningen efter uppdatera_cv, sedan bli upptäckt, coachen, testerna, intervjuprovet', () => {
    const allt = KOM_IGANG_LISTA.allt
    expect(allt[allt.indexOf('uppdatera_cv') + 1]).toBe('jobbmatchning')
    expect(allt.slice(-4)).toEqual(['bli_upptackt', 'coach', 'matris_grund', 'intervjuprov'])
  })

  it('Intervjuprovet står efter personlighetstestet i Test', () => {
    const t = KOM_IGANG_LISTA.tester
    expect(t[t.indexOf('personlighet') + 1]).toBe('intervjuprov')
  })

  it('varje bricka har titel, text, kort och en adress i appen', () => {
    for (const [paketNamn, lista] of Object.entries(KOM_IGANG_LISTA)) {
      const paket = paketNamn === 'gratis' ? null : (paketNamn as 'cv' | 'tester' | 'allt')
      for (const key of lista) {
        const t = brickaText(key, paket)
        expect(t.titel.length).toBeGreaterThan(0)
        expect(t.text.length).toBeGreaterThan(0)
        expect(t.kort.length).toBeGreaterThan(0)
        expect(t.href.startsWith('/dashboard')).toBe(true)
      }
    }
  })
})

describe('läget', () => {
  it('nästa är första oprovade i listans ordning, och raden säger n av m', () => {
    const lage = komIgangLage('cv', ['profil', 'cv_upp', 'analys'])
    expect(lage.antalProvade).toBe(3)
    expect(lage.antalTotalt).toBe(8)
    expect(lage.nasta).toBe('uppdatera_cv')
    expect(komIgangRadText(lage)).toBe('3 av 8 provade. Nästa: uppdatera CV:t.')
  })

  it('provade brickor utanför paketets lista räknas inte', () => {
    const lage = komIgangLage('tester', ['brev', 'linkedin', 'profil'])
    expect(lage.antalProvade).toBe(1)
  })

  it('allt provat betyder klar och ingen nästa', () => {
    const lage = komIgangLage('gratis' as never, KOM_IGANG_LISTA.gratis)
    expect(lage.klar).toBe(true)
    expect(lage.nasta).toBeNull()
  })

  it('rubriken följer paketet', () => {
    expect(komIgangRubrik('cv')).toBe('Kom igång med CV-paketet')
    expect(komIgangRubrik('tester')).toBe('Kom igång med Träningspaketet')
    expect(komIgangRubrik('allt')).toBe('Kom igång med Hela paketet')
    expect(komIgangRubrik(null)).toBe('Kom igång')
  })
})

describe('kvitteringen ur tabellerna', () => {
  it('den som redan hade CV, brev och test börjar inte på noll', () => {
    const provade = harledProvade({
      ...TOMT,
      goalRole: 'Projektledare',
      location: 'Göteborg',
      cvCount: 1,
      letterCount: 2,
      testTypes: ['matrislogik', 'verbal-resonemang'],
    })
    expect(provade).toContain('profil')
    expect(provade).toContain('cv_upp')
    expect(provade).toContain('brev')
    expect(provade).toContain('matris_grund')
    // Verbalt utan numeriskt räcker inte för den gemensamma brickan.
    expect(provade).not.toContain('verbalt_numeriskt_grund')
  })

  it('verbalt och numeriskt tillsammans ger brickan, och provet ger provläget', () => {
    const provade = harledProvade({
      ...TOMT,
      testTypes: ['verbal-resonemang', 'numerical-reasoning', 'matrislogik-prov'],
    })
    expect(provade).toContain('verbalt_numeriskt_grund')
    expect(provade).toContain('provlage')
  })

  it('andra analysen räknas som uppdaterat CV, och den sparade kolumnen vinner alltid', () => {
    expect(harledProvade({ ...TOMT, analysisCompleted: 1 })).not.toContain('uppdatera_cv')
    expect(harledProvade({ ...TOMT, analysisCompleted: 2 })).toContain('uppdatera_cv')
    expect(harledProvade({ ...TOMT, sparade: ['kurva'] })).toContain('kurva')
  })

  it('profilen kräver både roll och ort', () => {
    expect(harledProvade({ ...TOMT, goalRole: 'Säljare' })).not.toContain('profil')
    expect(harledProvade({ ...TOMT, goalRole: 'Säljare', location: 'Umeå' })).toContain('profil')
  })

  it('test_type null är matrislogik grund, expert räknas som avancerad', () => {
    expect(brickorForTestType(null)).toEqual(['matris_grund'])
    expect(brickorForTestType('matrislogik-expert')).toEqual(['matris_avancerad'])
    expect(brickorForTestType('personlighet-grund')).toEqual(['personlighet'])
  })

  it('tål skräp i onboarding_steps', () => {
    expect(sparadeNycklar(null)).toEqual([])
    expect(sparadeNycklar([1, 2])).toEqual([])
    expect(sparadeNycklar({ cv_upp: '2026-09-22' })).toEqual(['cv_upp'])
  })
})

describe('välkomstskärmen', () => {
  it('en per paket, med tre steg och första steget som primär', () => {
    expect(valkommen('cv').primar).toBe('Ladda upp CV:t')
    expect(valkommen('tester').primar).toBe('Börja med matrislogik')
    expect(valkommen('allt').steg).toHaveLength(3)
    expect(valkommen('cv').rubrik).toBe('Du har CV-paketet. Allt är öppet nu.')
  })

  it('den som redan har ett CV får analysen som första steg', () => {
    const v = valkommenMedCv('cv', 'Anna_CV.pdf', '14 september', 61)
    expect(v.rubrik).toBe('Du har CV-paketet. Och ett CV redan.')
    expect(v.primar).toBe('Kör hela CV-analysen')
    expect(v.cvRad).toBe('Uppladdat 14 september. Poäng 61 med gratisnivån.')
  })
})

describe('menyn', () => {
  const bas = {
    track: null,
    fornyasAt: '2026-09-29T10:00:00Z',
    dayPassOnly: false,
    chatUsed: 3,
    chatLimit: 10,
    lettersUsed: 0,
    lettersLimit: 1,
  }

  it('huvudet säger paketet, förnyelsen och priset ur prislistan', () => {
    const h = menyHuvud({ ...bas, scope: 'tester', planKey: 'test_week' })
    expect(h.rubrik).toBe('Du har Träningspaketet')
    expect(h.under).toBe(`Förnyas 29 september, ${PLAN_BY_KEY.test_week.amount} kr`)
    expect(menyHuvud({ ...bas, scope: null, planKey: null }).rubrik).toBe('Du är på gratisnivån')
  })

  it('underraderna följer scopet, aldrig hårdkodade tal', () => {
    const tester = { ...bas, scope: 'tester' as const, planKey: 'test_week' as const }
    expect(menyRad('mallar', tester).text).toBe('3 mallar, en nedladdning')
    expect(menyRad('brev', tester).text).toBe('Ett personligt brev i veckan att läsa')
    expect(menyRad('matchning', tester).text).toBe('Tre träffar per natt')
    expect(menyRad('coach', tester).text).toBe('7 av 10 meddelanden kvar')
    expect(menyRad('linkedin', tester)).toMatchObject({ ingar: false, text: 'Ingår inte. Finns i CV-paketet och Hela paketet.' })
    expect(menyRad('bli_upptackt', tester)).toMatchObject({ ingar: false, text: 'Ingår inte. Finns i Hela paketet.' })
    expect(menyRad('sokta', tester).text).toBe('Alltid gratis')

    const allt = { ...bas, scope: 'allt' as const, planKey: 'all_week' as const, chatLimit: null }
    expect(menyRad('linkedin', allt).ingar).toBe(true)
    expect(menyRad('bli_upptackt', allt).ingar).toBe(true)
    expect(menyRad('coach', allt).text).toBe('Utan tak')
  })

  it('mellanskillnaden räknas ur prislistan', () => {
    expect(mellanskillnadKr('cv_week')).toBe(PLAN_BY_KEY.all_week.amount - PLAN_BY_KEY.cv_week.amount)
    expect(mellanskillnadKr('all_week')).toBeNull()
    expect(ellerAlltKnapp('test_week')).toBe('Eller Hela paketet för 20 kr till i veckan')
    expect(graEtikettTest('cv')).toBe('Träningspaketet, 79 kr i veckan, eller Hela paketet')
    expect(graEtikettTest(null)).toBe('Träningspaketet, 79 kr i veckan')
  })
})

describe('Kom igång för Dagspasset (köptestet 2026-09-24, Kvar)', () => {
  it('rubriken säger Dagspasset, inte Hela paketet', async () => {
    const { komIgangRubrik, komIgangLage } = await import('../komigang')
    const { paketNamn } = await import('@/lib/plans/plans')
    expect(komIgangRubrik('allt', true)).toBe(`Kom igång med ${paketNamn('all_day')}`)
    expect(komIgangRubrik('allt')).toBe('Kom igång med Hela paketet')
    // Flaggan betyder bara något för scopet allt.
    expect(komIgangRubrik('cv', true)).toBe('Kom igång med CV-paketet')
    expect(komIgangLage('allt', [], true).dagspass).toBe(true)
    expect(komIgangLage('cv', [], true).dagspass).toBe(false)
    // Samma lista som Hela paketet: dygnet ger allt.
    expect(komIgangLage('allt', [], true).lista).toEqual(komIgangLage('allt', []).lista)
  })

  it('raden under rubriken talar om dygnet, utan talstreck', async () => {
    const { KOM_IGANG } = await import('../komigang')
    expect(KOM_IGANG.dygnRad).toContain('ett dygn')
    expect(KOM_IGANG.dygnRad).not.toMatch(/[—–]/)
  })
})
