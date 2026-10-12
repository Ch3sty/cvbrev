import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: vi.fn() }))

import { brevSparrMeddelande, letterResetAtFromNow, LETTER_WINDOW_DAYS } from '../quotaService'

const DYGN = 24 * 60 * 60 * 1000

describe('brevspärren (spec-publikt-v2 del A avsnitt 7)', () => {
  const nu = new Date('2026-10-12T10:00:00Z')

  it('levande fönster: nästa brev sju dygn efter fönstrets start', () => {
    const start = new Date(nu.getTime() - 2 * DYGN)
    expect(letterResetAtFromNow(start, nu).toISOString()).toBe(new Date(start.getTime() + LETTER_WINDOW_DAYS * DYGN).toISOString())
  })

  it('inget eller utgånget fönster: nästa brev sju dygn efter nu', () => {
    expect(letterResetAtFromNow(null, nu).getTime()).toBe(nu.getTime() + LETTER_WINDOW_DAYS * DYGN)
    const gammal = new Date(nu.getTime() - 10 * DYGN)
    expect(letterResetAtFromNow(gammal, nu).getTime()).toBe(nu.getTime() + LETTER_WINDOW_DAYS * DYGN)
  })

  it('meddelandet säger datum, aldrig dagens eller i morgon', () => {
    const text = brevSparrMeddelande(new Date('2026-10-19T08:00:00Z'), 'Premium')
    expect(text).toContain('19 oktober')
    expect(text).not.toMatch(/dagens|i morgon|midnatt/)
  })
})
