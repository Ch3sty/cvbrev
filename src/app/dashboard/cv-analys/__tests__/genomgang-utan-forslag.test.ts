// @vitest-environment node
/**
 * Genomgången för alla CV (beslutet 2026-11-21): poängen och de sju delarna
 * räknas utan modell ur CV:ts struktur, utan analysjobb och utan kvot. Talet
 * ska vara detsamma som Ditt CV, Mallar och Byt CV visar (poangForRad), och
 * detsamma före och efter att förslagen hämtats.
 */
import { describe, expect, it } from 'vitest'
import { byggAnalysVy, byggGenomgangVy, genomgangLageFor, ordnaDelarEfterArket, visaPoangAndrad } from '../analysData'
import { HUVUDSPALT, KOMPETENSER_FORE, STANDARD_ORDNING } from '@/lib/cv/mallar/definitioner/gemensamt'
import { poangForRad, poangSammanfattning, kanonisktCv, platshallareKvar } from '@/lib/cv/poang'
import { FIXTURER } from '@/lib/cv/poang/__tests__/fixturer'

const MED_STRUKTUR = FIXTURER.filter((f) => f.namn !== 'utan-struktur')

describe('poangSammanfattning utan förslag', () => {
  for (const f of MED_STRUKTUR) {
    it(`${f.namn}: inga förslag ger med-talen lika med i dag (utom siffrorna)`, () => {
      const cv = kanonisktCv(f.structured_data, f.cv_text)!
      expect(cv).not.toBeNull()
      // Ett resultat utan några förslagsfält alls, och ett med tomma listor.
      for (const analys of [
        { structuredCV: cv },
        { structuredCV: cv, profileSummary: null, roleBasedImprovements: [], skillSuggestions: [] },
      ]) {
        const s = poangSammanfattning(analys)!
        expect(s).not.toBeNull()
        expect(s.medAlla).toBe(s.idag)
        expect(s.plus).toBe(0)
        expect(s.idag).toBeGreaterThanOrEqual(0)
        expect(s.idag).toBeLessThanOrEqual(100)
        // medAllt räknar bara hennes siffror ([antal]) när förslagen saknas.
        expect(s.plusAllt).toBe(s.siffrorPlus)
        if (platshallareKvar(cv).length === 0) expect(s.medAllt).toBe(s.idag)
        expect(s.kategorier).toHaveLength(7)
        for (const k of s.kategorier) expect(k.plus).toBe(0)
      }
    })
  }

  it('utan struktur: null, inga påhittade tal', () => {
    expect(poangSammanfattning({ structuredCV: null })).toBeNull()
  })
})

describe('byggGenomgangVy', () => {
  for (const f of MED_STRUKTUR) {
    const rad = { structured_data: f.structured_data, cv_text: f.cv_text }

    it(`${f.namn}: sju delar, samma tal som poangForRad, inga förslag, inget jobb`, () => {
      for (const harFull of [false, true]) {
        const vy = byggGenomgangVy(rad, harFull)!
        expect(vy).not.toBeNull()
        expect(vy.jobbId).toBeNull()
        expect(vy.klar).toBeNull()
        expect(vy.delar).toHaveLength(7)
        expect(vy.poang.idag).toBe(poangForRad(rad))
        expect(vy.delar.reduce((s, d) => s + d.poang, 0)).toBe(vy.poang.idag)
        // Bara siffror-fyndet kan finnas: det är hennes egen uppgift, inget förslag.
        expect(vy.fynd.every((x) => x.typ === 'siffror' && x.oppen)).toBe(true)
        expect(vy.delarTackta).toEqual([])
        expect(vy.poang.medAlla).toBe(vy.poang.idag)
      }
    })

    if (f.analys) {
      it(`${f.namn}: poängen och delarna är desamma före och efter hämtningen`, () => {
        const fore = byggGenomgangVy(rad, false)!
        const efter = byggAnalysVy({ id: 'j', completed_at: null, result: f.analys as Record<string, unknown> }, rad, false)!
        expect(efter.poang.idag).toBe(fore.poang.idag)
        expect(efter.delar).toEqual(fore.delar)
      })
    }
  }

  it('CV utan sparad struktur: texten läses som poängen läser den, samma tal som poangForRad', () => {
    const f = FIXTURER.find((x) => x.namn === 'utan-struktur')!
    const rad = { structured_data: f.structured_data, cv_text: f.cv_text }
    const vy = byggGenomgangVy(rad, false)
    expect(vy?.poang.idag ?? null).toBe(poangForRad(rad))
  })

  it('inget att läsa: null (läget utan-struktur)', () => {
    expect(byggGenomgangVy(null, false)).toBeNull()
    expect(byggGenomgangVy({ structured_data: null, cv_text: '' }, false)).toBeNull()
  })
})

describe('genomgangLageFor', () => {
  it('hämtade förslag går först, sedan kvoten', () => {
    expect(genomgangLageFor('jobb-1', false, 0)).toBe('hamtade')
    expect(genomgangLageFor('jobb-1', true, null)).toBe('hamtade')
    expect(genomgangLageFor(null, false, 1)).toBe('utan-forslag')
    expect(genomgangLageFor(null, true, null)).toBe('utan-forslag')
    expect(genomgangLageFor(null, false, 0)).toBe('forbrukad')
    // Premium blir aldrig förbrukad.
    expect(genomgangLageFor(null, true, 0)).toBe('utan-forslag')
  })
})

describe('visaPoangAndrad', () => {
  const nu = Date.parse('2026-11-22T12:00:00+01:00')
  it('bara CV skapade före 21 november 2026', () => {
    expect(visaPoangAndrad('2026-11-20T22:59:00Z', nu)).toBe(true)
    expect(visaPoangAndrad('2026-10-01T10:00:00Z', nu)).toBe(true)
    expect(visaPoangAndrad('2026-11-21T08:00:00+01:00', nu)).toBe(false)
    expect(visaPoangAndrad(null, nu)).toBe(false)
    expect(visaPoangAndrad('inte ett datum', nu)).toBe(false)
  })
  it('försvinner av sig själv efter 31 januari 2027', () => {
    const gammalt = '2026-10-01T10:00:00Z'
    expect(visaPoangAndrad(gammalt, Date.parse('2027-01-31T23:59:00+01:00'))).toBe(true)
    expect(visaPoangAndrad(gammalt, Date.parse('2027-02-01T00:00:00+01:00'))).toBe(false)
    expect(visaPoangAndrad(gammalt, Date.parse('2027-06-01T00:00:00+02:00'))).toBe(false)
  })
})

describe('delarna i arkets ordning (numren stiger nedåt på arket)', () => {
  const f = MED_STRUKTUR[0]
  const vy = byggGenomgangVy({ structured_data: f.structured_data, cv_text: f.cv_text } as never, false)!

  it('Linne och de flesta mallar: utbildning före kompetenser, kontakt först, format sist', () => {
    const ut = ordnaDelarEfterArket(vy.delar, STANDARD_ORDNING)
    expect(ut.map((d) => d.id)).toEqual(['kontakt', 'profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'format'])
    expect(ut.map((d) => d.nr)).toEqual([1, 2, 3, 4, 5, 6, 7])
    // Poängen och innehållet är desamma, bara ordningen och numren byts.
    for (const d of ut) expect({ ...d, nr: 0 }).toEqual({ ...vy.delar.find((x) => x.id === d.id)!, nr: 0 })
    expect(ut.reduce((s, d) => s + d.poang, 0)).toBe(vy.poang.idag)
  })

  it('kompetenser före utbildning när mallen ritar dem så', () => {
    const ut = ordnaDelarEfterArket(vy.delar, KOMPETENSER_FORE)
    expect(ut.map((d) => d.id)).toEqual(['kontakt', 'profil', 'erfarenhet', 'kompetenser', 'utbildning', 'sprak', 'format'])
  })

  it('sidospalt: huvudspaltens avsnitt först, sedan spaltens', () => {
    const ut = ordnaDelarEfterArket(vy.delar, [...HUVUDSPALT, 'intyg', 'kompetenser', 'sprak', 'intressen'])
    expect(ut.map((d) => d.id)).toEqual(['kontakt', 'profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'format'])
  })
})
