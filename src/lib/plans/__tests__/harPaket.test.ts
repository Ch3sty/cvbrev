/**
 * harPaket (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 2).
 *
 * Menyn sa "Förnyas 24 oktober, 99 kr" för Hela paketet månad, eftersom
 * längden gissades ur premium_until, som webhooken nollar för
 * prenumerationer. Nu avgör prisid:t, och gissningen är bara reserv.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { harPaket } from '../harPaket'
import { PLAN_BY_KEY, SUBSCRIPTION_PLAN_KEYS, type PlanKey } from '../plans'

const PRIS: Record<PlanKey, [string, string]> = {
  cv_week: ['STRIPE_PRICE_CV_WEEK', 'price_cv_week'],
  test_week: ['STRIPE_PRICE_TEST_WEEK', 'price_test_week'],
  all_day: ['STRIPE_PRICE_DAYPASS', 'price_dag'],
  all_week: ['STRIPE_PRICE_ALL_WEEK', 'price_all_week'],
  all_month: ['NEXT_PUBLIC_STRIPE_PRICE_ID', 'price_manad'],
  all_quarter: ['STRIPE_PRICE_QUARTER', 'price_kvartal'],
}

const original: Record<string, string | undefined> = {}
beforeEach(() => {
  for (const [env, id] of Object.values(PRIS)) {
    original[env] = process.env[env]
    process.env[env] = id
  }
})
afterEach(() => {
  for (const [env] of Object.values(PRIS)) {
    if (original[env] === undefined) delete process.env[env]
    else process.env[env] = original[env]
  }
})

const NU = new Date('2026-09-24T08:00:00Z')

describe('harPaket med prisid', () => {
  it.each(SUBSCRIPTION_PLAN_KEYS)('%s: prisid:t ger paketet, premium_until nollad', (plan) => {
    const scope = PLAN_BY_KEY[plan].scope
    expect(harPaket(scope, null, NU, { priceId: PRIS[plan][1], status: 'active' })).toBe(plan)
  })

  it('Hela paketet månad ger 149 kr, inte veckans 99', () => {
    const plan = harPaket('allt', null, NU, { priceId: 'price_manad', status: 'active' })
    expect(plan).toBe('all_month')
    expect(PLAN_BY_KEY[plan!].amount).toBe(149)
  })

  it('Hela paketet kvartal ger 299 kr', () => {
    const plan = harPaket('allt', null, NU, { priceId: 'price_kvartal', status: 'trialing' })
    expect(PLAN_BY_KEY[plan!].amount).toBe(299)
  })

  it('past_due räknas fortfarande som prenumerationens paket', () => {
    expect(harPaket('allt', null, NU, { priceId: 'price_kvartal', status: 'past_due' })).toBe('all_quarter')
  })

  it('en avslutad prenumeration avgör inte: Dagspasset efter en gammal månad', () => {
    const dygn = new Date(NU.getTime() + 20 * 3600000)
    expect(harPaket('allt', dygn, NU, { priceId: 'price_manad', status: 'canceled' })).toBe('all_day')
  })

  it('prisid:t måste ge samma scope som kunden har', () => {
    // CV-paketets pris men scopet allt (Dagspass ovanpå): gissningen tar över.
    expect(harPaket('allt', null, NU, { priceId: 'price_cv_week', status: 'active' })).toBe('all_week')
  })

  it('okänt prisid faller tillbaka på gissningen', () => {
    const om30 = new Date(NU.getTime() + 30 * 86400000)
    expect(harPaket('allt', om30, NU, { priceId: 'price_okant', status: 'active' })).toBe('all_month')
  })

  it('Dagspassets eget prisid ger aldrig ett prenumerationspaket', () => {
    expect(harPaket('allt', null, NU, { priceId: 'price_dag', status: 'active' })).toBe('all_week')
  })
})

describe('harPaket utan prisid (engångsköp, manuell premium)', () => {
  it('gratisnivån', () => {
    expect(harPaket(null, null, NU)).toBeNull()
  })
  it('spåren är alltid vecka', () => {
    expect(harPaket('cv', null, NU)).toBe('cv_week')
    expect(harPaket('tester', null, NU)).toBe('test_week')
  })
  it('allt: längden ur premium_until', () => {
    const om = (dagar: number) => new Date(NU.getTime() + dagar * 86400000)
    expect(harPaket('allt', om(1), NU)).toBe('all_day')
    expect(harPaket('allt', om(6), NU)).toBe('all_week')
    expect(harPaket('allt', om(28), NU)).toBe('all_month')
    expect(harPaket('allt', om(88), NU)).toBe('all_quarter')
    expect(harPaket('allt', null, NU)).toBe('all_week')
  })
})
