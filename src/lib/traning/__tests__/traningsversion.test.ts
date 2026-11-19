/**
 * Bank 3.1 (beställning omgång 2, C1): testmotorn väljer ur
 * TRANINGSVERSION, klassiska test står kvar på bank_version 3.
 * Matrisparti 04 (docs/fragebank/matris-2026-11-19.md): frågorna med
 * fran_version 5, valbara sedan TRANINGSVERSION 5.
 * Matrisparti 05 (docs/fragebank/matris-2026-11-19-omg2.md): frågorna med
 * fran_version 6 blir valbara när scripts/befordra-matris-parti-05.mjs
 * --sla-pa höjer TRANINGSVERSION till 6.
 * Matrisparti 06 (docs/fragebank/matris-2026-11-19-omg3.md): frågorna med
 * fran_version 7 blir valbara när scripts/befordra-matris-parti-06.mjs
 * --sla-pa höjer TRANINGSVERSION till 7. Testet håller i båda lägena.
 */
import { describe, expect, it } from 'vitest'
import { BANK_VERSION, TRANINGSVERSION, poolFor, ALLA_MATRISFRAGOR } from '@/lib/logicTestV7/selectQuestions.v7'
import { TRANINGSBANK } from '../bank.server'

// TRANINGSVERSION är en literal (5 före --sla-pa), så den läses som number här.
const TV: number = TRANINGSVERSION
const franVersion = (q: unknown) => (q as { fran_version?: number }).fran_version

describe('träningsversionen', () => {
  it('klassiska test står på version 3 med 110 / 95 / 95 valbara', () => {
    expect(BANK_VERSION).toBe(3)
    expect([poolFor('grund', 3).length, poolFor('avancerad', 3).length, poolFor('expert', 3).length]).toEqual([110, 95, 95])
  })

  it('motorn läser version 6 eller 7: allt i version 3 plus frågorna med fran_version 4 till TRANINGSVERSION', () => {
    expect([6, 7]).toContain(TV)
    const v3 = new Set([...poolFor('grund', 3), ...poolFor('avancerad', 3), ...poolFor('expert', 3)].map((q) => q.id))
    const bank = new Set(TRANINGSBANK.map((q) => q.id))
    for (const id of v3) expect(bank.has(id)).toBe(true)
    const v4 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 4)
    expect(v4).toHaveLength(15)
    const v5 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 5)
    expect(v5).toHaveLength(77)
    const v6 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 6)
    // Version 6 är parti 05: före --sla-pa är det befordrade inte valbart.
    expect(v6).toHaveLength(57)
    const v7 = ALLA_MATRISFRAGOR.filter((q) => franVersion(q) === 7)
    // Version 7 är parti 06: före --sla-pa är det befordrade inte valbart.
    if (TV === 7) expect(v7).toHaveLength(50)
    const nya = [...v4, ...v5, ...v6, ...(TV >= 7 ? v7 : [])]
    for (const q of nya) {
      expect(bank.has(q.id)).toBe(true)
      expect(v3.has(q.id)).toBe(false)
    }
    for (const q of TV >= 7 ? [] : v7) expect(bank.has(q.id)).toBe(false)
    expect(bank.size).toBe(v3.size + nya.length)
  })
})
