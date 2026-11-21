/**
 * skapaSoktTjanst med kallad_till_test (Jobbsöket omgång 2, byggspec 9.16 och
 * 9.19). Mockad klient: inga anrop mot databasen.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: vi.fn(async () => undefined) }))

import { arKalladTillTest, skapaSoktTjanst } from '../skapa'

type Insert = { tabell: string; rad: Record<string, unknown> }

/** En klient som sparar varje insert och kan låta händelsen test_invited falla. */
function klient(opts: { testFaller?: number } = {}) {
  const inserts: Insert[] = []
  let testFall = opts.testFaller ?? 0
  const from = (tabell: string) => ({
    insert: (rad: Record<string, unknown>) => {
      inserts.push({ tabell, rad })
      if (tabell === 'job_applications') {
        return { select: () => ({ single: async () => ({ data: { id: 'app1', ...rad, current_status: null }, error: null }) }) }
      }
      if (rad.event_type === 'test_invited' && testFall > 0) {
        testFall--
        return Promise.resolve({ error: { code: '23514', message: 'violates check constraint' } })
      }
      return Promise.resolve({ error: null })
    },
  })
  return { supabase: { from } as never, inserts }
}

const BAS = { job_title: 'Ekonomiassistent', company: 'Norrmejerier', applied_at: '2026-11-20', application_channel: 'ad' }
const handelser = (i: Insert[]) => i.filter((x) => x.tabell === 'job_application_events').map((x) => x.rad.event_type)

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('skapaSoktTjanst: kallad till test', () => {
  it('med fran=test-hem-plan: applied och sedan test_invited i två insert, svaret test_invited', async () => {
    const { supabase, inserts } = klient()
    const svar = await skapaSoktTjanst(supabase, 'u1', { ...BAS, fran: 'test-hem-plan', kallad_till_test: true })
    expect(handelser(inserts)).toEqual(['applied', 'test_invited'])
    const test = inserts.find((x) => x.rad.event_type === 'test_invited')!.rad
    expect(Object.keys(test).sort()).toEqual(['application_id', 'event_type', 'occurred_at'])
    expect(test.occurred_at).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(svar.ok && svar.data.current_status).toBe('test_invited')
  })

  it('med fran=test-hem gäller det också', async () => {
    const { supabase, inserts } = klient()
    await skapaSoktTjanst(supabase, 'u1', { ...BAS, fran: 'test-hem', kallad_till_test: true })
    expect(handelser(inserts)).toEqual(['applied', 'test_invited'])
  })

  it('utan fran, med ett annat fran eller utan true: bara applied', async () => {
    for (const body of [
      { ...BAS, kallad_till_test: true },
      { ...BAS, fran: 'komigang', kallad_till_test: true },
      { ...BAS, fran: 'test-hem-plan', kallad_till_test: 'true' },
      { ...BAS, fran: 'test-hem-plan' },
    ]) {
      const { supabase, inserts } = klient()
      const svar = await skapaSoktTjanst(supabase, 'u1', body)
      expect(handelser(inserts)).toEqual(['applied'])
      expect(svar.ok && svar.data.current_status).toBe('applied')
    }
  })

  it('ett fel: ett försök till, som lyckas', async () => {
    const { supabase, inserts } = klient({ testFaller: 1 })
    const svar = await skapaSoktTjanst(supabase, 'u1', { ...BAS, fran: 'test-hem-plan', kallad_till_test: true })
    expect(handelser(inserts)).toEqual(['applied', 'test_invited', 'test_invited'])
    expect(svar.ok && svar.data.current_status).toBe('test_invited')
  })

  it('två fel (som före migreringen): tjänsten står kvar som sökt och felet loggas', async () => {
    const { supabase, inserts } = klient({ testFaller: 2 })
    const svar = await skapaSoktTjanst(supabase, 'u1', { ...BAS, fran: 'test-hem-plan', kallad_till_test: true })
    expect(handelser(inserts)).toEqual(['applied', 'test_invited', 'test_invited'])
    expect(svar.ok).toBe(true)
    expect(svar.ok && svar.data.current_status).toBe('applied')
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('arKalladTillTest', () => {
    expect(arKalladTillTest({ kallad_till_test: true, fran: 'test-hem-plan' })).toBe(true)
    expect(arKalladTillTest({ kallad_till_test: true, fran: 'intervju-hubb' })).toBe(false)
    expect(arKalladTillTest({ kallad_till_test: false, fran: 'test-hem' })).toBe(false)
  })
})
