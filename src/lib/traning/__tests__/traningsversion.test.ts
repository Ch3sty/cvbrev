/**
 * Bank 3.1 (beställning omgång 2, C1): testmotorn väljer ur
 * TRANINGSVERSION, klassiska test står kvar på bank_version 3.
 * Matrisparti 04 (docs/fragebank/matris-2026-11-19.md): frågorna med
 * fran_version 5 blir valbara när scripts/befordra-matris-parti-04.mjs
 * --sla-pa höjer TRANINGSVERSION till 5. Testet håller i båda lägena.
 */
import { describe, expect, it } from 'vitest'
import { BANK_VERSION, TRANINGSVERSION, poolFor, ALLA_MATRISFRAGOR } from '@/lib/logicTestV7/selectQuestions.v7'
import { TRANINGSBANK } from '../bank.server'

const franVersion = (q: unknown) => (q as { fran_version?: number }).fran_version

describe('träningsversionen', () => {
  it('klassiska test står på version 3 med 110 / 95 / 95 valbara', () => {
    expect(BANK_VERSION).toBe(3)
    expect([poolFor('grund', 3).length, poolFor('avancerad', 3).length, poolFor('expert', 3).length]).toEqual([110, 95, 95])
  })

  it('motorn läser version 4 eller 5: allt i version 3 plus frågorna med fran_version 4 till TRANINGSVERSION', () => {
    expect([4, 5]).toContain(TRANINGSVERSION)
    const v3 = new Set([...poolFor('grund', 3), ...poolFor('avancerad', 3), ...poolFor('expert', 3)].map((q) => q.id))
    const bank = new Set(TRANINGSBANK.map((q) => q.id))
    for (const id of v3) expect(bank.has(id)).toBe(true)
    const v4 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 4)
    expect(v4).toHaveLength(15)
    const v5 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 5)
    // Version 5 är parti 04: före --sla-pa är det befordrade inte valbart.
    if (TRANINGSVERSION === 5) expect(v5.length).toBeGreaterThan(0)
    const nya = [...v4, ...(TRANINGSVERSION >= 5 ? v5 : [])]
    for (const q of nya) {
      expect(bank.has(q.id)).toBe(true)
      expect(v3.has(q.id)).toBe(false)
    }
    for (const q of TRANINGSVERSION >= 5 ? [] : v5) expect(bank.has(q.id)).toBe(false)
    expect(bank.size).toBe(v3.size + nya.length)
  })
})
