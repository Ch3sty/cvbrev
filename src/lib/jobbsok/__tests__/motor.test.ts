import { describe, expect, it } from 'vitest'
import {
  attGoraNu,
  bana,
  brickBokstaver,
  coachForslag,
  dagarMellan,
  forberedelse,
  franStockholm,
  handelseEtikett,
  handelselista,
  idagSv,
  intervjuerPaGang,
  isoVecka,
  klockslag,
  kompetenserEnOchEn,
  mailtoHref,
  narText,
  ordIMejlet,
  sistaAnsokningsdag,
  skaSokasLista,
  soktaLista,
  soktaVagg,
  sparadFranAnnons,
  styckenUrMejl,
  tjanstLage,
  tjanstensSteg,
  tolkaSoktaAdress,
  tolkaTjanstAdress,
  tratt,
  uppfoljningSparr,
  uppfoljningsmall,
  valideraAiMejl,
  valideraIntervjutid,
  valideraNySparad,
  valideraSkickad,
  valideraUtfall,
  valideraVeckansMal,
  valjKompetenser,
  veckaStart,
  veckansMal,
  veckostaplar,
  soktaHref,
  tjanstHref,
  avslutadeText,
  type Handelse,
  type SparadAnnons,
  type TjanstMedHistorik,
  type Uppfoljning,
} from '../index'
import type { ApplicationEventType, JobApplication } from '@/lib/applications/status'
import type { ProvSammanfattning } from '@/lib/intervju/nasta'

/* Elin Sundberg, lördag 21 november 2026 klockan 10 (UNDERLAG). */
const NU = new Date('2026-11-21T09:00:00Z')

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
  company: string,
  titel: string,
  sokt: string,
  status: ApplicationEventType,
  handelser: Handelse[] = [],
  opts: Partial<JobApplication> = {},
  uppfoljningar: Uppfoljning[] = []
): TjanstMedHistorik {
  return {
    ansokan: {
      id,
      user_id: 'u1',
      job_title: titel,
      company,
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

function uppf(appId: string, extra: Partial<Uppfoljning> = {}): Uppfoljning {
  return {
    id: `u-${appId}-${Math.random()}`,
    application_id: appId,
    user_id: 'u1',
    subject: 'Ämne',
    body: 'Hej,\n\nText.\n\nVänliga hälsningar\nElin Sundberg',
    rewrites: 0,
    sent_at: null,
    sent_via: null,
    created_at: '2026-11-20T10:00:00Z',
    updated_at: '2026-11-20T10:00:00Z',
    ...extra,
  }
}

function sparad(id: string, company: string, titel: string, sista: string | null, score: number | null = null, extra: Partial<SparadAnnons> = {}): SparadAnnons {
  return {
    id,
    user_id: 'u1',
    job_title: titel,
    company,
    location: 'Umeå',
    job_ad_url: null,
    last_application_date: sista,
    source: 'match',
    af_ad_id: `af-${id}`,
    match_score: score,
    note: null,
    application_id: null,
    created_at: '2026-11-19T10:00:00Z',
    updated_at: '2026-11-19T10:00:00Z',
    ...extra,
  }
}

const UE_TID = '2026-11-24T09:00:00.000Z' // tisdag 24 nov 10.00 svensk tid

function elin(): TjanstMedHistorik[] {
  return [
    tjanst('ue', 'Umeå Energi', 'Redovisningsekonom', '2026-11-02', 'interview_invited', [
      handelse('ue', 'interview_invited', '2026-11-13', { interview_at: UE_TID, interview_place: 'Umeå Energi, Storgatan' }),
    ], { letter_id: 'brev-ue' }),
    tjanst('lf', 'Länsförsäkringar Västerbotten', 'Ekonomiassistent', '2026-10-28', 'interview_completed', [
      handelse('lf', 'interview_invited', '2026-11-05'),
      handelse('lf', 'interview_completed', '2026-11-18', { interview_round: 1 }),
    ]),
    tjanst('no', 'Norrmejerier', 'Ekonomiassistent', '2026-11-06', 'applied'),
    tjanst('uk', 'Umeå kommun', 'Ekonomihandläggare', '2026-11-10', 'applied'),
    tjanst('rv', 'Region Västerbotten', 'Ekonomiadministratör', '2026-11-17', 'applied'),
    tjanst('ko', 'Komatsu Forest', 'Ekonomiassistent', '2026-11-19', 'applied', [], { application_channel: 'unsolicited' }),
    tjanst('bo', 'Bostaden', 'Löneadministratör', '2026-10-27', 'rejected', [handelse('bo', 'rejected', '2026-11-12')]),
    tjanst('sw', 'Swedbank', 'Kundreskontraansvarig', '2026-10-14', 'rejected', [handelse('sw', 'rejected', '2026-10-30')]),
    tjanst('pw', 'PwC', 'Redovisningsassistent', '2026-10-20', 'rejected', [handelse('pw', 'rejected', '2026-11-09')], { application_channel: 'network' }),
  ]
}

const ELIN_SPARADE = [
  sparad('vo', 'Volvo Lastvagnar', 'Redovisningsassistent', '2026-11-30', 88),
  sparad('al', 'Ålö AB', 'Ekonomiassistent', '2026-11-26', 92),
]

/* ------------------------------------------------------------- datum */

describe('datum i svensk tid', () => {
  it('räknar dagen, veckan och veckonumret', () => {
    expect(idagSv(NU)).toBe('2026-11-21')
    expect(idagSv(new Date('2026-11-21T23:30:00Z'))).toBe('2026-11-22')
    expect(veckaStart('2026-11-21')).toBe('2026-11-16')
    expect(veckaStart('2026-11-16')).toBe('2026-11-16')
    expect(veckaStart('2026-11-22')).toBe('2026-11-16')
    expect(isoVecka('2026-11-21')).toBe(47)
    expect(isoVecka('2027-01-01')).toBe(53)
    expect(dagarMellan('2026-11-06', '2026-11-21')).toBe(15)
  })

  it('går fram och tillbaka mellan svensk tid och UTC, även på sommartid', () => {
    expect(franStockholm('2026-11-24', '10:00')).toBe(UE_TID)
    expect(franStockholm('2026-06-10', '10:00')).toBe('2026-06-10T08:00:00.000Z')
    expect(franStockholm('2026-03-29', '03:30')).toBe('2026-03-29T01:30:00.000Z')
    expect(klockslag(UE_TID)).toBe('10.00')
    expect(klockslag(franStockholm('2026-11-24'))).toBeNull()
    expect(franStockholm('2026-11-24', '25:00')).toBeNull()
  })

  it('säger när i löptext', () => {
    expect(narText('2026-11-21', '2026-11-21')).toBe('i dag')
    expect(narText('2026-11-22', '2026-11-21')).toBe('i morgon')
    expect(narText('2026-11-24', '2026-11-21')).toBe('på tisdag')
    expect(narText('2026-12-03', '2026-11-21')).toBe('den 3 december')
  })
})

/* ------------------------------------------------------------- brickan */

describe('brickans två bokstäver', () => {
  it('tar initialerna i två ord och de två första bokstäverna i ett ord', () => {
    expect(brickBokstaver('Umeå Energi')).toBe('UE')
    expect(brickBokstaver('Umeå kommun')).toBe('UK')
    expect(brickBokstaver('Region Västerbotten')).toBe('RV')
    expect(brickBokstaver('Norrmejerier')).toBe('NO')
    expect(brickBokstaver('Ålö AB')).toBe('ÅL')
    expect(brickBokstaver('PwC')).toBe('PW')
    expect(brickBokstaver('Swedbank AB (publ)')).toBe('SW')
    expect(brickBokstaver('')).toBe('?')
  })
})

/* ------------------------------------------------------ tystnad och läge */

describe('tjänstens läge', () => {
  it('gör en tjänst tyst efter tolv dagar och räknar dagen tystnaden inträffade', () => {
    const no = tjanstLage(elin()[2], NU)
    expect(no.tyst).toBe(true)
    expect(no.dagarTyst).toBe(15)
    expect(no.tystSedan).toBe('2026-11-18')
    expect(no.ton).toBe('tyst')
    expect(tjanstLage(elin()[3], NU).tyst).toBe(false) // 11 dagar
  })

  it('en skickad uppföljning nollställer tystnaden i tolv dagar', () => {
    const t = tjanst('no', 'Norrmejerier', 'Ekonomiassistent', '2026-11-06', 'applied', [], {}, [
      uppf('no', { sent_at: '2026-11-19', sent_via: 'epost' }),
    ])
    const l = tjanstLage(t, NU)
    expect(l.tyst).toBe(false)
    expect(l.senasteAktivitet).toBe('2026-11-19')
    expect(l.tystSedan).toBe('2026-12-01')
    expect(tjanstLage(t, new Date('2026-12-01T09:00:00Z')).tyst).toBe(true)
  })

  it('en tjänst i intervjusteget blir aldrig tyst (spärren till omgång 2)', () => {
    const ue = tjanstLage(elin()[0], new Date('2026-12-20T09:00:00Z'))
    expect(ue.tyst).toBe(false)
    // Kallad utan tid för 20 dagar sedan: står kvar som kallelse, inte under Följ upp.
    const utanTid = tjanst('x', 'X', 'Y', '2026-10-25', 'interview_invited', [handelse('x', 'interview_invited', '2026-11-01')])
    const ut = tjanstLage(utanTid, NU)
    expect(ut.dagarTyst).toBe(20)
    expect(ut.tyst).toBe(false)
    expect(ut.ton).toBe('intervju')
    expect(ut.intervju?.lage).toBe('utan_tid')
    // Genomförd intervju för 20 dagar sedan: väntar besked, inte tyst.
    const genomford = tjanst('y', 'Y', 'Z', '2026-10-20', 'interview_completed', [
      handelse('y', 'interview_invited', '2026-10-25'),
      handelse('y', 'interview_completed', '2026-11-01'),
    ])
    const g = tjanstLage(genomford, NU)
    expect(g.dagarTyst).toBe(20)
    expect(g.tyst).toBe(false)
    expect(g.intervju?.lage).toBe('vantar_besked')
    // Genomfört provjobb likaså.
    const provjobb = tjanst('z', 'Z', 'Q', '2026-10-20', 'trial_work_completed', [handelse('z', 'trial_work_completed', '2026-11-01')])
    expect(tjanstLage(provjobb, NU).tyst).toBe(false)
    // Ingen av dem hamnar under Följ upp i listan.
    const lista = soktaLista([utanTid, genomford, provjobb].map((t) => tjanstLage(t, NU)), [])
    expect(lista.antal['folj-upp']).toBe(0)
    expect(lista.antal.intervju).toBe(3)
  })

  it('läser intervjuns läge: bokad, hur gick, väntar besked', () => {
    const ue = tjanstLage(elin()[0], NU)
    expect(ue.intervju?.lage).toBe('bokad')
    expect(ue.intervju?.dag).toBe('2026-11-24')
    expect(ue.intervju?.plats).toBe('Umeå Energi, Storgatan')
    // Samma dag efter intervjun: fortfarande bokad. Dagen efter: Hur gick intervjun?
    expect(tjanstLage(elin()[0], new Date('2026-11-24T15:00:00Z')).intervju?.lage).toBe('bokad')
    expect(tjanstLage(elin()[0], new Date('2026-11-25T07:00:00Z')).intervju?.lage).toBe('hur_gick')
    expect(tjanstLage(elin()[1], NU).intervju?.lage).toBe('vantar_besked')
  })
})

/* ------------------------------------------------------------- banan */

describe('banan', () => {
  it('ställer Elins brickor vid rätt station', () => {
    const lagen = elin().map((t) => tjanstLage(t, NU))
    const b = bana(lagen, skaSokasLista(ELIN_SPARADE, '2026-11-21'))
    const [ska, sokt, intervju, erbj] = b.stationer
    expect(ska.antal).toBe(2)
    expect(ska.undertext).toBe('2 sparade, närmast tors 26 nov')
    expect(sokt.antal).toBe(4)
    expect(sokt.brickor[0].bokstaver).toBe('NO')
    expect(sokt.brickor[0].etikett).toBe('tyst 15 dagar')
    expect(sokt.undertext).toBe('4 väntar svar')
    expect(intervju.brickor.map((x) => x.bokstaver)).toEqual(['UE', 'LV'])
    expect(intervju.brickor[0].etikett).toBe('tis 10.00')
    expect(intervju.undertext).toBe('1 bokad, 1 väntar besked')
    expect(erbj.antal).toBe(0)
    expect(b.avslutade).toHaveLength(3)
  })

  it('ger tjänstens egna fyra steg', () => {
    const t = elin()[0]
    const s = tjanstensSteg(t, tjanstLage(t, NU))
    expect(s.punkter.map((p) => [p.steg, p.klar, p.aktuell])).toEqual([
      ['sokt', true, false],
      ['svar', true, false],
      ['intervju', false, true],
      ['erbjudande', false, false],
    ])
    expect(s.punkter[1].etikett).toBe('13 nov')
    expect(s.punkter[2].etikett).toBe('tis 24 nov 10.00')
    const bo = elin()[6]
    const sb = tjanstensSteg(bo, tjanstLage(bo, NU))
    expect(sb.avslutad).toBe(true)
    expect(sb.punkter[1].klar).toBe(true)
  })
})

/* ------------------------------------------------------- veckans mål */

describe('veckans mål', () => {
  it('räknar måndag till söndag och har förvalet 3', () => {
    const vm = veckansMal(elin().map((t) => t.ansokan), null, NU)
    expect(vm).toMatchObject({ mal: 3, forval: true, sokta: 2, klart: false, kvar: 1, vecka: 47, start: '2026-11-16', slut: '2026-11-22' })
    expect(vm.text).toBe('Veckans mål: 2 av 3 sökta')
    const klart = veckansMal(elin().map((t) => t.ansokan), 2, NU)
    expect(klart.text).toBe('Veckans mål klart: 2 av 2')
    expect(veckansMal([], 99, NU).mal).toBe(3)
  })
})

/* ------------------------------------------------------- Att göra nu */

describe('Att göra nu', () => {
  const lagen = () => elin().map((t) => tjanstLage(t, NU))
  const ind = () => ({
    tjanster: lagen(),
    skaSokas: skaSokasLista(ELIN_SPARADE, '2026-11-21'),
    veckansMal: veckansMal(elin().map((t) => t.ansokan), null, NU),
    harCv: true,
    sokteForraManaden: 4,
    intervjuprov: { ovade: 3, lagst: { kort: 'Ett problem du löste', betyg: 2 } },
    nu: NU,
  })

  it('tar högst tre: kommande intervju först, sedan övrigt med det passerade först', () => {
    const a = attGoraNu(ind())
    expect(a.lage).toBe('handlingar')
    expect(a.handlingar.map((h) => h.typ)).toEqual(['forbered_intervju', 'folj_upp', 'sok_fore_sista_dag'])
    expect(a.handlingar[0]).toMatchObject({ datum: '2026-11-24', overrad: 'TISDAG 24 NOV 10.00', rubrik: 'Förbered intervjun på Umeå Energi' })
    expect(a.handlingar[0].text).toBe('Tre av sju frågor övade. Börja med Ett problem du löste, där du fick 2 av 5.')
    expect(a.handlingar[1]).toMatchObject({ datum: '2026-11-18', passerad: true, overrad: 'TYST I 15 DAGAR', rubrik: 'Följ upp Norrmejerier' })
    expect(a.handlingar[2]).toMatchObject({ datum: '2026-11-26', overrad: 'SISTA DAG TORSDAG 26 NOV', rubrik: 'Sök Ålö AB senast torsdag' })
    expect(a.handlingar[2].text).toBe('Ekonomiassistent, 92 % matchgrad.')
  })

  it('sätter "Hur gick intervjun?" före kommande intervjuer och sorterar intervjuerna efter tid', () => {
    const nu = new Date('2026-11-25T08:00:00Z')
    const x = tjanst('x', 'Xylem', 'Controller', '2026-11-01', 'interview_invited', [
      handelse('x', 'interview_invited', '2026-11-20', { interview_at: '2026-11-26T08:00:00.000Z' }),
    ])
    const y = tjanst('y', 'Ystad Energi', 'Controller', '2026-11-01', 'interview_invited', [
      handelse('y', 'interview_invited', '2026-11-20', { interview_at: '2026-11-27T08:00:00.000Z' }),
    ])
    const a = attGoraNu({ ...ind(), tjanster: [y, x, elin()[0]].map((t) => tjanstLage(t, nu)), skaSokas: [], nu })
    expect(a.handlingar.map((h) => [h.typ, h.ansokanId])).toEqual([
      ['hur_gick_intervjun', 'ue'],
      ['forbered_intervju', 'x'],
      ['forbered_intervju', 'y'],
    ])
  })

  it('låter första handlingen bära väggens rubrik och primärknapp', () => {
    const a = attGoraNu(ind())
    expect(a.vagg.rubrik).toBe('Intervju på Umeå Energi på tisdag')
    expect(a.vagg.text).toBe('Redovisningsekonom, tisdag 24 november klockan 10.00. Du har övat på tre av de sju vanligaste frågorna.')
    expect(a.vagg.knapp).toEqual(a.handlingar[0].knapp)
    expect(a.vagg.knapp.href).toBe('/dashboard/sokta-tjanster/ue?steg=forbered')
    expect(a.vagg.overrad).toBe('LÖRDAG 21 NOV · VECKA 47')
    // Avfärdad intervju: uppföljningen blir väggen, och Sök en tjänst till står sist.
    const b = attGoraNu({ ...ind(), avfardade: new Set([a.handlingar[0].nyckel]) })
    expect(b.vagg.rubrik).toBe('Följ upp Norrmejerier')
    expect(b.vagg.knapp.href).toBe('/dashboard/sokta-tjanster/no?steg=folj-upp')
    expect(b.handlingar.map((h) => h.typ)).toEqual(['folj_upp', 'sok_fore_sista_dag', 'sok_en_till'])
  })

  it('frågar hur intervjun gick dagen efter', () => {
    const nu = new Date('2026-11-25T08:00:00Z')
    const a = attGoraNu({ ...ind(), tjanster: elin().map((t) => tjanstLage(t, nu)), nu })
    const h = a.handlingar.find((x) => x.typ === 'hur_gick_intervjun')
    expect(h).toMatchObject({ datum: '2026-11-25', rubrik: 'Hur gick intervjun på Umeå Energi?' })
    expect(h?.knapp.href).toBe('/dashboard/sokta-tjanster/ue?steg=hur-gick')
  })

  it('lägger till "Sök en tjänst till" när målet inte är nått och det finns plats', () => {
    // En sökt tjänst som inte ger någon handling (Region Västerbotten, fyra dagar).
    const a = attGoraNu({ ...ind(), tjanster: [tjanstLage(elin()[4], NU)], skaSokas: [], bastaTraff: { id: '123', jobTitle: 'Ekonomiassistent', company: 'Ålö AB', score: 92 } })
    expect(a.handlingar).toHaveLength(1)
    expect(a.handlingar[0]).toMatchObject({ typ: 'sok_en_till', rubrik: 'Sök en tjänst till' })
    expect(a.handlingar[0].knapp.href).toBe('/dashboard/jobbmatchning?annons=123')
  })

  it('med CV och utan rader är första handlingen "Sök din första tjänst"', () => {
    const a = attGoraNu({ ...ind(), harCv: true, tjanster: [], skaSokas: [], bastaTraff: null })
    expect(a.lage).toBe('handlingar')
    expect(a.handlingar[0]).toMatchObject({
      typ: 'sok_en_till',
      rubrik: 'Sök din första tjänst',
      text: 'Matchade jobb har annonser som passar ditt CV. Har du redan sökt en tjänst loggar du den med företag, tjänst och datum.',
      knapp: { text: 'Till Matchade jobb', href: '/dashboard/jobbmatchning' },
    })
    expect(a.vagg.rubrik).toBe('Sök din första tjänst')
    // Med bästa träff: rubriken är den första, texten och knappen som förut.
    const b = attGoraNu({ ...ind(), harCv: true, tjanster: [], skaSokas: [], bastaTraff: { id: '123', jobTitle: 'Ekonomiassistent', company: 'Ålö AB', score: 92 } })
    expect(b.handlingar[0]).toMatchObject({ rubrik: 'Sök din första tjänst', text: 'Ekonomiassistent hos Ålö AB passar dig till 92 %.' })
    expect(b.handlingar[0].knapp).toEqual({ text: 'Se annonsen', href: '/dashboard/jobbmatchning?annons=123' })
  })

  it('tar med rapporten den 1 till 14 när något söktes förra månaden', () => {
    const nu = new Date('2026-12-03T09:00:00Z')
    const a = attGoraNu({ ...ind(), tjanster: [], skaSokas: [], sokteForraManaden: 5, nu })
    const r = a.handlingar.find((h) => h.typ === 'af_rapport')
    expect(r).toMatchObject({ datum: '2026-12-14', rubrik: 'Rapporten för november' })
    expect(r?.knapp.href).toBe('/dashboard/sokta-tjanster?vy=rapport&manad=2026-11')
    expect(attGoraNu({ ...ind(), tjanster: [], skaSokas: [], sokteForraManaden: 5, nu: new Date('2026-12-15T09:00:00Z') }).handlingar.some((h) => h.typ === 'af_rapport')).toBe(false)
  })

  it('visar inte en passerad sista dag', () => {
    const a = attGoraNu({ ...ind(), tjanster: [], skaSokas: skaSokasLista([sparad('x', 'X', 'Y', '2026-11-20')], '2026-11-21') })
    expect(a.handlingar.some((h) => h.typ === 'sok_fore_sista_dag')).toBe(false)
  })

  it('säger läget som det är när inget finns att göra', () => {
    const klartMal = veckansMal(elin().map((t) => t.ansokan), 1, NU)
    const bara = [tjanstLage(elin()[4], NU)]
    const a = attGoraNu({ ...ind(), tjanster: bara, skaSokas: [], veckansMal: klartMal, sokteForraManaden: 0 })
    expect(a.lage).toBe('inget_att_gora')
    expect(a.vagg.rubrik).toBe('En tjänst väntar svar')
    expect(a.vagg.knapp.href).toBe('/dashboard/jobbmatchning')
  })

  it('ger Oversikt-ny utan CV', () => {
    const a = attGoraNu({ ...ind(), tjanster: [], skaSokas: [], harCv: false, fornamn: 'Elin' })
    expect(a.lage).toBe('utan_cv')
    expect(a.vagg.rubrik).toBe('Börja med ditt CV, Elin')
  })
})

/* ------------------------------------------------------- Ska sökas */

describe('Ska sökas', () => {
  it('sorterar närmast först, utan dag efter, passerade sist och grå', () => {
    const lista = skaSokasLista(
      [
        sparad('a', 'A', 'T', '2026-11-30'),
        sparad('b', 'B', 'T', null),
        sparad('c', 'C', 'T', '2026-11-20'),
        sparad('d', 'D', 'T', '2026-11-26'),
        sparad('e', 'E', 'T', '2026-11-25', null, { application_id: 'app' }),
      ],
      '2026-11-21'
    )
    expect(lista.map((r) => r.id)).toEqual(['d', 'a', 'b', 'c'])
    expect(lista[0].sistaDagText).toBe('Sista dag tors 26 nov, 5 dagar kvar')
    expect(lista[3]).toMatchObject({ passerad: true, sistaDagText: 'Sista dag har passerat' })
  })
})

/* ------------------------------------------------------- listan */

describe('Sökta tjänster-listan', () => {
  it('grupperar Elins tjänster och räknar filtren', () => {
    const lagen = elin().map((t) => tjanstLage(t, NU))
    const l = soktaLista(lagen, skaSokasLista(ELIN_SPARADE, '2026-11-21'))
    expect(l.folj_upp.map((t) => t.id)).toEqual(['no'])
    expect(l.intervju.map((t) => t.id)).toEqual(['ue', 'lf'])
    expect(l.vantar_svar.map((t) => t.id)).toEqual(['uk', 'rv', 'ko'])
    expect(l.avslutade).toHaveLength(3)
    expect(l.antal).toEqual({ alla: 11, 'folj-upp': 1, 'ska-sokas': 2, 'vantar-svar': 4, intervju: 2, erbjudande: 0, avslutade: 3 })
    expect(soktaVagg(lagen)).toEqual({ rubrik: 'Sex är på väg', text: 'Två är i intervju och fyra väntar svar. Norrmejerier har varit tyst i 15 dagar.' })
    expect(avslutadeText(l.avslutade)).toBe('Tre avslag, det senaste 12 november.')
  })
})

/* ------------------------------------------------------- händelser */

describe('händelselistan', () => {
  it('sorterar in skickade uppföljningar och lägger en bokad intervju sist', () => {
    const t = tjanst('ue', 'Umeå Energi', 'Redovisningsekonom', '2026-11-02', 'interview_invited', [
      handelse('ue', 'interview_invited', '2026-11-13', { interview_at: UE_TID }),
    ], { letter_id: 'b' }, [uppf('ue', { sent_at: '2026-11-10', sent_via: 'kopierat' }), uppf('ue')])
    const rader = handelselista(t, tjanstLage(t, NU), NU)
    expect(rader.map((r) => r.typ)).toEqual(['handelse', 'foljde_upp', 'handelse', 'kommande_intervju'])
    expect(rader[0]).toMatchObject({ rubrik: 'Ansökan skickad', text: 'Svar på annons, med personligt brev.' })
    expect(rader[1]).toMatchObject({ rubrik: 'Följde upp', datum: '2026-11-10' })
    expect(rader[3].text).toBe('Om 3 dagar. På onsdag frågar vi hur det gick, så loggas den som genomförd.')
    // Kallad till intervju visar dagen kallelsen kom; intervjutiden står bara på raden Intervju.
    expect(rader[2].rubrik).toBe('Kallad till intervju')
    expect(handelseEtikett(rader[2])).toBe('13 nov')
    expect(handelseEtikett(rader[3])).toBe('tis 24 nov 10.00')
  })
})

/* ------------------------------------------------------- statistik */

describe('statistik', () => {
  it('räknar tratten och veckostaplarna ur listan', () => {
    const h = elin()
    const lagen = h.map((t) => tjanstLage(t, NU))
    const tr = tratt(h, lagen)
    expect(tr.sokta.antal).toBe(9)
    expect(tr.sokta.sedan).toBe('2026-10-14')
    expect(tr.svar).toMatchObject({ antal: 5, kallelser: 2, avslag: 3 })
    expect(tr.intervju).toMatchObject({ antal: 2, genomforda: 1, bokade: 1 })
    expect(tr.erbjudande.antal).toBe(0)
    const v = veckostaplar(lagen, NU)
    expect(v.map((s) => s.vecka)).toEqual([42, 43, 44, 45, 46, 47])
    expect(v[5]).toMatchObject({ etikett: 'v. 47, nu', arNu: true })
    expect(v[5].brickor.map((b) => b.bokstaver)).toEqual(['RV', 'KF'])
  })
})

/* ------------------------------------------------------- intervju */

describe('intervjun', () => {
  const prov: ProvSammanfattning[] = [
    { token: 't1', question: 'beratta', level: 4, missingKind: '', createdAt: '2026-11-20T10:00:00Z' },
    { token: 't2', question: 'varfor_jobbet', level: 3, missingKind: 'kopplingen', createdAt: '2026-11-17T10:00:00Z' },
    { token: 't3', question: 'star', level: 2, missingKind: 'resultatet', createdAt: '2026-11-16T10:00:00Z' },
    { token: 't0', question: 'beratta', level: 2, missingKind: 'exemplet', createdAt: '2026-11-10T10:00:00Z' },
  ]

  it('ger de sju frågorna med senaste betyget, lägst först, och kraven ur brevet', () => {
    const f = forberedelse(prov, [
      { krav: 'Löpande redovisning', citat: 'jag har skött' },
      { krav: 'Koncernredovisning', citat: null },
    ])
    expect(f.fragor.map((x) => x.fraga)).toEqual(['star', 'varfor_jobbet', 'beratta', 'styrkor', 'varfor_vi', 'konflikt', 'misstag'])
    expect(f.fragor[0]).toMatchObject({ betyg: 2, betygOrd: 'Tunt', saknades: 'resultatet' })
    expect(f.fragor[2]).toMatchObject({ betyg: 4, betygOrd: 'Starkt' })
    expect(f.ovade).toBe(3)
    expect(f.nastaFraga).toBe('star')
    expect(f.krav).toEqual([{ krav: 'Löpande redovisning', harSvar: true }, { krav: 'Koncernredovisning', harSvar: false }])
    expect(f.kravMedSvar).toBe(1)
    expect(forberedelse([], []).krav).toBeNull()
    expect(forberedelse([], null).nastaFraga).toBe('beratta')
  })

  it('listar intervjuer på gång med text', () => {
    const lagen = elin().map((t) => tjanstLage(t, NU))
    const p = intervjuerPaGang(lagen, NU)
    expect(p.map((x) => [x.id, x.lage])).toEqual([['ue', 'bokad'], ['lf', 'vantar_besked']])
    expect(p[0].text).toBe('Tisdag 24 november 10.00, om 3 dagar')
    expect(p[1].text).toBe('Intervju genomförd 18 november. Väntar på besked.')
  })
})

/* ------------------------------------------------------- Jobbcoachen */

describe('Jobbcoachens förslag', () => {
  it('räknar fram högst fyra ur läget, annars de fasta', () => {
    const lagen = elin().map((t) => tjanstLage(t, NU))
    const f = coachForslag(lagen, NU)
    expect(f.lage).toBe('fran_laget')
    expect(f.forslag.map((x) => x.fraga)).toEqual([
      'Hur svarar jag på lönefrågan hos Umeå Energi?',
      'Vad skriver jag i ett uppföljningsmejl?',
      'Vad frågar jag arbetsgivaren på intervjun?',
      'Hur länge är det rimligt att vänta på besked?',
    ])
    expect(f.forslag[1].bokstaver).toBe('NO')
    expect(coachForslag([], NU).lage).toBe('fasta')
    expect(coachForslag([], NU).forslag).toHaveLength(3)
  })
})

/* ------------------------------------------------------- uppföljningen */

describe('uppföljningsmejlet', () => {
  const u = {
    jobTitle: 'Ekonomiassistent',
    company: 'Norrmejerier',
    appliedAt: '2026-11-06',
    kanal: 'ad' as const,
    kompetenser: ['kund- och leverantörsreskontra', 'månadsavstämningar i Fortnox'],
    krav: [],
    sprak: 'sv' as const,
  }

  it('bygger reservmallen av samma uppgifter, med namnet satt lokalt', () => {
    const m = uppfoljningsmall(u, 'Elin Sundberg')
    expect(m.subject).toBe('Min ansökan till tjänsten som ekonomiassistent')
    expect(m.body).toBe(
      'Hej,\n\nJag sökte tjänsten som ekonomiassistent hos er den 6 november och undrar hur långt ni har kommit i rekryteringen.\n\n' +
        'Jag är fortfarande intresserad. Det jag gör i dag, kund- och leverantörsreskontra och månadsavstämningar i Fortnox, ligger nära det ni beskriver i annonsen.\n\n' +
        'Hör gärna av er om ni vill ha något mer från mig. Jag svarar på det här mejlet eller i telefon.\n\nVänliga hälsningar\nElin Sundberg'
    )
    expect(ordIMejlet(m.body)).toBeLessThanOrEqual(90)
    expect(m.body).not.toMatch(/[—–]/)
    expect(uppfoljningsmall({ ...u, sprak: 'en' }, null).subject).toBe('Following up on my application for Ekonomiassistent')
  })

  it('godtar AI:ns svar bara när det håller', () => {
    expect(valideraAiMejl({ amne: 'Min ansökan', stycken: ['Ett — två.', 'Tre.', 'Fyra.'] })).toEqual({ subject: 'Min ansökan', stycken: ['Ett, två.', 'Tre.', 'Fyra.'] })
    expect(valideraAiMejl({ amne: 'X', stycken: ['bara ett'] })).toBeNull()
    expect(valideraAiMejl({ amne: 'X', stycken: ['Hej [NAMN]', 'b', 'c'] })).toEqual({ subject: 'X', stycken: ['Hej', 'b', 'c'] })
    expect(valideraAiMejl({ amne: 'X', stycken: ['a', 'b', 'mejla mig på x@y.se'] })).toBeNull()
    expect(valideraAiMejl({ amne: 'X', stycken: ['ord '.repeat(95), 'b'] })).toBeNull()
    expect(valideraAiMejl('nej')).toBeNull()
  })

  it('plockar ut styckena utan hälsning och avslut', () => {
    expect(styckenUrMejl('Hej,\n\nA.\n\nB.\n\nVänliga hälsningar\nElin')).toEqual(['A.', 'B.'])
  })

  it('väljer kompetenser som står i kraven först', () => {
    expect(valjKompetenser(['Excel', 'Fortnox', 'Visma', 'Bokslut'], ['Ekonomiassistent'], ['Vana vid bokslut', 'Visma'])).toEqual(['Visma', 'Bokslut', 'Excel'])
    expect(valjKompetenser([], ['Ekonomiassistent'], [])).toEqual(['Ekonomiassistent'])
  })

  it('bygger mailto med ämne och text', () => {
    expect(mailtoHref({ subject: 'Hej då', body: 'A\nB' })).toBe('mailto:?subject=Hej%20d%C3%A5&body=A%0AB')
  })

  it('spärren: ett utkast gratis, samma tjänst igen, Premium 30 per dygn', () => {
    expect(uppfoljningSparr({ harBetalt: false, utkast: [], applicationId: 'a' }).lage).toBe('ny')
    const ett = [{ application_id: 'a', created_at: '2026-11-01T10:00:00Z' }]
    expect(uppfoljningSparr({ harBetalt: false, utkast: ett, applicationId: 'a' }).lage).toBe('ateranvand')
    expect(uppfoljningSparr({ harBetalt: false, utkast: ett, applicationId: 'b' }).lage).toBe('premium_required')
    const trettio = Array.from({ length: 30 }, () => ({ application_id: 'x', created_at: '2026-11-21T07:00:00Z' }))
    expect(uppfoljningSparr({ harBetalt: true, utkast: trettio, applicationId: 'b', nu: NU })).toEqual({ lage: 'dygnstak', kvarIdag: 0 })
    expect(uppfoljningSparr({ harBetalt: true, utkast: trettio, applicationId: 'b', nu: new Date('2026-11-21T23:30:00Z') })).toEqual({ lage: 'ny', kvarIdag: 30 })
  })

  it('validerar "skickat" med i dag som förval och inget framtida datum', () => {
    expect(valideraSkickad({}, NU)).toEqual({ via: 'eget', datum: '2026-11-21' })
    expect(valideraSkickad({ via: 'epost', datum: '2026-11-20' }, NU)).toEqual({ via: 'epost', datum: '2026-11-20' })
    expect(valideraSkickad({ via: 'post' }, NU)).toEqual({ fel: 'via' })
    expect(valideraSkickad({ datum: '2026-11-22' }, NU)).toEqual({ fel: 'datum' })
  })
})

/* ------------------------------------------------------- adressen */

describe('adressen', () => {
  it('läser vy och filter, även de gamla parametrarna', () => {
    expect(tolkaSoktaAdress(new URLSearchParams('vy=statistik'))).toMatchObject({ vy: 'statistik', filter: 'alla' })
    expect(tolkaSoktaAdress({ rapport: '1' }).vy).toBe('rapport')
    expect(tolkaSoktaAdress({ tab: 'dela' }).vy).toBe('rapport')
    expect(tolkaSoktaAdress({ filter: 'uppfoljning' }).filter).toBe('folj-upp')
    expect(tolkaSoktaAdress({ filter: 'folj-upp' }).filter).toBe('folj-upp')
    expect(tolkaSoktaAdress({ filter: 'skräp' }).filter).toBe('alla')
    expect(tolkaSoktaAdress({ logga: '1' }).logga).toBe('sokt')
    expect(tolkaSoktaAdress({ logga: 'ska-soka', manad: '2026-10' })).toMatchObject({ logga: 'ska-soka', manad: '2026-10' })
    expect(soktaHref({ vy: 'rapport' })).toBe('/dashboard/sokta-tjanster?vy=rapport')
    expect(soktaHref({ filter: 'folj-upp' })).toBe('/dashboard/sokta-tjanster?filter=folj-upp')
    // fran märker källan i sidvisningen och stör inte tolkningen.
    const medFran = soktaHref({ logga: 'sokt', fran: 'oversikt-ny' })
    expect(medFran).toBe('/dashboard/sokta-tjanster?logga=1&fran=oversikt-ny')
    expect(tolkaSoktaAdress(new URLSearchParams(medFran.split('?')[1]))).toEqual({ vy: 'lista', filter: 'alla', logga: 'sokt', manad: null })
    expect(tjanstHref('abc', 'forbered')).toBe('/dashboard/sokta-tjanster/abc?steg=forbered')
    expect(tolkaTjanstAdress({ steg: 'hur-gick' })).toBe('hur-gick')
    expect(tolkaTjanstAdress({ steg: 'x' })).toBeNull()
  })
})

/* ------------------------------------------------------- Matchade jobb */

describe('Matchade jobb', () => {
  const annons = {
    id: 29384756,
    headline: 'Ekonomiassistent',
    employer: { name: 'Ålö AB' },
    workplace_address: { municipality: 'Umeå' },
    application_deadline: '2026-11-26T23:59:59',
    webpage_url: 'https://arbetsformedlingen.se/platsbanken/annonser/29384756',
    must_have: { skills: [{ label: 'Fortnox' }, { label: 'SAP' }, { label: 'Leverantörsreskontra' }] },
  }

  it('läser sista ansökningsdag ur annonsen', () => {
    expect(sistaAnsokningsdag(annons, NU)).toEqual({ dag: '2026-11-26', dagarKvar: 5, passerad: false, text: 'Sista dag tors 26 nov, 5 dagar kvar' })
    expect(sistaAnsokningsdag({}, NU)).toBeNull()
  })

  it('visar kompetenserna en och en, den som saknas i CV:t utmärkt', () => {
    const k = kompetenserEnOchEn(annons, { extracted_skills: ['Fortnox', 'leverantörsreskontra', 'Excel'] })
    expect(k.grund).toBe('kravprofil')
    expect(k.rader).toEqual([
      { namn: 'Fortnox', iCv: true, kalla: 'krav' },
      { namn: 'Leverantörsreskontra', iCv: true, kalla: 'krav' },
      { namn: 'SAP', iCv: false, kalla: 'krav' },
    ])
    expect([k.traffar, k.totalt]).toEqual([2, 3])
  })

  it('utan kravprofil: bara CV:ts kompetenser som står i annonsen, ingen markeras som saknad', () => {
    const utan = { headline: 'Ekonomiassistent', description: { text: 'Du arbetar i Fortnox och Excel.' } }
    const k = kompetenserEnOchEn(utan, { extracted_skills: ['Fortnox', 'Excel', 'Visma'] })
    expect(k.grund).toBe('annonstext')
    expect(k.rader.every((r) => r.iCv)).toBe(true)
    expect(k.rader.map((r) => r.namn)).toEqual(['Fortnox', 'Excel'])
  })

  it('sparar en träff med rätt fält', () => {
    expect(sparadFranAnnons(annons, 91.6)).toMatchObject({
      job_title: 'Ekonomiassistent',
      company: 'Ålö AB',
      last_application_date: '2026-11-26',
      af_ad_id: '29384756',
      match_score: 92,
      source: 'match',
    })
  })
})

/* ------------------------------------------------------- validering */

describe('validering', () => {
  it('ny Ska sökas-rad', () => {
    expect(valideraNySparad({ company: 'X' })).toEqual({ fel: 'job_title' })
    expect(valideraNySparad({ job_title: 'T', company: 'X', last_application_date: '2026-02-30' })).toEqual({ fel: 'last_application_date' })
    expect(valideraNySparad({ job_title: 'T', company: 'X', job_ad_url: 'javascript:alert(1)' })).toEqual({ fel: 'job_ad_url' })
    expect(valideraNySparad({ job_title: ' T ', company: 'X', af_ad_id: 123 })).toMatchObject({ job_title: 'T', source: 'match', af_ad_id: '123' })
    expect(valideraNySparad({ job_title: 'T', company: 'X' })).toMatchObject({ source: 'egen', last_application_date: null })
  })

  it('intervjuns tid, utfallet och veckans mål', () => {
    expect(valideraIntervjutid({ datum: '2026-11-24', tid: '10:00', plats: ' Storgatan 1 ' })).toEqual({ interview_at: UE_TID, interview_place: 'Storgatan 1' })
    expect(valideraIntervjutid({ datum: null })).toEqual({ interview_at: null })
    expect(valideraIntervjutid({ datum: '2026-11-24', tid: '9' })).toEqual({ fel: 'tid' })
    expect(valideraIntervjutid({ plats: 'x'.repeat(201) })).toEqual({ fel: 'plats' })
    expect(valideraUtfall({ svar: 'genomford' })).toEqual({ svar: 'genomford' })
    expect(valideraUtfall({ svar: 'flyttad' })).toEqual({ fel: 'datum' })
    expect(valideraUtfall({ svar: 'flyttad', datum: '2026-11-26', tid: '13:30' })).toMatchObject({ svar: 'flyttad', ny: { interview_at: '2026-11-26T12:30:00.000Z' } })
    expect(valideraVeckansMal({ mal: 5 })).toEqual({ mal: 5 })
    expect(valideraVeckansMal({ mal: null })).toEqual({ mal: null })
    expect(valideraVeckansMal({ mal: 11 })).toEqual({ fel: 'mal' })
    expect(valideraVeckansMal({ mal: 2.5 })).toEqual({ fel: 'mal' })
  })
})
