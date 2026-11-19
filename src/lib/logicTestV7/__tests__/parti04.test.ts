/**
 * Matrislogik parti 04 (docs/fragebank/matris-2026-11-19.md): kandidaterna
 * ligger i kandidater/ med fran_version 5 och är inte valbara förrän
 * scripts/befordra-matris-parti-04.mjs har körts efter granskningen.
 * Filen läses med fs, aldrig import (kandidater.test.ts).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { ALLA_MATRISFRAGOR, BANK_VERSION, TRANINGSVERSION, valbarI } from '../selectQuestions.v7'

type K = { id: string; fran_version?: number; family?: string }
const KANDIDATER = JSON.parse(
  readFileSync('src/lib/logicTestV7/kandidater/matris-parti-04.v7.json', 'utf8')
) as K[]

describe('parti 04', () => {
  it('kandidaterna efter omgång 2: fran_version 5 och unika id', () => {
    expect(KANDIDATER).toHaveLength(77)
    expect(new Set(KANDIDATER.map((q) => q.id)).size).toBe(77)
    for (const q of KANDIDATER) {
      expect(q.id).toMatch(/^v7[gae]-b5-/)
      expect(q.fran_version).toBe(5)
    }
  })

  it('valbara först i version 5, aldrig i dagens versioner', () => {
    for (const q of KANDIDATER) {
      expect(valbarI(q, BANK_VERSION)).toBe(false)
      expect(valbarI(q, 5)).toBe(true)
    }
    if (TRANINGSVERSION < 5) for (const q of KANDIDATER) expect(valbarI(q, TRANINGSVERSION)).toBe(false)
  })

  it('inget id krockar med bankerna, utom de som befordrats oförändrade', () => {
    const bank = new Map(ALLA_MATRISFRAGOR.map((q) => [q.id, q]))
    for (const q of KANDIDATER) {
      const b = bank.get(q.id)
      if (b) expect(b).toEqual(q)
    }
  })
})
