// @vitest-environment node
/**
 * Bankversion 3 av ordförrådet (omgång 2, docs/fragebank/ordforrad-2026-11-19-omg2.md):
 * 103 nya uppgifter sist i bankerna med fran_version 3. Inlagda men inte
 * aktiverade: ORD_VERSION är fortfarande 2, så pooler, urval och antal är
 * oförändrade tills version 3 aktiveras. När ORD_VERSION blir 3 vänds testet
 * "inlagd men inte aktiverad" (se dokumentets aktiveringssteg).
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifiera } from '../../../../scripts/ordforrad-verifiera.mjs'
import { ORD_VERSION, poolFor, allaOrd, valjOrd } from '../select'
import { ordforradAntal } from '../status'

const NIVAER = ['grund', 'avancerad', 'expert'] as const

describe('ordförråd version 3', () => {
  const v3 = allaOrd().filter((q) => q.fran_version === 3)

  it('verifieraren hittar inga fel', () => {
    expect(verifiera().fel).toEqual([])
  })
  it('103 uppgifter, ungefär en tredjedel per nivå', () => {
    expect(v3.length).toBe(103)
    expect(v3.filter((q) => q.niva === 'grund').length).toBe(35)
    expect(v3.filter((q) => q.niva === 'avancerad').length).toBe(34)
    expect(v3.filter((q) => q.niva === 'expert').length).toBe(34)
  })
  it('version 3 är aktiverad', () => {
    expect(ORD_VERSION).toBe(3)
    for (const n of NIVAER) {
      expect(poolFor(n).some((q) => q.fran_version === 3)).toBe(true)
      expect(poolFor(n, 3).length).toBe(poolFor(n, 2).length + v3.filter((q) => q.niva === n).length)
      for (const q of valjOrd(n, 'session-v2', 2)) expect(q.fran_version).toBeLessThanOrEqual(2)
    }
    expect(ordforradAntal()).toEqual({
      grund: { synonym: 86, antonym: 77 },
      avancerad: { synonym: 95, antonym: 76 },
      expert: { synonym: 97, antonym: 24 },
    })
  })
  it('varken uppslagsord eller facit fanns i banken före version 3', () => {
    const fore = allaOrd().filter((q) => q.fran_version < 3)
    const upptagna = new Set(fore.flatMap((q) => [q.ord, q.options[q.correctAnswer]]))
    for (const q of v3) {
      expect(upptagna.has(q.ord), q.id).toBe(false)
      expect(upptagna.has(q.options[q.correctAnswer]), q.id).toBe(false)
    }
  })
  it('bara distraktorer ur samma fält, facittext ifylld och utan tankstreck', () => {
    for (const q of v3) {
      q.typer.forEach((t, i) => {
        if (i !== q.correctAnswer) expect(t, q.id).toBe('samma_falt')
      })
      expect(q.facit_betyder, q.id).not.toBe('')
      expect(/[–—]/.test([q.facit_betyder, q.exempel, ...q.misstag].join(' ')), q.id).toBe(false)
    }
  })
  it('nya uppgifter ligger sist i varje bank', () => {
    for (const n of NIVAER) {
      const bank = allaOrd().filter((q) => q.niva === n)
      const forsta3 = bank.findIndex((q) => q.fran_version === 3)
      expect(bank.slice(forsta3).every((q) => q.fran_version === 3)).toBe(true)
    }
  })
})
