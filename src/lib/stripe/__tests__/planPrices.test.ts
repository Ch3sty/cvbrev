/**
 * Priserna per paket (docs/plan-paket-och-onboarding.md avsnitt 5).
 *
 * Det som måste hålla: varje paket har sin egen env-variabel, de tre gamla
 * behåller sina namn så att inga kvitton påverkas, uppslaget tillbaka från
 * price-id till paket fungerar, och bara prenumerationspaketen släpps in i
 * prenumerationscheckouten.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getPlanEnvName,
  getStripePriceId,
  priceIdToPlanKey,
  getSubscriptionPriceAllowlist,
} from '../planPrices'
import { PLANS } from '@/lib/plans/plans'

const ENV_NYCKLAR = [
  'STRIPE_PRICE_CV_WEEK',
  'STRIPE_PRICE_TEST_WEEK',
  'STRIPE_PRICE_DAYPASS',
  'STRIPE_PRICE_ALL_WEEK',
  'NEXT_PUBLIC_STRIPE_PRICE_ID',
  'STRIPE_PRICE_QUARTER',
] as const

const original: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const nyckel of ENV_NYCKLAR) original[nyckel] = process.env[nyckel]
  process.env.STRIPE_PRICE_CV_WEEK = 'price_cv_week'
  process.env.STRIPE_PRICE_TEST_WEEK = 'price_test_week'
  process.env.STRIPE_PRICE_DAYPASS = 'price_dag'
  process.env.STRIPE_PRICE_ALL_WEEK = 'price_all_week'
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID = 'price_manad'
  process.env.STRIPE_PRICE_QUARTER = 'price_kvartal'
})

afterEach(() => {
  for (const nyckel of ENV_NYCKLAR) {
    if (original[nyckel] === undefined) delete process.env[nyckel]
    else process.env[nyckel] = original[nyckel]
  }
})

describe('planPrices', () => {
  it('varje paket har en egen env-variabel', () => {
    const namn = PLANS.map((p) => getPlanEnvName(p.key))
    expect(new Set(namn).size).toBe(PLANS.length)
  })

  it('de tre befintliga priserna behåller sina env-namn', () => {
    expect(getPlanEnvName('all_day')).toBe('STRIPE_PRICE_DAYPASS')
    expect(getPlanEnvName('all_month')).toBe('NEXT_PUBLIC_STRIPE_PRICE_ID')
    expect(getPlanEnvName('all_quarter')).toBe('STRIPE_PRICE_QUARTER')
  })

  it('hämtar price-id per paket', () => {
    expect(getStripePriceId('cv_week')).toBe('price_cv_week')
    expect(getStripePriceId('all_month')).toBe('price_manad')
  })

  it('kastar med env-namnet i texten när priset saknas', () => {
    delete process.env.STRIPE_PRICE_ALL_WEEK
    expect(() => getStripePriceId('all_week')).toThrow(/STRIPE_PRICE_ALL_WEEK/)
  })

  it('slår tillbaka från price-id till paket', () => {
    expect(priceIdToPlanKey('price_test_week')).toBe('test_week')
    expect(priceIdToPlanKey('price_kvartal')).toBe('all_quarter')
    expect(priceIdToPlanKey('price_okant')).toBeNull()
    expect(priceIdToPlanKey(null)).toBeNull()
  })

  it('allowlistan är prenumerationerna, aldrig Allt-dagen', () => {
    const tillatna = getSubscriptionPriceAllowlist()
    expect(tillatna).toContain('price_cv_week')
    expect(tillatna).toContain('price_test_week')
    expect(tillatna).toContain('price_all_week')
    expect(tillatna).toContain('price_manad')
    expect(tillatna).toContain('price_kvartal')
    expect(tillatna).not.toContain('price_dag')
  })

  it('saknade priser tas bort ur allowlistan i stället för att bli undefined', () => {
    delete process.env.STRIPE_PRICE_CV_WEEK
    const tillatna = getSubscriptionPriceAllowlist()
    expect(tillatna).not.toContain('price_cv_week')
    expect(tillatna.every((id) => typeof id === 'string')).toBe(true)
  })
})
