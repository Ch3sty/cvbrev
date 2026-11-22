// Mejlet om Jobbsöket (beslut-mejl-och-radering 1e): lydelserna, urvalet med
// sina sju spärrar, utskicksdagen och admin-rutten. Inget skickas: Resend är
// en mock och databasen en dubbel i minnet.
import { describe, expect, it, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  send: vi.fn(async (_: any) => ({ data: { id: 're_1' }, error: null })),
  batchSend: vi.fn(async (_: any) => ({ data: { data: [] }, error: null })),
  db: null as any,
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: h.send }
    batch = { send: h.batchSend }
  },
}))
vi.mock('@/lib/admin/requireSuperAdmin', () => ({
  requireSuperAdmin: async () => ({ ok: true, userId: 'admin-1', email: 'agaren@exempel.se' }),
}))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => h.db.client }))

import { fakeSupabase } from '@/lib/email/lifecycle/__tests__/fakeSupabase'
import { genereraJobbsoketMejl, JOBBSOKET_TEXT, JOBBSOKET_MEJL_TYP } from '../lifecycle/templates/campaign-jobbsoket'
import { arUtskicksdag, jobbsoketMottagare, JOBBSOKET_UTSKICK, skickaJobbsoket } from '../jobbsoketUtskick'
import { GET, POST } from '@/app/api/admin/email/jobbsoket/route'

const EMOJI = /\p{Extended_Pictographic}/u

describe('mejlet', () => {
  it('utan brev: ämnet J1, knappen J6, länken öppnar arket, J5 saknas', () => {
    const { subject, preheader, html } = genereraJobbsoketMejl({ userId: 'u1', fullName: 'Anna Berg', harBrev: false })
    expect(subject).toBe(JOBBSOKET_TEXT.J1)
    expect(preheader).toBe(JOBBSOKET_TEXT.J2)
    expect(html).toContain(JOBBSOKET_TEXT.J3)
    expect(html).toContain(`Hej Anna, ${JOBBSOKET_TEXT.J4_1}`)
    expect(html).toContain(JOBBSOKET_TEXT.J4_2)
    expect(html).toContain(`>${JOBBSOKET_TEXT.J6}<`)
    expect(html).toMatch(/sokta-tjanster\?logga=1&amp;fran=mejl-jobbsoket|sokta-tjanster\?logga=1&fran=mejl-jobbsoket/)
    expect(html).not.toContain(JOBBSOKET_TEXT.J5)
    expect(html).toContain(encodeURIComponent(JOBBSOKET_MEJL_TYP))
  })

  it('med brev: J5 och J7 finns, länken saknar logga=', () => {
    const { html } = genereraJobbsoketMejl({ userId: 'u1', fullName: null, harBrev: true })
    expect(html).toContain(`${JOBBSOKET_TEXT.J4_2} ${JOBBSOKET_TEXT.J5}`)
    expect(html).toContain(`>${JOBBSOKET_TEXT.J7}<`)
    expect(html).toContain(`Hej, ${JOBBSOKET_TEXT.J4_1}`)
    const knapp = html.match(/href="([^"]*sokta-tjanster[^"]*)"/)?.[1] ?? ''
    expect(knapp).toContain('fran=mejl-jobbsoket')
    expect(knapp).not.toContain('logga=')
  })

  it('foten: J8, J9, J10 och länken till avregistreringen av erbjudanden; inget mailet, inga tankstreck, ingen emoji', () => {
    const { html } = genereraJobbsoketMejl({ userId: 'u1', fullName: 'Anna', harBrev: true })
    expect(html).toContain(JOBBSOKET_TEXT.J8)
    expect(html).toContain(JOBBSOKET_TEXT.J9)
    expect(html).toContain(JOBBSOKET_TEXT.J10)
    expect(html).toContain('/api/email/avregistrera-erbjudanden?uid=u1')
    expect(html).not.toMatch(/mailet/)
    expect(html).not.toContain('—')
    expect(html).not.toMatch(EMOJI)
    for (const t of Object.values(JOBBSOKET_TEXT)) {
      const s = typeof t === 'function' ? t('tolv') : t
      expect(s).not.toContain('—')
      expect(s).not.toMatch(EMOJI)
    }
  })

  it('"tolv" följer NO_RESPONSE_NUDGE_DAYS', async () => {
    expect(genereraJobbsoketMejl({ userId: 'u1', fullName: null, harBrev: false }).html).toContain('tyst i tolv dagar')
    vi.resetModules()
    vi.doMock('@/lib/applications/status', async (orig) => ({ ...(await orig<object>()), NO_RESPONSE_NUDGE_DAYS: 14 }))
    const mod = await import('../lifecycle/templates/campaign-jobbsoket')
    expect(mod.genereraJobbsoketMejl({ userId: 'u1', fullName: null, harBrev: false }).html).toContain('tyst i fjorton dagar')
    vi.doUnmock('@/lib/applications/status')
  })
})

// Onsdag 2 december 2026, 07.00 svensk tid.
const NU = new Date('2026-12-02T06:00:00Z')
const AKTIV = '2026-11-20T10:00:00Z'

function profil(id: string, over: Record<string, unknown> = {}) {
  return { id, email: `${id}@exempel.se`, full_name: 'Test Person', quota_emails_opt_out: false, erbjudanden_mejl: null, last_active: AKTIV, ...over }
}

function grund(profiler: any[], extra: Record<string, any[]> = {}) {
  const db = fakeSupabase({ profiles: profiler, job_applications: [], email_events: [], email_log: [], letters: [], ...extra })
  db.client.rpc = async (namn: string) =>
    namn === 'admin_undantagna_konton'
      ? { data: [{ user_id: 'undantagen', email: 'qa-x@exempel.se', skal: 'test' }], error: null }
      : { data: null, error: null }
  return db
}

describe('urvalet', () => {
  it('en profil som klarar alla sju villkor kommer med', async () => {
    const { kvar, redan } = await jobbsoketMottagare(grund([profil('ok')]).client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['ok'])
    expect(redan).toBe(0)
  })

  it('1. undantagna konton stoppas', async () => {
    const { kvar } = await jobbsoketMottagare(grund([profil('undantagen'), profil('ok')]).client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['ok'])
  })

  it('2. avstängda mejl stoppas', async () => {
    const { kvar } = await jobbsoketMottagare(grund([profil('a', { quota_emails_opt_out: true }), profil('ok')]).client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['ok'])
  })

  it('3. avstängda erbjudanden och tips stoppas, null släpps igenom', async () => {
    const { kvar } = await jobbsoketMottagare(
      grund([profil('a', { erbjudanden_mejl: false }), profil('ok', { erbjudanden_mejl: true }), profil('ok2')]).client,
      NU
    )
    expect(kvar.map((m) => m.id)).toEqual(['ok', 'ok2'])
  })

  it('4. den som loggat en sökt tjänst stoppas', async () => {
    const db = grund([profil('a'), profil('ok')], { job_applications: [{ id: 'j1', user_id: 'a' }] })
    const { kvar } = await jobbsoketMottagare(db.client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['ok'])
  })

  it('5. inaktiv i mer än 90 dagar, eller utan last_active, stoppas', async () => {
    const db = grund([
      profil('gammal', { last_active: '2026-09-02T05:59:00Z' }),
      profil('aldrig', { last_active: null }),
      profil('kant', { last_active: '2026-09-03T06:00:00Z' }),
    ])
    const { kvar } = await jobbsoketMottagare(db.client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['kant'])
  })

  it('6. studsad eller skräppostanmäld adress stoppas, båda formerna av to', async () => {
    const db = grund([profil('a'), profil('b'), profil('c'), profil('ok')], {
      email_events: [
        { id: 'e1', event_type: 'bounced', payload: { to: ['A@Exempel.se'] } },
        { id: 'e2', event_type: 'complained', payload: { to: 'b@exempel.se' } },
        { id: 'e3', event_type: 'opened', payload: { to: ['c@exempel.se'] } },
      ],
    })
    const { kvar } = await jobbsoketMottagare(db.client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['c', 'ok'])
  })

  it('7. den som redan fått mejlet stoppas och räknas som skickad', async () => {
    const db = grund([profil('a'), profil('ok')], { email_log: [{ id: 'l1', user_id: 'a', email_type: JOBBSOKET_MEJL_TYP }] })
    const { kvar, redan } = await jobbsoketMottagare(db.client, NU)
    expect(kvar.map((m) => m.id)).toEqual(['ok'])
    expect(redan).toBe(1)
  })

  it('harBrev sätts bara av ett sparat brev', async () => {
    const db = grund([profil('sparat'), profil('osparat'), profil('inget')], {
      letters: [
        { id: 'b1', user_id: 'sparat', is_saved: true },
        { id: 'b2', user_id: 'osparat', is_saved: false },
      ],
    })
    const { kvar } = await jobbsoketMottagare(db.client, NU)
    expect(Object.fromEntries(kvar.map((m) => [m.id, m.harBrev]))).toEqual({ sparat: true, osparat: false, inget: false })
  })
})

describe('utskicket', () => {
  beforeEach(() => h.batchSend.mockClear())

  it('loggar varje mottagare med typen och feature jobbsoket', async () => {
    h.batchSend.mockResolvedValueOnce({ data: { data: [{ id: 're_a' }] }, error: null } as any)
    const db = fakeSupabase({ email_log: [] })
    const r = await skickaJobbsoket(db.client, [{ id: 'u1', email: 'u1@exempel.se', full_name: null, harBrev: false }])
    expect(r.skickade).toBe(1)
    expect(db.tables.email_log[0]).toMatchObject({ user_id: 'u1', email_type: JOBBSOKET_MEJL_TYP, feature: 'jobbsoket', resend_id: 're_a' })
    expect(h.batchSend.mock.calls[0][0][0].headers['List-Unsubscribe']).toContain('avregistrera-erbjudanden')
  })

  it('en omgång som faller loggas inte', async () => {
    h.batchSend.mockResolvedValueOnce({ data: null, error: { message: 'nere' } } as any)
    const db = fakeSupabase({ email_log: [] })
    const r = await skickaJobbsoket(db.client, [{ id: 'u1', email: 'u1@exempel.se', full_name: null, harBrev: false }])
    expect(r.misslyckade).toBe(1)
    expect(db.tables.email_log).toEqual([])
  })
})

describe('utskicksdagen', () => {
  it('dagen i koden är den ägaren sagt ja till, 2 december 2026', () => {
    expect(JOBBSOKET_UTSKICK.dag).toBe('2026-12-02')
    expect(arUtskicksdag(new Date('2026-12-02T06:00:00Z'))).toBe(true)
    expect(arUtskicksdag(new Date('2026-12-01T06:00:00Z'))).toBe(false)
    expect(arUtskicksdag(new Date('2026-12-03T06:00:00Z'))).toBe(false)
  })

  it('falsk när dagen är null, sann bara på den svenska kalenderdagen', () => {
    expect(arUtskicksdag(NU, null)).toBe(false)
    expect(arUtskicksdag(new Date('2026-12-01T23:30:00Z'), '2026-12-02')).toBe(true) // 00.30 svensk tid
    expect(arUtskicksdag(new Date('2026-12-01T22:59:00Z'), '2026-12-02')).toBe(false) // 23.59 den 1:a
    expect(arUtskicksdag(new Date('2026-12-02T22:59:00Z'), '2026-12-02')).toBe(true)
    expect(arUtskicksdag(new Date('2026-12-02T23:00:00Z'), '2026-12-02')).toBe(false)
  })
})

describe('admin-rutten', () => {
  beforeEach(() => {
    h.send.mockClear()
    h.batchSend.mockClear()
    h.db = grund([profil('admin-1', { full_name: 'Ägaren Admin' }), profil('ok')])
  })

  const req = (url: string, body?: unknown) =>
    ({ url, json: async () => body ?? {} }) as unknown as import('next/server').NextRequest

  it('POST send ger 409 när det inte är utskicksdagen och skickar inget', async () => {
    const res = await POST(req('http://x/api/admin/email/jobbsoket', { mode: 'send', confirm: true }))
    expect(res.status).toBe(409)
    expect(h.batchSend).not.toHaveBeenCalled()
  })

  it('GET ?forhandsvisa=1 ger HTML för admin och skickar inget', async () => {
    const res = await GET(req('http://x/api/admin/email/jobbsoket?forhandsvisa=1&brev=1'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(res.headers.get('cache-control')).toBe('no-store')
    const html = await res.text()
    expect(html).toContain('Hej Ägaren,')
    expect(html).toContain(JOBBSOKET_TEXT.J7)
    expect(h.send).not.toHaveBeenCalled()
    expect(h.batchSend).not.toHaveBeenCalled()
  })

  it('GET utan parametrar ger dag, kvar, skickade och senasteTest', async () => {
    const res = await GET(req('http://x/api/admin/email/jobbsoket'))
    expect(await res.json()).toEqual({ dag: '2026-12-02', kvar: 2, skickade: 0, senasteTest: null })
  })

  it('POST test går till admins adress, märkt [TEST], loggat som campaign_test', async () => {
    const res = await POST(req('http://x/api/admin/email/jobbsoket', { mode: 'test' }))
    expect(res.status).toBe(200)
    expect(h.send.mock.calls[0][0]).toMatchObject({ to: ['agaren@exempel.se'], subject: `[TEST] ${JOBBSOKET_TEXT.J1}` })
    expect(h.db.tables.email_log.at(-1)).toMatchObject({ email_type: 'campaign_test', feature: 'jobbsoket' })
  })
})
