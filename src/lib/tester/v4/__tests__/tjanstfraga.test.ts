/**
 * Kortet "Vilken tjänst gäller provet?" på testernas Hem (Jobbsöket omgång 2,
 * byggspec 9.14 och 9.19): grinden, varianterna och Hoppa över.
 */
import { describe, expect, it } from 'vitest'
import { arHoppad, tjanstfraga, tjanstfragaNyckel } from '../tjanstfraga'
import { fixturTester } from '../fixturer'
import type { TesterV4Data } from '../typer'

/** Grundfallet: gratis, slutförd Nivåkoll, dagens grundnivå kvar, ingen sökt tjänst, plan med datum. */
function grund(over: Partial<TesterV4Data> = {}): TesterV4Data {
  const d = fixturTester('b', 'gratis')
  return {
    ...d,
    dagens: { ...d.dagens, forstaSteget: false, knapp: { ...d.dagens.knapp, las: null } },
    gratis: { ...d.gratis, premium: false, grundKvarIdag: 1 },
    tjanstfraga: { harNivakoll: true, harSoktTjanst: false },
    ...over,
  }
}

describe('tjanstfraga: grinden', () => {
  it('ger ett kort i grundfallet', () => {
    const d = grund()
    expect(d.plan).not.toBeNull()
    expect(tjanstfraga(d, false)).toEqual({ variant: 'plan', fran: 'test-hem-plan', nyckel: tjanstfragaNyckel(d.plan) })
  })

  it('1. i appen: null, alltid', () => {
    expect(tjanstfraga(grund(), true)).toBeNull()
    expect(tjanstfraga(grund({ plan: null }), true)).toBeNull()
  })

  it('2. utan underlag eller utan slutförd Nivåkoll: null', () => {
    expect(tjanstfraga(grund({ tjanstfraga: undefined }), false)).toBeNull()
    expect(tjanstfraga(grund({ tjanstfraga: { harNivakoll: false, harSoktTjanst: false } }), false)).toBeNull()
  })

  it('3. med en sökt tjänst: null', () => {
    expect(tjanstfraga(grund({ tjanstfraga: { harNivakoll: true, harSoktTjanst: true } }), false)).toBeNull()
  })

  it('4. vid första steget: null', () => {
    const d = grund()
    expect(tjanstfraga({ ...d, dagens: { ...d.dagens, forstaSteget: true } }, false)).toBeNull()
  })

  it('5. väggens knapp är en köpknapp: null, också när Gratisraden inte ritas', () => {
    const d = grund()
    expect(d.gratis.grundKvarIdag).toBe(1)
    const las = { ...d, dagens: { ...d.dagens, knapp: { ...d.dagens.knapp, las: { skal: 'premium' as const, chip: 'Ingår i Premium' } } } }
    expect(tjanstfraga(las, false)).toBeNull()
  })

  it('6. Gratisraden ritas: null', () => {
    const d = grund()
    expect(tjanstfraga({ ...d, gratis: { ...d.gratis, grundKvarIdag: 0 } }, false)).toBeNull()
    // Premium har ingen gratisrad.
    expect(tjanstfraga({ ...d, gratis: { ...d.gratis, premium: true, grundKvarIdag: 0 } }, false)).not.toBeNull()
  })
})

describe('tjanstfraga: varianterna', () => {
  it('utan plan: utan_plan och test-hem, nyckeln ingen', () => {
    expect(tjanstfraga(grund({ plan: null }), false)).toEqual({ variant: 'utan_plan', fran: 'test-hem', nyckel: 'ingen' })
  })

  it('med plan: plan och test-hem-plan', () => {
    const d = grund()
    const plan = { ...d.plan!, provdatum: '2026-11-26', dagarKvar: 5 }
    expect(tjanstfraga({ ...d, plan }, false)).toEqual({ variant: 'plan', fran: 'test-hem-plan', nyckel: `${plan.mittTest}|2026-11-26` })
  })

  it('plan utan datum: plan', () => {
    const d = grund()
    const plan = { ...d.plan!, provdatum: null, dagarKvar: null }
    expect(tjanstfraga({ ...d, plan }, false)).toEqual({ variant: 'plan', fran: 'test-hem-plan', nyckel: `${plan.mittTest}|` })
  })

  it('passerat datum: plan_passerad', () => {
    const d = grund()
    const plan = { ...d.plan!, provdatum: '2026-11-18', dagarKvar: -3 }
    expect(tjanstfraga({ ...d, plan }, false)?.variant).toBe('plan_passerad')
  })
})

describe('arHoppad', () => {
  it('samma nyckel ja', () => expect(arHoppad('alva|2026-11-26', 'alva|2026-11-26')).toBe(true))
  it('annat prov nej', () => expect(arHoppad('alva|2026-11-26', 'matrigma|2026-11-26')).toBe(false))
  it('ändrat datum nej', () => expect(arHoppad('alva|2026-11-26', 'alva|2026-12-03')).toBe(false))
  it('första datumet på samma prov ja', () => expect(arHoppad('alva|', 'alva|2026-11-26')).toBe(true))
  it("'ingen' mot en plan nej", () => expect(arHoppad('ingen', 'alva|2026-11-26')).toBe(false))
  it('null nej', () => expect(arHoppad(null, 'ingen')).toBe(false))
  it('tjanstfragaNyckel', () => {
    expect(tjanstfragaNyckel(null)).toBe('ingen')
    expect(tjanstfragaNyckel({ mittTest: 'alva' as never, provdatum: null })).toBe('alva|')
  })
})
