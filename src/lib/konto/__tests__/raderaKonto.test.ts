import { beforeEach, describe, expect, it, vi } from 'vitest'

const lista = vi.fn()
const avsluta = vi.fn()
vi.mock('@/lib/stripe/server', () => ({
  stripe: { subscriptions: { list: (...a: unknown[]) => lista(...a), cancel: (...a: unknown[]) => avsluta(...a) } },
}))

import { raderaKonto } from '../raderaKonto.server'

function admin(kund: string | null, raderaFel: string | null = null) {
  const deleteUser = vi.fn(async () => ({ error: raderaFel ? { message: raderaFel } : null }))
  const klient = {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { stripe_customer_id: kund } }) }) }) }),
    auth: { admin: { deleteUser } },
  }
  return { klient: klient as never, deleteUser }
}

describe('raderaKonto', () => {
  beforeEach(() => {
    lista.mockReset()
    avsluta.mockReset()
  })

  it('raderar ett konto utan Stripe-kund utan att fråga Stripe', async () => {
    const { klient, deleteUser } = admin(null)
    expect(await raderaKonto(klient, 'u1')).toEqual({ ok: true })
    expect(lista).not.toHaveBeenCalled()
    expect(deleteUser).toHaveBeenCalledWith('u1')
  })

  it('avslutar bara levande prenumerationer före raderingen', async () => {
    lista.mockResolvedValue({ data: [{ id: 's1', status: 'active' }, { id: 's2', status: 'canceled' }, { id: 's3', status: 'past_due' }] })
    const { klient, deleteUser } = admin('cus_1')
    expect(await raderaKonto(klient, 'u1')).toEqual({ ok: true })
    expect(avsluta.mock.calls.map((c) => c[0])).toEqual(['s1', 's3'])
    expect(deleteUser).toHaveBeenCalled()
  })

  it('behåller kontot när Stripe inte går att avsluta', async () => {
    lista.mockRejectedValue(new Error('nere'))
    const { klient, deleteUser } = admin('cus_1')
    expect(await raderaKonto(klient, 'u1')).toMatchObject({ ok: false, fel: 'stripe' })
    expect(deleteUser).not.toHaveBeenCalled()
  })

  it('rapporterar fel från raderingen', async () => {
    const { klient } = admin(null, 'boom')
    expect(await raderaKonto(klient, 'u1')).toMatchObject({ ok: false, fel: 'radering' })
  })
})
