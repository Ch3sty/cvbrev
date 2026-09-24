// Kvittot skickas en gång per Stripe-event: den som lägger in raden
// receipt_<event.id> skickar, ett omsänt event hittar raden och gör ingenting.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const skickaMock = vi.fn(async () => 'sent' as const)
vi.mock('../runner', () => ({
  LIFECYCLE_FROM: 'test',
  sendScheduledRowNow: (...args: unknown[]) => skickaMock(...(args as [])),
}))

import { onPaymentReceipt } from '../hooks'

/** En låtsasklient med unique-indexet (user_id, email_type). */
function falskAdmin() {
  const rader = new Map<string, { id: string; metadata: unknown }>()
  return {
    rader,
    from: () => ({
      upsert: (rad: { user_id: string; email_type: string; metadata: unknown }) => ({
        select: async () => {
          const nyckel = `${rad.user_id}|${rad.email_type}`
          if (rader.has(nyckel)) return { data: [], error: null }
          const id = `rad-${rader.size + 1}`
          rader.set(nyckel, { id, metadata: rad.metadata })
          return { data: [{ id }], error: null }
        },
      }),
    }),
  }
}

describe('kvittots idempotens', () => {
  beforeEach(() => skickaMock.mockClear())

  it('samma event två gånger ger ett utskick', async () => {
    const admin = falskAdmin()
    const underlag = { planKey: 'all_month', amount: 149, periodStart: null, periodEnd: null }
    await onPaymentReceipt(admin as never, 'u1', 'evt_1', underlag)
    await onPaymentReceipt(admin as never, 'u1', 'evt_1', underlag)
    expect(skickaMock).toHaveBeenCalledTimes(1)
    expect(admin.rader.get('u1|receipt_evt_1')?.metadata).toMatchObject({ planKey: 'all_month', amount: 149, stripeEventId: 'evt_1' })
  })

  it('ett nytt event ger ett nytt kvitto', async () => {
    const admin = falskAdmin()
    const underlag = { planKey: 'cv_week', amount: 79, periodStart: null, periodEnd: null }
    await onPaymentReceipt(admin as never, 'u1', 'evt_1', underlag)
    await onPaymentReceipt(admin as never, 'u1', 'evt_2', underlag)
    expect(skickaMock).toHaveBeenCalledTimes(2)
  })
})
