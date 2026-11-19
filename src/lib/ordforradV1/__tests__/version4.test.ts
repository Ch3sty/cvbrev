// @vitest-environment node
/**
 * Bankversion 4 av ordförrådet (omgång 3, docs/fragebank/ordforrad-2026-11-19-omg3.md):
 * 102 nya uppgifter sist i bankerna med fran_version 4. Inlagda men inte
 * aktiverade: ORD_VERSION är fortfarande 3, så pooler, urval och antal är
 * oförändrade tills version 4 aktiveras. När ORD_VERSION blir 4 vänds testet
 * "inlagd men inte aktiverad" (se dokumentets aktiveringssteg).
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifiera } from '../../../../scripts/ordforrad-verifiera.mjs'
import { ORD_VERSION, poolFor, allaOrd, valjOrd } from '../select'
import { ordforradAntal } from '../status'

const NIVAER = ['grund', 'avancerad', 'expert'] as const
/** Längsta gemensamma för- eller efterled mellan två ord. */
const form = (a: string, b: string) => {
  let p = 0
  while (p < a.length && p < b.length && a[p] === b[p]) p++
  let s = 0
  while (s < a.length && s < b.length && a[a.length - 1 - s] === b[b.length - 1 - s]) s++
  return Math.max(p, s)
}

describe('ordförråd version 4', () => {
  const v4 = allaOrd().filter((q) => q.fran_version === 4)

  it('verifieraren hittar inga fel', () => {
    expect(verifiera().fel).toEqual([])
  })
  it('102 uppgifter, ungefär en tredjedel per nivå', () => {
    expect(v4.length).toBe(102)
    expect(v4.filter((q) => q.niva === 'grund').length).toBe(34)
    expect(v4.filter((q) => q.niva === 'avancerad').length).toBe(34)
    expect(v4.filter((q) => q.niva === 'expert').length).toBe(34)
  })
  it('version 4 är aktiverad', () => {
    expect(ORD_VERSION).toBe(4)
    for (const n of NIVAER) {
      expect(poolFor(n).some((q) => q.fran_version === 4)).toBe(true)
      expect(poolFor(n, 4).length).toBe(poolFor(n, 3).length + v4.filter((q) => q.niva === n).length)
      for (const q of valjOrd(n, 'session-v3', 3)) expect(q.fran_version).toBeLessThanOrEqual(3)
    }
    expect(ordforradAntal()).toEqual({
      grund: { synonym: 104, antonym: 93 },
      avancerad: { synonym: 113, antonym: 92 },
      expert: { synonym: 121, antonym: 34 },
    })
  })
  it('varken uppslagsord eller facit fanns i banken före version 4', () => {
    const fore = allaOrd().filter((q) => q.fran_version < 4)
    const upptagna = new Set(fore.flatMap((q) => [q.ord, q.options[q.correctAnswer]]))
    for (const q of v4) {
      expect(upptagna.has(q.ord), q.id).toBe(false)
      expect(upptagna.has(q.options[q.correctAnswer]), q.id).toBe(false)
    }
  })
  it('bara distraktorer ur samma fält, facittext ifylld och utan tankstreck', () => {
    for (const q of v4) {
      q.typer.forEach((t, i) => {
        if (i !== q.correctAnswer) expect(t, q.id).toBe('samma_falt')
      })
      expect(q.facit_betyder, q.id).not.toBe('')
      expect(/[–—]/.test([q.facit_betyder, q.exempel, ...q.misstag].join(' ')), q.id).toBe(false)
    }
  })
  it('motsatsord på expert går inte att lösa på formen', () => {
    for (const q of v4.filter((x) => x.niva === 'expert' && x.typ === 'antonym')) {
      const facit = q.options[q.correctAnswer]
      const f = form(q.ord, facit)
      if (f < 3) continue
      const lika = q.options.filter((o, i) => i !== q.correctAnswer && form(q.ord, o) >= f).length
      expect(lika, q.id).toBeGreaterThanOrEqual(2)
    }
  })
  it('nya uppgifter ligger sist i varje bank', () => {
    for (const n of NIVAER) {
      const bank = allaOrd().filter((q) => q.niva === n)
      const forsta4 = bank.findIndex((q) => q.fran_version === 4)
      expect(bank.slice(forsta4).every((q) => q.fran_version === 4)).toBe(true)
    }
  })
})
