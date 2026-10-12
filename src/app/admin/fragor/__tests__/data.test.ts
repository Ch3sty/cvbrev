// @vitest-environment node
/**
 * Admin Frågor (beställningen omgång 3, B4): med tom fraga_statistik och tom
 * vy står alla frågor som okalibrerade utan fel; fixturdata ger rätt status
 * och ordning; registret täcker alla testtyper.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }))
vi.mock('@/lib/admin/metrics', () => ({ hamtaUndantagCachad: async () => ({ konton: [], ids: [], stripeKunder: new Set(), har: () => false }) }))

import { filtrera, median, slaIhop } from '../data'
import { register, kindForId, TEST_KINDS } from '@/lib/fragor/register.server'

describe('admin Frågor', () => {
  it('registret har frågor från alla fem testtyper, deduktivens bank inräknad', () => {
    const reg = register()
    for (const k of TEST_KINDS) expect(reg.some((r) => r.test_kind === k), k).toBe(true)
    expect(reg.filter((r) => r.test_kind === 'deduktiv').length).toBe(75)
    expect(reg.some((r) => r.test_kind === 'verbal' && r.id === 'va-17-fyradagarsvecka:0')).toBe(true)
    expect(kindForId('dd-e-d3-05')).toBe('deduktiv')
    expect(kindForId('fs-g-vrid-01')).toBe('figurserie')
  })

  it('tom vy: alla frågor okalibrerade, inga fel', () => {
    const rader = slaIhop(register(), new Map())
    expect(rader.length).toBeGreaterThan(500)
    expect(rader.every((r) => r.status === 'okalibrerad' && r.svar === 0 && r.p === null)).toBe(true)
    // Vyn gick inte att läsa (null): samma sak.
    expect(slaIhop(register(), null).every((r) => r.status === 'okalibrerad')).toBe(true)
  })

  it('fixturdata: prior 0,40 och uppmätt 0,70 flaggas först, 0,60 inte; okalibrerade sorteras på antal svar', () => {
    const reg = register().filter((r) => r.test_kind === 'deduktiv' && r.niva === 'expert').slice(0, 4)
    expect(reg.every((r) => r.p_prior === 0.4)).toBe(true)
    const vy = new Map([
      [reg[0].id, { svar: 40, konton: 25, ratt: 24, p: 0.6, tid_median_s: 70 }],
      [reg[1].id, { svar: 40, konton: 25, ratt: 28, p: 0.7, tid_median_s: 60 }],
      [reg[2].id, { svar: 12, konton: 9, ratt: 5, p: 0.42, tid_median_s: 80 }],
      [reg[3].id, { svar: 3, konton: 3, ratt: 1, p: 0.33, tid_median_s: 90 }],
    ])
    const rader = filtrera(slaIhop(reg, vy), { kind: 'deduktiv', niva: 'expert', status: null })
    expect(rader.map((r) => [r.id, r.status])).toEqual([
      [reg[1].id, 'prior_fel'],
      [reg[0].id, 'fel_niva'],
      [reg[2].id, 'okalibrerad'],
      [reg[3].id, 'okalibrerad'],
    ])
    // 0,60 på expert: priorn håller men bandet (högst 0,50) gör inte det.
    expect(filtrera(slaIhop(reg, vy), { kind: null, niva: null, status: 'prior_fel' }).map((r) => r.id)).toEqual([reg[1].id])
  })

  it('median', () => {
    expect(median([])).toBeNull()
    expect(median([0.2, 0.8, 0.5])).toBe(0.5)
    expect(median([0.2, 0.4])).toBeCloseTo(0.3)
  })
})
