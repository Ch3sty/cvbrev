/**
 * /api/quota/remind tar bara emot kvoter som kommer tillbaka av sig själva
 * (beslut-mejl-och-radering 1b). Supabase är utbytt, ingen databas rörs.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  insert: vi.fn(async (_: unknown) => ({ error: null })),
  recordQuotaWall: vi.fn(async () => undefined),
}))

vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => ({ insert: h.insert }),
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }))
vi.mock('@/lib/email/lifecycle/hooks', () => ({ recordQuotaWall: h.recordQuotaWall }))

import { POST } from '../route'

const imorgon = () => new Date(Date.now() + 20 * 3600000).toISOString()
const req = (body: unknown) => ({ json: async () => body }) as unknown as Request

beforeEach(() => {
  h.insert.mockClear()
  h.recordQuotaWall.mockClear()
})

describe('POST /api/quota/remind', () => {
  it('svarar 400 feature_utan_aterkomst för cv_analysis och skriver ingen rad', async () => {
    const res = await POST(req({ feature: 'cv_analysis', remindAfter: imorgon() }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'feature_utan_aterkomst' })
    expect(h.insert).not.toHaveBeenCalled()
  })

  it('svarar 400 för cv_bygg och chat_message', async () => {
    for (const feature of ['cv_bygg', 'chat_message', 'test:../x']) {
      const res = await POST(req({ feature, remindAfter: imorgon() }))
      expect(res.status).toBe(400)
    }
    expect(h.insert).not.toHaveBeenCalled()
  })

  it('svarar 200 och skriver en rad för test:matris', async () => {
    const res = await POST(req({ feature: 'test:matris', remindAfter: imorgon() }))
    expect(res.status).toBe(200)
    expect(h.insert).toHaveBeenCalledTimes(1)
    expect(h.insert.mock.calls[0][0]).toMatchObject({ user_id: 'u1', feature: 'test:matris' })
  })

  it('svarar 200 för veckans brev', async () => {
    const res = await POST(req({ feature: 'letter_generation', remindAfter: imorgon() }))
    expect(res.status).toBe(200)
    expect(h.insert).toHaveBeenCalledTimes(1)
  })
})
