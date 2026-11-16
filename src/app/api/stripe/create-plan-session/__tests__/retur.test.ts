import { describe, it, expect, beforeEach, vi } from 'vitest'
import { samtyckeVidKop } from '@/components/pricing/paket-copy'

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

/** Köpreturen ur mallflödet (affärsgranskningen B2). */
describe('create-plan-session, köpet tillbaka till filen', () => {
  it('skickar tillbaka till galleriet med ladda=1 och avbryter till galleriet', async () => {
    const retur = '/dashboard/cv-mallar?cv=abc&mall=kalksten&format=pdf'
    const res = await anrop({ plan: 'all_month', source: 'betalvagg:mall:kalksten', consent: true, retur })
    expect(res.status).toBe(200)
    const arg = sessionsSkapa.mock.calls[0][0]
    expect(arg.success_url).toMatch(/\/dashboard\/cv-mallar\?cv=abc&mall=kalksten&format=pdf&ladda=1&premium_activated=true$/)
    expect(arg.cancel_url).toMatch(/\/dashboard\/cv-mallar\?cv=abc&mall=kalksten&format=pdf$/)
    expect(arg.metadata.source).toBe('betalvagg:mall:kalksten')
  })

  it('ignorerar en retur som inte är galleriet', async () => {
    for (const retur of ['https://ond.example/x', '/dashboard/profil?x=1', '//ond.example', '/dashboard/cv-mallar?x=<s>']) {
      sessionsSkapa.mockClear()
      await anrop({ plan: 'all_month', source: 'test', consent: true, retur })
      const arg = sessionsSkapa.mock.calls[0][0]
      expect(arg.success_url, retur).not.toContain('cv-mallar')
      expect(arg.cancel_url, retur).toMatch(/\/priser$/)
    }
  })
})
