import { describe, expect, it } from 'vitest'
import {
  avrunda,
  beraknaNiva,
  chansRatt,
  foreslaSikte,
  matningsNiva,
  MATNING_ANTAL,
  passUppdatering,
  PASS_TAK,
  STOD_NIVA,
  type NivaSvar,
} from '../niva'
import { nivaForP, pForFraga, pForNiva, PRIOR_P, svarighetPrior } from '../svarighet'
import { nivaTak, BANK_KALIBRERAD_OVER_7_5 } from '../flaggor'

const svar = (p: number, ratt: number, antal: number): NivaSvar[] =>
  Array.from({ length: antal }, (_, i) => ({ p, correct: i < ratt }))

const blandad = (ratt: number): NivaSvar[] => {
  // Tolv frågor över spannet, fyra per band, rätt på de `ratt` lättaste.
  const ps = [0.85, 0.85, 0.7, 0.7, 0.7, 0.55, 0.55, 0.55, 0.4, 0.4, 0.4, 0.4]
  return ps.map((p, i) => ({ p, correct: i < ratt }))
}

describe('svårigheten', () => {
  it('priorn ur difficulty: 1 0,85, 2 0,7, 3 0,55, 4 0,4', () => {
    expect(PRIOR_P).toEqual({ 1: 0.85, 2: 0.7, 3: 0.55, 4: 0.4 })
    expect(svarighetPrior(5)).toBe(4)
    expect(svarighetPrior(0)).toBe(1)
    expect(svarighetPrior(undefined)).toBe(3)
  })

  it('priorn gäller tills 30 svar, sedan uppmätt andel', () => {
    expect(pForFraga(3, { antal: 29, ratt: 29 })).toBe(0.55)
    expect(pForFraga(3, { antal: 30, ratt: 15 })).toBe(0.5)
    expect(pForFraga(3, null)).toBe(0.55)
    // Alla rätt ger inte nivå 1,0.
    expect(pForFraga(3, { antal: 40, ratt: 40 })).toBeLessThan(1)
  })

  it('frågans nivå är monoton i p och pForNiva är omvändningen', () => {
    expect(nivaForP(0.4)).toBeCloseTo(6.4)
    expect(nivaForP(0.85)).toBeCloseTo(2.35)
    for (const n of [1, 3.5, 5, 7.5, 10]) expect(nivaForP(pForNiva(n))).toBeCloseTo(n)
  })
})

describe('beraknaNiva', () => {
  it('är monoton: fler rätt ger aldrig lägre nivå', () => {
    let fore = 0
    for (let r = 0; r <= 12; r++) {
      const n = beraknaNiva(blandad(r))
      expect(n).toBeGreaterThanOrEqual(fore)
      fore = n
    }
    expect(beraknaNiva(blandad(12))).toBeGreaterThan(beraknaNiva(blandad(0)))
  })

  it('samma antal rätt på svårare frågor ger högre nivå', () => {
    // Nivån beror på antal rätt mot frågornas svårighet. Adaptiviteten i
    // mätningen gör att den som svarar rätt får svårare frågor.
    expect(beraknaNiva(svar(0.4, 6, 12))).toBeGreaterThan(beraknaNiva(svar(0.7, 6, 12)))
    expect(beraknaNiva(svar(0.55, 9, 12))).toBeGreaterThan(beraknaNiva(svar(0.85, 9, 12)))
  })

  it('ger en decimal och håller sig inom 1 till taket', () => {
    for (let r = 0; r <= 12; r++) {
      const n = beraknaNiva(blandad(r))
      expect(n).toBe(avrunda(n))
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(nivaTak())
    }
  })

  it('inga värden över 7,5 under flaggan', () => {
    expect(BANK_KALIBRERAD_OVER_7_5).toBe(false)
    expect(beraknaNiva(svar(0.02, 30, 30))).toBe(7.5)
    expect(passUppdatering(7.4, svar(0.05, 9, 9)).niva).toBe(7.5)
  })

  it('alla fel ger en ändlig låg nivå, tom lista stödnivån', () => {
    expect(beraknaNiva(blandad(0))).toBeLessThan(3)
    expect(beraknaNiva([])).toBe(STOD_NIVA)
  })

  it('hälften rätt på frågor vid nivå 5 ger cirka 5', () => {
    const p5 = pForNiva(5)
    expect(Math.abs(beraknaNiva(svar(p5, 6, 12)) - 5)).toBeLessThanOrEqual(0.2)
  })
})

describe('matningsNiva', () => {
  it('tolv frågor ger en punkt med vikt 1: nivån före ersätts helt', () => {
    const s = blandad(8)
    expect(s).toHaveLength(MATNING_ANTAL)
    expect(matningsNiva(s, 3).niva).toBe(beraknaNiva(s))
    expect(matningsNiva(s, 7).niva).toBe(beraknaNiva(s))
  })

  it('sex frågor väger hälften', () => {
    const s = blandad(8).slice(0, 6)
    const matt = beraknaNiva(s)
    expect(matningsNiva(s, 3).niva).toBeCloseTo(avrunda(3 + 0.5 * (matt - 3)), 5)
  })

  it('utan nivå före gäller mätningen helt, delta 0', () => {
    expect(matningsNiva(blandad(6), null)).toEqual({ niva: beraknaNiva(blandad(6)), delta: 0 })
  })
})

describe('passUppdatering', () => {
  it('rör sig högst 0,5 per pass åt båda hållen', () => {
    expect(passUppdatering(5, svar(0.3, 9, 9)).delta).toBe(PASS_TAK)
    expect(passUppdatering(5, svar(0.9, 0, 9)).delta).toBe(-PASS_TAK)
  })

  it('rätt på svår lyfter mer än rätt på lätt, fel på lätt sänker mer än fel på svår', () => {
    const lattRatt = passUppdatering(5, svar(0.85, 1, 1)).delta
    const svarRatt = passUppdatering(5, svar(0.4, 1, 1)).delta
    expect(svarRatt).toBeGreaterThan(lattRatt)
    const lattFel = passUppdatering(5, svar(0.85, 0, 1)).delta
    const svarFel = passUppdatering(5, svar(0.4, 0, 1)).delta
    expect(lattFel).toBeLessThan(svarFel)
  })

  it('exemplet: 7 av 9 i ett 60/20/20-pass kring 5,4 ger cirka +0,2', () => {
    const p = pForNiva(5.4)
    const pass: NivaSvar[] = [
      { p: p + 0.25, correct: true },
      { p: p + 0.25, correct: true },
      { p, correct: true },
      { p, correct: false },
      { p, correct: true },
      { p, correct: true },
      { p, correct: true },
      { p: p - 0.25, correct: false },
      { p: p - 0.25, correct: true },
    ]
    const r = passUppdatering(5.4, pass)
    expect(r.delta).toBeGreaterThanOrEqual(0.1)
    expect(r.delta).toBeLessThanOrEqual(0.3)
  })

  it('ett pass med väntat utfall flyttar inte nivån', () => {
    expect(chansRatt(5, pForNiva(5))).toBeCloseTo(0.5)
    const p = pForNiva(5)
    expect(passUppdatering(5, [{ p, correct: true }, { p, correct: false }]).delta).toBe(0)
  })
})

describe('foreslaSikte', () => {
  it('5,0 med 18 dagar ger 6,5; utan datum +1; aldrig över taket', () => {
    expect(foreslaSikte(5, 18)).toBe(6.5)
    expect(foreslaSikte(5, null)).toBe(6)
    expect(foreslaSikte(5, 2)).toBe(5.5)
    expect(foreslaSikte(7.2, 30)).toBe(7.5)
  })
})
