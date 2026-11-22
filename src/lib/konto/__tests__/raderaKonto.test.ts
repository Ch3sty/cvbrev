import { beforeEach, describe, expect, it, vi } from 'vitest'

const lista = vi.fn()
const avsluta = vi.fn()
vi.mock('@/lib/stripe/server', () => ({
  stripe: { subscriptions: { list: (...a: unknown[]) => lista(...a), cancel: (...a: unknown[]) => avsluta(...a) } },
}))

import { mottagarvarden, raderaKonto, raderaKontotsFiler, rensaLosaRader } from '../raderaKonto.server'

const U1 = '11111111-2222-4333-8444-555555555555'
const U2 = '99999999-2222-4333-8444-555555555555'

/**
 * Lagringen som Supabase visar den: list är inte rekursiv, en undermapp kommer
 * som en post med id null, filer har ett id. Nyckeln är hinken.
 */
function lagring(start: Record<string, string[]>, listFel: string | null = null) {
  const hinkar: Record<string, Set<string>> = {}
  for (const [h, vagar] of Object.entries(start)) hinkar[h] = new Set(vagar)
  const borttaget: Record<string, string[]> = {}
  const from = vi.fn((hink: string) => {
    const filer = (hinkar[hink] ??= new Set())
    return {
      list: vi.fn(async (mapp: string, opt?: { limit?: number; offset?: number }) => {
        if (listFel) return { data: null, error: { message: listFel } }
        const poster = new Map<string, { name: string; id: string | null }>()
        for (const v of filer) {
          if (!v.startsWith(`${mapp}/`)) continue
          const rest = v.slice(mapp.length + 1)
          const [forsta, ...resten] = rest.split('/')
          poster.set(forsta, { name: forsta, id: resten.length ? null : `id-${v}` })
        }
        const alla = [...poster.values()]
        const off = opt?.offset ?? 0
        return { data: alla.slice(off, off + (opt?.limit ?? 100)), error: null }
      }),
      remove: vi.fn(async (vagar: string[]) => {
        for (const v of vagar) filer.delete(v)
        ;(borttaget[hink] ??= []).push(...vagar)
        return { error: null }
      }),
    }
  })
  return { from, hinkar, borttaget }
}

function admin(
  kund: string | null,
  raderaFel: string | null = null,
  filer: Record<string, string[]> = {},
  listFel: string | null = null,
  radFel: string | null = null,
  epost: { auth?: string | null; profil?: string | null } = {}
) {
  const deleteUser = vi.fn(async () => ({ error: raderaFel ? { message: raderaFel } : null }))
  const lag = lagring(filer, listFel)
  const rader: string[] = []
  const svar = async () => ({ error: radFel ? { message: radFel } : null })
  const klient = {
    from: (tabell: string) =>
      tabell === 'profiles'
        ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { stripe_customer_id: kund, email: epost.profil ?? null } }) }) }) }
        : {
            delete: () => ({ eq: (k: string, v: string) => (rader.push(`delete ${tabell}.${k}=${v}`), svar()) }),
            update: (u: Record<string, unknown>) => ({
              eq: (k: string, v: string) => (rader.push(`update ${tabell}.${k}=${v} ${Object.keys(u).sort().join(',')}`), svar()),
            }),
          },
    auth: { admin: { deleteUser, getUserById: vi.fn(async () => ({ data: { user: epost.auth ? { email: epost.auth } : null }, error: null })) } },
    storage: { from: lag.from },
  }
  return { klient: klient as never, deleteUser, lag, rader }
}

describe('raderaKonto', () => {
  beforeEach(() => {
    lista.mockReset()
    avsluta.mockReset()
  })

  it('raderar ett konto utan Stripe-kund utan att fråga Stripe', async () => {
    const { klient, deleteUser } = admin(null)
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(lista).not.toHaveBeenCalled()
    expect(deleteUser).toHaveBeenCalledWith(U1)
  })

  it('avslutar bara levande prenumerationer före raderingen', async () => {
    lista.mockResolvedValue({ data: [{ id: 's1', status: 'active' }, { id: 's2', status: 'canceled' }, { id: 's3', status: 'past_due' }] })
    const { klient, deleteUser } = admin('cus_1')
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(avsluta.mock.calls.map((c) => c[0])).toEqual(['s1', 's3'])
    expect(deleteUser).toHaveBeenCalled()
  })

  it('behåller kontot när Stripe inte går att avsluta', async () => {
    lista.mockRejectedValue(new Error('nere'))
    const { klient, deleteUser } = admin('cus_1')
    expect(await raderaKonto(klient, U1)).toMatchObject({ ok: false, fel: 'stripe' })
    expect(deleteUser).not.toHaveBeenCalled()
  })

  it('rapporterar fel från raderingen', async () => {
    const { klient } = admin(null, 'boom')
    expect(await raderaKonto(klient, U1)).toMatchObject({ ok: false, fel: 'radering' })
  })

  it('tar bort kontots filer i båda hinkarna, även i undermappar, före kontot', async () => {
    const { klient, deleteUser, lag } = admin(null, null, {
      cvs: [
        `users/${U1}/cv.pdf`,
        `users/${U1}/.placeholder`,
        `users/${U1}/chat_attachments/k1/1_cv.pdf`,
        `users/${U1}/chat_attachments/temp/2_brev.pdf`,
        `users/${U2}/annans.pdf`,
        `${U1}/gammal.pdf`,
      ],
      'profile-photos': [`users/${U1}/profile-photo-1.jpg`, `users/${U2}/profile-photo-2.jpg`],
    })
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect([...lag.hinkar.cvs].sort()).toEqual([`${U1}/gammal.pdf`, `users/${U2}/annans.pdf`].sort())
    expect([...lag.hinkar['profile-photos']]).toEqual([`users/${U2}/profile-photo-2.jpg`])
    for (const vagar of Object.values(lag.borttaget)) {
      for (const v of vagar) expect(v.startsWith(`users/${U1}/`)).toBe(true)
    }
    expect(deleteUser).toHaveBeenCalledWith(U1)
  })

  it('behåller kontot när filerna inte går att ta bort', async () => {
    const { klient, deleteUser } = admin(null, null, { cvs: [`users/${U1}/cv.pdf`] }, 'nere')
    expect(await raderaKonto(klient, U1)).toMatchObject({ ok: false, fel: 'radering' })
    expect(deleteUser).not.toHaveBeenCalled()
  })
})

describe('lösa rader', () => {
  it('raderar de lösa raderna och tvättar säkerhetsloggen på kontots id före kontot', async () => {
    const { klient, rader, deleteUser } = admin(null)
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(rader).toEqual([
      `delete email_log.user_id=${U1}`,
      `delete public_letter_drafts.claimed_by=${U1}`,
      `delete anon_interview_samples.user_id=${U1}`,
      `delete anon_interview_samples.claimed_by=${U1}`,
      `delete anon_personality_samples.user_id=${U1}`,
      `delete anon_personality_samples.claimed_by=${U1}`,
      `delete guest_invitations.guest_user_id=${U1}`,
      `update audit_logs.user_id=${U1} ip_address,metadata,new_values,old_values,user_agent`,
    ])
    expect(deleteUser).toHaveBeenCalledWith(U1)
  })

  it('behåller kontot när raderna inte går att ta bort', async () => {
    const { klient, deleteUser } = admin(null, null, {}, null, 'nere')
    expect(await raderaKonto(klient, U1)).toMatchObject({ ok: false, fel: 'radering' })
    expect(deleteUser).not.toHaveBeenCalled()
  })
})

describe('email_events (beslut-agarpunkter, policylistan punkt 2)', () => {
  it('tar bort kontots händelser på hela mottagaradressen, i båda formerna, före kontot', async () => {
    const { klient, rader, deleteUser } = admin(null, null, {}, null, null, { auth: 'Sara@Exempel.se', profil: 'sara@exempel.se' })
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    const handelser = rader.filter((r) => r.startsWith('delete email_events'))
    expect(handelser).toEqual([
      'delete email_events.payload->>to=Sara@Exempel.se',
      'delete email_events.payload->>to=["Sara@Exempel.se"]',
      'delete email_events.payload->>to=sara@exempel.se',
      'delete email_events.payload->>to=["sara@exempel.se"]',
    ])
    expect(deleteUser).toHaveBeenCalledWith(U1)
  })

  it('utan adress rörs inte email_events', async () => {
    const { klient, rader } = admin(null)
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(rader.some((r) => r.includes('email_events'))).toBe(false)
  })

  it('adminens radering läser adressen själv', async () => {
    const { klient, rader } = admin(null, null, {}, null, null, { profil: 'ola@exempel.se' })
    await rensaLosaRader(klient, U1)
    expect(rader).toContain('delete email_events.payload->>to=ola@exempel.se')
    expect(rader).toContain('delete email_events.payload->>to=["ola@exempel.se"]')
  })

  it('mottagarvärdena är bara hela adresser', () => {
    expect(mottagarvarden(['', null, 'inte-en-adress', '  a@b.se '])).toEqual(['a@b.se', '["a@b.se"]'])
  })

  it('behåller kontot när händelserna inte går att ta bort', async () => {
    const { klient, deleteUser } = admin(null, null, {}, null, 'nere', { auth: 'a@b.se' })
    expect(await raderaKonto(klient, U1)).toMatchObject({ ok: false, fel: 'radering' })
    expect(deleteUser).not.toHaveBeenCalled()
  })
})

describe('raderaKontotsFiler', () => {
  it('vägrar ett id som inte är ett uuid, så att prefixet aldrig blir users/', async () => {
    const { klient, lag } = admin(null, null, { cvs: [`users/${U2}/annans.pdf`] })
    await expect(raderaKontotsFiler(klient, '')).rejects.toThrow('ogiltigt')
    await expect(raderaKontotsFiler(klient, '../')).rejects.toThrow('ogiltigt')
    expect(lag.from).not.toHaveBeenCalled()
  })

  it('räknar borttagna filer och klarar fler än en sida', async () => {
    const manga = Array.from({ length: 1205 }, (_, i) => `users/${U1}/f${i}.pdf`)
    const { klient, lag } = admin(null, null, { cvs: manga })
    expect(await raderaKontotsFiler(klient, U1)).toBe(1205)
    expect(lag.hinkar.cvs.size).toBe(0)
  })
})
