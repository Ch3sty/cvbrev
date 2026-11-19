import { describe, expect, it } from 'vitest'
import { byggGraf, nastaIndex, paNivaaxeln, periodGranser, synligaPunkter } from '../geometri'
import { PLAN_ALVA, data, punkt } from './testdata'

const bas = (over: Partial<Parameters<typeof byggGraf>[0]> = {}) => {
  const d = data()
  return byggGraf({
    idag: d.idag,
    plan: null,
    provdag: null,
    punkter: d.punkter,
    historikLast: false,
    typVal: 'alla',
    period: 'allt',
    bredd: 'dator',
    ...over,
  })
}

describe('perioder', () => {
  const d = data()
  it('4 veckor: 27 dagar bakåt till i dag', () => {
    expect(periodGranser('4v', { idag: d.idag, plan: null, provdag: null, punkter: d.punkter })).toEqual({ fran: '2026-10-23', till: '2026-11-19' })
  })
  it('4 veckor tar med provdagen när den är nära', () => {
    expect(periodGranser('4v', { idag: d.idag, plan: PLAN_ALVA, provdag: '2026-11-25', punkter: d.punkter }).till).toBe('2026-11-25')
  })
  it('Planen börjar på planens startdag, inte första nivåkollen', () => {
    const g = periodGranser('plan', { idag: d.idag, plan: PLAN_ALVA, provdag: '2026-11-25', punkter: d.punkter })
    expect(g).toEqual({ fran: '2026-11-01', till: '2026-11-25' })
  })
  it('Allt börjar på första punkten', () => {
    expect(periodGranser('allt', { idag: d.idag, plan: null, provdag: null, punkter: d.punkter }).fran).toBe('2026-10-11')
  })
  it('minst en vecka bred', () => {
    const g = periodGranser('allt', { idag: d.idag, plan: null, provdag: null, punkter: [punkt('matris', '2026-11-19', 'nivakoll', 5)] })
    expect(g.fran).toBe('2026-11-13')
  })
  it('Planen utan plan faller tillbaka på Allt', () => {
    expect(bas({ period: 'plan' }).granser.fran).toBe('2026-10-11')
  })
})

describe('markörer och linjer', () => {
  it('nivåkoll är ring, träning punkt, övningsprov fyrkant på tidslinjen', () => {
    const g = bas()
    const former = Object.fromEntries(g.markorer.map((m) => [m.punkt.slag, m.form]))
    expect(former).toEqual({ nivakoll: 'ring', trana: 'punkt', ovningsprov: 'fyrkant' })
    const prov = g.markorer.find((m) => m.punkt.slag === 'ovningsprov')!
    expect(prov.paLinjen).toBe(false)
    expect(prov.y).toBe(g.matt.yTid)
  })

  it('träning utan nivå står på tidslinjen, aldrig på nivåaxeln', () => {
    const p = punkt('talserie', '2026-11-18', 'trana', null)
    const g = bas({ punkter: [...data().punkter, p] })
    const m = g.markorer.find((x) => x.punkt.id === p.id)!
    expect(paNivaaxeln(p)).toBe(false)
    expect(m.y).toBe(g.matt.yTid)
    expect(g.linjer.find((l) => l.typ === 'talserie')).toBeUndefined()
  })

  it('raknas: false ritas inte på linjen', () => {
    const p = punkt('deduktiv', '2026-11-14', 'nivakoll', 5.9, { raknas: false })
    const g = bas({ punkter: [...data().punkter, p] })
    const m = g.markorer.find((x) => x.punkt.id === p.id)!
    expect(m.form).toBe('tomring')
    expect(m.paLinjen).toBe(false)
    const linje = g.linjer.find((l) => l.typ === 'deduktiv')!
    expect(linje.d.split('L').length).toBe(2)
  })

  it('med plan: planens typ i koppar och fram, övriga neutrala', () => {
    const g = bas({ plan: PLAN_ALVA, provdag: '2026-11-25' })
    expect(g.linjer.find((l) => l.typ === 'matris')).toMatchObject({ ton: 'koppar', fram: true })
    expect(g.linjer.find((l) => l.typ === 'deduktiv')).toMatchObject({ ton: 'neutral', fram: false })
    // Planens linje ritas sist.
    expect(g.linjer[g.linjer.length - 1].typ).toBe('matris')
    expect(g.provX).not.toBeNull()
  })

  it('utan plan: seriefärg per typ', () => {
    expect(bas().linjer.every((l) => l.ton === 'serie')).toBe(true)
  })

  it('vald typ tonar ned övriga och gör dem ovalbara', () => {
    const g = bas({ typVal: 'deduktiv' })
    expect(g.linjer.find((l) => l.typ === 'matris')!.dold).toBe(true)
    expect(g.valbara.every((m) => m.punkt.typ === 'deduktiv')).toBe(true)
    expect(g.linjer.find((l) => l.typ === 'deduktiv')!.etikett?.text).toBe('5,3')
  })

  it('gratis: bara senaste punkten per typ', () => {
    const s = synligaPunkter(data().punkter, null, true)
    expect(s.map((p) => `${p.typ} ${p.dag}`)).toEqual(['deduktiv 2026-11-14', 'matris 2026-11-17'])
  })

  it('perioden filtrerar punkterna', () => {
    const g = bas({ period: '4v' })
    expect(g.markorer.every((m) => m.punkt.dag >= '2026-10-23')).toBe(true)
  })

  it('nivåaxeln går 1 till 10 med zonerna', () => {
    const g = bas()
    expect(g.yTicks.map((t) => t.v)).toEqual([1, 4, 7, 10])
    expect(g.zoner.map((z) => z.namn)).toEqual(['grund', 'avancerad', 'expert'])
    expect(g.yTicks[0].y).toBeGreaterThan(g.yTicks[3].y)
  })
})

describe('tangentbordet', () => {
  it('pilar, Home och End', () => {
    expect(nastaIndex(2, 5, 'ArrowRight')).toBe(3)
    expect(nastaIndex(4, 5, 'ArrowRight')).toBe(4)
    expect(nastaIndex(0, 5, 'ArrowLeft')).toBe(0)
    expect(nastaIndex(3, 5, 'Home')).toBe(0)
    expect(nastaIndex(1, 5, 'End')).toBe(4)
    expect(nastaIndex(1, 5, 'a')).toBeNull()
  })
})
