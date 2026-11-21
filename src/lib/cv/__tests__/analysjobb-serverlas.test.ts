/**
 * Analysjobben läses och skrivs bara av servern (2026-11-21):
 *  - jobbraden skapas med service role, och edge-funktionen anropas med
 *    servicenyckeln (admin-klienten), aldrig med användarens session
 *  - getJobStatus läser med service role och alltid med user_id i villkoret
 *  - save-improved-analysis läser originalet och skriver den nya raden med
 *    service role, bara för hennes egen rad och hennes eget CV
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

type Anrop = { tabell: string; op: string; varden?: unknown; filter: Array<[string, unknown]>; kolumner?: string }
let adminAnrop: Anrop[] = []
let anvandarAnrop: Anrop[] = []
let invokes: Array<{ namn: string; body: unknown }> = []
let cvAgare: string | null = 'user-1'
let originalRad: Record<string, unknown> | null = null

function kedja(logg: Anrop[], tabell: string, svar: (a: Anrop) => unknown) {
  const a: Anrop = { tabell, op: 'select', filter: [] }
  logg.push(a)
  const k: Record<string, unknown> = {}
  const klar = async () => ({ data: svar(a), error: null })
  k.select = (kol?: string) => {
    if (a.op === 'select') a.kolumner = kol
    return k
  }
  k.insert = (v: unknown) => {
    a.op = 'insert'
    a.varden = v
    return k
  }
  k.update = (v: unknown) => {
    a.op = 'update'
    a.varden = v
    return k
  }
  k.eq = (kol: string, v: unknown) => {
    a.filter.push([kol, v])
    return k
  }
  k.single = klar
  k.maybeSingle = klar
  k.then = (r: (x: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(r)
  return k
}

const filterVarde = (a: Anrop, kol: string) => a.filter.find(([k]) => k === kol)?.[1]

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}))
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: (t: string) =>
      kedja(adminAnrop, t, (a) => {
        if (a.op === 'insert') return { id: 'nytt-jobb' }
        if (t === 'cv_analysis_jobs') {
          // Raden finns bara för rätt ägare.
          return filterVarde(a, 'user_id') === 'user-1' ? originalRad : null
        }
        return null
      }),
    functions: {
      invoke: (namn: string, opts: { body: unknown }) => {
        invokes.push({ namn, body: opts.body })
        return Promise.resolve({ data: null, error: null })
      },
    },
  }),
}))
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
    from: (t: string) =>
      kedja(anvandarAnrop, t, (a) => {
        if (t === 'cv_texts' && a.kolumner === 'id') {
          return filterVarde(a, 'user_id') === cvAgare ? { id: filterVarde(a, 'id') } : null
        }
        if (t === 'cv_texts') return { structured_data: null, cv_text: 'x' }
        return null
      }),
    functions: {
      invoke: () => {
        throw new Error('edge-funktionen får inte anropas med användarens session')
      },
    },
  }),
}))

beforeEach(() => {
  adminAnrop = []
  anvandarAnrop = []
  invokes = []
  cvAgare = 'user-1'
  originalRad = { result: { analysisType: 'full', roleBasedImprovements: [] } }
})

describe('background-jobs', () => {
  it('skapar jobbraden med service role och anropar edge-funktionen med admin-klienten', async () => {
    const { createBackgroundJob } = await import('../background-jobs')
    const { jobId, error } = await createBackgroundJob('user-1', 'cv-1')
    expect(error).toBeUndefined()
    expect(jobId).toBe('nytt-jobb')
    const insert = adminAnrop.find((a) => a.op === 'insert')!
    expect(insert.tabell).toBe('cv_analysis_jobs')
    expect(insert.varden).toMatchObject({ user_id: 'user-1', cv_id: 'cv-1', status: 'pending', usage_counted: true })
    expect(invokes).toEqual([{ namn: 'analyze-cv-background', body: { jobId: 'nytt-jobb', cvId: 'cv-1' } }])
    expect(anvandarAnrop.filter((a) => a.tabell === 'cv_analysis_jobs')).toHaveLength(0)
  })

  it('getJobStatus läser bara användarens egen rad', async () => {
    const { getJobStatus } = await import('../background-jobs')
    originalRad = { id: 'job-1', user_id: 'user-1', status: 'completed' }
    expect(await getJobStatus('job-1', 'user-1')).toMatchObject({ id: 'job-1' })
    expect(await getJobStatus('job-1', 'user-2')).toBeNull()
    for (const a of adminAnrop) expect(filterVarde(a, 'user_id')).toBeDefined()
  })
})

describe('POST /api/cv/save-improved-analysis', () => {
  const posta = async (body: Record<string, unknown>) => {
    const { POST } = await import('@/app/api/cv/save-improved-analysis/route')
    return POST({ json: async () => body } as never)
  }
  const body = { originalAnalysisId: 'job-1', improvedResult: { x: 1 }, displayName: 'Nytt', cvId: 'cv-1', satt: 'nytt' }

  it('läser originalet och skriver raden med service role, med user_id i villkoret', async () => {
    const res = await posta(body)
    expect(res.status).toBe(200)
    const las = adminAnrop.find((a) => a.tabell === 'cv_analysis_jobs' && a.op === 'select')!
    expect(filterVarde(las, 'user_id')).toBe('user-1')
    const insert = adminAnrop.find((a) => a.op === 'insert')!
    expect(insert.varden).toMatchObject({ user_id: 'user-1', cv_id: 'cv-1', status: 'completed' })
    expect(anvandarAnrop.filter((a) => a.tabell === 'cv_analysis_jobs')).toHaveLength(0)
  })

  it('nekar ett CV som inte är hennes och skriver ingenting', async () => {
    cvAgare = 'user-2'
    const res = await posta(body)
    expect(res.status).toBe(404)
    expect(adminAnrop.filter((a) => a.op === 'insert')).toHaveLength(0)
  })
})
