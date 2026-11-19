// @vitest-environment node
/**
 * Frågebanken 2026-11-19 (docs/fragebank/spatial-2026-11-19.md): 99 nya
 * uppgifter med fran_version 3. De påverkar inte version 1 och 2, klarar den
 * oberoende verifieraren och ger ett nivåtest med samma form-fördelning när
 * SPATIAL_VERSION är 3. Verifieraren fäller också vridna och speglade dubbletter.
 */
import { describe, expect, it } from 'vitest'
// @ts-ignore ren JavaScript
import { verifieraBanker } from '../../../../scripts/spatial-verifiera.mjs'
import { poolFor, valjSpatial, perFormFor, FORMER, SPATIAL_VERSION, allaSpatial } from '../select'

const NIVAER = ['grund', 'avancerad', 'expert'] as const

describe('bankversion 3', () => {
  it('99 nya uppgifter, sist i bankerna, med unika id', () => {
    const nya = allaSpatial().filter((q) => q.fran_version === 3)
    expect(nya.length).toBe(99)
    const ids = allaSpatial().map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of NIVAER) {
      const pool = poolFor(n, 3)
      const forsta3 = pool.findIndex((q) => q.fran_version === 3)
      expect(pool.slice(forsta3).every((q) => q.fran_version === 3), n).toBe(true)
    }
  })
  it('version 1 och 2 drar ur samma pool som förut', () => {
    for (const n of NIVAER) {
      expect(poolFor(n, 2).length).toBe(96)
      expect(poolFor(n, 1).length).toBe(72)
      expect(poolFor(n, 2).some((q) => q.fran_version === 3)).toBe(false)
    }
    expect(SPATIAL_VERSION).toBe(3)
  })
  it('version 3: samma fördelning per form och aldrig två av samma form i följd', () => {
    for (const niva of NIVAER) {
      for (let s = 0; s < 60; s++) {
        const u = valjSpatial(niva, `v3-${s}`, 3)
        expect(u.length).toBe(15)
        const antal = Object.fromEntries(FORMER.map((f) => [f, u.filter((q) => q.form === f).length]))
        expect(antal).toEqual(perFormFor(3))
        for (let i = 1; i < u.length; i++) expect(u[i].form).not.toBe(u[i - 1].form)
      }
    }
  })
  it('den oberoende verifieraren hittar inga fel i någon uppgift', () => {
    const res = verifieraBanker()
    expect(res.fel).toEqual([])
    expect(res.antal).toBe(387)
  })
})
