import { describe, expect, it } from 'vitest'
import {
  deltester,
  deltesterForPlan,
  mittTestNamn,
  mittTestUrPlan,
  passForDag,
  planFranVal,
  upplagg,
} from '../mittTest'
import { validerPlan } from '../testplan'
import { baraPersonlighet } from '../rubrik'

describe('Mitt test är …', () => {
  it('gamla planer utan mitt_test läses ur leverantör och typer', () => {
    expect(mittTestUrPlan({ leverantor: 'matrigma', testtyper: ['matris'] })).toBe('matrigma')
    expect(mittTestUrPlan({ leverantor: null, testtyper: ['personlighet'] })).toBe('personlighet')
    expect(mittTestUrPlan({ leverantor: null, testtyper: ['verbal', 'matris'] })).toBe('annat')
    expect(mittTestUrPlan({ leverantor: null, testtyper: [] })).toBeNull()
    expect(mittTestUrPlan(null)).toBeNull()
  })

  it('valet skriver leverantör, variant och typer så att äldre läsare ser planen', () => {
    expect(planFranVal('lokforare', null, [])).toMatchObject({
      mitt_test: 'lokforare',
      leverantor: 'aon',
      testtyper: ['verbal', 'numerisk'],
      extra_typer: ['figurserie', 'deduktiv'],
    })
    expect(planFranVal('matrigma', 'adaptiv', [])).toMatchObject({ leverantor: 'matrigma', variant: 'adaptiv', mitt_test_variant: 'adaptiv', testtyper: ['matris'] })
    expect(planFranVal('iprov', 'polis', [])).toMatchObject({ leverantor: null, variant: null, mitt_test_variant: 'polis', testtyper: [] })
    expect(planFranVal('annat', null, ['figurserie', 'verbal'])).toMatchObject({ leverantor: 'annat', testtyper: ['verbal'], extra_typer: ['figurserie'] })
    // Annat utan kryss: figurer och mönster.
    expect(planFranVal('annat', null, []).testtyper).toEqual(['matris'])
  })

  it('validerPlan tar de nya fälten och avvisar okända värden', () => {
    const p = planFranVal('shl', null, [])
    const v = validerPlan({ ...p, provdatum: null }, '2026-11-09')
    expect(v.ok).toBe(true)
    if (v.ok) expect(v.data).toMatchObject({ mitt_test: 'shl', extra_typer: ['deduktiv', 'figurserie'] })
    expect(validerPlan({ mitt_test: 'tullen' }, '2026-11-09').ok).toBe(false)
    expect(validerPlan({ mitt_test_variant: 'chef' }, '2026-11-09').ok).toBe(false)
    expect(validerPlan({ extra_typer: ['matris'] }, '2026-11-09').ok).toBe(false)
  })

  it('deltesterna följer valet och visar bara typer som finns', () => {
    expect(deltester('shl')).toEqual(['numerisk', 'deduktiv', 'figurserie', 'verbal'])
    expect(deltester('alva')).toEqual(['matris'])
    expect(deltester('annat', [])).toEqual(['matris'])
    expect(deltesterForPlan({ mitt_test: 'annat', testtyper: ['verbal'], extra_typer: ['deduktiv'] })).toEqual(['deduktiv', 'verbal'])
  })

  it('rotationen ger samma typ för samma datum och går runt', () => {
    const typer = ['verbal', 'numerisk', 'figurserie'] as const
    expect(passForDag(typer, '2026-11-02', '2026-11-02')).toBe('verbal')
    expect(passForDag(typer, '2026-11-02', '2026-11-03')).toBe('numerisk')
    expect(passForDag(typer, '2026-11-02', '2026-11-05')).toBe('verbal')
    expect(passForDag([], '2026-11-02', '2026-11-05')).toBeNull()
  })

  it('namnet i raden Mitt test', () => {
    expect(mittTestNamn('iprov', 'polis')).toBe('Polisen, I-provet')
    expect(mittTestNamn('iprov', null)).toBe('I-provet')
    expect(mittTestNamn('shl')).toBe('SHL Verify')
  })

  it('Så lägger vi upp det: passen, provet och Alla tester, utan talstreck', () => {
    const r = upplagg('lokforare', [], 'Figurserier, 20 uppgifter på 5 minuter.')
    expect(r.map((x) => x.nyckel)).toEqual(['passen', 'provet', 'alla'])
    expect(r[0].text).toBe('Figurserier, text, siffror och deduktivt i tur och ordning, i Aons tempo.')
    expect(r[2].text).toBe('Dina fyra deltester överst, resten under Fler tester.')
    for (const x of r) expect(x.text).not.toMatch(/[—·]/)
  })

  it('bara personlighet räknar figurserier och deduktivt som kognitiva', () => {
    expect(baraPersonlighet(['personlighet'])).toBe(true)
    expect(baraPersonlighet(['personlighet', 'figurserie'])).toBe(false)
  })
})
