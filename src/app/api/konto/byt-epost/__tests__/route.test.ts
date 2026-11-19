/**
 * /api/konto/byt-epost. Supabase, Resend och rate limiting är mockade, så
 * inget mejl lämnar testet och ingen databas rörs.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const send = vi.fn()
const getUser = vi.fn()
const generateLink = vi.fn()
const updateUserById = vi.fn()
const profilTraffar = vi.fn()
const checkIpRateLimit = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send } })),
}))
vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}))
vi.mock('@/lib/activation-tracking', () => ({ logActivityServer: async () => {} }))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    auth: { admin: { generateLink, updateUserById } },
    from: () => ({
      select: () => ({
        ilike: () => ({ limit: async () => ({ data: profilTraffar(), error: null }) }),
        eq: () => ({ maybeSingle: async () => ({ data: { full_name: 'Anna Berg' }, error: null }) }),
      }),
    }),
  }),
}))
vi.mock('@/lib/rate-limit/ip', async (orig) => ({
  ...(await orig<typeof import('@/lib/rate-limit/ip')>()),
  checkIpRateLimit: (...a: unknown[]) => checkIpRateLimit(...a),
}))

import { createHash } from 'crypto'
import { POST } from '../route'

// Supabase verifierar den nya adressens länk mot sha224(ny + otp), inte mot hashed_token.
const NY_HASH = createHash('sha224').update('ny@exempel.se' + '123456').digest('hex')

const req = (body: unknown, ua = 'Mozilla/5.0') =>
  ({
    json: async () => body,
    headers: new Headers({ 'x-forwarded-for': '203.0.113.7', 'user-agent': ua }),
  }) as unknown as import('next/server').NextRequest

const ANVANDARE = { id: 'u1', email: 'gammal@exempel.se', is_anonymous: false }
const dubbelFore = process.env.SUPABASE_EMAIL_CHANGE_DUBBEL

beforeEach(() => {
  for (const f of [send, getUser, generateLink, updateUserById, profilTraffar, checkIpRateLimit]) f.mockReset()
  getUser.mockResolvedValue({ data: { user: ANVANDARE }, error: null })
  profilTraffar.mockReturnValue([])
  checkIpRateLimit.mockResolvedValue({ allowed: true, used: 1, limit: 5, resetAt: 'imorgon' })
  generateLink.mockImplementation(async ({ type }: { type: string }) => ({
    data: { properties: { hashed_token: `hash-${type}`, email_otp: '123456' } },
    error: null,
  }))
  send.mockResolvedValue({ data: { id: 'm1' }, error: null })
  delete process.env.SUPABASE_EMAIL_CHANGE_DUBBEL
})
afterEach(() => {
  if (dubbelFore === undefined) delete process.env.SUPABASE_EMAIL_CHANGE_DUBBEL
  else process.env.SUPABASE_EMAIL_CHANGE_DUBBEL = dubbelFore
})

describe('POST /api/konto/byt-epost', () => {
  it('lyckat byte: länk till den nya adressen, besked utan länk till den nuvarande', async () => {
    const res = await POST(req({ email: ' Ny@Exempel.se ' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, bekraftelse: 'ny' })

    expect(generateLink).toHaveBeenCalledTimes(1)
    expect(generateLink).toHaveBeenCalledWith({ type: 'email_change_new', email: 'gammal@exempel.se', newEmail: 'ny@exempel.se' })

    expect(send).toHaveBeenCalledTimes(2)
    const [ny, gammal] = send.mock.calls.map((c) => c[0])
    expect(ny.to).toBe('ny@exempel.se')
    expect(ny.from).toBe('Jobbcoach.ai <noreply@jobbcoach.ai>')
    expect(ny.subject).toBe('Bekräfta din nya e-postadress')
    expect(ny.html).toContain(`/auth/confirm?token_hash=${NY_HASH}&type=email_change`)
    expect(ny.text).toContain(`token_hash=${NY_HASH}&type=email_change`)
    expect(ny.text).not.toContain('hash-email_change_new')
    expect(ny.html).toContain('Hej Anna,')
    expect(gammal.to).toBe('gammal@exempel.se')
    expect(gammal.text).not.toContain('token_hash')
    expect(gammal.text).toContain('ny@exempel.se')
    for (const m of [gammal, ny]) {
      expect(m.html).not.toContain('—')
      expect(m.text).not.toContain('—')
    }
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it('båda adresserna får en länk när dubbel bekräftelse är påslagen', async () => {
    process.env.SUPABASE_EMAIL_CHANGE_DUBBEL = 'true'
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(await res.json()).toEqual({ ok: true, bekraftelse: 'bada' })
    expect(generateLink).toHaveBeenCalledTimes(2)
    expect(generateLink).toHaveBeenCalledWith({ type: 'email_change_current', email: 'gammal@exempel.se', newEmail: 'ny@exempel.se' })
    expect(send.mock.calls[1][0].to).toBe('gammal@exempel.se')
    expect(send.mock.calls[1][0].text).toContain('token_hash=hash-email_change_current')
  })

  it('beskedet till den nuvarande adressen fäller inte bytet om det inte går iväg', async () => {
    send.mockResolvedValueOnce({ data: { id: 'm1' }, error: null }).mockResolvedValueOnce({ data: null, error: { message: 'nej' } })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(res.status).toBe(200)
  })

  it('från appen pekar länken på /auth/app/, som appens App Links öppnar', async () => {
    await POST(req({ email: 'ny@exempel.se' }, 'Mozilla/5.0 JobbcoachApp/0.3.0 (android)'))
    expect(send.mock.calls[0][0].text).toContain('https://www.jobbcoach.ai/auth/app/bekrafta?token_hash=')
  })

  it('anonymt konto utan e-post: adressen sätts direkt, inga länkar', async () => {
    getUser.mockResolvedValue({ data: { user: { id: 'anon', email: undefined, is_anonymous: true } }, error: null })
    updateUserById.mockResolvedValue({ data: { user: {} }, error: null })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(await res.json()).toEqual({ ok: true, bekraftelse: 'ingen' })
    expect(updateUserById).toHaveBeenCalledWith('anon', { email: 'ny@exempel.se', email_confirm: true })
    expect(generateLink).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('409 när ett annat konto redan har adressen i profilen', async () => {
    profilTraffar.mockReturnValue([{ id: 'annan' }])
    const res = await POST(req({ email: 'upptagen@exempel.se' }))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'email_exists' })
    expect(generateLink).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('409 när Supabase själv säger att adressen finns', async () => {
    generateLink.mockResolvedValue({ data: null, error: { code: 'email_exists', message: 'A user with this email address has already been registered' } })
    const res = await POST(req({ email: 'upptagen@exempel.se' }))
    expect(res.status).toBe(409)
    expect(send).not.toHaveBeenCalled()
  })

  it('401 utan inloggning', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(res.status).toBe(401)
    expect(checkIpRateLimit).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('429 när kontot har nått gränsen', async () => {
    checkIpRateLimit.mockResolvedValueOnce({ allowed: false, used: 5, limit: 5, resetAt: 'imorgon' })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'for_manga', resetAt: 'imorgon' })
    expect(checkIpRateLimit.mock.calls[0][1]).toBe('konto:u1')
    expect(generateLink).not.toHaveBeenCalled()
  })

  it('429 när IP-adressen har nått gränsen', async () => {
    checkIpRateLimit
      .mockResolvedValueOnce({ allowed: true, used: 1, limit: 5, resetAt: '' })
      .mockResolvedValueOnce({ allowed: false, used: 10, limit: 10, resetAt: 'imorgon' })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(res.status).toBe(429)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 för en ogiltig adress och för samma adress som nu', async () => {
    expect((await POST(req({ email: 'inte-en-adress' }))).status).toBe(400)
    const samma = await POST(req({ email: 'GAMMAL@exempel.se' }))
    expect(samma.status).toBe(400)
    expect(await samma.json()).toEqual({ error: 'samma_epost' })
  })

  it('500 när Resend inte tar emot mejlet', async () => {
    send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'API key is invalid' } })
    const res = await POST(req({ email: 'ny@exempel.se' }))
    expect(res.status).toBe(500)
  })
})
