/**
 * Röktestet 2026-11-19: talserier grund, omladdning mitt i. Sessionen
 * startade 02:06:55 och slutfördes 02:09:24 men fick time_spent 1 s, eftersom
 * complete summerade tiden per uppgift. Nu räknas den från started_at.
 * Svarets form ({ success, score, timeSpent, totalQuestions }) är oförändrad,
 * appen Testklar läser samma rutt.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const START = '2026-11-19T01:06:55.000Z'
const SLUT = Date.parse('2026-11-19T01:09:24.000Z')

const session: Record<string, unknown> = {}
const update = vi.fn()

vi.mock('next/headers', () => ({ cookies: async () => ({}) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: session, error: null }) }) }) }),
    }),
  }),
}))
vi.mock('@/lib/tests/skrivKlient', () => ({
  testSkrivKlient: () => ({
    from: () => ({
      update: (rad: unknown) => {
        update(rad)
        return { eq: () => ({ eq: async () => ({ error: null }) }) }
      },
    }),
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({ rpc: async () => ({ error: null }) }) }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraTestBricka: async () => {} }))
vi.mock('@/lib/tester/steg2/motor.server', () => ({
  steg2Motor: () => ({
    kind: 'talserie',
    arTestTyp: () => true,
    ratta: (svar: { correct: boolean }[]) => svar.filter((s) => s.correct).length,
    statistik: () => [],
  }),
}))

import { POST } from '../route'

function anrop() {
  return POST(
    new Request('http://x/api/steg2/talserie/complete', { method: 'POST', body: JSON.stringify({ sessionId: 's1' }) }),
    { params: Promise.resolve({ kind: 'talserie' }) }
  )
}

describe('/api/steg2/[kind]/complete, time_spent', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(SLUT)
    update.mockClear()
    Object.assign(session, {
      id: 's1',
      test_type: 'talserier',
      completed_at: null,
      started_at: START,
      // Tiden per uppgift efter en omladdning: nästan ingenting.
      answers: [
        { q_id: 'a', selected: 0, correct: true, time_spent: 1 },
        { q_id: 'b', selected: 1, correct: false, time_spent: 0 },
      ],
    })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('räknar från sessionens started_at, inte från summan per uppgift', async () => {
    const res = await anrop()
    const body = await res.json()
    expect(body).toEqual({ success: true, score: 1, timeSpent: 149, totalQuestions: 2 })
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ time_spent: 149, score: 1 }))
  })

  it('faller tillbaka på summan per uppgift när started_at saknas', async () => {
    session.started_at = null
    const body = await (await anrop()).json()
    expect(body.timeSpent).toBe(1)
  })
})
