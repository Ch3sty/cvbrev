import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const lista = vi.fn()
const avsluta = vi.fn()
vi.mock('@/lib/stripe/server', () => ({
  stripe: { subscriptions: { list: (...a: unknown[]) => lista(...a), cancel: (...a: unknown[]) => avsluta(...a) } },
}))

import { mottagarvarden, raderaKonto, raderaKontotsFiler, rensaLosaRader } from '../raderaKonto.server'
import { AVSLUT_KOLUMNER } from '../avslut'

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

interface Extra {
  /** Profilens övriga fält (created_at, last_active ...). */
  profil?: Record<string, unknown>
  /** Mottagare i kontots email_log. */
  loggade?: string[]
  /** Kontot finns i admin_users. */
  adminRad?: boolean
  /** Antal rader per tabell för räkningarna. */
  antal?: Record<string, number>
  /** Fel när avslutsraden skrivs, till exempel att tabellen saknas. */
  avslutFel?: string | null
  /** Avslutets läsning av profilen kastar. */
  profilKastar?: boolean
}

/**
 * En Supabase-dubbel som loggar varje skrivning i `rader` i den ordning den
 * görs, och deleteUser som "deleteUser". Läsningar svarar ur `extra`.
 */
function admin(
  kund: string | null,
  raderaFel: string | null = null,
  filer: Record<string, string[]> = {},
  listFel: string | null = null,
  radFel: string | null = null,
  epost: { auth?: string | null; profil?: string | null; kontakt?: string | null } = {},
  extra: Extra = {}
) {
  const rader: string[] = []
  const inserts: Record<string, any[]> = {}
  const lag = lagring(filer, listFel)
  const deleteUser = vi.fn(async () => {
    rader.push('deleteUser')
    return { error: raderaFel ? { message: raderaFel } : null }
  })

  function from(tabell: string) {
    let op: 'select' | 'delete' | 'update' | 'insert' | 'upsert' = 'select'
    let payload: any = null
    let head = false
    const filter: string[] = []
    const svaraLas = () => {
      if (head) return { count: extra.antal?.[tabell] ?? 0, error: null }
      if (tabell === 'profiles') {
        return {
          data: { stripe_customer_id: kund, email: epost.profil ?? null, contact_email: epost.kontakt ?? null, ...(extra.profil ?? {}) },
          error: null,
        }
      }
      if (tabell === 'email_log') return { data: (extra.loggade ?? []).map((r) => ({ recipient: r })), error: null }
      if (tabell === 'admin_users') return { data: extra.adminRad ? { id: U1, role: 'admin' } : null, error: null }
      return { data: [], error: null }
    }
    const exec = async () => {
      if (op === 'select') return svaraLas()
      if (op === 'delete') {
        rader.push(`delete ${tabell}.${filter.join('&')}`)
        return { error: radFel ? { message: radFel } : null }
      }
      if (op === 'update') {
        rader.push(`update ${tabell}.${filter.join('&')} ${Object.keys(payload).sort().join(',')}`)
        return { error: radFel ? { message: radFel } : null }
      }
      rader.push(`${op} ${tabell}`)
      ;(inserts[tabell] ??= []).push(payload)
      if (tabell === 'konto_avslut' && extra.avslutFel) return { error: { message: extra.avslutFel } }
      return { error: null }
    }
    const b: any = {
      select: (c?: string, o?: { head?: boolean }) => {
        if (extra.profilKastar && tabell === 'profiles' && c?.includes('created_at')) throw new Error('profilen gick inte att läsa')
        head = Boolean(o?.head)
        return b
      },
      eq: (k: string, v: unknown) => (filter.push(`${k}=${v}`), b),
      not: (k: string) => (filter.push(`${k} not null`), b),
      gt: () => b,
      in: () => b,
      order: () => b,
      limit: () => b,
      delete: () => ((op = 'delete'), b),
      update: (p: any) => ((op = 'update'), (payload = p), b),
      insert: (p: any) => ((op = 'insert'), (payload = p), b),
      upsert: (p: any) => ((op = 'upsert'), (payload = p), b),
      maybeSingle: () => exec(),
      single: () => exec(),
      then: (res: any, rej: any) => exec().then(res, rej),
    }
    return b
  }

  const klient = {
    from,
    rpc: async () => ({ data: null, error: null }),
    auth: { admin: { deleteUser, getUserById: vi.fn(async () => ({ data: { user: epost.auth ? { email: epost.auth } : null }, error: null })) } },
    storage: { from: lag.from },
  }
  return { klient: klient as never, deleteUser, lag, rader, inserts }
}

const fetchMock = vi.fn()
beforeEach(() => {
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({ status: 202 })
  vi.stubGlobal('fetch', fetchMock)
  process.env.POSTHOG_RADERA_NYCKEL = 'phx_test'
  process.env.POSTHOG_PROJECT_ID = '148688'
  process.env.POSTHOG_HOST = 'https://eu.posthog.com'
})
afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.POSTHOG_RADERA_NYCKEL
  delete process.env.POSTHOG_PROJECT_ID
  delete process.env.POSTHOG_HOST
  delete process.env.AVSLUT_TESTA_UNDANTAG
})

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
  it('raderar de lösa raderna på rätt kolumn och tvättar säkerhetsloggen och adminens åtgärder före kontot', async () => {
    const { klient, rader, deleteUser } = admin(null)
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(rader.filter((r) => r.startsWith('delete') || r.startsWith('update') || r === 'deleteUser')).toEqual([
      `delete email_log.user_id=${U1}`,
      `delete public_letter_drafts.claimed_by=${U1}`,
      `delete anon_interview_samples.user_id=${U1}`,
      `delete anon_interview_samples.claimed_by=${U1}`,
      `delete anon_personality_samples.user_id=${U1}`,
      `delete anon_personality_samples.claimed_by=${U1}`,
      `delete guest_invitations.guest_user_id=${U1}`,
      `delete guest_invitations.inviter_id=${U1}`,
      `delete improved_cvs.user_id=${U1}`,
      `delete recruiter_candidate_notes.candidate_user_id=${U1}`,
      `delete recruiter_project_candidates.candidate_user_id=${U1}`,
      `delete recruiter_share_links.candidate_user_id=${U1}`,
      `delete api_metrics.user_id=${U1}`,
      `update audit_logs.user_id=${U1} ip_address,metadata,new_values,old_values,user_agent`,
      `update admin_actions.target_user_id=${U1} description,metadata`,
      'deleteUser',
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

  it('tar också bort händelser till kontaktadressen och till adresser som bara finns i email_log', async () => {
    const { klient, rader } = admin(null, null, {}, null, null, { profil: 'ny@exempel.se', kontakt: 'kontakt@exempel.se' }, { loggade: ['gammal@exempel.se', 'ny@exempel.se'] })
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    const handelser = rader.filter((r) => r.startsWith('delete email_events'))
    expect(handelser).toContain('delete email_events.payload->>to=kontakt@exempel.se')
    expect(handelser).toContain('delete email_events.payload->>to=gammal@exempel.se')
    expect(handelser).toContain('delete email_events.payload->>to=["gammal@exempel.se"]')
    // Varje adress en gång, även när den står både i profilen och i loggen.
    expect(handelser.filter((r) => r === 'delete email_events.payload->>to=ny@exempel.se')).toHaveLength(1)
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

describe('avslutsraden (beslut-mejl-och-radering 2b)', () => {
  const NU_PROFIL = { created_at: '2026-11-01T10:00:00Z', last_active: '2026-11-20T10:00:00Z', subscription_id: null, subscription_status: null, paket_started_at: null, premium_source: null }

  it('med opts skrivs exakt en rad efter deleteUser, med bara migreringens kolumner', async () => {
    const { klient, rader, inserts } = admin(null, null, {}, null, null, { profil: 'anna@exempel.se' }, {
      profil: NU_PROFIL,
      antal: { cv_texts: 2, letters: 1, logic_test_v4_sessions: 4, personality_test_sessions: 3, job_applications: 0 },
    })
    expect(await raderaKonto(klient, U1, { kalla: 'webb', anledning: 'fick_jobb' })).toEqual({ ok: true })
    expect(inserts.konto_avslut).toHaveLength(1)
    expect(rader.indexOf('insert konto_avslut')).toBeGreaterThan(rader.indexOf('deleteUser'))
    const rad = inserts.konto_avslut[0]
    expect(Object.keys(rad).sort()).toEqual([...AVSLUT_KOLUMNER].sort())
    for (const k of ['id', 'user_id', 'email', 'created_at', 'ip', 'datum']) expect(rad).not.toHaveProperty(k)
    expect(JSON.stringify(rad)).not.toContain('anna@exempel.se')
    expect(JSON.stringify(rad)).not.toContain(U1)
    expect(rad).toMatchObject({ kalla: 'webb', anledning: 'fick_jobb', antal_cv: '2_5', antal_brev: '1', antal_test: '6_20', antal_sokta: '0', hade_premium: false, har_betalat: false })
  })

  it('appens radering märks app, och en okänd anledning blir null', async () => {
    const { klient, inserts } = admin(null, null, {}, null, null, {}, { profil: NU_PROFIL })
    await raderaKonto(klient, U1, { kalla: 'app', anledning: 'fritext om mig' })
    expect(inserts.konto_avslut[0]).toMatchObject({ kalla: 'app', anledning: null })
  })

  it('när deleteUser misslyckas skrivs ingen rad och PostHog anropas inte', async () => {
    const { klient, inserts } = admin(null, 'boom', {}, null, null, {}, { profil: NU_PROFIL })
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toMatchObject({ ok: false })
    expect(inserts.konto_avslut).toBeUndefined()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(inserts.posthog_raderingar).toBeUndefined()
  })

  it('utan opts (adminens radering) skrivs ingen rad', async () => {
    const { klient, inserts } = admin(null, null, {}, null, null, {}, { profil: NU_PROFIL })
    expect(await raderaKonto(klient, U1)).toEqual({ ok: true })
    expect(inserts.konto_avslut).toBeUndefined()
  })

  it('ett testkonto (qa-...) skriver ingen rad', async () => {
    const { klient, inserts } = admin(null, null, {}, null, null, { profil: 'qa-radera-1@exempel.se' }, { profil: { ...NU_PROFIL, email: 'qa-radera-1@exempel.se' } })
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(inserts.konto_avslut).toBeUndefined()
  })

  it('ett adminkonto skriver ingen rad', async () => {
    const { klient, inserts } = admin(null, null, {}, null, null, {}, { profil: NU_PROFIL, adminRad: true })
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(inserts.konto_avslut).toBeUndefined()
  })

  it('AVSLUT_TESTA_UNDANTAG=1 släpper igenom testkontot utanför produktionen, aldrig i produktionen', async () => {
    process.env.AVSLUT_TESTA_UNDANTAG = '1'
    const forr = process.env.VERCEL_ENV
    const profil = { ...NU_PROFIL, email: 'qa-radera-1@exempel.se' }
    try {
      process.env.VERCEL_ENV = 'preview'
      const a = admin(null, null, {}, null, null, {}, { profil })
      await raderaKonto(a.klient, U1, { kalla: 'webb' })
      expect(a.inserts.konto_avslut).toHaveLength(1)
      process.env.VERCEL_ENV = 'production'
      const b = admin(null, null, {}, null, null, {}, { profil })
      await raderaKonto(b.klient, U1, { kalla: 'webb' })
      expect(b.inserts.konto_avslut).toBeUndefined()
    } finally {
      if (forr === undefined) delete process.env.VERCEL_ENV
      else process.env.VERCEL_ENV = forr
    }
  })

  it('saknas tabellen konto_avslut går raderingen ändå igenom och felet loggas', async () => {
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { klient, deleteUser } = admin(null, null, {}, null, null, {}, {
      profil: NU_PROFIL,
      avslutFel: "Could not find the table 'public.konto_avslut' in the schema cache",
    })
    expect(await raderaKonto(klient, U1, { kalla: 'webb', anledning: 'for_dyrt' })).toEqual({ ok: true })
    expect(deleteUser).toHaveBeenCalledWith(U1)
    expect(logg.mock.calls.some((c) => String(c[0]).includes('[raderaKonto] avslut'))).toBe(true)
    logg.mockRestore()
  })

  it('går avslutet inte att läsa raderas kontot ändå, utan rad', async () => {
    const logg = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { klient, inserts, deleteUser } = admin(null, null, {}, null, null, {}, { profilKastar: true })
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(deleteUser).toHaveBeenCalled()
    expect(inserts.konto_avslut).toBeUndefined()
    logg.mockRestore()
  })
})

describe('PostHog (beslut-mejl-och-radering 2c punkt 4)', () => {
  it('anropar bulk_delete med kontots id och delete_events efter raderingen', async () => {
    const { klient, inserts } = admin(null)
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://eu.posthog.com/api/projects/148688/persons/bulk_delete/')
    expect(JSON.parse(init.body)).toEqual({ distinct_ids: [U1], delete_events: true })
    expect(inserts.posthog_raderingar).toBeUndefined()
  })

  it('PostHog svarar 500: id:t hamnar i kön och raderingen svarar ok', async () => {
    fetchMock.mockResolvedValue({ status: 500 })
    const { klient, inserts } = admin(null)
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(inserts.posthog_raderingar).toEqual([{ distinct_id: U1, senaste_fel: 'PostHog svarade 500' }])
  })

  it('utan nyckel köas raderingen utan anrop', async () => {
    delete process.env.POSTHOG_RADERA_NYCKEL
    const { klient, inserts } = admin(null)
    expect(await raderaKonto(klient, U1, { kalla: 'webb' })).toEqual({ ok: true })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(inserts.posthog_raderingar?.[0].distinct_id).toBe(U1)
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
