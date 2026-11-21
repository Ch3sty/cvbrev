import { describe, expect, it } from 'vitest'
import type { AttGoraHandling, Bana, TjanstLage } from '@/lib/jobbsok'
import { banaProps, bliUpptacktRad, goraMobil, goraTon, tjanstRad, traffUnder, traffUnderMedSedan } from '../oversikt'
import { nyaBlandBasta, nyaMarke, traffRubrikNya } from '@/lib/rum/nyaTraffar'
import { startvy } from '@/app/dashboard/(oversikt)/startvy'
import { rapportTotalt } from '@/components/jobb3/sokta/text'

const IDAG = '2026-11-21'

function tjanst(p: Partial<TjanstLage>): TjanstLage {
  return {
    id: 't1',
    company: 'Norrmejerier',
    jobTitle: 'Ekonomiassistent',
    location: 'Umeå',
    bokstaver: 'NO',
    status: 'applied',
    kanal: 'ad',
    appliedAt: '2026-11-06',
    station: 'sokt',
    avslutad: false,
    senasteAktivitet: '2026-11-06',
    foljUppTyp: 'ansokan',
    tystGrans: 12,
    tyst: false,
    dagarTyst: 15,
    tystSedan: '2026-11-18',
    intervju: null,
    harUtkast: false,
    senastUppfoljd: null,
    harBrev: false,
    letterId: null,
    cvId: null,
    ton: 'vantar',
    ...p,
  } as TjanstLage
}

/** Genomförd intervju eller provjobb den 10 november, tyst i elva dagar. */
function genomford(status: 'interview_completed' | 'trial_work_completed', typ: 'intervju' | 'provjobb', p: Partial<TjanstLage> = {}): TjanstLage {
  return tjanst({
    status,
    station: 'intervju',
    senasteAktivitet: '2026-11-10',
    foljUppTyp: typ,
    tystGrans: 7,
    tyst: true,
    dagarTyst: 11,
    tystSedan: '2026-11-17',
    ton: 'intervju',
    intervju: { lage: 'vantar_besked', tid: '2026-11-10T09:00:00Z', harKlockslag: true, plats: null, handelseId: 'h', dag: '2026-11-10', kalladDag: '2026-11-05' },
    ...p,
  })
}

/** Kallad den 12 november utan tid. */
function kalladUtanTid(): TjanstLage {
  return tjanst({
    status: 'interview_invited',
    station: 'intervju',
    company: 'Umeå Energi',
    senasteAktivitet: '2026-11-12',
    foljUppTyp: null,
    tystGrans: 12,
    ton: 'intervju',
    intervju: { lage: 'utan_tid', tid: null, harKlockslag: false, plats: null, handelseId: 'h', dag: null, kalladDag: '2026-11-12' },
  })
}

describe('tjanstRad', () => {
  it('tyst tjänst: Följ upp, kopparbricka och länk till uppföljningen', () => {
    const r = tjanstRad(tjanst({ tyst: true }), IDAG)
    expect(r.status.status).toBe('folj-upp')
    expect(r.bricka.ton).toBe('tyst')
    expect(r.text).toBe('Sökt för 15 dagar sedan, inget svar än. Följ upp med ett kort mejl.')
    expect(r.href).toContain('steg=folj-upp')
    expect(r.rubrik).toBe('Norrmejerier, Ekonomiassistent')
    expect(r.rubrikMobil).toBe('Norrmejerier')
  })

  it('bokad intervju: tiden i texten och pillret Intervju bokad', () => {
    const r = tjanstRad(
      tjanst({
        station: 'intervju',
        intervju: { lage: 'bokad', tid: '2026-11-24T09:00:00Z', harKlockslag: true, plats: null, handelseId: 'h', dag: '2026-11-24', kalladDag: null },
      }),
      IDAG
    )
    expect(r.text).toBe('Intervjun är på tisdag 10.00.')
    expect(r.status).toEqual({ status: 'intervju', text: 'Intervju bokad' })
    expect(r.steg?.steg).toBe(3)
  })

  it('genomförd intervju utan besked på sju dagar: Följ upp, tyst steg och länk till uppföljningen (omgång 2)', () => {
    const r = tjanstRad(genomford('interview_completed', 'intervju'), IDAG)
    expect(r.text).toBe('Intervjun var den 10 november. Fråga när du kan vänta besked.')
    expect(r.textMobil).toBe('Ekonomiassistent. Intervjun var den 10 november.')
    expect(r.steg).toEqual({ steg: 3, tyst: true })
    expect(r.status).toEqual({ status: 'folj-upp' })
    expect(r.href).toContain('steg=folj-upp')
    expect(r.text).not.toMatch(/har inte hört/)
  })

  it('genomfört provjobb utan besked: ordet provjobbet', () => {
    const r = tjanstRad(genomford('trial_work_completed', 'provjobb'), IDAG)
    expect(r.text).toBe('Provjobbet var den 10 november. Fråga när du kan vänta besked.')
    expect(r.textMobil).toBe('Ekonomiassistent. Provjobbet var den 10 november.')
  })

  it('genomförd intervju före sju dagar: som förut, väntar besked', () => {
    const r = tjanstRad(genomford('interview_completed', 'intervju', { tyst: false, dagarTyst: 3 }), IDAG)
    expect(r.text).toBe('Intervju genomförd 10 november. Väntar på besked.')
    expect(r.status).toEqual({ status: 'vantar-besked' })
    expect(r.steg).toEqual({ steg: 3 })
  })

  it('nyss sökt: i dag och i går i stället för noll och en dag', () => {
    expect(tjanstRad(tjanst({ appliedAt: IDAG }), IDAG).text.startsWith('Sökt i dag.')).toBe(true)
    expect(tjanstRad(tjanst({ appliedAt: '2026-11-20' }), IDAG).text.startsWith('Sökt i går.')).toBe(true)
  })
})

describe('banaProps', () => {
  it('kortare rader på telefon och etikett för skärmläsare', () => {
    const b: Bana = {
      stationer: [
        { station: 'ska_sokas', antal: 2, brickor: [], undertext: '2 sparade' },
        {
          station: 'sokt',
          antal: 4,
          brickor: [
            { id: '1', bokstaver: 'NO', company: 'Norrmejerier', ton: 'tyst', tyst: true, etikett: 'tyst 15 dagar' },
            { id: '2', bokstaver: 'UK', company: 'Umeå kommun', ton: 'vantar', tyst: false, etikett: null },
          ],
          undertext: '4 väntar svar',
        },
        { station: 'intervju', antal: 2, brickor: [], undertext: '1 bokad, 1 väntar besked' },
        { station: 'erbjudande', antal: 0, brickor: [], undertext: 'Hit ska en bricka' },
      ],
      avslutade: [],
    }
    const p = banaProps(b)
    expect(p.sokt.underMobil).toBe('4, en tyst')
    expect(p.intervju.underMobil).toBe('2 på gång')
    expect(p.sokt.brickor[0]).toMatchObject({ kod: 'NO', tyst: true, tagg: 'tyst 15 dagar', taggTon: 'koppar' })
    expect(p.etikett).toContain('varav 1 tyst')
  })

  it('ett av varje: "1 sparad" och "1 sökt", aldrig "1 sparade" (klicktestets andra pass)', () => {
    const b: Bana = {
      stationer: [
        { station: 'ska_sokas', antal: 1, brickor: [], undertext: '1 sparad' },
        { station: 'sokt', antal: 1, brickor: [{ id: '1', bokstaver: 'NO', company: 'Norrmejerier', ton: 'vantar', tyst: false, etikett: null }], undertext: '1 väntar svar' },
        { station: 'intervju', antal: 0, brickor: [], undertext: 'Ingen just nu' },
        { station: 'erbjudande', antal: 0, brickor: [], undertext: 'Hit ska en bricka' },
      ],
      avslutade: [],
    }
    const p = banaProps(b)
    expect(p.skaSokas.underMobil).toBe('1 sparad')
    expect(p.etikett).toContain('1 sparad att söka')
    expect(p.etikett).toContain('1 sökt som väntar svar')
    expect(p.etikett).not.toMatch(/\b1 (sparade|sökta)\b/)
    const tva = banaProps({ ...b, stationer: b.stationer.map((s) => (s.station === 'ska_sokas' ? { ...s, antal: 2 } : s)) })
    expect(tva.skaSokas.underMobil).toBe('2 sparade')
  })
})

describe('rapportens text att kopiera', () => {
  it('rätt form vid ett: "1 spontan", "1 intervju", "1 sökt jobb", "1 annonserad"', () => {
    expect(rapportTotalt({ applications: 10, advertised: 9, unsolicited: 1, interviews: 2 })).toBe('Totalt: 10 sökta jobb (9 annonserade, 1 spontan), 2 intervjuer.')
    expect(rapportTotalt({ applications: 1, advertised: 1, unsolicited: 0, interviews: 1 })).toBe('Totalt: 1 sökt jobb (1 annonserad, 0 spontana), 1 intervju.')
    expect(rapportTotalt({ applications: 4, advertised: 2, unsolicited: 2, interviews: 0 })).toBe('Totalt: 4 sökta jobb (2 annonserade, 2 spontana), 0 intervjuer.')
  })
})

describe('Att göra nu', () => {
  const h = (typ: AttGoraHandling['typ']): AttGoraHandling => ({
    typ,
    nyckel: typ,
    datum: IDAG,
    passerad: false,
    ikon: 'kalender',
    overrad: 'X',
    rubrik: 'R',
    text: 'Tre av sju frågor övade. Börja med Ett problem du löste.',
    knapp: { text: 'K', href: '/x' },
    ansokanId: 't1',
  })
  it('första kortet i väggens färg, uppföljning tyst', () => {
    expect(goraTon(h('folj_upp'), 0)).toBe('nu')
    expect(goraTon(h('folj_upp'), 1)).toBe('tyst')
    expect(goraTon(h('sok_fore_sista_dag'), 2)).toBe('vanlig')
  })
  it('telefonens korta rader', () => {
    expect(goraMobil(h('forbered_intervju'), [tjanst({ company: 'Umeå Energi' })])).toEqual({ rubrik: 'Förbered intervjun', text: 'Umeå Energi. Tre av sju frågor övade.' })
    expect(goraMobil(h('folj_upp'), [tjanst({ harUtkast: true })]).text).toBe('Utkastet till mejlet är skrivet.')
    expect(goraMobil(h('folj_upp'), [tjanst({})]).text).toBe('Ett kort mejl brukar ge besked.')
  })
  it('telefonens rad för Fråga om besked efter intervju och provjobb, med och utan utkast (omgång 2)', () => {
    expect(goraMobil(h('folj_upp'), [genomford('interview_completed', 'intervju')])).toEqual({ text: 'Intervjun var den 10 november.' })
    expect(goraMobil(h('folj_upp'), [genomford('trial_work_completed', 'provjobb')])).toEqual({ text: 'Provjobbet var den 10 november.' })
    expect(goraMobil(h('folj_upp'), [genomford('interview_completed', 'intervju', { harUtkast: true })])).toEqual({ text: 'Utkastet till mejlet är skrivet.' })
  })
  it('telefonens kort för Sätt tiden efter en kallelse utan tid (omgång 2)', () => {
    expect(goraMobil(h('satt_intervjutid'), [kalladUtanTid()])).toEqual({ rubrik: 'Sätt tiden för intervjun', text: 'Umeå Energi. Kallad 12 nov.' })
  })
})

describe('träffarna', () => {
  it('rubriken räknar nya bara bland de bästa', () => {
    const publ = ['2026-11-20T08:00:00Z', '2026-11-20T09:00:00Z', '2026-11-10T08:00:00Z', '2026-11-01T08:00:00Z']
    expect(traffRubrikNya(nyaBlandBasta(publ, '2026-11-15T00:00:00Z'))).toBe('2 nya jobb som passar dig')
    // Första gången: inget "nya", antalet bästa.
    expect(traffRubrikNya(nyaBlandBasta(publ, null))).toBe('4 jobb som passar dig')
    // Allt är nytt: antalet bästa utan "nya".
    expect(traffRubrikNya(nyaBlandBasta(publ, '2026-10-01T00:00:00Z'))).toBe('4 jobb som passar dig')
    expect(traffRubrikNya(nyaBlandBasta(['2026-11-20T08:00:00Z', '2026-11-01T08:00:00Z'], '2026-11-15T00:00:00Z'))).toBe('1 nytt jobb som passar dig')
    expect(traffRubrikNya(null)).toBe('Jobb som passar dig')
  })
  it('sidomenyns märke aldrig över de bästa', () => {
    expect(nyaMarke(600)).toBe(25)
    expect(nyaMarke(4)).toBe(4)
    expect(nyaMarke(0)).toBe(null)
    expect(nyaMarke(null)).toBe(null)
  })
  it('raden under', () => {
    expect(traffUnder(600, '2026-11-21T08:00:00Z', IDAG)).toBe('Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV, senast i dag.')
    expect(traffUnder(600, null, IDAG)).toBe('Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV.')
  })
  it('"Sedan du tittade" bara när det finns nya träffar', () => {
    const sedda = '2026-11-17T09:00:00Z' // tisdag
    expect(traffUnderMedSedan(600, null, IDAG, 4, sedda)).toBe('Sedan du tittade i tisdags. Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV.')
    expect(traffUnderMedSedan(600, null, IDAG, null, sedda)).toBe('Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV.')
    expect(traffUnderMedSedan(600, null, IDAG, 0, sedda)).toBe('Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV.')
    expect(traffUnderMedSedan(600, null, IDAG, 4, null)).toBe('Vi har läst 600 annonser hos Arbetsförmedlingen mot ditt CV.')
  })
})

describe('Bli upptäckt-raden', () => {
  const T = { metaPa: 'PÅ', metaAv: 'AV' }
  it('visningar bara när profilen är synlig och har setts', () => {
    expect(bliUpptacktRad({ synlig: true, sett: 12, vantar: 0 }, T)).toEqual({ text: 'Din profil har visats 12 gånger.', vantar: null })
    expect(bliUpptacktRad({ synlig: true, sett: 1, vantar: 0 }, T).text).toBe('Din profil har visats en gång.')
    expect(bliUpptacktRad({ synlig: true, sett: 0, vantar: 0 }, T).text).toBe('PÅ')
    expect(bliUpptacktRad({ synlig: false, sett: 12, vantar: 0 }, T).text).toBe('AV')
    expect(bliUpptacktRad({ synlig: true, sett: null, vantar: null }, T)).toEqual({ text: 'PÅ', vantar: null })
  })
  it('märket när en förfrågan väntar, också med dold profil', () => {
    expect(bliUpptacktRad({ synlig: true, sett: 12, vantar: 1 }, T)).toEqual({ text: 'Din profil har visats 12 gånger.', vantar: 1 })
    expect(bliUpptacktRad({ synlig: false, sett: 0, vantar: 2 }, T)).toEqual({ text: 'AV', vantar: 2 })
  })
})

describe('startvy (dagens regler)', () => {
  it('träningsfokus bara utan CV, med testspåret eller valet tester/intervju, och inte med ?cv=1', () => {
    expect(startvy({ cvCount: 0, totalLetters: 0, scope: 'tester', intent: null, visaCv: false }).traningsFokus).toBe(true)
    expect(startvy({ cvCount: 0, totalLetters: 0, scope: null, intent: 'intervju', visaCv: false }).traningsFokus).toBe(true)
    expect(startvy({ cvCount: 0, totalLetters: 0, scope: null, intent: 'intervju', visaCv: true }).traningsFokus).toBe(false)
    expect(startvy({ cvCount: 1, totalLetters: 0, scope: 'tester', intent: null, visaCv: false }).traningsFokus).toBe(false)
    expect(startvy({ cvCount: 0, totalLetters: 0, scope: 'cv', intent: 'tester', visaCv: false }).traningsFokus).toBe(false)
    expect(startvy({ cvCount: 0, totalLetters: 0, scope: null, intent: 'tester', visaCv: false }).testForst).toBe(true)
  })
  it('tillstånden A, B, C', () => {
    expect(startvy({ cvCount: 0, totalLetters: 3, scope: null, intent: null, visaCv: false }).state).toBe('A')
    expect(startvy({ cvCount: 1, totalLetters: 0, scope: null, intent: null, visaCv: false }).state).toBe('B')
    expect(startvy({ cvCount: 1, totalLetters: 1, scope: null, intent: null, visaCv: false }).state).toBe('C')
  })
})
