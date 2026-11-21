import { describe, expect, it } from 'vitest'
import type { AttGoraHandling, Bana, TjanstLage } from '@/lib/jobbsok'
import { banaProps, goraMobil, goraTon, tjanstRad, traffUnder } from '../oversikt'
import { nyaBlandBasta, nyaMarke, traffRubrikNya } from '@/lib/rum/nyaTraffar'
import { startvy } from '@/app/dashboard/(oversikt)/startvy'

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
        intervju: { lage: 'bokad', tid: '2026-11-24T09:00:00Z', harKlockslag: true, plats: null, handelseId: 'h', dag: '2026-11-24' },
      }),
      IDAG
    )
    expect(r.text).toBe('Intervjun är på tisdag 10.00.')
    expect(r.status).toEqual({ status: 'intervju', text: 'Intervju bokad' })
    expect(r.steg?.steg).toBe(3)
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
