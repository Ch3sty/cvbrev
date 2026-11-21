/**
 * Jobbsöket omgång 2, intervjulägena (byggspec 2.2, 2.3, 2.5, 2.6 och 2.10).
 * Ren motor, inget nätverk.
 */
import { describe, expect, it, vi } from 'vitest'

// Instruktionen prövas utan nätverk: AI-lagret byts mot en attrapp.
vi.mock('@/lib/gemini', () => ({ generateJSON: vi.fn(), GEMINI_MODELS: { fast: 'attrapp' } }))
import { instruktionFor, systemEfterMoment } from '@/lib/openai/uppfoljningsmejl'
import {
  AMNE_START,
  attGoraKandidater,
  attGoraNu,
  bana,
  beskedText,
  delaUppMejl,
  foljUppText,
  foljUppTyp,
  gruppFor,
  intervjuInfo,
  intervjuText,
  mallAmne,
  nastaPaminnelse,
  ordIMejlet,
  skaSattaTiden,
  soktaVagg,
  tjanstLage,
  tystGransFor,
  underlagForModellen,
  uppfoljningSparr,
  uppfoljningsmall,
  utkastGaller,
  utkastTyp,
  vaggForHandling,
  type AttGoraIndata,
  type Handelse,
  type TjanstMedHistorik,
  type Uppfoljning,
  type UppfoljningUnderlag,
  type VeckansMal,
} from '../index'
import { forberedKortning } from '../uppfoljningMarken'
import { valbaraForIntervju } from '../intervju'
import type { ApplicationEventType, JobApplication } from '@/lib/applications/status'

/* Lördag 21 november 2026 klockan 10 svensk tid. */
const NU = new Date('2026-11-21T09:00:00Z')
const IDAG = '2026-11-21'
const dagFore = (n: number) => {
  const d = new Date(Date.UTC(2026, 10, 21 - n))
  return d.toISOString().slice(0, 10)
}

let raknare = 0
function handelse(appId: string, typ: ApplicationEventType, dag: string, extra: Partial<Handelse> = {}): Handelse {
  raknare++
  return {
    id: `h${raknare}`,
    application_id: appId,
    event_type: typ,
    interview_round: null,
    note: null,
    occurred_at: dag,
    created_at: `${dag}T08:00:00Z`,
    interview_at: null,
    interview_place: null,
    ...extra,
  }
}

function tjanst(
  id: string,
  status: ApplicationEventType,
  handelser: Handelse[],
  uppfoljningar: Uppfoljning[] = [],
  opts: Partial<JobApplication> = {}
): TjanstMedHistorik {
  return {
    ansokan: {
      id,
      user_id: 'u1',
      job_title: 'Ekonomiassistent',
      company: 'Länsförsäkringar',
      location: 'Umeå',
      application_channel: 'ad',
      job_ad_url: null,
      letter_id: null,
      cv_id: null,
      notes: null,
      applied_at: '2026-10-20',
      current_status: status,
      status_updated_at: '2026-10-20T10:00:00Z',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
      ...opts,
    },
    handelser: [handelse(id, 'applied', opts.applied_at ?? '2026-10-20'), ...handelser],
    uppfoljningar,
  }
}

function uppf(appId: string, extra: Partial<Uppfoljning> = {}): Uppfoljning {
  return {
    id: `u-${appId}-${++raknare}`,
    application_id: appId,
    user_id: 'u1',
    subject: 'Min ansökan till tjänsten som ekonomiassistent',
    body: 'Hej,\n\nText.\n\nVänliga hälsningar\nElin Sundberg',
    rewrites: 0,
    sent_at: null,
    sent_via: null,
    created_at: '2026-11-20T10:00:00Z',
    updated_at: '2026-11-20T10:00:00Z',
    ...extra,
  }
}

/** Genomförd intervju (eller provjobb) för `dagar` dagar sedan. */
function genomford(id: string, dagar: number, prov = false, uppfoljningar: Uppfoljning[] = []): TjanstMedHistorik {
  const dag = dagFore(dagar)
  return prov
    ? tjanst(id, 'trial_work_completed', [handelse(id, 'trial_work_completed', dag)], uppfoljningar)
    : tjanst(id, 'interview_completed', [handelse(id, 'interview_invited', '2026-10-25'), handelse(id, 'interview_completed', dag)], uppfoljningar)
}

/** Kallad utan tid för `dagar` dagar sedan. */
function kalladUtanTid(id: string, dagar: number): TjanstMedHistorik {
  return tjanst(id, 'interview_invited', [handelse(id, 'interview_invited', dagFore(dagar))])
}

const MAL: VeckansMal = { mal: 3, forval: true, sokta: 3, klart: true, kvar: 0, vecka: 47, start: '2026-11-16', slut: '2026-11-22', text: '' }
function indata(t: TjanstMedHistorik[]): AttGoraIndata {
  return { tjanster: t.map((x) => tjanstLage(x, NU)), skaSokas: [], veckansMal: MAL, harCv: true, sokteForraManaden: 0, nu: NU }
}

/* ------------------------------------------------------------ foljUppTyp */

describe('foljUppTyp', () => {
  const lageFor = (t: TjanstMedHistorik) => foljUppTyp(t.ansokan.current_status, intervjuInfo(t.ansokan.current_status, t.handelser, NU))

  it('ger sorten för varje status', () => {
    expect(lageFor(tjanst('a', 'applied', []))).toBe('ansokan')
    expect(foljUppTyp(null, null)).toBe('ansokan')
    expect(foljUppTyp('no_response', null)).toBe('ansokan')
    // Kallad med tid (framåt), utan tid och med tiden passerad.
    const medTid = tjanst('b', 'interview_invited', [handelse('b', 'interview_invited', '2026-11-13', { interview_at: '2026-11-24T09:00:00.000Z' })])
    expect(lageFor(medTid)).toBeNull()
    expect(lageFor(kalladUtanTid('c', 3))).toBeNull()
    const passerad = tjanst('d', 'interview_invited', [handelse('d', 'interview_invited', '2026-11-05', { interview_at: '2026-11-10T09:00:00.000Z' })])
    expect(intervjuInfo('interview_invited', passerad.handelser, NU)?.lage).toBe('hur_gick')
    expect(lageFor(passerad)).toBeNull()
    expect(lageFor(genomford('e', 3))).toBe('intervju')
    expect(lageFor(genomford('f', 3, true))).toBe('provjobb')
    expect(foljUppTyp('offer_received', null)).toBeNull()
    expect(foljUppTyp('accepted', null)).toBeNull()
    expect(foljUppTyp('rejected', null)).toBeNull()
    expect(foljUppTyp('declined', null)).toBeNull()
  })

  it('gränsen: tolv dagar för ansökan och utan sort, sju efter intervju och provjobb', () => {
    expect(tystGransFor('ansokan')).toBe(12)
    expect(tystGransFor(null)).toBe(12)
    expect(tystGransFor('intervju')).toBe(7)
    expect(tystGransFor('provjobb')).toBe(7)
  })
})

/* ------------------------------------------------------------ tystnaden */

describe('tystnaden efter intervju', () => {
  it('genomförd intervju: inte tyst dag 6, tyst dag 7, tystSedan är intervjudagen plus sju', () => {
    const sex = tjanstLage(genomford('a', 6), NU)
    expect(sex.tyst).toBe(false)
    expect(sex.tystGrans).toBe(7)
    const sju = tjanstLage(genomford('a', 7), NU)
    expect(sju.tyst).toBe(true)
    expect(sju.foljUppTyp).toBe('intervju')
    expect(sju.tystSedan).toBe('2026-11-21')
    expect(sju.intervju?.dag).toBe('2026-11-14')
  })

  it('en uppföljning för 3 dagar sedan håller tystnaden borta, en för 8 dagar sedan inte', () => {
    const tre = genomford('a', 20, false, [uppf('a', { sent_at: dagFore(3), sent_via: 'epost' })])
    expect(tjanstLage(tre, NU).tyst).toBe(false)
    const atta = genomford('a', 20, false, [uppf('a', { sent_at: dagFore(8), sent_via: 'epost' })])
    expect(tjanstLage(atta, NU).tyst).toBe(true)
  })

  it('kallelse utan tid för 20 dagar sedan är aldrig tyst; Sätt tiden från dag 2', () => {
    const l = tjanstLage(kalladUtanTid('a', 20), NU)
    expect(l.tyst).toBe(false)
    expect(l.foljUppTyp).toBeNull()
    expect(l.tystGrans).toBe(12)
    expect(l.intervju?.kalladDag).toBe(dagFore(20))
    expect(skaSattaTiden(tjanstLage(kalladUtanTid('b', 1), NU).intervju, IDAG)).toBe(false)
    expect(skaSattaTiden(tjanstLage(kalladUtanTid('b', 2), NU).intervju, IDAG)).toBe(true)
    expect(skaSattaTiden(null, IDAG)).toBe(false)
    expect(skaSattaTiden(tjanstLage(genomford('c', 9), NU).intervju, IDAG)).toBe(false)
  })

  it('en obesvarad ansökan blir tyst dag 12 som förut', () => {
    const elva = tjanstLage(tjanst('a', 'applied', [], [], { applied_at: dagFore(11) }), NU)
    const tolv = tjanstLage(tjanst('a', 'applied', [], [], { applied_at: dagFore(12) }), NU)
    expect(elva.tyst).toBe(false)
    expect(tolv.tyst).toBe(true)
    expect(tolv.foljUppTyp).toBe('ansokan')
    expect(tolv.tystSedan).toBe(IDAG)
  })

  it('en ny kallelse efter en genomförd intervju gör tjänsten kallad igen', () => {
    const t = tjanst('a', 'interview_invited', [
      handelse('a', 'interview_invited', '2026-10-25'),
      handelse('a', 'interview_completed', '2026-11-01'),
      handelse('a', 'interview_invited', '2026-11-10'),
    ], [uppf('a', { subject: 'Tack för intervjun, tjänsten som ekonomiassistent' })])
    const l = tjanstLage(t, NU)
    expect(l.tyst).toBe(false)
    expect(l.foljUppTyp).toBeNull()
    expect(l.harUtkast).toBe(false)
  })

  it('nastaPaminnelse: sju dagar efter intervju, tolv utan sort', () => {
    expect(nastaPaminnelse('2026-11-20', 'intervju')).toBe('2026-11-27')
    expect(nastaPaminnelse('2026-11-20', 'provjobb')).toBe('2026-11-27')
    expect(nastaPaminnelse('2026-11-20')).toBe('2026-12-02')
  })
})

/* ---------------------------------------------------------- utkastets sort */

describe('utkastets sort', () => {
  const bas = { jobTitle: 'Ekonomiassistent', kanal: 'ad' as const }

  it('utkastTyp och mallAmne hör ihop för varje sort och språk', () => {
    for (const typ of ['intervju', 'provjobb'] as const) {
      for (const sprak of ['sv', 'en'] as const) {
        expect(utkastTyp(mallAmne({ ...bas, sprak, typ }))).toBe(typ)
        // Hur man sökte påverkar inte ämnesraden för de här sorterna.
        expect(mallAmne({ ...bas, sprak, typ, kanal: 'unsolicited' })).toBe(mallAmne({ ...bas, sprak, typ }))
      }
    }
    expect(utkastTyp(mallAmne({ ...bas, sprak: 'sv' }))).toBe('ansokan')
    expect(utkastTyp(mallAmne({ ...bas, sprak: 'sv', kanal: 'unsolicited' }))).toBe('ansokan')
    expect(utkastTyp(mallAmne({ ...bas, sprak: 'en' }))).toBe('ansokan')
    expect(utkastTyp(null)).toBe('ansokan')
    expect(utkastTyp('')).toBe('ansokan')
  })

  it('ämnesraderna ordagrant', () => {
    expect(mallAmne({ ...bas, sprak: 'sv', typ: 'intervju' })).toBe('Tack för intervjun, tjänsten som ekonomiassistent')
    expect(mallAmne({ ...bas, sprak: 'sv', typ: 'provjobb' })).toBe('Tack för provjobbet, tjänsten som ekonomiassistent')
    expect(mallAmne({ ...bas, sprak: 'en', typ: 'intervju' })).toBe('Thank you for the interview, Ekonomiassistent')
    expect(mallAmne({ ...bas, sprak: 'en', typ: 'provjobb' })).toBe('Thank you for the trial day, Ekonomiassistent')
    expect(AMNE_START.intervju.sv).toBe('Tack för intervjun')
  })

  it('utkastGaller: rätt sort ja, fel sort nej, skickat nej, utan text nej, typ null nej', () => {
    const intervjuUtkast = uppf('a', { subject: 'Tack för intervjun, tjänsten som ekonomiassistent' })
    expect(utkastGaller(intervjuUtkast, 'intervju')).toBe(true)
    expect(utkastGaller(intervjuUtkast, 'ansokan')).toBe(false)
    expect(utkastGaller(intervjuUtkast, 'provjobb')).toBe(false)
    expect(utkastGaller({ ...intervjuUtkast, sent_at: IDAG }, 'intervju')).toBe(false)
    expect(utkastGaller({ ...intervjuUtkast, body: null }, 'intervju')).toBe(false)
    expect(utkastGaller(intervjuUtkast, null)).toBe(false)
    expect(utkastGaller(null, 'intervju')).toBe(false)
    expect(utkastGaller(uppf('a'), 'ansokan')).toBe(true)
  })

  it('harUtkast är falskt i intervjusteget med ett oskickat ansökningsutkast', () => {
    expect(tjanstLage(genomford('a', 9, false, [uppf('a')]), NU).harUtkast).toBe(false)
    expect(tjanstLage(kalladUtanTid('b', 3), NU).harUtkast).toBe(false)
    const ratt = genomford('c', 9, false, [uppf('c', { subject: 'Tack för intervjun, tjänsten som ekonomiassistent' })])
    expect(tjanstLage(ratt, NU).harUtkast).toBe(true)
  })
})

/* ---------------------------------------------------------- Att göra nu */

describe('Att göra nu i intervjulägena', () => {
  it('genomförd intervju för 9 dagar sedan: fråga om besked, med och utan utkast', () => {
    const [h] = attGoraKandidater(indata([genomford('a', 9)]))
    expect(h.typ).toBe('folj_upp')
    expect(h.overrad).toBe('INGET BESKED PÅ 9 DAGAR')
    expect(h.rubrik).toBe('Fråga Länsförsäkringar om besked')
    expect(h.text).toBe('Ekonomiassistent. Intervjun var den 12 november. Fråga när du kan vänta besked.')
    expect(h.knapp).toEqual({ text: 'Fråga om besked', href: '/dashboard/sokta-tjanster/a?steg=folj-upp' })
    expect(h.ikon).toBe('kuvert')
    expect(h.nyckel).toBe('folj_upp:a:2026-11-19')

    const medUtkast = genomford('a', 9, false, [uppf('a', { subject: 'Tack för intervjun, tjänsten som ekonomiassistent' })])
    const [u] = attGoraKandidater(indata([medUtkast]))
    expect(u.text).toBe('Ekonomiassistent. Intervjun var den 12 november. Utkastet till mejlet är skrivet.')
    expect(u.knapp.text).toBe('Öppna utkastet')

    const [p] = attGoraKandidater(indata([genomford('p', 9, true)]))
    expect(p.text).toBe('Ekonomiassistent. Provjobbet var den 12 november. Fråga när du kan vänta besked.')
  })

  it('ett ansökningsutkast i intervjusteget ger inte "Öppna utkastet"', () => {
    const [h] = attGoraKandidater(indata([genomford('a', 9, false, [uppf('a')])]))
    expect(h.knapp.text).toBe('Fråga om besked')
  })

  it('kallelse utan tid för 3 dagar sedan ger Sätt tiden, för 1 dag sedan ingenting', () => {
    const [h] = attGoraKandidater(indata([kalladUtanTid('a', 3)]))
    expect(h).toMatchObject({
      typ: 'satt_intervjutid',
      nyckel: 'satt_intervjutid:a',
      datum: '2026-11-20',
      passerad: true,
      ikon: 'kalender',
      overrad: 'KALLAD 18 NOV',
      rubrik: 'Sätt tiden för intervjun på Länsförsäkringar',
      text: 'Ekonomiassistent. Med tiden satt påminner vi före intervjun och frågar hur det gick.',
      knapp: { text: 'Sätt tiden', href: '/dashboard/sokta-tjanster/a?steg=andra-tid' },
    })
    expect(attGoraKandidater(indata([kalladUtanTid('b', 1)]))).toEqual([])
    // Dag 2: datumet är i dag, inte passerat.
    expect(attGoraKandidater(indata([kalladUtanTid('c', 2)]))[0]).toMatchObject({ datum: IDAG, passerad: false })
  })

  it('ordningen: Hur gick intervjun? före Sätt tiden, och Sätt tiden bland övrigt på datum', () => {
    const hurGick = tjanst('h', 'interview_invited', [handelse('h', 'interview_invited', '2026-11-05', { interview_at: '2026-11-18T09:00:00.000Z' })])
    const satt = kalladUtanTid('s', 3) // datum 20 nov, passerat
    const folj = genomford('f', 10) // tystSedan 18 nov, passerat
    const nu = attGoraNu(indata([satt, folj, hurGick]))
    expect(nu.handlingar.map((h) => h.typ)).toEqual(['hur_gick_intervjun', 'folj_upp', 'satt_intervjutid'])
    // Ny kallelse utan tid i dag minus 2 (datum i dag) mot en uppföljning som passerat: passerade först.
    const nu2 = attGoraNu(indata([kalladUtanTid('s2', 2), genomford('f2', 8)]))
    expect(nu2.handlingar.map((h) => h.typ)).toEqual(['folj_upp', 'satt_intervjutid'])
  })

  it('väggens text för båda handlingarna', () => {
    const ind = indata([genomford('a', 9)])
    const nu = attGoraNu(ind)
    expect(nu.vagg.rubrik).toBe('Fråga Länsförsäkringar om besked')
    expect(nu.vagg.text).toBe(
      'Intervjun för tjänsten som ekonomiassistent var den 12 november, och du har inte fått besked. Ett kort mejl som frågar när du kan vänta det räcker.'
    )
    expect(nu.vagg.knapp.text).toBe('Fråga om besked')
    expect(nu.vagg.text).not.toMatch(/har inte hört/)

    const prov = attGoraNu(indata([genomford('p', 9, true)]))
    expect(prov.vagg.text).toBe(
      'Provjobbet för tjänsten som ekonomiassistent var den 12 november, och du har inte fått besked. Ett kort mejl som frågar när du kan vänta det räcker.'
    )

    const ind2 = indata([kalladUtanTid('k', 3)])
    const [h] = attGoraKandidater(ind2)
    const v = vaggForHandling(h, ind2, IDAG)
    expect(v.rubrik).toBe('Sätt tiden för intervjun på Länsförsäkringar')
    expect(v.text).toBe('Ekonomiassistent. Du blev kallad den 18 november. Med tiden satt påminner vi före intervjun och frågar hur det gick.')
    expect(v.knapp.text).toBe('Sätt tiden')
  })

  it('en obesvarad ansökan låter som förut', () => {
    const [h] = attGoraKandidater(indata([tjanst('a', 'applied', [], [], { applied_at: '2026-11-06' })]))
    expect(h.overrad).toBe('TYST I 15 DAGAR')
    expect(h.rubrik).toBe('Följ upp Länsförsäkringar')
    expect(h.knapp.text).toBe('Skriv uppföljningen')
  })
})

/* ----------------------------------------------------- listan och banan */

describe('listan, banan och texterna', () => {
  it('gruppFor: tyst genomförd intervju i folj_upp, kallelse utan tid i intervju', () => {
    expect(gruppFor(tjanstLage(genomford('a', 9), NU))).toBe('folj_upp')
    expect(gruppFor(tjanstLage(kalladUtanTid('b', 20), NU))).toBe('intervju')
    expect(gruppFor(tjanstLage(genomford('c', 3), NU))).toBe('intervju')
  })

  it('foljUppText: de tre strängarna', () => {
    const ansokan = tjanstLage(tjanst('a', 'applied', [], [], { applied_at: '2026-11-01' }), NU)
    const intervju = tjanstLage(genomford('b', 9), NU)
    const prov = tjanstLage(genomford('c', 9, true), NU)
    expect(foljUppText([ansokan])).toBe('Tyst i minst tolv dagar. Ett kort mejl brukar ge besked.')
    expect(foljUppText([intervju, prov])).toBe('Minst sju dagar utan besked. Ett kort mejl som frågar brukar räcka.')
    expect(foljUppText([ansokan, intervju])).toBe('Tyst länge nog för att fråga. Ett kort mejl brukar ge besked.')
  })

  it('beskedText: intervju och provjobb', () => {
    expect(beskedText(tjanstLage(genomford('a', 9), NU))).toBe('Intervjun var den 12 november. Fråga när du kan vänta besked.')
    expect(beskedText(tjanstLage(genomford('b', 9, true), NU))).toBe('Provjobbet var den 12 november. Fråga när du kan vänta besked.')
  })

  it('intervjuText: de två nya grenarna, och vantar_besked oberoende av tyst', () => {
    expect(intervjuText(tjanstLage(kalladUtanTid('a', 3), NU), IDAG)).toBe('Kallad till intervju den 18 november. Sätt tiden, så påminner vi före intervjun.')
    expect(intervjuText(tjanstLage(kalladUtanTid('a', 1), NU), IDAG)).toBe('Kallad till intervju. Sätt tiden när du vet den.')
    expect(intervjuText(tjanstLage(genomford('b', 1, true), NU), IDAG)).toBe('Provjobb genomfört 20 november. Väntar på besked.')
    const tyst = tjanstLage(genomford('c', 9), NU)
    const inteTyst = tjanstLage(genomford('c', 9), new Date('2026-11-13T09:00:00Z'))
    expect(tyst.tyst).toBe(true)
    expect(inteTyst.tyst).toBe(false)
    expect(intervjuText(tyst, IDAG)).toBe('Intervju genomförd 12 november. Väntar på besked.')
    expect(intervjuText(inteTyst, IDAG)).toBe(intervjuText(tyst, IDAG))
  })

  it('soktaVagg: "har inte gett besked" för en intervju', () => {
    const v = soktaVagg([tjanstLage(genomford('a', 9), NU)])
    expect(v.text).toBe('En är i intervju. Länsförsäkringar har inte gett besked på 9 dagar.')
    expect(v.text).not.toMatch(/tyst/)
  })

  it('banan: en tyst bricka vid Intervju får etiketten "tyst N dagar"', () => {
    const b = bana([tjanstLage(genomford('a', 9), NU), tjanstLage(kalladUtanTid('b', 20), NU)], [])
    const intervju = b.stationer.find((s) => s.station === 'intervju')!
    expect(intervju.brickor.find((x) => x.id === 'a')).toMatchObject({ tyst: true, etikett: 'tyst 9 dagar', ton: 'intervju' })
    expect(intervju.brickor.find((x) => x.id === 'b')).toMatchObject({ tyst: false, etikett: null })
  })
})

/* ---------------------------------------------------------- spärren */

describe('spärren med sorten', () => {
  const rad = (application_id: string, subject: string | null) => ({ application_id, created_at: '2026-11-01T10:00:00Z', subject })
  const ansokan = 'Min ansökan till tjänsten som ekonomiassistent'
  const intervju = 'Tack för intervjun, tjänsten som ekonomiassistent'

  it('gratis: ny, samma tjänst samma sort, samma tjänst annan sort, annan tjänst', () => {
    expect(uppfoljningSparr({ harBetalt: false, utkast: [], applicationId: 'a', typ: 'intervju' }).lage).toBe('ny')
    expect(uppfoljningSparr({ harBetalt: false, utkast: [rad('a', intervju)], applicationId: 'a', typ: 'intervju' }).lage).toBe('ateranvand')
    expect(uppfoljningSparr({ harBetalt: false, utkast: [rad('a', ansokan)], applicationId: 'a', typ: 'intervju' }).lage).toBe('premium_required')
    expect(uppfoljningSparr({ harBetalt: false, utkast: [rad('b', intervju)], applicationId: 'a', typ: 'intervju' }).lage).toBe('premium_required')
  })

  it('utan typ och subject som förut', () => {
    const ett = [{ application_id: 'a', created_at: '2026-11-01T10:00:00Z' }]
    expect(uppfoljningSparr({ harBetalt: false, utkast: ett, applicationId: 'a' }).lage).toBe('ateranvand')
    expect(uppfoljningSparr({ harBetalt: false, utkast: ett, applicationId: 'b' }).lage).toBe('premium_required')
    expect(uppfoljningSparr({ harBetalt: true, utkast: [rad('a', ansokan)], applicationId: 'a', typ: 'intervju', nu: NU }).lage).toBe('ny')
  })
})

/* ------------------------------------------------------- utkastet (2.6) */

describe('utkastet efter intervju eller provjobb', () => {
  const u = (extra: Partial<UppfoljningUnderlag> = {}): UppfoljningUnderlag => ({
    jobTitle: 'Ekonomiassistent',
    company: 'Länsförsäkringar Västerbotten',
    appliedAt: '2026-10-28',
    kanal: 'ad',
    kompetenser: ['kundreskontra', 'bokslut', 'Fortnox'],
    krav: ['Erfarenhet av bokslut'],
    sprak: 'sv',
    typ: 'intervju',
    momentDag: '2026-11-20',
    ...extra,
  })
  const stycken = (body: string) => body.split('\n\n').slice(1, -1)

  it('svenska, intervju och provjobb, med och utan dag och kompetenser', () => {
    const m = uppfoljningsmall(u(), 'Elin Sundberg')
    expect(m.subject).toBe('Tack för intervjun, tjänsten som ekonomiassistent')
    expect(m.body).toBe(
      'Hej,\n\n' +
        'Tack för intervjun den 20 november om tjänsten som ekonomiassistent.\n\n' +
        'Jag är fortfarande intresserad. Det jag gör i dag, kundreskontra och bokslut, ligger nära det ni söker.\n\n' +
        'Vet ni när ni räknar med att lämna besked? Hör gärna av er om ni vill fråga något mer. Jag svarar på det här mejlet eller i telefon.\n\n' +
        'Vänliga hälsningar\nElin Sundberg'
    )
    expect(stycken(uppfoljningsmall(u({ momentDag: null }), null).body)[0]).toBe('Tack för intervjun om tjänsten som ekonomiassistent.')
    expect(stycken(uppfoljningsmall(u({ typ: 'provjobb' }), null).body)[0]).toBe('Tack för provjobbet den 20 november, för tjänsten som ekonomiassistent.')
    expect(stycken(uppfoljningsmall(u({ typ: 'provjobb', momentDag: null }), null).body)[0]).toBe('Tack för provjobbet, för tjänsten som ekonomiassistent.')
    expect(uppfoljningsmall(u({ typ: 'provjobb' }), null).subject).toBe('Tack för provjobbet, tjänsten som ekonomiassistent')
    expect(stycken(uppfoljningsmall(u({ kompetenser: [] }), null).body)[1]).toBe('Jag är fortfarande intresserad av tjänsten och av att jobba hos er.')
    expect(stycken(uppfoljningsmall(u({ typ: 'provjobb' }), null).body).slice(1)).toEqual(stycken(m.body).slice(1))
    expect(stycken(uppfoljningsmall(u({ kompetenser: ['bokslut'] }), null).body)[1]).toBe(
      'Jag är fortfarande intresserad. Det jag gör i dag, bokslut, ligger nära det ni söker.'
    )
  })

  it('engelska, intervju och provjobb, med och utan dag och kompetenser', () => {
    const m = uppfoljningsmall(u({ sprak: 'en' }), 'Elin Sundberg')
    expect(m.subject).toBe('Thank you for the interview, Ekonomiassistent')
    expect(stycken(m.body)).toEqual([
      'Thank you for the interview on 20 November for the Ekonomiassistent position.',
      'I am still interested. My experience with kundreskontra and bokslut is close to what you are looking for.',
      'Do you know when you expect to make a decision? Please let me know if you have further questions. I am happy to answer by email or phone.',
    ])
    expect(m.body.startsWith('Hello,\n\n')).toBe(true)
    expect(m.body.endsWith('Kind regards\nElin Sundberg')).toBe(true)
    expect(stycken(uppfoljningsmall(u({ sprak: 'en', momentDag: null }), null).body)[0]).toBe('Thank you for the interview for the Ekonomiassistent position.')
    expect(stycken(uppfoljningsmall(u({ sprak: 'en', typ: 'provjobb' }), null).body)[0]).toBe(
      'Thank you for the trial day on 20 November for the Ekonomiassistent position.'
    )
    expect(stycken(uppfoljningsmall(u({ sprak: 'en', typ: 'provjobb', momentDag: null }), null).body)[0]).toBe(
      'Thank you for the trial day for the Ekonomiassistent position.'
    )
    expect(uppfoljningsmall(u({ sprak: 'en', typ: 'provjobb' }), null).subject).toBe('Thank you for the trial day, Ekonomiassistent')
    expect(stycken(uppfoljningsmall(u({ sprak: 'en', kompetenser: [] }), null).body)[1]).toBe('I am still interested in the role and in working with you.')
  })

  it('högst två kompetenser, högst 90 ord, inga talstreck, inget "har inte hört"', () => {
    for (const typ of ['intervju', 'provjobb'] as const) {
      for (const sprak of ['sv', 'en'] as const) {
        const m = uppfoljningsmall(u({ typ, sprak }), 'Elin Sundberg')
        expect(m.body).not.toMatch(/Fortnox/)
        expect(ordIMejlet(m.body)).toBeLessThanOrEqual(90)
        expect(m.body).not.toMatch(/[—–]/)
        expect(m.body).not.toMatch(/har inte hört/)
      }
    }
  })

  it('underlaget för intervju: moment och datum, inte sokt_datum eller hur, inget namn', () => {
    const ut = underlagForModellen(u())
    expect(ut).toEqual({
      tjanst: 'Ekonomiassistent',
      arbetsgivare: 'Länsförsäkringar Västerbotten',
      moment: 'intervju',
      datum: '20 november',
      kompetenser: ['kundreskontra', 'bokslut', 'Fortnox'],
      krav: ['Erfarenhet av bokslut'],
      sprak: 'sv',
    })
    expect(ut).not.toHaveProperty('sokt_datum')
    expect(ut).not.toHaveProperty('hur')
    expect(JSON.stringify(ut)).not.toMatch(/Elin|Sundberg/)
    expect(underlagForModellen(u({ typ: 'provjobb', momentDag: null }))).toMatchObject({ moment: 'provjobb', datum: null })
    // Ansökan som förut.
    expect(underlagForModellen(u({ typ: 'ansokan', momentDag: null }))).toHaveProperty('sokt_datum', '28 oktober')
  })

  it('"Skriv om kortare" delar intervjuutkastet: hälsning och avslut ordagrant, egna uppgifter blir märken', () => {
    for (const sprak of ['sv', 'en'] as const) {
      const m = uppfoljningsmall(u({ sprak }), 'Elin Sundberg')
      const delar = delaUppMejl(m.body)
      expect(delar).not.toBeNull()
      expect(delar!.halsning).toBe(sprak === 'sv' ? 'Hej,' : 'Hello,')
      expect(delar!.stycken).toHaveLength(3)
      expect(delar!.avslut).toBe(sprak === 'sv' ? 'Vänliga hälsningar\nElin Sundberg' : 'Kind regards\nElin Sundberg')
    }
    // Användaren har lagt till telefon i texten: den blir ett numrerat märke.
    const m = uppfoljningsmall(u(), 'Elin Sundberg')
    const andrad = m.body.replace('i telefon.', 'i telefon, 070-123 45 67.')
    const f = forberedKortning(andrad, { detectNameHeuristically: false, fullName: 'Elin Sundberg', knownPhones: ['070-123 45 67'] })
    expect(f).not.toBeNull()
    expect(f!.delar.halsning).toBe('Hej,')
    expect(f!.delar.avslut).toBe('Vänliga hälsningar\nElin Sundberg')
    expect(f!.markt.stycken.join(' ')).toContain('[TELEFON 1]')
    expect(f!.markt.stycken.join(' ')).not.toContain('070')
    expect(f!.markt.marken).toEqual([{ mark: '[TELEFON 1]', varde: '070-123 45 67' }])
  })
})

/* ------------------------------------------------------- instruktionen */

describe('instruktionen till AI:n efter intervju eller provjobb', () => {
  const FORBJUDNA_SV = ['"ser fram emot"', '"bidra till ert team"', '"mycket intresserad"', '"rekryteringsprocessen"']
  const FORBJUDNA_EN = ['"look forward to"', '"contribute to your team"', '"very interested"', '"recruitment process"']

  it('de fyra förbjudna fraserna står i alla fyra texterna', () => {
    for (const typ of ['intervju', 'provjobb'] as const) {
      for (const f of FORBJUDNA_SV) expect(systemEfterMoment('sv', typ)).toContain(f)
      for (const f of FORBJUDNA_EN) expect(systemEfterMoment('en', typ)).toContain(f)
    }
  })

  it('orden byts per sort, 70 ord, inga talstreck', () => {
    const sv = systemEfterMoment('sv', 'intervju')
    expect(sv).toContain('efter en genomförd intervju')
    expect(sv).toContain('1. Ett tack för intervjun, med dagen och tjänsten.')
    expect(sv).toContain('Påstå inget om vad som sades på intervjun eller hur den gick.')
    expect(sv).toContain('högst 70 ord')
    const prov = systemEfterMoment('sv', 'provjobb')
    expect(prov).toContain('efter ett genomfört provjobb')
    expect(prov).toContain('1. Ett tack för provjobbet, med dagen och tjänsten.')
    expect(prov).toContain('Påstå inget om vad som hände under provjobbet eller hur det gick.')
    const en = systemEfterMoment('en', 'intervju')
    expect(en).toContain('after a completed interview')
    expect(en).toContain('1. A thank you for the interview, with the day and the role.')
    expect(en).toContain('Claim nothing about what was said in the interview or how it went.')
    const enProv = systemEfterMoment('en', 'provjobb')
    expect(enProv).toContain('after a completed trial day')
    expect(enProv).toContain('1. A thank you for the trial day, with the day and the role.')
    expect(enProv).toContain('Claim nothing about what happened during the trial day or how it went.')
    for (const t of [sv, prov, en, enProv]) {
      expect(t).not.toMatch(/[—–]/)
      // Bara förbudets exempel på platshållare, inga märken att härma.
      expect(t.match(/\[[A-ZÅÄÖ0-9 -]+\]/g)).toEqual([sv === t || prov === t ? '[NAMN]' : '[NAME]'])
    }
  })

  it('väljs efter sorten', () => {
    expect(instruktionFor({ sprak: 'sv', typ: 'intervju' })).toBe(systemEfterMoment('sv', 'intervju'))
    expect(instruktionFor({ sprak: 'en', typ: 'provjobb' })).toBe(systemEfterMoment('en', 'provjobb'))
    expect(instruktionFor({ sprak: 'sv', typ: 'ansokan' })).toContain('uppföljningsmejl')
  })
})

/* ------------------------------------- "När är intervjun?" (byggspec 9.6) */

describe('valbaraForIntervju', () => {
  it('tar med sökta och obesvarade, inte kallade, genomförda, erbjudanden eller avslutade, senast sökt först', () => {
    const rader = [
      tjanst('sokt-gammal', 'applied', [], [], { applied_at: '2026-10-01', company: 'Norrmejerier' }),
      tjanst('sokt-ny', 'applied', [], [], { applied_at: '2026-11-10', company: 'Umeå Energi' }),
      tjanst('obesvarad', 'no_response', [handelse('obesvarad', 'no_response', '2026-11-05')], [], { applied_at: '2026-10-15' }),
      kalladUtanTid('kallad', 3),
      genomford('genomford', 3),
      tjanst('erbjudande', 'offer_received', [handelse('erbjudande', 'offer_received', '2026-11-12')]),
      tjanst('avslag', 'rejected', [handelse('avslag', 'rejected', '2026-11-12')]),
    ].map((t) => tjanstLage(t, NU))
    const val = valbaraForIntervju(rader)
    expect(val.map((v) => v.id)).toEqual(['sokt-ny', 'obesvarad', 'sokt-gammal'])
    expect(val[0]).toEqual({ id: 'sokt-ny', company: 'Umeå Energi', jobTitle: 'Ekonomiassistent', bokstaver: expect.any(String), appliedAt: '2026-11-10' })
  })

  it('ger en tom lista utan sökta tjänster', () => {
    expect(valbaraForIntervju([])).toEqual([])
  })
})
