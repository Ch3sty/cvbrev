// @vitest-environment node
/**
 * Bankversion 2 (frågebanksomgången 2026-11-19, docs/fragebank/talserier-2026-11-19.md):
 * de nya uppgifterna ligger i bankerna men påverkar inte sessioner med
 * talserie_version 1, och version 2 håller familjetaket och spärrarna.
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifiera, forskjutnaPar } from '../../../../scripts/talserier-verifiera.mjs'
import { valjTalserier, poolFor, allaTalserier, talserieVersion, MAX_PER_FAMILJ, TALSERIE_VERSION } from '../select'

const NIVAER = ['grund', 'avancerad', 'expert'] as const

describe('talseriernas bankversion 2', () => {
  it('version 1 har exakt de 72 uppgifterna per nivå som förut', () => {
    for (const niva of NIVAER) {
      const v1 = poolFor(niva, 1)
      expect(v1.length).toBe(72)
      expect(v1.every((q) => q.fran_version === 1)).toBe(true)
    }
  })

  it('en session med version 1 drar aldrig en ny uppgift', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 100; s++) {
        expect(valjTalserier(niva, `v1-${s}`, 15, 1).every((q) => q.fran_version === 1)).toBe(true)
      }
    }
  })

  it('version 2 lägger till cirka 100 uppgifter och håller familjetaket', () => {
    const nya = allaTalserier().filter((q) => q.fran_version === 2)
    expect(nya.length).toBe(100)
    for (const niva of NIVAER) {
      expect(poolFor(niva, 2).length).toBeGreaterThan(poolFor(niva, 1).length)
      for (let s = 0; s < 100; s++) {
        const u = valjTalserier(niva, `v2-${s}`, 15, 2)
        expect(u.length).toBe(15)
        const per = new Map<string, number>()
        for (const q of u) per.set(q.family, (per.get(q.family) ?? 0) + 1)
        expect(Math.max(...per.values())).toBeLessThanOrEqual(MAX_PER_FAMILJ)
      }
    }
  })

  it('expertkopiorna av två avancerade rader är pensionerade från version 2', () => {
    const v1 = poolFor('expert', 1).map((q) => q.id)
    const v2 = poolFor('expert', 2).map((q) => q.id)
    for (const id of ['ts-e-affin-11', 'ts-e-affin-08']) {
      expect(v1).toContain(id)
      expect(v2).not.toContain(id)
    }
    expect(TALSERIE_VERSION).toBeGreaterThanOrEqual(2)
  })

  it('ingen ny rad är en förskjutning av en annan rad (V7)', () => {
    const par = (forskjutnaPar(allaTalserier()) as { a: { fran_version: number }; b: { fran_version: number } }[]).filter(
      (p) => p.a.fran_version === 2 || p.b.fran_version === 2
    )
    expect(par).toEqual([])
  })

  it('meta styr versionen', () => {
    expect(talserieVersion({ talserie_version: 2 })).toBe(2)
    expect(talserieVersion({ talserie_version: 1 })).toBe(1)
    expect(talserieVersion(null)).toBe(TALSERIE_VERSION)
  })

  it('den oberoende verifieraren godkänner alla uppgifter', () => {
    const fel = allaTalserier().flatMap((q) => verifiera(q).fel as string[])
    expect(fel).toEqual([])
  })
})
