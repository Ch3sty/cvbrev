import { describe, expect, it } from 'vitest'
import {
  createFollowUpNotifications,
  followUpCandidates,
  notisText,
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

  it('längst tystnad först, avslutade och kallade bort (motorn avgör, inte statusen)', () => {
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

/** Genomförd intervju (eller provjobb) den 12 november, nio dagar före NU. */
function genomford(id: string, prov = false, over: Partial<ApplicationRow> = {}): ApplicationRow {
  const typ = prov ? 'trial_work_completed' : 'interview_completed'
  return rad({
    id,
    current_status: typ,
    status_updated_at: '2026-11-12T08:00:00Z',
    job_application_events: [
      { id: `h1-${id}`, event_type: 'applied', occurred_at: '2026-10-20', created_at: '2026-10-20T08:00:00Z' },
      { id: `h2-${id}`, event_type: 'interview_invited', occurred_at: '2026-11-01', created_at: '2026-11-01T08:00:00Z' },
      { id: `h3-${id}`, event_type: typ, occurred_at: '2026-11-12', created_at: '2026-11-12T08:00:00Z' },
    ],
    ...over,
  })
}

describe('intervjulägena (byggspec 2.7)', () => {
  it('genomförd intervju för 9 dagar sedan ger en kandidat med typ intervju, och notisen frågar om besked', () => {
    const [k] = followUpCandidates([genomford('i')], NU)
    expect(k).toMatchObject({ typ: 'intervju', momentDag: '2026-11-12', days: 9, tystSedan: '2026-11-19' })
    expect(notisText(k)).toEqual({
      title: 'Dags att fråga Norrmejerier om besked',
      message: 'Intervjun för tjänsten som ekonomiassistent var den 12 november. Ett kort mejl som frågar när du kan vänta besked räcker.',
    })
  })

  it('genomfört provjobb: samma titel, egen text', () => {
    const [k] = followUpCandidates([genomford('p', true)], NU)
    expect(k.typ).toBe('provjobb')
    expect(notisText(k)).toEqual({
      title: 'Dags att fråga Norrmejerier om besked',
      message: 'Provjobbet för tjänsten som ekonomiassistent var den 12 november. Ett kort mejl som frågar när du kan vänta besked räcker.',
    })
  })

  it('genomförd intervju för 6 dagar sedan ger ingen kandidat', () => {
    expect(followUpCandidates([genomford('i')], new Date('2026-11-18T10:00:00Z'))).toEqual([])
  })

  it('kallad, med eller utan tid, ger aldrig en kandidat', () => {
    const utanTid = rad({
      id: 'k1',
      current_status: 'interview_invited',
      job_application_events: [
        { id: 'k1a', event_type: 'applied', occurred_at: '2026-09-01', created_at: '2026-09-01T08:00:00Z' },
        { id: 'k1b', event_type: 'interview_invited', occurred_at: '2026-09-10', created_at: '2026-09-10T08:00:00Z' },
      ],
    })
    const medTid = rad({
      id: 'k2',
      current_status: 'interview_invited',
      job_application_events: [
        { id: 'k2a', event_type: 'applied', occurred_at: '2026-09-01', created_at: '2026-09-01T08:00:00Z' },
        { id: 'k2b', event_type: 'interview_invited', occurred_at: '2026-09-10', created_at: '2026-09-10T08:00:00Z', interview_at: '2026-09-20T08:00:00Z' },
      ],
    })
    expect(followUpCandidates([utanTid, medTid], NU)).toEqual([])
  })

  it('ingen notis för en intervjustatus säger "har inte hört av sig"', () => {
    for (const k of followUpCandidates([genomford('i'), genomford('p', true)], NU)) {
      const { title, message } = notisText(k)
      expect(`${title} ${message}`).not.toMatch(/har inte hört/)
    }
  })

  it('reservläget utan historik tar inte med en genomförd intervju', () => {
    const gammal = genomford('g', false, { status_updated_at: '2026-09-01T08:00:00Z' })
    delete gammal.job_application_events
    delete gammal.job_application_followups
    expect(followUpCandidates([gammal], NU)).toEqual([])
  })

  it('en obesvarad ansökan låter som förut', () => {
    const [k] = followUpCandidates([rad({ id: 'a' })], NU)
    expect(k.typ).toBe('ansokan')
    expect(notisText(k)).toEqual({
      title: 'Norrmejerier har inte hört av sig',
      message: 'Din ansökan som Ekonomiassistent har varit tyst i 32 dagar. Ett kort mejl som frågar hur processen ligger till räcker.',
    })
  })

  it('notisen får metadata efter och länken till folj-upp', async () => {
    const f = fejk({ job_applications: [genomford('app-i')], notifications: [] })
    await createFollowUpNotifications(f.admin as any, NU)
    expect(f.insatta[0]).toMatchObject({
      title: 'Dags att fråga Norrmejerier om besked',
      action_url: '/dashboard/sokta-tjanster/app-i?steg=folj-upp',
      metadata: { applicationId: 'app-i', silentDays: 9, efter: 'intervju' },
    })
  })
})

describe('redanNotifierad', () => {
  const kandidat = { app: rad({ id: 'x' }), days: 15, tystSedan: '2026-11-18', typ: 'ansokan' as const, momentDag: null }

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
      metadata: { applicationId: 'app-1', silentDays: 32, efter: 'ansokan' },
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
