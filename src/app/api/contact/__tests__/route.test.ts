/**
 * /api/contact (våg 5). Resend, Supabase, behörigheten och IP-gränsen är
 * mockade, så inget mejl lämnar testet och ingen databas rörs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const send = vi.fn()
const getUser = vi.fn()
const userHasAccess = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send } })),
}))
vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: (...a: unknown[]) => userHasAccess(...a) }))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }))
const checkIpRateLimit = vi.fn()
const checkDailyBudget = vi.fn()
vi.mock('@/lib/rate-limit/ip', async (orig) => ({
  ...(await orig<typeof import('@/lib/rate-limit/ip')>()),
  checkIpRateLimit: (...a: unknown[]) => checkIpRateLimit(...a),
  checkDailyBudget: (...a: unknown[]) => checkDailyBudget(...a),
}))

import { POST } from '../route'
import { arHonung, byggMejl, escapeHtml, mottagare, validera } from '../kontakt'

const GILTIG = { name: 'Anna', email: 'anna@exempel.se', subject: 'Fråga', message: 'Hej <b>där</b>' }
const req = (body: unknown, ip = '203.0.113.7') =>
  ({
    json: async () => (body instanceof Error ? Promise.reject(body) : body),
    headers: new Headers({ 'x-forwarded-for': ip }),
  }) as unknown as import('next/server').NextRequest

const nyckelFore = process.env.RESEND_API_KEY

beforeEach(() => {
  send.mockReset()
  getUser.mockReset()
  userHasAccess.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'konto@exempel.se' } }, error: null })
  userHasAccess.mockResolvedValue(false)
  checkIpRateLimit.mockReset()
  checkDailyBudget.mockReset()
  checkIpRateLimit.mockResolvedValue({ allowed: true, used: 1, limit: 3, resetAt: '' })
  checkDailyBudget.mockResolvedValue({ allowed: true, used: 1, limit: 50 })
  process.env.RESEND_API_KEY = 're_test_falsk'
})
afterEach(() => {
  process.env.RESEND_API_KEY = nyckelFore
})

describe('POST /api/contact', () => {
  it('200 när Resend tar emot mejlet, till supporten med svar till formulärets adress', async () => {
    send.mockResolvedValue({ data: { id: 'm1' }, error: null })
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(1)
    const mejl = send.mock.calls[0][0]
    expect(mejl.to).toEqual(['support@jobbcoach.ai'])
    expect(mejl.replyTo).toBe('anna@exempel.se')
    expect(mejl.subject).toBe('[KONTAKT] Fråga')
    expect(mejl.html).toContain('Hej &lt;b&gt;där&lt;/b&gt;')
  })

  it('Premium märks i ämnet så att ärendet hanteras först', async () => {
    userHasAccess.mockResolvedValue(true)
    send.mockResolvedValue({ data: { id: 'm1' }, error: null })
    await POST(req(GILTIG))
    expect(send.mock.calls[0][0].subject).toBe('[KONTAKT] [PREMIUM] Fråga')
  })

  it('500 när Resend svarar med fel, till exempel en ogiltig nyckel', async () => {
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'API key is invalid' } })
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(500)
    expect((await res.json()).ok).toBe(false)
  })

  it('500 utan RESEND_API_KEY, och Resend anropas inte', async () => {
    delete process.env.RESEND_API_KEY
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(500)
    expect(send).not.toHaveBeenCalled()
  })

  it('500 när Resend kastar (nätverksfel)', async () => {
    send.mockRejectedValue(new Error('ECONNRESET'))
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(500)
  })

  it('inloggad väg räknas aldrig mot IP-gränsen', async () => {
    send.mockResolvedValue({ data: { id: 'm1' }, error: null })
    await POST(req(GILTIG))
    expect(checkIpRateLimit).not.toHaveBeenCalled()
    expect(checkDailyBudget).not.toHaveBeenCalled()
  })

  it('400 vid tomma fält, fel e-post eller trasig kropp', async () => {
    expect((await POST(req({ ...GILTIG, message: '  ' }))).status).toBe(400)
    expect((await POST(req({ ...GILTIG, email: 'inte-en-adress' }))).status).toBe(400)
    expect((await POST(req(new Error('trasig json')))).status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('POST /api/contact utan inloggning (publika /kontakt)', () => {
  beforeEach(() => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('skickar mejlet med [Publik] i ämnet, utan konto och utan Premium', async () => {
    send.mockResolvedValue({ data: { id: 'm1' }, error: null })
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(200)
    expect(send).toHaveBeenCalledTimes(1)
    const mejl = send.mock.calls[0][0]
    expect(mejl.to).toEqual(['support@jobbcoach.ai'])
    expect(mejl.replyTo).toBe('anna@exempel.se')
    expect(mejl.subject).toBe('[KONTAKT] [Publik] Fråga')
    expect(mejl.text).toContain('Premium: nej')
    expect(mejl.text).toContain('utan inloggning')
    expect(userHasAccess).not.toHaveBeenCalled()
    expect(checkIpRateLimit).toHaveBeenCalledWith(expect.anything(), '203.0.113.7', 'kontakt', 3)
    expect(checkDailyBudget).toHaveBeenCalledWith(expect.anything(), 'kontakt', 50)
  })

  it('honungsfältet ifyllt ger 200 och inget skickas, inget räknas', async () => {
    const res = await POST(req({ ...GILTIG, webbplats: 'https://skrap.example' }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    expect(send).not.toHaveBeenCalled()
    expect(checkIpRateLimit).not.toHaveBeenCalled()
  })

  it('fjärde försöket från samma IP ger 429 med texten om att maila direkt', async () => {
    send.mockResolvedValue({ data: { id: 'm1' }, error: null })
    // Räknaren som public_rate_limits: tre släpps igenom per IP och dygn.
    const raknat = new Map<string, number>()
    checkIpRateLimit.mockImplementation(async (_a: unknown, ip: string, _s: string, limit: number) => {
      const used = raknat.get(ip) ?? 0
      if (used >= limit) return { allowed: false, used, limit, resetAt: '' }
      raknat.set(ip, used + 1)
      return { allowed: true, used: used + 1, limit, resetAt: '' }
    })
    for (let i = 0; i < 3; i++) expect((await POST(req(GILTIG))).status).toBe(200)
    const fjarde = await POST(req(GILTIG))
    expect(fjarde.status).toBe(429)
    expect((await fjarde.json()).message).toBe('Du har skickat flera meddelanden i dag. Maila support@jobbcoach.ai direkt.')
    expect(send).toHaveBeenCalledTimes(3)
    // En annan IP släpps fortfarande igenom.
    expect((await POST(req(GILTIG, '198.51.100.2'))).status).toBe(200)
  })

  it('429 när dygnets globala tak är nått', async () => {
    checkDailyBudget.mockResolvedValue({ allowed: false, used: 50, limit: 50 })
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(429)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 vid fel e-post, före IP-räknaren', async () => {
    expect((await POST(req({ ...GILTIG, email: 'inte-en-adress' }))).status).toBe(400)
    expect(checkIpRateLimit).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('KONTAKT_MOTTAGARE styr om även den publika vägen till resend.dev', async () => {
    const fore = process.env.KONTAKT_MOTTAGARE
    process.env.KONTAKT_MOTTAGARE = 'delivered@resend.dev'
    try {
      send.mockResolvedValue({ data: { id: 'm1' }, error: null })
      await POST(req(GILTIG))
      expect(send.mock.calls[0][0].to).toEqual(['delivered@resend.dev'])
    } finally {
      if (fore === undefined) delete process.env.KONTAKT_MOTTAGARE
      else process.env.KONTAKT_MOTTAGARE = fore
    }
  })
})

describe('kontakt.ts', () => {
  it('arHonung: tomt fält är en människa, ifyllt är en robot', () => {
    expect(arHonung(GILTIG)).toBe(false)
    expect(arHonung({ ...GILTIG, webbplats: '' })).toBe(false)
    expect(arHonung({ ...GILTIG, webbplats: '  ' })).toBe(false)
    expect(arHonung({ ...GILTIG, webbplats: 'x' })).toBe(true)
  })

  it('validera trimmar och sätter tak på längden', () => {
    const v = validera({ ...GILTIG, name: '  Anna  ' })
    expect(v.ok && v.data.name).toBe('Anna')
    expect(validera({ ...GILTIG, message: 'x'.repeat(5001) }).ok).toBe(false)
  })

  it('KONTAKT_MOTTAGARE styr bara om till resend.dev, aldrig till en annan adress', () => {
    expect(mottagare(undefined)).toBe('support@jobbcoach.ai')
    expect(mottagare('delivered@resend.dev')).toBe('delivered@resend.dev')
    expect(mottagare('annan@exempel.se')).toBe('support@jobbcoach.ai')
    expect(mottagare('x@resend.dev.exempel.se')).toBe('support@jobbcoach.ai')
  })

  it('escapeHtml och ämnet utan radbrytningar', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
    const m = byggMejl({ ...GILTIG, subject: 'Rad1\r\nBcc: x@y.se' }, { userId: 'u1', kontoEpost: null, harPremium: false })
    expect(m.subject).toBe('[KONTAKT] Rad1 Bcc: x@y.se')
  })
})
