// @vitest-environment node
/**
 * Bankversion 2 av ordförrådet (docs/fragebank/ordforrad-2026-11-19.md), aktiverad
 * 2026-11-19 efter testansvarigs granskning (ordforrad-2026-11-19-granskning.md):
 * 101 nya uppgifter sist i bankerna med fran_version 2. Version 1 ska dra exakt
 * samma pool som förut, och den oberoende verifieraren ska vara grön.
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifiera } from '../../../../scripts/ordforrad-verifiera.mjs'
import { ORD_VERSION, poolFor, allaOrd, valjOrd } from '../select'
import { ordforradRedo } from '../status'
import { hittaOrd } from '../fragor.server'

describe('ordförråd version 2', () => {
  it('verifieraren hittar inga fel', () => {
    expect(verifiera().fel).toEqual([])
  })
  it('version 2 finns kvar för sina sessioner', () => {
    expect(ORD_VERSION).toBeGreaterThanOrEqual(2)
    const v2 = allaOrd().filter((q) => q.fran_version === 2)
    expect(v2.length).toBe(101)
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      expect(poolFor(n, 2).length).toBe(poolFor(n, 1).length + v2.filter((q) => q.niva === n).length)
    }
    expect(ordforradRedo()).toBe(true)
  })
  it('version 1 drar samma pool och samma urval som före version 2', () => {
    expect(poolFor('grund', 1).length).toBe(91)
    expect(poolFor('avancerad', 1).length).toBe(99)
    expect(poolFor('expert', 1).length).toBe(61)
    for (const n of ['grund', 'avancerad', 'expert'] as const)
      for (const q of valjOrd(n, 'session-v1', 1)) expect(q.fran_version).toBe(1)
  })
  it('rättelserna i version 1 behåller id, facit och index', () => {
    const tunn = hittaOrd('of-g-m-39')!
    expect(tunn.options[tunn.correctAnswer]).toBe('tjock')
    expect(tunn.options[3]).toBe('blöt')
    for (const id of ['of-e-s-04', 'of-e-s-29', 'of-e-s-39']) expect(hittaOrd(id)!.facit_betyder).not.toBe('')
  })
  it('nya uppgifter ligger sist i varje bank', () => {
    for (const n of ['grund', 'avancerad', 'expert'] as const) {
      const bank = allaOrd().filter((q) => q.niva === n)
      const forsta2 = bank.findIndex((q) => q.fran_version === 2)
      // efter version 2 kommer bara senare versioner (version 3 ligger sist, omgång 2)
      expect(bank.slice(forsta2).every((q) => q.fran_version >= 2)).toBe(true)
    }
  })
})
