/**
 * Jobbsöket omgång 2, 9 B: händelsetypen test_invited (kallad till test) i
 * motorn (byggspec 9.12, 9.13 och 9.19). Ren motor, inget nätverk.
 *
 * Ligger i en egen fil i stället för i intervjulagen.test.ts och
 * motor.test.ts, som byggare D1 ändrar samtidigt (9 A).
 */
import { describe, expect, it } from 'vitest'
import {
  attGoraKandidater,
  attGoraNu,
  foljUppTyp,
  gruppFor,
  kalladTillTestDag,
  soktaHref,
  testRadText,
  tjanstensSteg,
  tjanstLage,
  vaggUtanHandling,
  vantarSvarText,
  VANTAR_SVAR_TEXT,
  type AttGoraIndata,
  type Handelse,
  type TjanstMedHistorik,
  type Uppfoljning,
  type VeckansMal,
} from '../index'
import { STATUS_META, LOGGABLE_EVENT_TYPES, type ApplicationEventType, type JobApplication } from '@/lib/applications/status'

/* Lördag 21 november 2026 klockan 10 svensk tid. */
const NU = new Date('2026-11-21T09:00:00Z')
const IDAG = '2026-11-21'
const dagFore = (n: number) => new Date(Date.UTC(2026, 10, 21 - n)).toISOString().slice(0, 10)
const nuEfter = (dagar: number) => new Date(NU.getTime() + dagar * 86_400_000)

let raknare = 0
function handelse(appId: string, typ: ApplicationEventType, dag: string): Handelse {
  raknare++
  return {
    id: `h${raknare}`,
    application_id: appId,
    event_type: typ,
    interview_round: null,
    note: null,
    occurred_at: dag,
    created_at: `${dag}T08:00:${String(raknare % 60).padStart(2, '0')}Z`,
    interview_at: null,
    interview_place: null,
  }
}

function tjanst(id: string, status: ApplicationEventType, handelser: Handelse[], opts: Partial<JobApplication> = {}, uppfoljningar: Uppfoljning[] = []): TjanstMedHistorik {
  const sokt = opts.applied_at ?? dagFore(30)
  return {
    ansokan: {
      id,
      user_id: 'u1',
      job_title: 'Ekonomiassistent',
      company: 'Norrmejerier',
      location: 'Umeå',
      application_channel: 'ad',
      job_ad_url: null,
      letter_id: null,
      cv_id: null,
      notes: null,
      applied_at: sokt,
      current_status: status,
      status_updated_at: `${sokt}T10:00:00Z`,
      created_at: `${sokt}T10:00:00Z`,
      updated_at: `${sokt}T10:00:00Z`,
      ...opts,
    },
    handelser: [handelse(id, 'applied', sokt), ...handelser],
    uppfoljningar,
  }
}

/** Sökt för 30 dagar sedan, kallad till test för `dagar` dagar sedan. */
function kalladTest(id: string, dagar = 0, opts: Partial<JobApplication> = {}, uppfoljningar: Uppfoljning[] = []): TjanstMedHistorik {
  return tjanst(id, 'test_invited', [handelse(id, 'test_invited', dagFore(dagar))], opts, uppfoljningar)
}

const MAL: VeckansMal = { mal: 3, forval: true, sokta: 3, klart: true, kvar: 0, vecka: 47, start: '2026-11-16', slut: '2026-11-22', text: '' }
function indata(t: TjanstMedHistorik[], nu = NU): AttGoraIndata {
  return { tjanster: t.map((x) => tjanstLage(x, nu)), skaSokas: [], veckansMal: MAL, harCv: true, sokteForraManaden: 0, nu }
}

describe('status: Kallad till test', () => {
  it('etiketten, och den går att logga för hand först i listan', () => {
    expect(STATUS_META.test_invited.label).toBe('Kallad till test')
    expect(STATUS_META.test_invited.timelineLabel).toBe('Kallad till test')
    expect(STATUS_META.test_invited.pillClass).toBe(STATUS_META.interview_invited.pillClass)
    expect(LOGGABLE_EVENT_TYPES[0]).toBe('test_invited')
  })
})

describe('motorn: kallad till test blir aldrig tyst', () => {
  it('foljUppTyp är null', () => {
    expect(foljUppTyp('test_invited', null)).toBeNull()
  })

  it('sökt för 30 dagar sedan och kallad till test i dag: inte tyst, Väntar svar, stationen Sökt', () => {
    const l = tjanstLage(kalladTest('a'), NU)
    expect(l.tyst).toBe(false)
    expect(l.foljUppTyp).toBeNull()
    expect(gruppFor(l)).toBe('vantar_svar')
    expect(l.station).toBe('sokt')
    expect(l.ton).toBe('vantar')
  })

  it('samma tjänst 40 dagar efter kallelsen: inte tyst', () => {
    const l = tjanstLage(kalladTest('a'), nuEfter(40))
    expect(l.tyst).toBe(false)
    expect(gruppFor(l)).toBe('vantar_svar')
  })

  it('tjanstensSteg står på Svar med kallelsens datum', () => {
    const t = kalladTest('a', 3)
    const steg = tjanstensSteg(t, tjanstLage(t, NU))
    const svar = steg.punkter.find((p) => p.steg === 'svar')!
    expect(svar.klar).toBe(true)
    expect(svar.aktuell).toBe(true)
    expect(svar.datum).toBe(dagFore(3))
    expect(steg.avslutad).toBe(false)
  })

  it('kalladTillTest är kallelsens dag, och null när statusen är en annan', () => {
    expect(tjanstLage(kalladTest('a', 4), NU).kalladTillTest).toBe(dagFore(4))
    expect(tjanstLage(tjanst('b', 'applied', []), NU).kalladTillTest).toBeNull()
    // Kallad till test, sedan kallad till intervju: statusen är en annan.
    const vidare = tjanst('c', 'interview_invited', [handelse('c', 'test_invited', dagFore(10)), handelse('c', 'interview_invited', dagFore(2))])
    expect(tjanstLage(vidare, NU).kalladTillTest).toBeNull()
    // Utan händelser (en lista utan historik) gäller status_updated_at.
    const utan: TjanstMedHistorik = { ...kalladTest('d'), handelser: [] }
    utan.ansokan = { ...utan.ansokan, status_updated_at: `${dagFore(6)}T09:00:00Z` }
    expect(kalladTillTestDag('test_invited', [], dagFore(6))).toBe(dagFore(6))
    expect(tjanstLage(utan, NU).kalladTillTest).toBe(dagFore(6))
  })

  it('ett sparat oskickat utkast på en tjänst som sedan blir kallad till test räknas inte i harUtkast', () => {
    const utkast: Uppfoljning = {
      id: 'u1',
      application_id: 'a',
      user_id: 'u1',
      subject: 'Min ansökan till tjänsten som ekonomiassistent',
      body: 'Hej,\n\nText.\n\nVänliga hälsningar',
      rewrites: 0,
      sent_at: null,
      sent_via: null,
      created_at: '2026-11-10T10:00:00Z',
      updated_at: '2026-11-10T10:00:00Z',
    }
    expect(tjanstLage(tjanst('a', 'applied', [], {}, [utkast]), NU).harUtkast).toBe(true)
    expect(tjanstLage(kalladTest('a', 1, {}, [utkast]), NU).harUtkast).toBe(false)
  })
})

describe('Att göra nu: Vad hände efter testet?', () => {
  it('ingen kandidat dag 13 efter kallelsen, och aldrig folj_upp', () => {
    const h = attGoraKandidater(indata([kalladTest('a', 13)]))
    expect(h.map((x) => x.typ)).toEqual([])
  })

  it('uppdatera_test dag 14 med texterna i 9.13', () => {
    const h = attGoraKandidater(indata([kalladTest('a', 14)]))
    expect(h).toHaveLength(1)
    expect(h[0]).toMatchObject({
      typ: 'uppdatera_test',
      nyckel: 'uppdatera_test:a',
      datum: IDAG,
      passerad: false,
      ikon: 'fraga',
      overrad: 'KALLAD TILL TEST 7 NOV',
      rubrik: 'Vad hände efter testet hos Norrmejerier?',
      text: 'Ekonomiassistent. Lägg till intervjun eller beskedet, så stämmer listan.',
      knapp: { text: 'Uppdatera tjänsten', href: '/dashboard/sokta-tjanster/a' },
    })
  })

  it('dag 20: passerad, fortfarande en enda kandidat, aldrig folj_upp', () => {
    const h = attGoraKandidater(indata([kalladTest('a', 20)]))
    expect(h.map((x) => x.typ)).toEqual(['uppdatera_test'])
    expect(h[0].passerad).toBe(true)
  })

  it('väggen när handlingen står först', () => {
    const nu = attGoraNu(indata([kalladTest('a', 14)]))
    expect(nu.lage).toBe('handlingar')
    expect(nu.vagg.rubrik).toBe('Vad hände efter testet hos Norrmejerier?')
    expect(nu.vagg.text).toBe('Ekonomiassistent. Du blev kallad till test den 7 november. Lägg till intervjun eller beskedet, så stämmer listan.')
    expect(nu.vagg.knapp).toEqual({ text: 'Uppdatera tjänsten', href: '/dashboard/sokta-tjanster/a' })
  })
})

describe('vaggUtanHandling när alla vid Sökt är kallade till test', () => {
  it('en tjänst', () => {
    const v = vaggUtanHandling(indata([kalladTest('a', 2)]), IDAG)
    expect(v.rubrik).toBe('Kallad till test hos Norrmejerier')
    expect(v.text).toBe('Inget att göra just nu. Lägg till intervjun eller beskedet på tjänsten när det kommer.')
  })

  it('två tjänster', () => {
    const v = vaggUtanHandling(indata([kalladTest('a', 2), kalladTest('b', 3, { company: 'Umeå Energi' })]), IDAG)
    expect(v.rubrik).toBe('Två tjänster med test på gång')
    expect(v.text).toBe('Inget att göra just nu. Lägg till intervjun eller beskedet på tjänsten när det kommer.')
  })

  it('blandat med en vanlig ansökan: dagens text', () => {
    const v = vaggUtanHandling(indata([kalladTest('a', 2), tjanst('b', 'applied', [], { applied_at: dagFore(3) })]), IDAG)
    expect(v.rubrik).toBe('Två tjänster väntar svar')
  })
})

describe('listans texter', () => {
  it('testRadText ordagrant, dator och telefon', () => {
    const l = tjanstLage(kalladTest('a', 0), NU)
    expect(testRadText(l)).toBe('Kallad till test 21 nov. Lägg till intervjun eller beskedet när det kommer.')
    expect(testRadText(l, true)).toBe('Kallad till test 21 nov')
  })

  it('vantarSvarText: testets rad när alla är kallade till test, annars dagens', () => {
    const test = tjanstLage(kalladTest('a'), NU)
    const sokt = tjanstLage(tjanst('b', 'applied', []), NU)
    expect(vantarSvarText([test])).toBe('Kallad till test. Lägg till intervjun eller beskedet när det kommer.')
    expect(vantarSvarText([test, sokt])).toBe(VANTAR_SVAR_TEXT)
    expect(VANTAR_SVAR_TEXT).toBe('Svar brukar dröja en till två veckor. Vi säger till när det är dags att följa upp.')
  })
})

describe('adressen från testernas Hem', () => {
  it('soktaHref bär bara logga och fran, aldrig tjänst eller arbetsgivare (beslut-agarpunkter D-13)', () => {
    expect(soktaHref({ logga: 'sokt', fran: 'test-hem-plan' })).toBe('/dashboard/sokta-tjanster?logga=1&fran=test-hem-plan')
  })
})
