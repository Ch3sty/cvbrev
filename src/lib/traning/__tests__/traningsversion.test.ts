/**
 * Bank 3.1 (beställning omgång 2, C1): testmotorn väljer ur
 * TRANINGSVERSION, klassiska test står kvar på bank_version 3.
 */
import { describe, expect, it } from 'vitest'
import { BANK_VERSION, TRANINGSVERSION, poolFor, ALLA_MATRISFRAGOR } from '@/lib/logicTestV7/selectQuestions.v7'
import { TRANINGSBANK } from '../bank.server'

describe('träningsversionen', () => {
  it('klassiska test står på version 3 med 110 / 95 / 95 valbara', () => {
    expect(BANK_VERSION).toBe(3)
    expect([poolFor('grund', 3).length, poolFor('avancerad', 3).length, poolFor('expert', 3).length]).toEqual([110, 95, 95])
  })

  it('motorn läser version 4: allt i version 3 plus frågorna med fran_version 4', () => {
    expect(TRANINGSVERSION).toBe(4)
    const v3 = new Set([...poolFor('grund', 3), ...poolFor('avancerad', 3), ...poolFor('expert', 3)].map((q) => q.id))
    const bank = new Set(TRANINGSBANK.map((q) => q.id))
    for (const id of v3) expect(bank.has(id)).toBe(true)
    const nya = ALLA_MATRISFRAGOR.filter((q) => (q as { fran_version?: number }).fran_version === 4)
    for (const q of nya) {
      expect(bank.has(q.id)).toBe(true)
      expect(v3.has(q.id)).toBe(false)
    }
    expect(bank.size).toBe(v3.size + nya.length)
  })
})
