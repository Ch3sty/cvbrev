// @vitest-environment node
/**
 * Deduktivens bankversion 2 (testplanen steg 1, 2026-11-09): DD7 och DD8 i
 * bankens aktiva uppgifter, pensionering och ersättare, och att gamla
 * sessioner läser version 1 oförändrat.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import * as S from '../../../../scripts/lib/deduktiv/sparrar.mjs'
import { DEDUKTIV_VERSION, deduktivVersion, poolFor, valjFragor } from '../select'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/deduktivV1/bank${n}.json`, 'utf8'))
const alla = [...bank('Grund'), ...bank('Avancerad'), ...bank('Expert')]

describe('deduktiv bankversion 2', () => {
  it('ingen aktiv uppgift fälls av DD7, DD8 eller DD9', () => {
    for (const q of alla.filter((x) => !x.pensionerad_fran)) expect([...S.dd7(q), ...S.dd8(q), ...S.dd9(q)], q.id).toEqual([])
  }, 60_000)

  it('de kända fallen från granskning 02 fälls och är pensionerade', () => {
    const q = (id: string) => alla.find((x) => x.id === id)
    expect(S.dd7(q('dd-g-d2-09')).join()).toMatch(/E medför alternativ D/)
    expect(S.dd7(q('dd-g-d2-10'))).toHaveLength(2)
    expect(S.dd8(q('dd-g-d2-11')).join()).toMatch(/DD8/)
    for (const id of ['dd-g-d2-09', 'dd-g-d2-10', 'dd-g-d2-11']) expect(q(id).pensionerad_fran).toBe(2)
  })

  it('varje ersättare pekar på en pensionerad uppgift med samma villkor', () => {
    for (const q of alla.filter((x) => x.ersatter)) {
      const o = alla.find((x) => x.id === q.ersatter)
      expect(o?.pensionerad_fran, q.id).toBe(2)
      expect(q.villkor).toEqual(o.villkor)
      expect(q.fran_version).toBe(2)
    }
  })

  it('golvet håller: 30, 30 och 20 i version 2, och version 1 är oförändrad', () => {
    expect(DEDUKTIV_VERSION).toBe(2)
    expect([poolFor('grund', 2).length, poolFor('avancerad', 2).length, poolFor('expert', 2).length]).toEqual([30, 30, 20])
    expect([poolFor('grund', 1).length, poolFor('avancerad', 1).length, poolFor('expert', 1).length]).toEqual([30, 30, 20])
    expect(poolFor('grund', 1).some((q) => q.fran_version === 2)).toBe(false)
  })

  it('en gammal session utan version drar samma tolv som förut', () => {
    expect(deduktivVersion({})).toBe(1)
    expect(deduktivVersion({ deduktiv_version: 2 })).toBe(2)
    const id = '6f7d2a10-0000-4000-8000-000000000001'
    expect(valjFragor('avancerad', id).map((q) => q.id)).toEqual(valjFragor('avancerad', id, 12, 1).map((q) => q.id))
    expect(valjFragor('avancerad', id, 12, 2).some((q) => q.pensionerad_fran)).toBe(false)
  })
})
