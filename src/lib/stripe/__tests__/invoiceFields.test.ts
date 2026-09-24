import { describe, expect, it } from 'vitest'
import {
  invoiceChargeId,
  invoiceLinePriceId,
  invoicePaymentIntentId,
  invoicePeriod,
  invoiceSubscriptionId,
  invoiceSubscriptionMetadata,
  subscriptionPeriodEnd,
} from '../invoiceFields'

// Fakturan som den kom i testläget 2026-09-24, API-version 2025-08-27.basil
// (förkortad). invoice.subscription, charge och payment_intent finns inte.
const basil = {
  object: 'invoice',
  billing_reason: 'subscription_create',
  amount_paid: 14900,
  parent: {
    type: 'subscription_details',
    quote_details: null,
    subscription_details: {
      subscription: 'sub_basil',
      metadata: { planKey: 'all_month', scope: 'allt' },
    },
  },
  payments: {
    object: 'list',
    data: [{ object: 'invoice_payment', payment: { type: 'payment_intent', payment_intent: 'pi_basil', charge: 'ch_basil' } }],
  },
  lines: {
    data: [
      {
        object: 'line_item',
        period: { start: 1790232000, end: 1792824000 },
        pricing: { type: 'price_details', price_details: { price: 'price_manad', product: 'prod_x' } },
        parent: {
          type: 'subscription_item_details',
          subscription_item_details: { subscription: 'sub_basil', proration: false },
        },
      },
    ],
  },
}

// Samma faktura i det gamla formatet (acacia och äldre).
const acacia = {
  object: 'invoice',
  billing_reason: 'subscription_create',
  amount_paid: 7900,
  subscription: 'sub_acacia',
  subscription_details: { metadata: { planKey: 'cv_week' } },
  charge: 'ch_acacia',
  payment_intent: { id: 'pi_acacia', object: 'payment_intent' },
  lines: {
    data: [{ object: 'line_item', price: { id: 'price_cv' }, period: { start: 1790232000, end: 1790836800 } }],
  },
}

describe('invoiceFields, basil', () => {
  it('läser prenumerationen ur parent.subscription_details', () => {
    expect(invoiceSubscriptionId(basil)).toBe('sub_basil')
  })
  it('läser metadata ur parent', () => {
    expect(invoiceSubscriptionMetadata(basil)).toEqual({ planKey: 'all_month', scope: 'allt' })
  })
  it('läser payment_intent och charge ur payments', () => {
    expect(invoicePaymentIntentId(basil)).toBe('pi_basil')
    expect(invoiceChargeId(basil)).toBe('ch_basil')
  })
  it('läser priset ur pricing.price_details', () => {
    expect(invoiceLinePriceId(basil)).toBe('price_manad')
  })
  it('läser perioden ur raden', () => {
    expect(invoicePeriod(basil)).toEqual({
      start: new Date(1790232000 * 1000).toISOString(),
      end: new Date(1792824000 * 1000).toISOString(),
    })
  })
  it('ger null när payments inte är expanderad', () => {
    const utan = { ...basil, payments: undefined }
    expect(invoicePaymentIntentId(utan)).toBeNull()
    expect(invoiceChargeId(utan)).toBeNull()
  })
})

describe('invoiceFields, acacia', () => {
  it('läser prenumerationen på roten', () => {
    expect(invoiceSubscriptionId(acacia)).toBe('sub_acacia')
  })
  it('läser metadata ur subscription_details', () => {
    expect(invoiceSubscriptionMetadata(acacia)).toEqual({ planKey: 'cv_week' })
  })
  it('läser charge som sträng och payment_intent som objekt', () => {
    expect(invoiceChargeId(acacia)).toBe('ch_acacia')
    expect(invoicePaymentIntentId(acacia)).toBe('pi_acacia')
  })
  it('läser priset på raden', () => {
    expect(invoiceLinePriceId(acacia)).toBe('price_cv')
  })
})

describe('invoiceFields, udda indata', () => {
  it('tål null, tom faktura och engångsfaktura utan prenumeration', () => {
    expect(invoiceSubscriptionId(null)).toBeNull()
    expect(invoiceSubscriptionId({})).toBeNull()
    expect(invoiceSubscriptionId({ parent: null })).toBeNull()
    expect(invoiceSubscriptionId({ parent: { type: 'quote_details', subscription_details: null } })).toBeNull()
    expect(invoicePeriod({})).toEqual({ start: null, end: null })
  })
  it('tar expanderad prenumeration i parent', () => {
    expect(
      invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: 'sub_exp' } } } })
    ).toBe('sub_exp')
  })
})

describe('subscriptionPeriodEnd', () => {
  it('läser roten (acacia) och raderna (basil)', () => {
    expect(subscriptionPeriodEnd({ current_period_end: 100 })).toBe(100)
    expect(subscriptionPeriodEnd({ items: { data: [{ current_period_end: 300 }, { current_period_end: 200 }] } })).toBe(200)
    expect(subscriptionPeriodEnd({ items: { data: [] } })).toBeNull()
  })
})
