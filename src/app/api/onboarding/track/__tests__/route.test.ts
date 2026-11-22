/**
 * POST /api/onboarding/track med baraOmTomt: valet härlett ur brevet från
 * startflödet skrivs bara när profilen saknar ett val (klicktestet
 * 2026-11-22, punkt 4). Utan flaggan som förut.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const steg: string[] = []
let andring: Record<string, unknown> | null = null

vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) } }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => {
      const k: Record<string, unknown> = {}
      k.select = () => k
      k.maybeSingle = async () => ({ data: { onboarding_track: null } })
      k.update = (v: Record<string, unknown>) => {
        andring = v
        return k
      }
      k.eq = (kol: string) => {
        steg.push(`eq:${kol}`)
        return k
      }
      k.is = (kol: string, v: unknown) => {
        steg.push(`is:${kol}:${v}`)
        return Promise.resolve({ error: null })
      }
      k.then = (res: (v: unknown) => unknown) => res({ error: null })
      return k
    },
  }),
}))

import { POST } from '../route'

const anrop = (body: unknown) => POST(new Request('http://lokal/api/onboarding/track', { method: 'POST', body: JSON.stringify(body) }) as never)

beforeEach(() => {
  steg.length = 0
  andring = null
})

describe('baraOmTomt', () => {
  it('skriver valet bara där kolumnen är tom', async () => {
    const res = await anrop({ intent: 'brev', baraOmTomt: true })
    expect(res.status).toBe(200)
    expect(andring).toEqual({ onboarding_intent: 'brev' })
    expect(steg).toContain('is:onboarding_intent:null')
  })

  it('utan flaggan skrivs valet som förut', async () => {
    await anrop({ intent: 'cv' })
    expect(andring).toEqual({ onboarding_intent: 'cv' })
    expect(steg.some((s) => s.startsWith('is:'))).toBe(false)
  })
})
