// @vitest-environment node
/**
 * Byggarens första sparning är ett nytt CV i kontot och räknas som kontots
 * CV; ett förbättrat CV (originalCvId) räknas som uppdaterat. Bara när raden
 * finns (klicktestet på live 2026-11-22, punkt 4).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

let insattFel: { message: string } | null = null
const bricka = vi.fn(async () => {})
const nyttCv = vi.fn(async () => {})

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => {
      const k: Record<string, unknown> = {}
      k.select = (_: string, o?: { head?: boolean }) => (o?.head ? { eq: async () => ({ count: 0, error: null }) } : k)
      k.eq = () => k
      k.single = async () => (insattFel ? { data: null, error: insattFel } : { data: { id: 'ny1', original_file_path: 'users/u1/cv.pdf' }, error: null })
      k.insert = () => k
      return k
    },
  }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: false, maxCvs: 2 }) }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: (...a: unknown[]) => bricka(...(a as [])) }))
vi.mock('@/lib/onboarding/forsta-handling.server', () => ({ kvitteraNyttCv: (...a: unknown[]) => nyttCv(...(a as [])) }))

import { POST } from '@/app/api/cv/save-improved/route'

const anrop = (body: Record<string, unknown>) =>
  POST(new Request('http://localhost/api/cv/save-improved', { method: 'POST', body: JSON.stringify(body) }) as never)

beforeEach(() => {
  vi.clearAllMocks()
  insattFel = null
})

describe('save-improved och Kom igång', () => {
  it('byggarens första sparning: kontots CV, inte uppdaterat', async () => {
    const res = await anrop({ fileName: 'Mitt CV', improvedText: 'text', structuredData: {}, originalCvId: null })
    expect(res.status).toBe(200)
    expect(nyttCv).toHaveBeenCalledWith(expect.anything(), 'u1')
    expect(bricka).not.toHaveBeenCalled()
  })

  it('förbättrat CV: uppdaterat efter genomgången', async () => {
    await anrop({ fileName: 'cv (förbättrat)', improvedText: 'text', structuredData: {}, originalCvId: 'cv1' })
    expect(bricka).toHaveBeenCalledWith('u1', 'uppdatera_cv')
    expect(nyttCv).not.toHaveBeenCalled()
  })

  it('ingen rad sparad: ingen kvittering', async () => {
    insattFel = { message: 'fel' }
    const res = await anrop({ fileName: 'Mitt CV', improvedText: 'text', structuredData: {}, originalCvId: null })
    expect(res.status).toBe(500)
    expect(nyttCv).not.toHaveBeenCalled()
    expect(bricka).not.toHaveBeenCalled()
  })
})
