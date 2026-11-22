import { describe, expect, it } from 'vitest'
import { digestPreheader, followUpNote, summarize, weeklyDigest, type DigestApplication } from '../templates/weekly-digest'

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
      besked: [],
    })!
    expect(html).toMatch(
      /<a href="https:\/\/[^"]+\/dashboard\/sokta-tjanster\/abc-123\?steg=folj-upp&amp;utm_source=lifecycle&amp;utm_medium=email&amp;utm_campaign=weekly_digest"/
    )
    expect(html).toContain('<strong style="color:#0F172A;">Ekonomiassistent</strong></a> hos Norrmejerier, tyst i 20 dagar')
  })
})

/** Genomförd intervju (eller provjobb) på dagen `dag`. */
function genomford(id: string, dag: string, prov = false, over: Partial<DigestApplication> = {}): DigestApplication {
  const typ = prov ? 'trial_work_completed' : 'interview_completed'
  return app({
    id,
    current_status: typ,
    status_updated_at: `${dag}T08:00:00Z`,
    job_application_events: [
      { id: `h1-${id}`, event_type: 'applied', occurred_at: '2026-10-20', created_at: '2026-10-20T08:00:00Z' },
      { id: `h2-${id}`, event_type: 'interview_invited', occurred_at: '2026-10-25', created_at: '2026-10-25T08:00:00Z' },
      { id: `h3-${id}`, event_type: typ, occurred_at: dag, created_at: `${dag}T08:00:00Z` },
    ],
    ...over,
  })
}

describe('besked efter intervju eller provjobb (byggspec 2.7)', () => {
  it('besked fylls för genomförd intervju och provjobb, längst väntan först, högst 2', () => {
    const d = summarize(
      [
        genomford('i1', '2026-11-12'),
        genomford('p1', '2026-11-05', true, { company: 'Umeå Energi', job_title: 'Redovisningsekonom' }),
        genomford('i2', '2026-11-10'),
        genomford('farsk', '2026-11-16'),
      ],
      NU
    )
    expect(d.besked).toEqual([
      { id: 'p1', title: 'Redovisningsekonom', company: 'Umeå Energi', dag: '2026-11-05', moment: 'provjobb' },
      { id: 'i2', title: 'Ekonomiassistent', company: 'Norrmejerier', dag: '2026-11-10', moment: 'intervju' },
    ])
    expect(d.followUps).toEqual([])

    // Tysta ansökningar fyller upp till tre rader.
    const tysta = [app({ id: 't1' }), app({ id: 't2' }), app({ id: 't3' })]
    const tvaBesked = summarize([genomford('b1', '2026-11-05'), genomford('b2', '2026-11-06'), ...tysta], NU)
    expect(tvaBesked.besked).toHaveLength(2)
    expect(tvaBesked.followUps).toHaveLength(1)
    const ettBesked = summarize([genomford('b1', '2026-11-05'), ...tysta], NU)
    expect(ettBesked.besked).toHaveLength(1)
    expect(ettBesked.followUps).toHaveLength(2)
    const ingetBesked = summarize(tysta, NU)
    expect(ingetBesked.besked).toHaveLength(0)
    expect(ingetBesked.followUps).toHaveLength(2)
  })

  it('högst tre rader i rutan, med fem kandidater av varje sort', () => {
    const rader = [
      ...['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map((dag, i) => genomford(`b${i}`, dag, i % 2 === 1)),
      ...[0, 1, 2, 3, 4].map((i) => app({ id: `t${i}` })),
    ]
    const d = summarize(rader, NU)
    expect(d.besked.length + d.followUps.length).toBeLessThanOrEqual(3)
  })

  it('en kallelse, med eller utan tid, står aldrig i rutan', () => {
    const utanTid = app({
      id: 'k1',
      current_status: 'interview_invited',
      job_application_events: [
        { id: 'k1a', event_type: 'applied', occurred_at: '2026-09-01', created_at: '2026-09-01T08:00:00Z' },
        { id: 'k1b', event_type: 'interview_invited', occurred_at: '2026-09-10', created_at: '2026-09-10T08:00:00Z' },
      ],
    })
    const medTid = app({
      id: 'k2',
      current_status: 'interview_invited',
      job_application_events: [
        { id: 'k2a', event_type: 'applied', occurred_at: '2026-09-01', created_at: '2026-09-01T08:00:00Z' },
        { id: 'k2b', event_type: 'interview_invited', occurred_at: '2026-09-10', created_at: '2026-09-10T08:00:00Z', interview_at: '2026-09-20T08:00:00Z' },
      ],
    })
    const d = summarize([utanTid, medTid], NU)
    expect(d.besked).toEqual([])
    expect(d.followUps).toEqual([])
    expect(followUpNote(d)).toBeUndefined()
  })

  it('rutans rader och avslutning, före det oförändrade stycket om tysta ansökningar', () => {
    const html = followUpNote({
      appliedThisWeek: 0,
      waiting: 1,
      interviews: 2,
      repliesThisWeek: 0,
      total: 3,
      followUps: [{ id: 'abc-123', title: 'Ekonomiassistent', company: 'Norrmejerier', days: 20 }],
      besked: [
        { id: 'i-1', title: 'Redovisningsekonom', company: 'Umeå Energi', dag: '2026-11-12', moment: 'intervju' },
        { id: 'p-1', title: 'Lagerarbetare', company: 'Komatsu Forest', dag: '2026-11-10', moment: 'provjobb' },
      ],
    })!
    expect(html).toContain('Här väntar du på besked:')
    expect(html).toContain('<strong style="color:#0F172A;">Redovisningsekonom</strong></a> hos Umeå Energi, intervjun var den 12 november')
    expect(html).toContain('<strong style="color:#0F172A;">Lagerarbetare</strong></a> hos Komatsu Forest, provjobbet var den 10 november')
    expect(html).toContain('/dashboard/sokta-tjanster/i-1?steg=folj-upp&amp;utm_source=lifecycle&amp;utm_medium=email&amp;utm_campaign=weekly_digest"')
    // Med stycket om tysta ansökningar står meningen om mejlet bara en gång, i dess avslutning.
    const beskedStycke = html.slice(0, html.indexOf('Den här har det varit tyst om ett tag:'))
    expect(beskedStycke).toContain('Fråga när du kan vänta besked.')
    expect(beskedStycke).not.toContain('Ett kort mejl räcker.')
    expect(html.split('Ett kort mejl som frågar hur processen ligger till räcker.')).toHaveLength(2)
    // Det befintliga stycket står kvar ordagrant, efter besked-stycket.
    expect(html).toContain('Den här har det varit tyst om ett tag:')
    expect(html).toContain('Ett kort mejl som frågar hur processen ligger till räcker. Det är inte påträngande, det är att visa intresse.')
    expect(html.indexOf('Här väntar du på besked:')).toBeLessThan(html.indexOf('Den här har det varit tyst om ett tag:'))
    expect(html).not.toMatch(/har inte hört/)
  })

  it('bara besked: bara besked-stycket', () => {
    const html = followUpNote({ appliedThisWeek: 0, waiting: 0, interviews: 1, repliesThisWeek: 0, total: 1, followUps: [], besked: [{ title: 'X', company: 'Y', dag: '2026-11-12', moment: 'intervju' }] })!
    expect(html).toContain('Här väntar du på besked:')
    expect(html).toContain('<strong style="color:#0F172A;">X</strong> hos Y, intervjun var den 12 november')
    expect(html).not.toContain('tyst om ett tag')
    expect(html.endsWith('Fråga när du kan vänta besked. Ett kort mejl räcker.</p>')).toBe(true)
  })

  it('preheadern', () => {
    const bas = { appliedThisWeek: 0, waiting: 2, interviews: 1, repliesThisWeek: 0, total: 3 }
    expect(digestPreheader({ ...bas, followUps: [], besked: [{ title: 'X', company: 'Y', dag: '2026-11-12', moment: 'intervju' }] })).toBe('Dags att fråga om besked.')
    expect(digestPreheader({ ...bas, followUps: [{ title: 'X', company: 'Y', days: 20 }], besked: [] })).toBe('1 ansökan som är värd en påminnelse.')
    expect(digestPreheader({ ...bas, followUps: [], besked: [] })).toBe('2 ansökningar väntar fortfarande på svar.')
  })

  it('shouldSend är oförändrad: bara en tjänst som väntar besked ger inget brev', async () => {
    const rader = [genomford('i1', '2026-11-05')]
    const ctx = {
      userId: 'u1',
      profile: { weekly_digest_opt_out: false },
      admin: {
        from: () => {
          const b: any = { select: () => b, eq: () => b, then: (r: (v: unknown) => unknown) => Promise.resolve({ data: rader, error: null }).then(r) }
          return b
        },
      },
    }
    expect(summarize(rader, NU).besked).toHaveLength(1)
    expect(await weeklyDigest.shouldSend(ctx as any)).toBe(false)
  })
})

describe('kallad till test (Jobbsöket omgång 2, byggspec 9.19)', () => {
  it('sökt för 30 dagar sedan och kallad till test: varken i followUps eller i besked, och rutan nämner den inte', () => {
    const test = app({
      id: 'test-1',
      company: 'Testbolaget',
      applied_at: '2026-10-22',
      current_status: 'test_invited',
      status_updated_at: '2026-11-01T08:00:00Z',
      job_application_events: [
        { id: 'ta', event_type: 'applied', occurred_at: '2026-10-22', created_at: '2026-10-22T08:00:00Z' },
        { id: 'tb', event_type: 'test_invited', occurred_at: '2026-11-01', created_at: '2026-11-01T08:00:00Z' },
      ],
    })
    const d = summarize([test], NU)
    expect(d.followUps).toEqual([])
    expect(d.besked).toEqual([])
    expect(followUpNote(d)).toBeUndefined()
    // Med en tyst ansökan bredvid står bara den i rutan.
    const blandat = summarize([test, app({ id: 'tyst' })], NU)
    expect(blandat.followUps.map((f) => f.id)).toEqual(['tyst'])
    expect(followUpNote(blandat)).not.toContain('Testbolaget')
  })
})
