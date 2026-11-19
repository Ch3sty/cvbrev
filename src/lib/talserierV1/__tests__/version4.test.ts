// @vitest-environment node
/**
 * Bankversion 4 (talserier omgång 3, 2026-11-19, docs/fragebank/talserier-2026-11-19-omg3.md):
 * de nya uppgifterna ligger i bankerna med fran_version 4 men påverkar inte
 * sessioner med talserie_version 1 till 3. Efter granskningen
 * (talserier-2026-11-19-omg3-granskning.md) är ts-g-geom-19 pensionerad från
 * version 4 och har aldrig visats.
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { forskjutnaPar, sammaStegPar, verifiera } from '../../../../scripts/talserier-verifiera.mjs'
import { valjTalserier, poolFor, allaTalserier, MAX_PER_FAMILJ, TALSERIE_VERSION } from '../select'

const NIVAER = ['grund', 'avancerad', 'expert'] as const

describe('talseriernas bankversion 4', () => {
  it('version 4 är påslagen', () => {
    expect(TALSERIE_VERSION).toBe(4)
  })

  it('version 3 har exakt samma pool som före omgång 3', () => {
    const storlek = { grund: 138, avancerad: 135, expert: 133 }
    for (const niva of NIVAER) {
      const v3 = poolFor(niva, 3)
      expect(v3.length).toBe(storlek[niva])
      expect(v3.every((q) => q.fran_version <= 3)).toBe(true)
    }
  })

  it('sessioner med version 1 till 3 drar aldrig en uppgift från version 4', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 100; s++) {
        for (const v of [1, 2, 3]) expect(valjTalserier(niva, `v${v}-${s}`, 15, v).every((q) => q.fran_version <= v)).toBe(true)
      }
    }
  })

  it('version 4 lägger till 99 uppgifter, ungefär en tredjedel per nivå, och håller familjetaket', () => {
    const nya = allaTalserier().filter((q) => q.fran_version === 4 && !q.pensionerad_fran)
    expect(nya.length).toBe(99)
    for (const niva of NIVAER) {
      const n = nya.filter((q) => q.niva === niva).length
      expect(n).toBeGreaterThanOrEqual(33)
      expect(n).toBeLessThanOrEqual(34)
      expect(poolFor(niva, 4).length).toBe(poolFor(niva, 3).length + n)
      for (let s = 0; s < 100; s++) {
        const u = valjTalserier(niva, `v4-${s}`, 15, 4)
        expect(u.length).toBe(15)
        const per = new Map<string, number>()
        for (const q of u) per.set(q.family, (per.get(q.family) ?? 0) + 1)
        expect(Math.max(...per.values())).toBeLessThanOrEqual(MAX_PER_FAMILJ)
      }
    }
  })

  it('grund väger över mot geometrisk i omgång 3', () => {
    const grund = allaTalserier().filter((q) => q.fran_version === 4 && q.niva === 'grund' && !q.pensionerad_fran)
    const per = new Map<string, number>()
    for (const q of grund) per.set(q.family, (per.get(q.family) ?? 0) + 1)
    expect(Math.max(...per.values())).toBe(per.get('geometrisk'))
    expect(per.get('vaxelvis') ?? 0).toBeLessThan(per.get('geometrisk')!)
  })

  it('ingen rad i version 4 är en förskjutning av en annan rad (V7)', () => {
    const par = (forskjutnaPar(allaTalserier()) as { a: { fran_version: number }; b: { fran_version: number } }[]).filter(
      (p) => p.a.fran_version === 4 || p.b.fran_version === 4
    )
    expect(par).toEqual([])
  })

  it('ts-g-geom-19 är pensionerad från version 4 och finns aldrig i en pool', () => {
    const q = allaTalserier().find((x) => x.id === 'ts-g-geom-19')!
    expect(q.pensionerad_fran).toBe(4)
    expect(poolFor('grund', 4).map((x) => x.id)).not.toContain('ts-g-geom-19')
  })

  it('varje geometrisk grundrad i version 4 har ett eget räknesättspar', () => {
    const par = allaTalserier()
      .filter((q) => q.fran_version === 4 && q.niva === 'grund' && q.family === 'geometrisk' && !q.pensionerad_fran)
      .map((q) => (q.params as { kv: number[][] }).kv.map((x) => x.join('/')).sort().join(','))
    expect(new Set(par).size).toBe(par.length)
  })

  it('ingen rad i version 4 har samma stegföljd eller kvotföljd som en annan rad på någon nivå (V8)', () => {
    const par = sammaStegPar(allaTalserier(), 4) as { a: { id: string }; b: { id: string } }[]
    expect(par.map((p) => `${p.a.id}/${p.b.id}`)).toEqual([])
  })

  it('tredje ordningen har fem visade steg och inget alternativ som stämmer med en enklare läsning (V9)', () => {
    const tredje = allaTalserier().filter((q) => q.fran_version === 4 && q.family === 'andra_ordningen' && (q.params as { t?: number }).t)
    expect(tredje.length).toBeGreaterThan(0)
    for (const q of tredje) {
      expect(q.visade.length, q.id).toBeGreaterThanOrEqual(6)
      expect(verifiera(q).fel, q.id).toEqual([])
    }
  })

  it('inget tal upprepas i en ny rad och inga tankstreck i texterna', () => {
    for (const q of allaTalserier().filter((x) => x.fran_version === 4)) {
      expect(new Set(q.visade).size, q.id).toBe(q.visade.length)
      expect([q.regel, ...q.misstag].join(' '), q.id).not.toMatch(/—/)
    }
  })
})
