/**
 * Intervjuprovets dagskvot (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 6,
 * ägarens beslut 5 2026-09-23): ett prov per dygn på gratisnivån, räknat mot
 * anon_interview_samples sedan midnatt svensk tid, och ingen gräns för den
 * som har interview_unlimited (Träningspaketet och alla Allt-paket).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const harAtkomst = vi.fn()
vi.mock('@/lib/supabase/premiumAccess', () => ({
  userHasAccess: (...args: unknown[]) => harAtkomst(...args),
}))

import {
  checkDailyInterviewQuota,
  DAILY_LIMIT_INTERVIEW_SAMPLES,
  nextMidnightStockholm,
  startOfTodayStockholm,
} from '../quotaService'
import { FEATURES } from '@/lib/access/features'

/** En minimal klient som spelar in frågan och svarar med ett givet antal. */
function klient(count: number | null) {
  const anrop: Record<string, unknown[]> = {}
  const kedja = {
    select: (...a: unknown[]) => ((anrop.select = a), kedja),
    eq: (...a: unknown[]) => ((anrop.eq = a), kedja),
    gte: (...a: unknown[]) => {
      anrop.gte = a
      return Promise.resolve({ count, error: null })
    },
  }
  const supabase = {
    from: (tabell: string) => ((anrop.from = [tabell]), kedja),
  }
  return { supabase: supabase as never, anrop }
}

beforeEach(() => {
  harAtkomst.mockReset()
})

describe('gränsen', () => {
  it('är ett prov per dygn', () => {
    expect(DAILY_LIMIT_INTERVIEW_SAMPLES).toBe(1)
  })

  it('ges obegränsat av Träningspaketet och Allt, inte av CV-paketet', () => {
    expect(FEATURES.interview_unlimited).toEqual(['tester', 'allt'])
  })
})

describe('checkDailyInterviewQuota', () => {
  const nu = new Date('2026-09-23T15:30:00Z')

  it('släpper igenom första provet för ett gratiskonto', async () => {
    harAtkomst.mockResolvedValue(false)
    const { supabase } = klient(0)
    const r = await checkDailyInterviewQuota(supabase, 'u1', nu)
    expect(r.allowed).toBe(true)
    expect(r.used).toBe(0)
    expect(r.isPremium).toBe(false)
  })

  it('stoppar andra provet samma dygn och anger nästa midnatt', async () => {
    harAtkomst.mockResolvedValue(false)
    const { supabase } = klient(1)
    const r = await checkDailyInterviewQuota(supabase, 'u1', nu)
    expect(r.allowed).toBe(false)
    expect(r.used).toBe(1)
    expect(r.limit).toBe(1)
    expect(r.nextResetAt).toBe(nextMidnightStockholm(nu).toISOString())
    expect(r.perAccount).toBeUndefined()
  })

  it('räknar användarens rader sedan midnatt svensk tid', async () => {
    harAtkomst.mockResolvedValue(false)
    const { supabase, anrop } = klient(0)
    await checkDailyInterviewQuota(supabase, 'u1', nu)
    expect(anrop.from).toEqual(['anon_interview_samples'])
    expect(anrop.eq).toEqual(['user_id', 'u1'])
    expect(anrop.gte).toEqual(['created_at', startOfTodayStockholm(nu).toISOString()])
    // 23 september är sommartid: midnatt i Stockholm är 22:00 UTC dagen före.
    expect(anrop.gte?.[1]).toBe('2026-09-22T22:00:00.000Z')
  })

  it('behandlar ett saknat antal som noll', async () => {
    harAtkomst.mockResolvedValue(false)
    const { supabase } = klient(null)
    expect((await checkDailyInterviewQuota(supabase, 'u1', nu)).allowed).toBe(true)
  })

  it('frågar efter interview_unlimited och räknar inget för den som har det', async () => {
    harAtkomst.mockResolvedValue(true)
    const { supabase, anrop } = klient(5)
    const r = await checkDailyInterviewQuota(supabase, 'u1', nu)
    expect(harAtkomst).toHaveBeenCalledWith(supabase, 'u1', 'interview_unlimited')
    expect(r.allowed).toBe(true)
    expect(r.isPremium).toBe(true)
    expect(anrop.from).toBeUndefined()
  })
})
