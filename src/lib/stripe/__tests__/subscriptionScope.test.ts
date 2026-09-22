/**
 * Scope-regeln i webhooken (docs/plan-paket-och-onboarding.md avsnitt 5).
 *
 * Den dyraste buggen den här regeln kan ha är att en befintlig kund får
 * mindre än i dag. Därför finns fallbacken, och därför testas den.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scopeFromSubscription } from '../subscriptionScope'

const ENV_NYCKLAR = ['STRIPE_PRICE_CV_WEEK', 'NEXT_PUBLIC_STRIPE_PRICE_ID'] as const
const original: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const nyckel of ENV_NYCKLAR) original[nyckel] = process.env[nyckel]
  process.env.STRIPE_PRICE_CV_WEEK = 'price_cv_week'
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID = 'price_manad'
})

afterEach(() => {
  for (const nyckel of ENV_NYCKLAR) {
    if (original[nyckel] === undefined) delete process.env[nyckel]
    else process.env[nyckel] = original[nyckel]
  }
})

describe('scopeFromSubscription', () => {
  it('läser scope ur metadata när checkout satt det', () => {
    expect(scopeFromSubscription({ metadata: { scope: 'tester' } })).toBe('tester')
    expect(scopeFromSubscription({ metadata: { scope: 'cv' } })).toBe('cv')
  })

  it('härleder scope ur planKey när scope saknas', () => {
    expect(scopeFromSubscription({ metadata: { planKey: 'cv_week' } })).toBe('cv')
    expect(scopeFromSubscription({ metadata: { plan: 'all_quarter' } })).toBe('allt')
  })

  it('faller tillbaka på priset när metadata saknas helt', () => {
    expect(scopeFromSubscription({ priceId: 'price_cv_week' })).toBe('cv')
    expect(scopeFromSubscription({ priceId: 'price_manad' })).toBe('allt')
  })

  it('metadata vinner över priset', () => {
    expect(
      scopeFromSubscription({ metadata: { scope: 'cv' }, priceId: 'price_manad' })
    ).toBe('cv')
  })

  it('okänt pris och tom metadata ger allt, ingen befintlig kund får mindre', () => {
    expect(scopeFromSubscription({})).toBe('allt')
    expect(scopeFromSubscription({ priceId: 'price_gammalt_abonnemang' })).toBe('allt')
    expect(scopeFromSubscription({ metadata: { scope: 'skrap' } })).toBe('allt')
  })
})
