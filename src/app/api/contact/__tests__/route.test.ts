/**
 * /api/contact (våg 5). Resend, Supabase och behörigheten är mockade, så
 * inget mejl lämnar testet och ingen databas rörs.
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

import { POST } from '../route'
import { byggMejl, escapeHtml, mottagare, validera } from '../kontakt'

const GILTIG = { name: 'Anna', email: 'anna@exempel.se', subject: 'Fråga', message: 'Hej <b>där</b>' }
const req = (body: unknown) =>
  ({ json: async () => (body instanceof Error ? Promise.reject(body) : body) }) as unknown as import('next/server').NextRequest

const nyckelFore = process.env.RESEND_API_KEY

beforeEach(() => {
  send.mockReset()
  getUser.mockReset()
  userHasAccess.mockReset()
  getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'konto@exempel.se' } }, error: null })
  userHasAccess.mockResolvedValue(false)
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

  it('401 utan inloggning', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    const res = await POST(req(GILTIG))
    expect(res.status).toBe(401)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 vid tomma fält, fel e-post eller trasig kropp', async () => {
    expect((await POST(req({ ...GILTIG, message: '  ' }))).status).toBe(400)
    expect((await POST(req({ ...GILTIG, email: 'inte-en-adress' }))).status).toBe(400)
    expect((await POST(req(new Error('trasig json')))).status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('kontakt.ts', () => {
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
    const m = byggMejl({ ...GILTIG, subject: 'Rad1\r\nBcc: x@y.se' }, { userId: 'u1', kontoEpost: null, premium: false })
    expect(m.subject).toBe('[KONTAKT] Rad1 Bcc: x@y.se')
  })
})
