/**
 * Ångerrättssamtycket i kassan
 * (docs/plan-paket-och-onboarding.md avsnitt 8).
 *
 * Undantaget från ångerrätten på fjorton dagar gäller bara om kundens
 * uttryckliga samtycke till att tjänsten påbörjas direkt är dokumenterat.
 * Det som måste hålla, och som det här testet vaktar:
 *
 *   1. Ett köp utan samtycke går inte igenom, och ingen Stripe-session skapas.
 *      Gäller både prenumerationerna och engångsköpet Allt-dagen.
 *   2. Med samtycke bär sessionen tidsstämpel och den exakta kryssrutetexten,
 *      och samma metadata följer med ned på subscription_data respektive
 *      payment_intent_data, alltså den rad som överlever själva sessionen.
 *   3. Texten kommer ur samma konstant som klienten renderar. Skrivs
 *      kryssrutan om utan att metadatan följer med går det här testet rött.
 *   4. Tidsstämpeln sätts på servern. En klient som skickar med en egen
 *      tidpunkt kan inte skriva över den.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PAKETSKARM } from '@/lib/onboarding/program'

const ANVANDARE = { id: 'user-1', email: 'kund@example.com', user_metadata: {} }

const sessionsSkapa = vi.fn()
const kundSkapa = vi.fn()
const kundHamta = vi.fn()

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}))

vi.mock('@/lib/stripe/server', () => ({
  stripe: {
    checkout: { sessions: { create: (...a: unknown[]) => sessionsSkapa(...a) } },
    customers: {
      create: (...a: unknown[]) => kundSkapa(...a),
      retrieve: (...a: unknown[]) => kundHamta(...a),
    },
  },
}))

// Profilen har redan en Stripe-kund, så rutten hoppar över kundskapandet.
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: ANVANDARE }, error: null }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: { stripe_customer_id: 'cus_1', email: ANVANDARE.email },
          }),
        }),
      }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
}))

// Ingen levande prenumeration: spärren mot dubbletter ska aldrig vara det
// som fäller ett test om samtycket.
vi.mock('@/lib/stripe/guard-existing-subscription', () => ({
  findLiveSubscription: async () => null,
  alreadySubscribedResponse: () => ({ error: 'finns redan' }),
  blocksAsDuplicate: () => false,
}))

vi.mock('@/lib/stripe/planPrices', () => ({
  getStripePriceId: (plan: string) => `price_${plan}`,
}))

import { POST } from '../route'

const anrop = (body: unknown) =>
  POST({ json: async () => body } as unknown as Parameters<typeof POST>[0])

beforeEach(() => {
  vi.clearAllMocks()
  kundHamta.mockResolvedValue({ id: 'cus_1' })
  sessionsSkapa.mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' })
})

describe('create-plan-session, ångerrättssamtycket', () => {
  it('svarar 400 utan samtycke på en prenumerationsplan', async () => {
    const res = await anrop({ plan: 'cv_week', source: 'test' })

    expect(res.status).toBe(400)
    expect(sessionsSkapa).not.toHaveBeenCalled()
  })

  it('svarar 400 utan samtycke på Allt-dagen, som är ett engångsköp', async () => {
    const res = await anrop({ plan: 'all_day', source: 'test' })

    expect(res.status).toBe(400)
    expect(sessionsSkapa).not.toHaveBeenCalled()
  })

  it('godtar inte en kryssruta som bara nästan är ikryssad', async () => {
    for (const falskt of ['true', 1, {}, null]) {
      const res = await anrop({ plan: 'cv_week', consent: falskt })
      expect(res.status).toBe(400)
    }
    expect(sessionsSkapa).not.toHaveBeenCalled()
  })

  it('lägger tidsstämpel och kryssrutetext på sessionen och på prenumerationen', async () => {
    const innan = Date.now()
    const res = await anrop({ plan: 'cv_week', source: 'onboarding_paket', consent: true })
    expect(res.status).toBe(200)

    const arg = sessionsSkapa.mock.calls[0][0]
    expect(arg.metadata.angerratt_samtycke_text).toBe(PAKETSKARM.samtycke)
    expect(arg.subscription_data.metadata.angerratt_samtycke_text).toBe(PAKETSKARM.samtycke)

    // Servertid, inte klienttid: stämpeln ligger inom anropets egen sekund.
    const vid = Date.parse(arg.metadata.angerratt_samtycke_at)
    expect(vid).toBeGreaterThanOrEqual(innan)
    expect(vid).toBeLessThanOrEqual(Date.now())
    expect(arg.subscription_data.metadata.angerratt_samtycke_at).toBe(
      arg.metadata.angerratt_samtycke_at
    )
  })

  it('lägger samma metadata på payment_intent för engångsköpet', async () => {
    const res = await anrop({ plan: 'all_day', source: 'onboarding_paket', consent: true })
    expect(res.status).toBe(200)

    const arg = sessionsSkapa.mock.calls[0][0]
    expect(arg.mode).toBe('payment')
    expect(arg.payment_intent_data.metadata.angerratt_samtycke_text).toBe(PAKETSKARM.samtycke)
    expect(arg.payment_intent_data.metadata.angerratt_samtycke_at).toBe(
      arg.metadata.angerratt_samtycke_at
    )
    expect(arg.subscription_data).toBeUndefined()
  })

  it('låter inte klienten bestämma tidpunkten', async () => {
    const påhittat = '2001-01-01T00:00:00.000Z'
    await anrop({
      plan: 'cv_week',
      consent: true,
      angerratt_samtycke_at: påhittat,
      metadata: { angerratt_samtycke_at: påhittat },
    })

    const arg = sessionsSkapa.mock.calls[0][0]
    expect(arg.metadata.angerratt_samtycke_at).not.toBe(påhittat)
  })

  it('kräver samtycke innan produktvalet ens hunnit slås upp i Stripe', async () => {
    await anrop({ plan: 'all_week' })
    expect(kundHamta).not.toHaveBeenCalled()
    expect(kundSkapa).not.toHaveBeenCalled()
  })
})
