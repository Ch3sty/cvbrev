/**
 * Delningslänken med lista är Premium (beslut 17 i
 * docs/beslut-jobbsoket-2026-11-21.md): show_company_names blir sann bara när
 * anropet ber om listan och kontot har Premium, med samma kontroll som
 * rapporten (userHasPremiumAccess).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const ANVANDARE = { id: 'user-1' }
const premium = vi.fn<() => boolean>()
const inserts: Record<string, unknown>[] = []

function kedja() {
  const k: Record<string, unknown> = {}
  k.update = () => k
  k.eq = () => k
  k.is = () => Promise.resolve({ error: null })
  k.insert = async (rad: Record<string, unknown>) => {
    inserts.push(rad)
    return { error: null }
  }
  return k
}

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: ANVANDARE }, error: null }) },
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ from: () => kedja() }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({
  userHasPremiumAccess: async () => premium(),
}))

import { POST } from '../route'

const anrop = (body: Record<string, unknown>) =>
  POST({ json: async () => body, nextUrl: { origin: 'https://www.jobbcoach.ai' } } as unknown as Parameters<typeof POST>[0])

beforeEach(() => {
  premium.mockReset()
  inserts.length = 0
})

describe('POST /api/applications/share, listan är Premium', () => {
  it('gratiskonto som ber om listan får en länk med bara antalen', async () => {
    premium.mockReturnValue(false)
    const svar = await anrop({ show_company_names: true, show_notes: false })
    expect(svar.status).toBe(200)
    expect((await svar.json()).showCompanyNames).toBe(false)
    expect(inserts).toEqual([expect.objectContaining({ show_company_names: false })])
  })

  it('Premiumkonto som ber om listan får listan', async () => {
    premium.mockReturnValue(true)
    const svar = await anrop({ show_company_names: true, show_notes: false })
    expect((await svar.json()).showCompanyNames).toBe(true)
    expect(inserts).toEqual([expect.objectContaining({ show_company_names: true })])
  })

  it('utan begäran blir det ingen lista, inte heller för Premium', async () => {
    premium.mockReturnValue(true)
    await anrop({ show_notes: false })
    expect(inserts).toEqual([expect.objectContaining({ show_company_names: false })])
    await anrop({ show_company_names: false })
    expect(inserts[1]).toEqual(expect.objectContaining({ show_company_names: false }))
  })
})
