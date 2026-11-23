// Köpsteget visas inte för den som redan prenumererar på det som säljs
// (testköpet 2026-11-23). Regeln ska följa kassans spärr.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { harRedanPlanen } from '../redanKund'

const FORE = { ...process.env }
beforeEach(() => {
  process.env.NEXT_PUBLIC_STRIPE_PRICE_ID = 'price_manad'
  process.env.STRIPE_PRICE_CV_WEEK = 'price_cv'
})
afterEach(() => {
  process.env = { ...FORE }
})

describe('harRedanPlanen', () => {
  it('aktiv Premium som köper Premium är redan kund', () => {
    expect(harRedanPlanen({ subscription_status: 'active', price_id: 'price_manad' }, 'all_month')).toBe(true)
  })
  it('förfallen betalning räknas som levande, som i kassans spärr', () => {
    expect(harRedanPlanen({ subscription_status: 'past_due', price_id: 'price_manad' }, 'all_month')).toBe(true)
  })
  it('okänt pris på en levande prenumeration räknas som samma', () => {
    expect(harRedanPlanen({ subscription_status: 'active', price_id: 'price_okant' }, 'all_month')).toBe(true)
    expect(harRedanPlanen({ subscription_status: 'active', price_id: null }, 'all_month')).toBe(true)
  })
  it('äldre spårpaket som köper Premium är en uppgradering och släpps fram', () => {
    expect(harRedanPlanen({ subscription_status: 'active', price_id: 'price_cv' }, 'all_month')).toBe(false)
  })
  it('ingen eller avslutad prenumeration får köpsteget', () => {
    expect(harRedanPlanen({ subscription_status: null, price_id: null }, 'all_month')).toBe(false)
    expect(harRedanPlanen({ subscription_status: 'canceled', price_id: 'price_manad' }, 'all_month')).toBe(false)
    expect(harRedanPlanen(null, 'all_month')).toBe(false)
  })
})
