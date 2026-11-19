// @vitest-environment node
/**
 * Deduktivens bankversion 4 (frågebanken 2026-11-19, omgång 2): 100 nya
 * uppgifter med fran_version 4. Versionen är byggd men inte aktiv förrän
 * testansvarig har granskat; version 1 till 3 drar exakt som förut.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEDUKTIV_VERSION, deduktivVersion, poolFor, valjFragor } from '../select'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/deduktivV1/bank${n}.json`, 'utf8'))
const alla = [...bank('Grund'), ...bank('Avancerad'), ...bank('Expert')]
const nya = alla.filter((q) => q.fran_version === 4)

describe('deduktiv bankversion 4', () => {
  // Omgranskningen strök dd-a-d2-111, 113 och 114; tredje granskningen dd-g-d2-30,
  // dd-a-d2-92, 107, 110 och 118 samt dd-e-d3-70 och 71 (alla bara i version 4).
  it('90 nya uppgifter: 37 grund (30 D1, 7 D2), 30 avancerad, 23 expert', () => {
    const per = (n: string, typ?: string) => nya.filter((q) => q.niva === n && (!typ || q.typ === typ)).length
    expect([per('grund', 'D1'), per('grund', 'D2'), per('avancerad'), per('expert')]).toEqual([30, 7, 30, 23])
    expect(nya.some((q) => q.pensionerad_fran || q.ersatter)).toBe(false)
    expect(new Set(alla.map((q) => q.id)).size).toBe(alla.length)
  })

  it('avancerad har nästan lika många måste- som vem-frågor (16 och 14 efter strykningarna)', () => {
    const a = nya.filter((q) => q.niva === 'avancerad')
    const maste = a.filter((q) => q.formell.fraga.form === 'maste').length
    expect(Math.abs(maste - (a.length - maste))).toBeLessThanOrEqual(2)
  })

  it('nio nästan-dubbletter pensioneras från version 4 och finns kvar i version 3', () => {
    const pens = alla.filter((q) => q.pensionerad_fran === 4).map((q) => q.id).sort()
    expect(pens).toEqual([32, 50, 53, 61, 63, 68, 71, 78, 82].map((n) => `dd-a-d2-${n}`))
    const v3 = new Set(poolFor('avancerad', 3).map((q) => q.id))
    const v4 = new Set(poolFor('avancerad', 4).map((q) => q.id))
    for (const id of pens) {
      expect(v3.has(id), id).toBe(true)
      expect(v4.has(id), id).toBe(false)
    }
  })

  it('grund-D2 har p_prior 0,62', () => {
    expect(nya.filter((q) => q.niva === 'grund' && q.typ === 'D2').every((q) => q.p_prior === 0.62)).toBe(true)
  })

  it('inte aktiv än: version 3 är oförändrad, version 4 läses ur meta', () => {
    expect(DEDUKTIV_VERSION).toBe(4)
    expect([poolFor('grund', 3).length, poolFor('avancerad', 3).length, poolFor('expert', 3).length]).toEqual([68, 67, 45])
    // Avancerad: 67 + 30 - 9 pensionerade från version 4 (granskning omgång 2).
    expect([poolFor('grund', 4).length, poolFor('avancerad', 4).length, poolFor('expert', 4).length]).toEqual([105, 88, 68])
    expect(deduktivVersion({ deduktiv_version: 4 })).toBe(4)
    const id = '6f7d2a10-0000-4000-8000-000000000004'
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      expect(valjFragor(n, id, 12, 3).every((q) => q.fran_version !== 4)).toBe(true)
    }
  })
})
