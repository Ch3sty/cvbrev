import { describe, expect, it } from 'vitest'
import {
  MIN_UNDERLAG,
  andelUnder,
  byggFordelning,
  poangTillProcent,
  raknarAndel,
  staplar,
  tjugofemRegeln,
} from '../fordelning'

describe('byggFordelning', () => {
  it('räknar antal per poäng och hoppar över ogiltiga', () => {
    const f = byggFordelning([0, 1, 1, 15, '3', 16, -1, null, Number.NaN, 2.4], 15)
    expect(f.antal).toBe(6)
    expect(f.perPoang).toHaveLength(16)
    expect(f.perPoang[1]).toBe(2)
    expect(f.perPoang[2]).toBe(1)
    expect(f.perPoang[3]).toBe(1)
    expect(f.perPoang[15]).toBe(1)
  })

  it('tom ger noll', () => {
    expect(byggFordelning([], 15)).toEqual({ antal: 0, perPoang: new Array(16).fill(0), maxPoang: 15 })
  })
})

describe('andelUnder', () => {
  it('räknar strikt lägre poäng, som percentile-routen', () => {
    // 10 sessioner: 0..9. Poäng 7 har sju under sig.
    const f = byggFordelning([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 15)
    expect(andelUnder(f, 7)).toBe(70)
    expect(andelUnder(f, 0)).toBe(0)
    expect(andelUnder(f, 15)).toBe(100)
  })

  it('lika poäng räknas inte som under', () => {
    const f = byggFordelning([5, 5, 5, 5], 15)
    expect(andelUnder(f, 5)).toBe(0)
  })
})

describe('tjugofemRegeln', () => {
  const med = (n: number) => byggFordelning(Array.from({ length: n }, (_, i) => i % 16), 15)

  it('under 25: räknaren, aldrig en percentil', () => {
    const j = tjugofemRegeln(med(24), 14)
    expect(j).toEqual({ lage: 'raknare', antal: 24, mal: MIN_UNDERLAG })
  })

  it('utan fördelning: räknaren på noll', () => {
    expect(tjugofemRegeln(null, 14)).toEqual({ lage: 'raknare', antal: 0, mal: 25 })
  })

  it('vid exakt 25: percentilen', () => {
    const j = tjugofemRegeln(med(25), 14)
    expect(j.lage).toBe('visas')
    if (j.lage === 'visas') {
      expect(j.antal).toBe(25)
      expect(j.percentil).toBeGreaterThanOrEqual(0)
      expect(j.percentil).toBeLessThanOrEqual(100)
    }
  })

  it('underlag men inget eget jämförbart försök: utanEget', () => {
    expect(tjugofemRegeln(med(40), null)).toEqual({ lage: 'utanEget', antal: 40 })
  })
})

describe('raknarAndel', () => {
  it('fyller till målet och inte längre', () => {
    expect(raknarAndel(14)).toBeCloseTo(0.56)
    expect(raknarAndel(0)).toBe(0)
    expect(raknarAndel(30)).toBe(1)
  })
})

describe('staplar', () => {
  it('en stapel per poäng när de är få', () => {
    const f = byggFordelning([0, 15, 15], 15)
    const s = staplar(f)
    expect(s).toHaveLength(16)
    expect(s[15].hojd).toBe(1)
    expect(s[0].hojd).toBe(0.5)
    expect(s[0].fran).toBe(0)
    expect(s[15].till).toBe(100)
  })

  it('slår ihop till högst max staplar och tappar inga sessioner', () => {
    const f = byggFordelning(Array.from({ length: 61 }, (_, i) => i), 60)
    const s = staplar(f, 12)
    expect(s).toHaveLength(12)
    expect(s.reduce((sum, x) => sum + x.antal, 0)).toBe(61)
  })
})

describe('poangTillProcent', () => {
  it('står i mitten av sitt poängsteg', () => {
    expect(poangTillProcent({ maxPoang: 15 }, 0)).toBeCloseTo(3.125)
    expect(poangTillProcent({ maxPoang: 15 }, 15)).toBeCloseTo(96.875)
  })
})
