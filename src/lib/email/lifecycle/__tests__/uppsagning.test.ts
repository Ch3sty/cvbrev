// Uppsägningen schemalägger inte längre cancel_followup (spec-rummen 23.2):
// mejlet lovade 49 kr i månaden som ingen kod ger efter att prenumerationen
// är borttagen. Mallen och typen finns kvar i registret för historiken.
import { describe, it, expect, vi } from 'vitest'

const scheduleEmail = vi.fn(async () => undefined)
const cancelScheduled = vi.fn(async () => undefined)
vi.mock('../schedule', () => ({
  scheduleEmail: (...a: unknown[]) => scheduleEmail(...(a as [])),
  scheduleMany: vi.fn(async () => undefined),
  cancelScheduled: (...a: unknown[]) => cancelScheduled(...(a as [])),
  isoWeekKey: () => '2026-W41',
}))
vi.mock('../runner', () => ({ LIFECYCLE_FROM: 'test', sendScheduledRowNow: vi.fn() }))
vi.mock('resend', () => ({ Resend: vi.fn() }))

import { onSubscriptionDeleted } from '../hooks'
import { LIFECYCLE_EMAILS } from '../registry'

/** Profilen saknas, så bekräftelsen skickas aldrig och Resend rörs inte. */
const admin = {
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
}

describe('onSubscriptionDeleted', () => {
  it('schemalägger inget cancel_followup', async () => {
    await onSubscriptionDeleted(admin as never, 'u1')
    const typer = scheduleEmail.mock.calls.map(c => (c as unknown[])[2])
    expect(typer).not.toContain('cancel_followup')
    expect(cancelScheduled).toHaveBeenCalled()
  })

  it('mallen står kvar i registret', () => {
    expect(LIFECYCLE_EMAILS.cancel_followup).toBeDefined()
  })
})
