import { describe, expect, it } from 'vitest'
import { dokumentVag, fyndUrAnalys, poangUrAnalys, type AnalysUnderlag } from '../cvRum'

const bas: AnalysUnderlag = {
  cvId: 'cv1',
  klar: '2026-10-10T10:00:00Z',
  namn: 'Projektledare, Scania',
  poang: 72,
  profil: { atsImpact: 9 },
  roller: [
    { roleTitle: 'Projektledare', company: 'Scania', atsImpact: 5 },
    { roleTitle: 'Koordinator', company: 'Volvo', atsImpact: 0 },
  ],
  kompetenser: [
    { skill: 'SAP', atsImpact: 4 },
    { skill: 'Agil projektledning', atsImpact: 3 },
  ],
  allmant: [{ title: 'Datumformat', description: 'Blandade format.', atsImpact: 2 }],
}

describe('fynden', () => {
  it('är analysens egna atsImpact, i ordning, utan nollor', () => {
    const f = fyndUrAnalys(bas)
    expect(f.map((x) => [x.titel, x.plus])).toEqual([
      ['Sammanfattningen', 9],
      ['Kompetenser mot kravprofilen', 7],
      ['Projektledare, Scania', 5],
      ['Datumformat', 2],
    ])
  })

  it('hittar inte på något när analysen saknas eller är tom', () => {
    expect(fyndUrAnalys(null)).toEqual([])
    expect(
      fyndUrAnalys({ ...bas, profil: null, roller: null, kompetenser: [{ skill: 'x', atsImpact: 'nej' }], allmant: [] })
    ).toEqual([])
  })

  it('poängen hålls mellan 0 och 100', () => {
    expect(poangUrAnalys(bas)).toBe(72)
    expect(poangUrAnalys({ ...bas, poang: 140 })).toBe(100)
    expect(poangUrAnalys(null)).toBeNull()
  })
})

describe('dokumentets väg', () => {
  it('utkast och analyserat klart, åtgärdat nästa', () => {
    const v = dokumentVag({ harCv: true, analyseradAt: '2026-10-10T10:00:00Z', cvAndradAt: '2026-10-10T10:00:30Z', nedladdatAt: null })
    expect(v.map((c) => c.status)).toEqual(['gjord', 'gjord', 'nu', 'kvar'])
  })

  it('åtgärdat när CV:t ändrats efter analysen, nedladdat efter ändringen', () => {
    const v = dokumentVag({
      harCv: true,
      analyseradAt: '2026-10-10T10:00:00Z',
      cvAndradAt: '2026-10-10T12:00:00Z',
      nedladdatAt: '2026-10-10T13:00:00Z',
    })
    expect(v.map((c) => c.status)).toEqual(['gjord', 'gjord', 'gjord', 'gjord'])
  })

  it('en nedladdning före ändringen räknas inte', () => {
    const v = dokumentVag({
      harCv: true,
      analyseradAt: '2026-10-10T10:00:00Z',
      cvAndradAt: '2026-10-10T12:00:00Z',
      nedladdatAt: '2026-10-10T11:00:00Z',
    })
    expect(v[3].status).toBe('nu')
  })
})
