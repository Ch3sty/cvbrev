/**
 * Spärrarna för CV:t som Word-fil (docs/plan-cv-word-2026-11-15.md avsnitt 7):
 *
 *   1. Gratis och Word ger 402 med featuren cv_export_word, aldrig en fil,
 *      och gratisnedladdningen räknas inte.
 *   2. Premium och en mall utan Word-version ger 400.
 *   3. Premium och en Word-mall ger en .docx med rätt innehållstyp, loggar
 *      formatet och rör aldrig gratisräknaren.
 *   4. Saknas kolumnen format i formatted_cv_downloads loggas raden ändå.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NORMALT_CV } from '@/lib/cv/word/__tests__/fixtures'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'

// Mallarna ur katalogen, så att testet följer utbudet.
const WORD_MALL = MALL_KATALOG.find((m) => m.word)!
const UTAN_WORD = MALL_KATALOG.find((m) => !m.word)

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
  email_verified_at: '2026-01-01T00:00:00Z',
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
})

describe('CV som Word-fil, spärrarna i generate-formatted', () => {
  it('gratis och Word ger 402 cv_export_word, ingen fil och ingen räkning', async () => {
    harAtkomst.mockReturnValue(false)
    const svar = await word(WORD_MALL.id)
    expect(svar.status).toBe(402)
    const body = await svar.json()
    expect(body.feature).toBe('cv_export_word')
    expect(body.error).toBe('premium_required')
    expect(updates).toHaveLength(0)
    expect(inserts).toHaveLength(0)
  })

  it.skipIf(!UTAN_WORD)('Premium och en mall utan Word-version ger 400', async () => {
    harAtkomst.mockReturnValue(true)
    const svar = await word(UTAN_WORD!.id)
    expect(svar.status).toBe(400)
    expect(inserts).toHaveLength(0)
  })

  it('Premium och en Word-mall ger en .docx, loggar formatet och rör inte gratisräknaren', async () => {
    harAtkomst.mockReturnValue(true)
    const svar = await word(WORD_MALL.id, { fontId: 'lato' })
    expect(svar.status).toBe(200)
    expect(svar.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
    expect(svar.headers.get('Content-Disposition')).toContain('cv-' + WORD_MALL.id + '.docx')
    const buf = Buffer.from(await svar.arrayBuffer())
    expect(buf.subarray(0, 2).toString()).toBe('PK')
    // Lato finns inte i Word, så filen får mallens eget typsnitt.
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buf)
    const stilar = await zip.file('word/styles.xml')!.async('string')
    expect(stilar).toContain('w:ascii="Calibri"')
    expect(stilar).not.toContain('Lato')
    expect(updates).toHaveLength(0)
    expect(inserts).toEqual([expect.objectContaining({ template_id: WORD_MALL.id, format: 'docx' })])
    expect(loggat).toHaveBeenCalledWith('user-1', 'cv_export', expect.objectContaining({ format: 'docx' }))
  })

  it('ett Word-typsnitt som användaren valt följer med', async () => {
    harAtkomst.mockReturnValue(true)
    const svar = await word(WORD_MALL.id, { fontId: 'georgia' })
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(Buffer.from(await svar.arrayBuffer()))
    expect(await zip.file('word/styles.xml')!.async('string')).toContain('w:ascii="Georgia"')
  })

  it('loggar raden utan format när kolumnen saknas', async () => {
    harAtkomst.mockReturnValue(true)
    insertFel = [{ message: 'column "format" does not exist' }]
    const svar = await word(WORD_MALL.id)
    expect(svar.status).toBe(200)
    expect(inserts).toHaveLength(2)
    expect(inserts[0]).toHaveProperty('format', 'docx')
    expect(inserts[1]).not.toHaveProperty('format')
  })
})
