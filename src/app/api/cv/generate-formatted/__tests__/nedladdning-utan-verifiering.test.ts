/**
 * Beslut 0 (docs/plan-mallar-2026-11-15.md avsnitt 0): nedladdningen kräver
 * inte profiles.email_verified_at. Google-konton och e-postkonton saknar den
 * eftersom Confirm email är avstängt.
 *
 *   - gratiskonto utan kolumnen: första PDF:en 200, andra 402
 *   - gratiskonto utan kolumnen: Word i gratismall 200 första gången och
 *     räknad, andra gången 402 (en gratisfil, PDF eller Word); Word i
 *     premiummall 402 cv_export_word
 *   - betalande utan kolumnen: PDF och Word 200
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NORMALT_CV } from '@/lib/cv/word/__tests__/fixtures'

const ANVANDARE = { id: 'user-1', email: 'kund@example.com' }

const harAtkomst = vi.fn<(feature: string) => boolean>()
const inserts: Record<string, unknown>[] = []
const updates: Record<string, unknown>[] = []
const loggat = vi.fn()
let insertFel: Array<{ message: string } | null> = []

const PROFIL = {
  full_name: 'Erik Lindberg',
  email: ANVANDARE.email,
  onboarding_track: null,
  free_cv_exports_used: 0,
  // Som 133 av 155 nya konton: kolumnen är aldrig satt.
  email_verified_at: null as string | null,
}

function kedja(tabell: string) {
  const svar = async () => ({ data: tabell === 'profiles' ? PROFIL : null, error: null })
  const k: Record<string, unknown> = {}
  k.select = () => k
  k.eq = () => k
  k.single = svar
  k.maybeSingle = svar
  k.insert = async (rad: Record<string, unknown>) => {
    inserts.push(rad)
    return { error: insertFel.shift() ?? null }
  }
  k.update = (rad: Record<string, unknown>) => {
    updates.push(rad)
    const u: Record<string, unknown> = {}
    u.eq = () => u
    u.then = (r: (v: unknown) => void) => r({ error: null })
    return u
  }
  return k
}

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: ANVANDARE }, error: null }) },
    from: (t: string) => kedja(t),
    rpc: async () => ({ error: null }),
  }),
}))
// Kvoträknaren skrivs med adminklienten (skyddad kolumn).
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({ from: (t: string) => kedja(t) }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({
  userHasAccess: async (_s: unknown, _id: string, feature: string) => harAtkomst(feature),
}))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))
vi.mock('@/lib/premium/logPremiumUsage', () => ({ logPremiumUsage: (...a: unknown[]) => loggat(...a) }))
vi.mock('@/lib/openai/cv-parser-ai', () => ({ validateCVData: () => true }))
vi.mock('@/app/api/cv/parse/route', () => ({
  parseCVWithAIServerSide: async () => null,
  extractBasicPersonalInfo: () => ({}),
  extractBasicSummary: () => '',
  extractBasicExperience: () => [],
  extractBasicEducation: () => [],
  extractBasicSkills: () => [],
  extractBasicLanguages: () => [],
}))
vi.mock('@/lib/cv/swedish-cv-pdf-generator', () => ({ generateSwedishCVPDF: async () => Buffer.from('%PDF') }))

import { POST } from '../route'

const anrop = (body: Record<string, unknown>) =>
  POST({ json: async () => body } as unknown as Parameters<typeof POST>[0])

const word = (template: string, extra: Record<string, unknown> = {}) =>
  anrop({ template, structuredData: structuredClone(NORMALT_CV), format: 'docx', ...extra })

beforeEach(() => {
  harAtkomst.mockReset()
  inserts.length = 0
  updates.length = 0
  loggat.mockReset()
  insertFel = []
  PROFIL.free_cv_exports_used = 0
  PROFIL.email_verified_at = null
})

const pdf = (template: string) =>
  anrop({ template, structuredData: structuredClone(NORMALT_CV), format: 'pdf' })

describe('nedladdning utan bekräftad e-post', () => {
  it('gratiskonto får sin första PDF', async () => {
    harAtkomst.mockReturnValue(false)
    const svar = await pdf('norrsken')
    expect(svar.status).toBe(200)
    expect(svar.headers.get('Content-Type')).toBe('application/pdf')
    expect(updates).toEqual([expect.objectContaining({ free_cv_exports_used: 1 })])
  })

  it('gratiskonto som använt sin PDF får betalväggen, aldrig e-postfelet', async () => {
    harAtkomst.mockReturnValue(false)
    PROFIL.free_cv_exports_used = 1
    const svar = await pdf('norrsken')
    expect(svar.status).toBe(402)
    const body = await svar.json()
    expect(body.feature).toBe('cv_export')
  })

  it('betalande utan kolumnen får PDF i premiummall', async () => {
    harAtkomst.mockReturnValue(true)
    const svar = await pdf('tidlos-formell')
    expect(svar.status).toBe(200)
    expect(updates).toHaveLength(0)
  })

  it('gratiskonto får sin första fil som Word i gratismall, och den räknas', async () => {
    harAtkomst.mockReturnValue(false)
    const svar = await anrop({ template: 'linne', structuredData: structuredClone(NORMALT_CV), format: 'docx' })
    expect(svar.status).toBe(200)
    expect(updates).toEqual([expect.objectContaining({ free_cv_exports_used: 1 })])
  })

  it('gratiskonto som använt sin fil får betalväggen också för Word i gratismall', async () => {
    harAtkomst.mockReturnValue(false)
    PROFIL.free_cv_exports_used = 1
    const svar = await anrop({ template: 'bjork', structuredData: structuredClone(NORMALT_CV), format: 'docx' })
    expect(svar.status).toBe(402)
    expect((await svar.json()).feature).toBe('cv_export')
  })

  it('gratiskonto och Word i premiummall ger 402 cv_export_word', async () => {
    harAtkomst.mockReturnValue(false)
    const svar = await anrop({ template: 'koppar', structuredData: structuredClone(NORMALT_CV), format: 'docx' })
    expect(svar.status).toBe(402)
    expect((await svar.json()).feature).toBe('cv_export_word')
    expect(updates).toHaveLength(0)
  })

  it('betalande utan kolumnen får Word', async () => {
    harAtkomst.mockReturnValue(true)
    const svar = await anrop({ template: 'norrsken', structuredData: structuredClone(NORMALT_CV), format: 'docx' })
    expect(svar.status).toBe(200)
  })
})
