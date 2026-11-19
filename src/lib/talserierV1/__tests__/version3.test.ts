// @vitest-environment node
/**
 * Bankversion 3 (talserier omgång 2, 2026-11-19, docs/fragebank/talserier-2026-11-19-omg2.md):
 * de nya uppgifterna ligger i bankerna med fran_version 3 men påverkar inte
 * sessioner med talserie_version 1 eller 2. Versionen slogs på 2026-11-19
 * (TALSERIE_VERSION = 3 i select.ts).
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { forskjutnaPar, sammaStegPar } from '../../../../scripts/talserier-verifiera.mjs'
import { valjTalserier, poolFor, allaTalserier, MAX_PER_FAMILJ } from '../select'

const NIVAER = ['grund', 'avancerad', 'expert'] as const
const PENSIONERADE = ['ts-e-affin-16', 'ts-a-affin-08', 'ts-a-affin-06', 'ts-e-affin-14', 'ts-a-affin-16', 'ts-e-affin-06', 'ts-g-andra-09', 'ts-g-vaxel-09']

describe('talseriernas bankversion 3', () => {
  it('version 2 har exakt samma pool som före omgång 2', () => {
    const storlek = { grund: 106, avancerad: 105, expert: 103 }
    for (const niva of NIVAER) {
      const v2 = poolFor(niva, 2)
      expect(v2.length).toBe(storlek[niva])
      expect(v2.every((q) => q.fran_version <= 2)).toBe(true)
    }
  })

  it('sessioner med version 1 och 2 drar aldrig en uppgift från version 3', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 100; s++) {
        expect(valjTalserier(niva, `v1-${s}`, 15, 1).every((q) => q.fran_version === 1)).toBe(true)
        expect(valjTalserier(niva, `v2-${s}`, 15, 2).every((q) => q.fran_version <= 2)).toBe(true)
      }
    }
  })

  it('version 3 lägger till 100 uppgifter, ungefär en tredjedel per nivå, och håller familjetaket', () => {
    const nya = allaTalserier().filter((q) => q.fran_version === 3)
    expect(nya.length).toBe(100)
    for (const niva of NIVAER) {
      const n = nya.filter((q) => q.niva === niva).length
      expect(n).toBeGreaterThanOrEqual(33)
      expect(n).toBeLessThanOrEqual(34)
      for (let s = 0; s < 100; s++) {
        const u = valjTalserier(niva, `v3-${s}`, 15, 3)
        expect(u.length).toBe(15)
        const per = new Map<string, number>()
        for (const q of u) per.set(q.family, (per.get(q.family) ?? 0) + 1)
        expect(Math.max(...per.values())).toBeLessThanOrEqual(MAX_PER_FAMILJ)
      }
    }
  })

  it('de förskjutna raderna från version 1 är pensionerade från version 3, inte tidigare', () => {
    for (const id of PENSIONERADE) {
      const q = allaTalserier().find((x) => x.id === id)!
      expect(q.fran_version).toBe(1)
      expect(q.pensionerad_fran).toBe(3)
      expect(poolFor(q.niva, 2).map((x) => x.id)).toContain(id)
      expect(poolFor(q.niva, 3).map((x) => x.id)).not.toContain(id)
    }
  })

  it('ingen rad i version 3 är en förskjutning av en annan rad (V7)', () => {
    const par = (forskjutnaPar(allaTalserier()) as { a: { fran_version: number }; b: { fran_version: number } }[]).filter(
      (p) => p.a.fran_version === 3 || p.b.fran_version === 3
    )
    expect(par).toEqual([])
  })

  it('ingen rad i version 3 har samma stegföljd som en annan rad på någon nivå (V8)', () => {
    const par = sammaStegPar(allaTalserier(), 3) as { a: { id: string }; b: { id: string } }[]
    expect(par.map((p) => `${p.a.id}/${p.b.id}`)).toEqual([])
  })

  it('inget tal upprepas i en ny rad', () => {
    for (const q of allaTalserier().filter((x) => x.fran_version === 3)) expect(new Set(q.visade).size, q.id).toBe(q.visade.length)
  })
})
