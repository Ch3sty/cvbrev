// Testhistoriken bakom test_history (avsnitt 4).
//
// Gratisnivån ser senaste sessionen, aldrig serien. Trimningen sker i
// serverhämtningen och inte i vyn, så det som testas här är att historiken
// faktiskt aldrig lämnar servern, och att talen ovanför den står kvar: antal
// försök och bästa resultat är summeringar, inte historik, och de är
// dessutom köpskälet.

import { describe, it, expect } from 'vitest'
import { getTesterHubData } from '../getHubData'

/** Tre färdiga matrislogikförsök, stigande resultat över tre dagar. */
const SESSIONER = [
  { id: 's1', test_type: 'matrislogik', score: 10, time_spent: 600, completed_at: '2026-09-01T10:00:00Z' },
  { id: 's2', test_type: 'matrislogik', score: 14, time_spent: 580, completed_at: '2026-09-02T10:00:00Z' },
  { id: 's3', test_type: 'matrislogik', score: 18, time_spent: 540, completed_at: '2026-09-03T10:00:00Z' },
]

/**
 * Minsta möjliga Supabase-dubbel. Kedjan är .from().select().eq().in().order()
 * och varje led ska gå att kedja vidare, så alla returnerar samma objekt.
 */
function fakeSupabase() {
  const chain: Record<string, unknown> = {}
  const self = () => chain
  Object.assign(chain, {
    select: self,
    eq: self,
    in: self,
    gt: self,
    order: self,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: undefined,
  })

  return {
    from(tabell: string) {
      const data = tabell === 'logic_test_v4_sessions' ? SESSIONER : []
      const res = { data, error: null, count: data.length }
      const q: Record<string, unknown> = {}
      Object.assign(q, {
        select: () => q,
        eq: () => q,
        in: () => q,
        gt: () => q,
        order: () => Promise.resolve(res),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      })
      return q
    },
  }
}

describe('getTesterHubData och test_history', () => {
  it('ger hela serien till den som har featuren', async () => {
    const data = await getTesterHubData(fakeSupabase(), 'user-1', true, true, 'tester')

    expect(data.hasHistory).toBe(true)
    expect(data.perTest['matrislogik-grund'].history).toHaveLength(3)
    expect(data.scope).toBe('tester')
  })

  it('trimmar serien till senaste försöket på gratisnivån', async () => {
    const data = await getTesterHubData(fakeSupabase(), 'user-1', false, false, null)

    expect(data.hasHistory).toBe(false)
    const stats = data.perTest['matrislogik-grund']
    expect(stats.history).toHaveLength(1)
    // Senaste, alltså det sista i stigande tidsordning.
    expect(stats.history[0].score).toBe(18)
  })

  it('räknar försök, bästa och tid på hela serien även när historiken trimmas', async () => {
    const gratis = await getTesterHubData(fakeSupabase(), 'user-1', false, false, null)
    const betald = await getTesterHubData(fakeSupabase(), 'user-1', true, true, 'tester')

    const g = gratis.perTest['matrislogik-grund']
    const b = betald.perTest['matrislogik-grund']

    expect(g.attempts).toBe(3)
    expect(g.attempts).toBe(b.attempts)
    expect(g.bestScore).toBe(b.bestScore)
    expect(g.totalTimeSeconds).toBe(b.totalTimeSeconds)
  })

  it('läcker aldrig fler än en rad när featuren saknas', async () => {
    const data = await getTesterHubData(fakeSupabase(), 'user-1', false, false, null)

    for (const stats of Object.values(data.perTest)) {
      expect(stats.history.length).toBeLessThanOrEqual(1)
    }
  })
})
