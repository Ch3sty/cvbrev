// En schemalagd rad till en adress med fel form avbryts med ogiltig_adress i
// stället för att prövas mot Resend varje morgon (winback_14 och winback_30
// stod kvar med "Invalid `to` field", november 2026). Resend är en mock och
// databasen en dubbel i minnet: inget skickas.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({
  send: vi.fn(async (_: any) => ({ data: { id: 're_1' }, error: null })),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: h.send }
  },
}))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => null }))

import { fakeSupabase } from './fakeSupabase'
import { runLifecycleEmails, scheduleWinbacks } from '../runner'

const IGAR = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

function profil(id: string, email: string | null) {
  return {
    id,
    email,
    full_name: null,
    subscription_tier: 'free',
    subscription_status: null,
    current_period_end: null,
    premium_until: null,
    premium_source: null,
    quota_emails_opt_out: false,
    weekly_digest_opt_out: false,
    last_active: new Date(Date.now() - 20 * 86400000).toISOString(),
    created_at: '2026-09-01T00:00:00Z',
  }
}

function rad(id: string, userId: string, emailType: string) {
  return { id, user_id: userId, email_type: emailType, attempts: 0, metadata: {}, send_after: IGAR, sent_at: null, canceled_at: null }
}

describe('runnern och adresser med fel form', () => {
  beforeEach(() => h.send.mockClear())

  it('avbryter raden med ogiltig_adress och anropar aldrig Resend', async () => {
    const db = fakeSupabase({
      profiles: [profil('u-fel', 'anna@gmail')],
      email_schedule: [rad('s1', 'u-fel', 'winback_14'), rad('s2', 'u-fel', 'winback_30')],
    })
    const res = await runLifecycleEmails(db.client)

    expect(h.send).not.toHaveBeenCalled()
    expect(res).toMatchObject({ due: 2, sent: 0, canceled: 2, failed: 0 })
    for (const r of db.tables.email_schedule) {
      expect(r.cancel_reason).toBe('ogiltig_adress')
      expect(r.canceled_at).toBeTruthy()
      expect(r.attempts).toBe(0)
      expect(r.last_error ?? null).toBeNull()
    }
  })

  it('en avbruten rad plockas inte upp nästa morgon', async () => {
    const db = fakeSupabase({
      profiles: [profil('u-fel', 'anna@gmail')],
      email_schedule: [rad('s1', 'u-fel', 'winback_14')],
    })
    await runLifecycleEmails(db.client)
    const andra = await runLifecycleEmails(db.client)
    expect(andra.due).toBe(0)
    expect(h.send).not.toHaveBeenCalled()
  })

  it('en adress utan @ avbryts också, en riktig adress påverkas inte', async () => {
    const db = fakeSupabase({
      profiles: [profil('u-fel', 'inte-en-adress'), profil('u-ok', 'anna@exempel.se')],
      email_schedule: [rad('s1', 'u-fel', 'winback_14'), rad('s2', 'u-ok', 'winback_14')],
    })
    await runLifecycleEmails(db.client)
    const [fel, ok] = db.tables.email_schedule
    expect(fel.cancel_reason).toBe('ogiltig_adress')
    expect(ok.cancel_reason).not.toBe('ogiltig_adress')
    // Den riktiga adressen når åtminstone fram till mallens egna spärrar;
    // skickas den går den bara till anna@exempel.se.
    for (const anrop of h.send.mock.calls) {
      expect(anrop[0].to).toEqual(['anna@exempel.se'])
    }
  })

  it('saknad adress heter fortfarande no_email', async () => {
    const db = fakeSupabase({
      profiles: [profil('u-tom', null)],
      email_schedule: [rad('s1', 'u-tom', 'winback_14')],
    })
    await runLifecycleEmails(db.client)
    expect(db.tables.email_schedule[0].cancel_reason).toBe('no_email')
  })
})

describe('win-back schemaläggs inte på nytt efter en avbruten rad', () => {
  it('unikt index på (user_id, email_type): den avbrutna raden står kvar orörd', async () => {
    const db = fakeSupabase({
      profiles: [profil('u-fel', 'anna@gmail')],
      email_schedule: [{ ...rad('s1', 'u-fel', 'winback_14'), canceled_at: IGAR, cancel_reason: 'ogiltig_adress' }],
    })
    await scheduleWinbacks(db.client)
    const rader = db.tables.email_schedule.filter((r) => r.user_id === 'u-fel' && r.email_type === 'winback_14')
    expect(rader).toHaveLength(1)
    expect(rader[0].canceled_at).toBe(IGAR)
  })
})
