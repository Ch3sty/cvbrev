// @vitest-environment node
/**
 * Deduktivens bankversion 5 (frågebanken 2026-11-19, omgång 3): 93 nya
 * uppgifter av typen D4 med fran_version 5, fem nya familjer. Granskningen
 * strök dd-g-d4-17, 27, 28, dd-a-d4-08, 10, 17 och dd-e-d4-11. Versionen ligger
 * i bankfilerna men är inte aktiv förrän testansvarig har granskat; version 1
 * till 4 drar exakt som förut.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DEDUKTIV_VERSION, deduktivVersion, poolFor, valjFragor } from '../select'
import { DEDUKTIV_FAMILJ_NAMN } from '../familjer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/deduktivV1/bank${n}.json`, 'utf8'))
const alla = [...bank('Grund'), ...bank('Avancerad'), ...bank('Expert')]
const nya = alla.filter((q) => q.fran_version === 5)

describe('deduktiv bankversion 5', () => {
  it('93 nya D4-uppgifter: 27 grund, 33 avancerad, 33 expert', () => {
    const per = (n: string) => nya.filter((q) => q.niva === n).length
    expect([per('grund'), per('avancerad'), per('expert')]).toEqual([27, 33, 33])
    expect(nya.every((q) => q.typ === 'D4')).toBe(true)
    expect(alla.filter((q) => q.typ === 'D4').length).toBe(93)
    const strukna = ['dd-g-d4-17', 'dd-g-d4-27', 'dd-g-d4-28', 'dd-a-d4-08', 'dd-a-d4-10', 'dd-a-d4-17', 'dd-e-d4-11']
    expect(alla.some((q) => strukna.includes(q.id))).toBe(false)
    expect(new Set(alla.map((q) => q.id)).size).toBe(alla.length)
  })

  it('fördelningen per familj och nivå', () => {
    const per = (n: string, f: string) => nya.filter((q) => q.niva === n && q.family === f).length
    expect(['om_sa', 'kvantor', 'sanning', 'tabell', 'kan_inte'].map((f) => per('grund', f))).toEqual([7, 5, 6, 0, 9])
    expect(['om_sa', 'kvantor', 'sanning', 'tabell', 'kan_inte'].map((f) => per('avancerad', f))).toEqual([4, 3, 7, 10, 9])
    expect(['om_sa', 'kvantor', 'sanning', 'tabell', 'kan_inte'].map((f) => per('expert', f))).toEqual([2, 0, 9, 12, 10])
  })

  it('varje ny familj har ett namn i "Var du tappade"', () => {
    for (const q of nya) expect(DEDUKTIV_FAMILJ_NAMN[q.family as keyof typeof DEDUKTIV_FAMILJ_NAMN], q.id).toBeTruthy()
  })

  it('fem alternativ, ingen remsa, högst tolv steg, facit på varje plats', () => {
    expect(nya.every((q) => q.options.length === 5 && q.losning.schema === null && q.losning.steg.length > 0 && q.losning.steg.length <= 12)).toBe(true)
    // Tabellförklaringarna sammanfattar aldrig resten (granskningen av omgång 3).
    expect(nya.some((q) => q.losning.steg.some((s: Q) => /Det som återstår/.test(s.foljd)))).toBe(false)
    const platser = new Set(nya.map((q) => q.correctAnswer))
    expect([...platser].sort()).toEqual([0, 1, 2, 3, 4])
  })

  it('inte aktiv än: version 4 är oförändrad, version 5 läses ur meta', () => {
    expect(DEDUKTIV_VERSION).toBe(5)
    expect([poolFor('grund', 4).length, poolFor('avancerad', 4).length, poolFor('expert', 4).length]).toEqual([105, 88, 68])
    expect([poolFor('grund', 5).length, poolFor('avancerad', 5).length, poolFor('expert', 5).length]).toEqual([132, 121, 101])
    expect(deduktivVersion({ deduktiv_version: 5 })).toBe(5)
    const id = '6f7d2a10-0000-4000-8000-000000000005'
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      expect(valjFragor(n, id, 12, 4).every((q) => q.fran_version !== 5)).toBe(true)
    }
  })
})
