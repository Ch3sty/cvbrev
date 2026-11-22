// Kvotpåminnelsen hoppar över på behörigheten, inte på subscription_tier
// (beslut-mejl-och-radering 1d). Behörigheten läses med den riktiga
// userHasAccess mot en Supabase-dubbel i minnet; Resend är en mock.
import { describe, expect, it, vi } from 'vitest'

import { fakeSupabase } from '@/lib/email/lifecycle/__tests__/fakeSupabase'
import { skickaKvotPaminnelser } from '../kvotPaminnelse'

const NU = new Date()
const IGAR = new Date(NU.getTime() - 24 * 3600000).toISOString()
const OM_EN_DAG = new Date(NU.getTime() + 24 * 3600000).toISOString()

function resendMock() {
  const send = vi.fn(async (_: any) => ({ data: { id: 're_1' }, error: null }))
  return { send, resend: { emails: { send } } as any }
}

function profil(id: string, over: Record<string, unknown> = {}) {
  return { id, email: `${id}@exempel.se`, quota_emails_opt_out: false, subscription_tier: 'free', premium_until: null, premium_scope: null, ...over }
}

function paminnelse(id: string, user_id: string, feature: string) {
  return { id, user_id, feature, remind_after: IGAR, sent_at: null }
}

describe('skickaKvotPaminnelser', () => {
  it('gratiskonto med väntande letter_generation får mejlet', async () => {
    const db = fakeSupabase({ profiles: [profil('u1')], quota_reminders: [paminnelse('q1', 'u1', 'letter_generation')], admin_users: [], premium_grants: [], email_log: [] })
    const { send, resend } = resendMock()
    const r = await skickaKvotPaminnelser(db.client, resend, NU)
    expect(r).toEqual({ success: true, sent: 1, skipped: 0 })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0][0].to).toEqual(['u1@exempel.se'])
    expect(db.tables.email_log).toHaveLength(1)
    expect(db.tables.quota_reminders[0].sent_at).not.toBeNull()
  })

  it('free i subscription_tier men giltigt Dagspass i premium_grants: inget mejl, raden markeras', async () => {
    const db = fakeSupabase({
      profiles: [profil('u2')],
      quota_reminders: [paminnelse('q2', 'u2', 'letter_generation')],
      admin_users: [],
      premium_grants: [{ user_id: 'u2', scope: 'allt', premium_until_after: OM_EN_DAG }],
      email_log: [],
    })
    const { send, resend } = resendMock()
    const r = await skickaKvotPaminnelser(db.client, resend, NU)
    expect(r.skipped).toBe(1)
    expect(send).not.toHaveBeenCalled()
    expect(db.tables.quota_reminders[0].sent_at).not.toBeNull()
  })

  it('admintilldelat konto får ingen testpåminnelse', async () => {
    const db = fakeSupabase({
      profiles: [profil('u3')],
      quota_reminders: [paminnelse('q3', 'u3', 'test:matrislogik')],
      admin_users: [{ id: 'u3', role: 'admin' }],
      premium_grants: [],
      email_log: [],
    })
    const { send, resend } = resendMock()
    await skickaKvotPaminnelser(db.client, resend, NU)
    expect(send).not.toHaveBeenCalled()
    expect(db.tables.quota_reminders[0].sent_at).not.toBeNull()
  })

  it('cv_analysis skickas aldrig och markeras sent_at', async () => {
    const db = fakeSupabase({ profiles: [profil('u4')], quota_reminders: [paminnelse('q4', 'u4', 'cv_analysis')], admin_users: [], premium_grants: [], email_log: [] })
    const { send, resend } = resendMock()
    const r = await skickaKvotPaminnelser(db.client, resend, NU)
    expect(r).toEqual({ success: true, sent: 0, skipped: 1 })
    expect(send).not.toHaveBeenCalled()
    expect(db.tables.quota_reminders[0].sent_at).not.toBeNull()
  })

  it('avregistrerad får inget mejl', async () => {
    const db = fakeSupabase({ profiles: [profil('u5', { quota_emails_opt_out: true })], quota_reminders: [paminnelse('q5', 'u5', 'test:matris')], admin_users: [], premium_grants: [], email_log: [] })
    const { send, resend } = resendMock()
    await skickaKvotPaminnelser(db.client, resend, NU)
    expect(send).not.toHaveBeenCalled()
  })
})
