// @vitest-environment node
/**
 * Deduktivens bankversion 3 (frågebanken 2026-11-19): 100 nya uppgifter med
 * fran_version 3, aktiv sedan testansvarigs granskning. Sessioner med
 * version 1 och 2 drar exakt som förut.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEDUKTIV_VERSION, deduktivVersion, poolFor, valjFragor } from '../select'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/deduktivV1/bank${n}.json`, 'utf8'))
const alla = [...bank('Grund'), ...bank('Avancerad'), ...bank('Expert')]
const nya = alla.filter((q) => q.fran_version === 3)

describe('deduktiv bankversion 3', () => {
  it('100 nya uppgifter: 38 grund (30 D1, 8 D2), 37 avancerad, 25 expert', () => {
    const per = (n: string, typ?: string) => nya.filter((q) => q.niva === n && (!typ || q.typ === typ)).length
    expect([per('grund', 'D1'), per('grund', 'D2'), per('avancerad'), per('expert')]).toEqual([30, 8, 37, 25])
    // Åtta av dem pensioneras från version 4 (nästan-dubbletter, granskning omgång 2), ingen tidigare.
    expect(nya.some((q) => (q.pensionerad_fran != null && q.pensionerad_fran !== 4) || q.ersatter)).toBe(false)
    expect(new Set(alla.map((q) => q.id)).size).toBe(alla.length)
  })

  it('grund-D2 i den aktiva poolen har p_prior 0,62, avancerad-D2 0,55', () => {
    expect(poolFor('grund', 3).filter((q) => q.typ === 'D2').every((q) => q.p_prior === 0.62)).toBe(true)
    expect(poolFor('avancerad', 3).every((q) => q.p_prior === 0.55)).toBe(true)
  })

  it('poolerna: 68, 67 och 45 i version 3; version 1 och 2 är oförändrade', () => {
    expect(DEDUKTIV_VERSION).toBeGreaterThanOrEqual(3)
    expect([poolFor('grund', 3).length, poolFor('avancerad', 3).length, poolFor('expert', 3).length]).toEqual([68, 67, 45])
    for (const v of [1, 2] as const) {
      expect([poolFor('grund', v).length, poolFor('avancerad', v).length, poolFor('expert', v).length]).toEqual([30, 30, 20])
      for (const n of ['grund', 'avancerad', 'expert'] as const) expect(poolFor(n, v).some((q) => q.fran_version === 3)).toBe(false)
    }
  })

  it('en session med version 2 drar samma tolv som förut; version 3 läses ur meta', () => {
    expect(deduktivVersion({ deduktiv_version: 3 })).toBe(3)
    expect(deduktivVersion({ deduktiv_version: 2 })).toBe(2)
    const id = '6f7d2a10-0000-4000-8000-000000000002'
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      expect(valjFragor(n, id, 12, 2).every((q) => q.fran_version !== 3)).toBe(true)
      expect(valjFragor(n, id, 12, 3).every((q) => !q.pensionerad_fran || q.pensionerad_fran > 3)).toBe(true)
    }
  })
})
