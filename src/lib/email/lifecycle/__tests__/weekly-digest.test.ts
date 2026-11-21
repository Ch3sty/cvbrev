import { describe, expect, it } from 'vitest'
import { followUpNote, summarize, type DigestApplication } from '../templates/weekly-digest'

// Lördag 21 november 2026, 11.00 svensk tid.
const NU = new Date('2026-11-21T10:00:00Z')

function app(over: Partial<DigestApplication> & { id: string }): DigestApplication {
  return {
    job_title: 'Ekonomiassistent',
    company: 'Norrmejerier',
    applied_at: '2026-10-20',
    current_status: 'applied',
    status_updated_at: '2026-10-20T08:00:00Z',
    created_at: '2026-10-20T08:00:00Z',
    job_application_events: [
      { id: `h-${over.id}`, event_type: 'applied', occurred_at: '2026-10-20', created_at: '2026-10-20T08:00:00Z' },
    ],
    job_application_followups: [],
    ...over,
  }
}

describe('summarize, tystnaden med motorns regler', () => {
  it('följde upp i går: ingen påminnelse', () => {
    const d = summarize([app({ id: 'a', job_application_followups: [{ sent_at: '2026-11-20' }] })], NU)
    expect(d.followUps).toEqual([])
  })

  it('följde upp för länge sedan: påminnelse igen, dagarna räknas från uppföljningen', () => {
    const d = summarize([app({ id: 'b', job_application_followups: [{ sent_at: '2026-11-01' }] })], NU)
    expect(d.followUps).toEqual([{ id: 'b', title: 'Ekonomiassistent', company: 'Norrmejerier', days: 20 }])
  })

  it('ett oskickat utkast räknas inte som uppföljning', () => {
    const d = summarize([app({ id: 'c', job_application_followups: [{ sent_at: null }] })], NU)
    expect(d.followUps.map((f) => f.id)).toEqual(['c'])
  })

  it('en färsk status_updated_at (triggern) nollställer inte tystnaden', () => {
    const d = summarize([app({ id: 'd', status_updated_at: '2026-11-20T12:00:00Z' })], NU)
    expect(d.followUps.map((f) => f.days)).toEqual([32])
  })

  it('utan historik (tabellen saknas) räknas det som förut på status_updated_at', () => {
    const gammal = app({ id: 'e', status_updated_at: '2026-11-20T12:00:00Z' })
    delete gammal.job_application_events
    delete gammal.job_application_followups
    expect(summarize([gammal], NU).followUps).toEqual([])
  })

  it('bara de som väntar på första svaret, som förut', () => {
    const d = summarize([app({ id: 'f', current_status: 'interview_completed' })], NU)
    expect(d.followUps).toEqual([])
  })
})

describe('uppföljningsrutan', () => {
  it('tjänstetiteln länkar till uppföljningen på den sökta tjänsten, med utm', () => {
    const html = followUpNote({
      appliedThisWeek: 0,
      waiting: 1,
      interviews: 0,
      repliesThisWeek: 0,
      total: 1,
      followUps: [{ id: 'abc-123', title: 'Ekonomiassistent', company: 'Norrmejerier', days: 20 }],
    })!
    expect(html).toMatch(
      /<a href="https:\/\/[^"]+\/dashboard\/sokta-tjanster\/abc-123\?steg=folj-upp&amp;utm_source=lifecycle&amp;utm_medium=email&amp;utm_campaign=weekly_digest"/
    )
    expect(html).toContain('<strong style="color:#0F172A;">Ekonomiassistent</strong></a> hos Norrmejerier, tyst i 20 dagar')
  })
})
