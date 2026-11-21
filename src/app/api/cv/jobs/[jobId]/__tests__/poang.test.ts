/**
 * Analysjobbets svar visar läsbarhetspoängen enligt poängmodellen
 * (docs/poangmodell-cv-analys.md), aldrig talen analysen sparade:
 *  - en sparad analys med AI:ns påhittade tal får CV-radens poäng
 *  - samma CV ger samma poäng vid varje läsning
 *  - gratisnivån får ett fynd och en potential räknad på det hon ser
 * AI anropas inte: jobbet är redan klart, och inget här tolkar om CV:t.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FIXTURER } from '@/lib/cv/poang/__tests__/fixturer'
import { poangForRad, poangMedVal, forvaltVal } from '@/lib/cv/poang'

const ANVANDARE = { id: 'user-1' }
const NORMALT = FIXTURER.find((f) => f.namn === 'normalt')!

let jobb: Record<string, unknown>
const harAtkomst = vi.fn<() => boolean>()

function kedja(tabell: string) {
  const svar = async () =>
    tabell === 'cv_texts'
      ? { data: { structured_data: NORMALT.structured_data, cv_text: NORMALT.cv_text }, error: null }
      : { data: { onboarding_track: null }, error: null }
  const k: Record<string, unknown> = {}
  k.select = () => k
  k.eq = () => k
  k.single = svar
  k.maybeSingle = svar
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
vi.mock('@/lib/cv/background-jobs', () => ({ getJobStatus: async () => jobb }))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({ from: (t: string) => kedja(t) }) }))
vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: async () => harAtkomst() }))
vi.mock('@/lib/premium/logPremiumUsage', () => ({ logPremiumUsage: () => {} }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))
vi.mock('@/lib/activation-tracking', () => ({ markFirstMilestone: async () => {}, logActivityServer: async () => {} }))
vi.mock('@/lib/gemini', () => ({
  generateJSON: () => {
    throw new Error('AI får inte anropas när ett klart jobb läses')
  },
  GEMINI_MODELS: {},
}))

import { GET } from '../route'

const hamta = async () => {
  const res = await GET({} as never, { params: Promise.resolve({ jobId: 'job-1' }) })
  return (await res.json()) as { result: Record<string, any> }
}

beforeEach(() => {
  harAtkomst.mockReset()
  jobb = {
    id: 'job-1',
    user_id: ANVANDARE.id,
    cv_id: 'cv-1',
    status: 'completed',
    usage_counted: true,
    completion_handled: true,
    // Den sparade analysen, med AI:ns tal (score 62, atsImpact 10, 5, 4 ...).
    result: structuredClone(NORMALT.analys),
  }
})

describe('GET /api/cv/jobs/[jobId]: poängen', () => {
  it('visar CV-radens poäng enligt modellen, inte talet analysen sparade', async () => {
    harAtkomst.mockReturnValue(true)
    const { result } = await hamta()
    const ratt = poangForRad({ structured_data: NORMALT.structured_data, cv_text: NORMALT.cv_text })!
    expect(result.atsFriendliness.score).toBe(ratt)
    expect(result.atsFriendliness.score).not.toBe(62)
    expect(result.poang.idag).toBe(ratt)
    expect(result.poangVersion).toBe(1)
    // Varje plus är skillnaden, inte AI:ns atsImpact.
    result.roleBasedImprovements.forEach((r: { plus: number }, i: number) => {
      expect(poangMedVal(result, { profil: false, roller: [i], kompetenser: [] })!.total - ratt).toBe(r.plus)
    })
    expect(result.poang.medAlla).toBe(poangMedVal(result, forvaltVal(result))!.total)
  })

  it('samma CV ger samma poäng vid varje läsning', async () => {
    harAtkomst.mockReturnValue(true)
    const a = await hamta()
    const b = await hamta()
    expect(b.result.poang).toEqual(a.result.poang)
  })

  it('gratisnivån får ett fynd och potentialen räknas på det hon ser', async () => {
    harAtkomst.mockReturnValue(false)
    const { result } = await hamta()
    const synliga =
      result.roleBasedImprovements.length + result.skillSuggestions.length + result.generalImprovements.length
    expect(synliga).toBe(1)
    expect(result.gated.findingsTotal).toBe(9)
    expect(result.poang.medAlla).toBe(poangMedVal(result, forvaltVal(result))!.total)
  })
})
