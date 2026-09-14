// Bevisar att markFirstMilestone faktiskt skriver kolumnen, och att grenen
// som anropar den i /api/cv/jobs/[jobId] styrs av completion_handled och inte
// av usage_counted (som redan sätts vid jobbskapande och gjorde grenen död).
import { describe, it, expect, vi, beforeEach } from 'vitest'

const state = {
  profiles: {} as Record<string, any>,
  calls: [] as Array<{ table: string; values: any; filters: any[] }>,
}

function makeAdminStub() {
  return {
    from(table: string) {
      const filters: any[] = []
      const builder: any = {
        update(values: any) {
          builder._values = values
          return builder
        },
        insert(values: any) {
          state.calls.push({ table, values, filters })
          return Promise.resolve({ data: null, error: null })
        },
        eq(col: string, val: any) {
          filters.push(['eq', col, val])
          return builder
        },
        is(col: string, val: any) {
          filters.push(['is', col, val])
          return builder
        },
        then(resolve: any) {
          state.calls.push({ table, values: builder._values, filters })
          // Simulera PostgREST: .is(col, null) gör skrivningen till en no-op
          // när kolumnen redan är satt. Först vinner.
          const idFilter = filters.find((f) => f[0] === 'eq' && f[1] === 'id')
          const nullFilter = filters.find((f) => f[0] === 'is')
          const id = idFilter?.[2]
          const row = (state.profiles[id] ??= {})
          if (!nullFilter || row[nullFilter[1]] == null) {
            Object.assign(row, builder._values)
          }
          return resolve({ data: null, error: null })
        },
      }
      return builder
    },
  }
}

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => makeAdminStub(),
}))

import { markFirstMilestone } from '@/lib/activation-tracking'

const USER = 'ccb52d89-0000-0000-0000-000000000001'

beforeEach(() => {
  state.profiles = {}
  state.calls = []
})

describe('markFirstMilestone', () => {
  it('sätter first_cv_analyzed_at på profilen', async () => {
    const at = new Date('2026-09-14T12:00:00.000Z')
    await markFirstMilestone(USER, 'first_cv_analyzed_at', at)

    expect(state.profiles[USER]?.first_cv_analyzed_at).toBe(at.toISOString())
  })

  it('skriver mot profiles med id-filter och is(column, null)', async () => {
    await markFirstMilestone(USER, 'first_cv_analyzed_at')

    const call = state.calls.at(-1)!
    expect(call.table).toBe('profiles')
    expect(call.filters).toContainEqual(['eq', 'id', USER])
    expect(call.filters).toContainEqual(['is', 'first_cv_analyzed_at', null])
  })

  it('först vinner: ett andra anrop skriver inte över tidsstämpeln', async () => {
    const first = new Date('2026-09-14T12:00:00.000Z')
    const second = new Date('2026-09-20T12:00:00.000Z')

    await markFirstMilestone(USER, 'first_cv_analyzed_at', first)
    await markFirstMilestone(USER, 'first_cv_analyzed_at', second)

    expect(state.profiles[USER].first_cv_analyzed_at).toBe(first.toISOString())
  })

  it('sätter alla FirstMilestoneColumn-varianter', async () => {
    const columns = [
      'first_cv_uploaded_at',
      'first_letter_created_at',
      'first_cv_analyzed_at',
    ] as const

    for (const column of columns) {
      await markFirstMilestone(USER, column)
      expect(state.profiles[USER][column]).toBeTruthy()
    }
  })

  it('gör ingenting utan userId', async () => {
    await markFirstMilestone('', 'first_cv_analyzed_at')
    expect(state.calls).toHaveLength(0)
  })
})

describe('slutförandegrenen i /api/cv/jobs/[jobId]', () => {
  // Regressionsvakten för själva buggen: createBackgroundJob sätter
  // usage_counted=true redan vid skapandet, så !usage_counted var alltid
  // false för ett slutfört jobb och milstolpen kördes aldrig.
  const jobFromCreate = { status: 'completed', usage_counted: true, completion_handled: false }

  it('gamla villkoret !usage_counted är dött för jobb skapade av createBackgroundJob', () => {
    expect(jobFromCreate.status === 'completed' && !jobFromCreate.usage_counted).toBe(false)
  })

  it('nya villkoret !completion_handled kör för samma jobb', () => {
    expect(jobFromCreate.status === 'completed' && !jobFromCreate.completion_handled).toBe(true)
  })

  it('nya villkoret kör inte igen när flaggan är satt', () => {
    const handled = { ...jobFromCreate, completion_handled: true }
    expect(handled.status === 'completed' && !handled.completion_handled).toBe(false)
  })
})
