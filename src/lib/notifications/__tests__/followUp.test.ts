import { describe, expect, it } from 'vitest'
import {
  createFollowUpNotifications,
  followUpCandidates,
  redanNotifierad,
  type ApplicationRow,
} from '../followUp'

// Lördag 21 november 2026, 11.00 svensk tid.
const NU = new Date('2026-11-21T10:00:00Z')

function rad(over: Partial<ApplicationRow> & { id: string }): ApplicationRow {
  return {
    user_id: 'u1',
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

describe('followUpCandidates', () => {
  it('följde upp i går: ingen notis', () => {
    expect(followUpCandidates([rad({ id: 'a', job_application_followups: [{ sent_at: '2026-11-20' }] })], NU)).toEqual([])
  })

  it('följde upp för länge sedan: notis igen, tyst sedan nästa påminnelse', () => {
    const [k] = followUpCandidates([rad({ id: 'b', job_application_followups: [{ sent_at: '2026-11-01' }] })], NU)
    expect(k.app.id).toBe('b')
    expect(k.days).toBe(20)
    expect(k.tystSedan).toBe('2026-11-13')
  })

  it('en färsk status_updated_at (triggern) nollställer inte tystnaden', () => {
    const [k] = followUpCandidates([rad({ id: 'c', status_updated_at: '2026-11-20T12:00:00Z' })], NU)
    expect(k.days).toBe(32)
  })

  it('utan historik räknas det som förut', () => {
    const gammal = rad({ id: 'd', status_updated_at: '2026-11-20T12:00:00Z' })
    delete gammal.job_application_events
    delete gammal.job_application_followups
    expect(followUpCandidates([gammal], NU)).toEqual([])
  })

  it('längst tystnad först, avslutade och besvarade bort', () => {
    const lista = followUpCandidates(
      [
        rad({ id: 'kort', job_application_followups: [{ sent_at: '2026-11-05' }] }),
        rad({ id: 'lang' }),
        rad({ id: 'avslag', current_status: 'rejected' }),
        rad({ id: 'kallad', current_status: 'interview_invited' }),
      ],
      NU
    )
    expect(lista.map((k) => k.app.id)).toEqual(['lang', 'kort'])
  })
})

describe('redanNotifierad', () => {
  const kandidat = { app: rad({ id: 'x' }), days: 15, tystSedan: '2026-11-18' }

  it('en notis under den nuvarande tystnaden räknas', () => {
    expect(redanNotifierad(kandidat, ['2026-11-19T06:00:00Z'])).toBe(true)
  })

  it('en notis före en senare uppföljning räknas inte: nästa påminnelse gäller', () => {
    expect(redanNotifierad(kandidat, ['2026-11-05T06:00:00Z'])).toBe(false)
  })

  it('reservläget (utan historik) räknar varje notis i fönstret, som förut', () => {
    expect(redanNotifierad({ ...kandidat, tystSedan: null }, ['2026-11-05T06:00:00Z'])).toBe(true)
  })
})

/** Minsta möjliga fejkklient: kedjan returnerar sig själv och svarar med tabellens rader. */
function fejk(tabeller: Record<string, unknown[]>) {
  const insatta: unknown[] = []
  const fragor: string[] = []
  const admin = {
    from(tabell: string) {
      const bygg: any = {
        select(kol: string) {
          fragor.push(`${tabell}:${kol}`)
          return bygg
        },
        or: () => bygg,
        eq: () => bygg,
        gte: () => bygg,
        limit: () => bygg,
        insert(rader: unknown[]) {
          insatta.push(...rader)
          return Promise.resolve({ error: null })
        },
        then(res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) {
          return Promise.resolve({ data: tabeller[tabell] ?? [], error: null }).then(res, rej)
        },
      }
      return bygg
    },
  }
  return { admin, insatta, fragor }
}

describe('createFollowUpNotifications', () => {
  it('länkar till uppföljningen på den sökta tjänsten och läser historiken i samma fråga', async () => {
    const f = fejk({ job_applications: [rad({ id: 'app-1' })], notifications: [] })
    const r = await createFollowUpNotifications(f.admin as any, NU)
    expect(r.created).toBe(1)
    expect(f.insatta[0]).toMatchObject({
      action_url: '/dashboard/sokta-tjanster/app-1?steg=folj-upp',
      metadata: { applicationId: 'app-1', silentDays: 32 },
    })
    expect(f.fragor.filter((q) => q.startsWith('job_applications:'))).toHaveLength(1)
    expect(f.fragor[0]).toContain('job_application_followups(sent_at)')
  })

  it('följde upp efter förra notisen: ny notis när nästa påminnelse har passerat', async () => {
    const f = fejk({
      job_applications: [rad({ id: 'app-2', job_application_followups: [{ sent_at: '2026-11-06' }] })],
      notifications: [{ metadata: { applicationId: 'app-2' }, created_at: '2026-11-05T06:00:00Z' }],
    })
    const r = await createFollowUpNotifications(f.admin as any, NU)
    expect(r.created).toBe(1)
  })
})
