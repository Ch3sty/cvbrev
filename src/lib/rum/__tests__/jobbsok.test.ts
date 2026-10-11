import { describe, expect, it } from 'vitest'
import { arLandning, korsreferens, landningsrum, sparRad, sparRader, soktMeta, type SoktTjanst } from '../jobbsok'
import { JOBBSOK_HEM } from '../copy'

const bas: SoktTjanst = {
  id: 'a',
  company: 'Klarna',
  jobTitle: 'Projektledare',
  status: 'applied',
  days: 3,
  needsFollowUp: false,
  appliedAt: '2026-10-08T10:00:00Z',
  statusAt: '2026-10-08T10:00:00Z',
}

describe('spåret', () => {
  it('placerar intervju på station 2 med kallad-datum', () => {
    const r = sparRad({ ...bas, status: 'interview_invited', statusAt: '2026-10-15T08:00:00Z' })
    expect(r.station).toBe(2)
    expect(r.tyst).toBe(false)
    expect(r.etikett).toBe('kallad 15 okt')
    expect(r.aria).toBe('Klarna på intervju')
  })

  it('en tyst ansökan står vid Sökt med antalet dagar', () => {
    const r = sparRad({ ...bas, days: 16, needsFollowUp: true })
    expect(r.station).toBe(0)
    expect(r.tyst).toBe(true)
    expect(r.etikett).toBe('tyst 16 dagar')
  })

  it('ordnar längst kommen först och räknar resten', () => {
    const { rader, ovriga } = sparRader(
      [
        { ...bas, id: '1', company: 'A' },
        { ...bas, id: '2', company: 'B', status: 'offer_received' },
        { ...bas, id: '3', company: 'C', days: 20, needsFollowUp: true },
        { ...bas, id: '4', company: 'D', status: 'rejected' },
        { ...bas, id: '5', company: 'E' },
      ],
      3
    )
    expect(rader.map((r) => r.namn)).toEqual(['B', 'D', 'C'])
    expect(ovriga).toBe(2)
  })

  it('metaraden säger tystnaden i klartext', () => {
    expect(soktMeta({ ...bas, days: 16, needsFollowUp: true })).toContain('16 dagar')
  })
})

describe('väggens rad', () => {
  it('säger bara det som finns', () => {
    expect(JOBBSOK_HEM.rad({ oppna: 0, svarIGar: 0, intervju: null, tysta: 0, tystastDagar: null })).toBeNull()
    expect(JOBBSOK_HEM.rad({ oppna: 3, svarIGar: 0, intervju: { company: 'Klarna' }, tysta: 1, tystastDagar: 16 })).toBe(
      '3 sökta tjänster pågår. Intervju på Klarna. En har varit tyst i 16 dagar.'
    )
  })
})

describe('korsreferensen', () => {
  it('bjuder in den som aldrig mätt, även när tabellerna saknas', () => {
    expect(korsreferens(null, '2026-10-10').variant).toBe('aldrig_matt')
    expect(korsreferens({ niva: null, provdatum: null, leverantor: null, testtyper: [] }, '2026-10-10').variant).toBe(
      'aldrig_matt'
    )
  })

  it('säger nivån med komma och dagarna till leverantören', () => {
    const k = korsreferens({ niva: 5, provdatum: '2026-10-24', leverantor: 'matrigma', testtyper: ['matris'] }, '2026-10-10')
    expect(k).toEqual({ variant: 'niva', text: 'Nivå 5,0 i figurer och mönster. 14 dagar till Matrigma.' })
  })

  it('använder typen när leverantören saknas och hoppar över passerade datum', () => {
    expect(korsreferens({ niva: 6.4, provdatum: '2026-10-11', leverantor: null, testtyper: ['matris'] }, '2026-10-10').text).toBe(
      'Nivå 6,4 i figurer och mönster. I morgon: logiktestet.'
    )
    expect(korsreferens({ niva: 6.4, provdatum: '2026-10-01', leverantor: null, testtyper: [] }, '2026-10-10').text).toBe(
      'Nivå 6,4 i figurer och mönster.'
    )
  })

  it('säger aldrig poäng', () => {
    const k = korsreferens({ niva: 5.6, provdatum: '2026-10-24', leverantor: null, testtyper: ['matris'] }, '2026-10-10')
    expect(k.text.toLowerCase()).not.toContain('poäng')
  })
})

describe('landningen', () => {
  it('senaste rummet vinner, sedan provdatum, sedan valet', () => {
    expect(landningsrum({ senasteRum: 'cv', harProvdatum: true, intent: 'tester' })).toBe('cv')
    expect(landningsrum({ senasteRum: null, harProvdatum: true, intent: 'brev' })).toBe('tran')
    expect(landningsrum({ senasteRum: null, harProvdatum: false, intent: 'intervju' })).toBe('tran')
    expect(landningsrum({ senasteRum: null, harProvdatum: false, intent: 'brev' })).toBe('brev')
    expect(landningsrum({ senasteRum: 'neutral', harProvdatum: false, intent: null })).toBe('jobb')
    expect(landningsrum({ senasteRum: undefined, harProvdatum: false, intent: undefined })).toBe('jobb')
  })

  it('ett klick inne i appen är ingen landning', () => {
    expect(arLandning(null, 'jobbcoach.ai')).toBe(true)
    expect(arLandning('https://jobbcoach.ai/login', 'jobbcoach.ai')).toBe(true)
    expect(arLandning('https://www.google.com/', 'jobbcoach.ai')).toBe(true)
    expect(arLandning('https://jobbcoach.ai/dashboard/tester', 'jobbcoach.ai')).toBe(false)
    expect(arLandning('https://jobbcoach.ai/dashboard', 'jobbcoach.ai')).toBe(false)
    expect(arLandning('https://jobbcoach.ai/dashboardx', 'jobbcoach.ai')).toBe(true)
  })
})
