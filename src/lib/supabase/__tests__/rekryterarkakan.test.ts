// @vitest-environment node
/**
 * Kakan jc_recruiter (klicktestet live 2026-11-22: "sätts hos en vanlig
 * besökare"). Den är proxyns cache för rollseparationen: sätts bara för en
 * inloggad användare på en kandidatyta (/dashboard med flera), med svaret
 * "<id>:1" för en godkänd rekryterare och "<id>:0" för alla andra, httpOnly
 * och tio minuter. En besökare utan konto får den aldrig.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, type NextResponse } from 'next/server'

const getUser = vi.fn()
const maybeSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser } }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}))
vi.mock('@/lib/utils/activity-tracker', () => ({ updateLastActive: () => Promise.resolve() }))
vi.mock('@/lib/supabase/anvandare-header', () => ({
  ANVANDARE_HEADER: 'x-jc-anvandare',
  signeraAnvandare: async () => 'signerad',
}))

import { updateSession } from '../middleware'

const ID = '11111111-2222-3333-4444-555555555555'
const req = (path: string) => new NextRequest(new URL(path, 'https://www.jobbcoach.ai'))
const kakan = (res: NextResponse) => res.cookies.get('jc_recruiter')

describe('kakan jc_recruiter', () => {
  beforeEach(() => {
    getUser.mockReset()
    maybeSingle.mockReset()
  })

  it('sätts aldrig för en besökare utan konto, varken på publika sidor eller kandidatytor', async () => {
    getUser.mockResolvedValue({ data: { user: null } })
    for (const sokvag of ['/', '/artiklar/ai-jobbmatchning', '/skapa-brev/start', '/dashboard/mina-brev']) {
      const res = await updateSession(req(sokvag))
      expect(kakan(res), sokvag).toBeUndefined()
    }
    expect(maybeSingle).not.toHaveBeenCalled()
  })

  it('sätts inte för en inloggad på en publik sida', async () => {
    getUser.mockResolvedValue({ data: { user: { id: ID, is_anonymous: false } } })
    const res = await updateSession(req('/artiklar/ai-jobbmatchning'))
    expect(kakan(res)).toBeUndefined()
    expect(maybeSingle).not.toHaveBeenCalled()
  })

  it('cachar "inte rekryterare" för en inloggad kandidat på en kandidatyta', async () => {
    getUser.mockResolvedValue({ data: { user: { id: ID, is_anonymous: false } } })
    maybeSingle.mockResolvedValue({ data: null })
    const res = await updateSession(req('/dashboard/mina-brev'))
    const k = kakan(res)
    expect(k?.value).toBe(`${ID}:0`)
    expect(k?.httpOnly).toBe(true)
    expect(k?.maxAge).toBe(600)
  })

  it('skickar en godkänd rekryterare till portalen och cachar svaret', async () => {
    getUser.mockResolvedValue({ data: { user: { id: ID, is_anonymous: false } } })
    maybeSingle.mockResolvedValue({ data: { status: 'approved' } })
    const res = await updateSession(req('/dashboard'))
    expect(res.headers.get('location')).toBe('https://www.jobbcoach.ai/rekryterare')
    expect(kakan(res)?.value).toBe(`${ID}:1`)
  })
})
