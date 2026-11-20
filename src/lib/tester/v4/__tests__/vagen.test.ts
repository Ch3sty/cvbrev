import { describe, expect, it } from 'vitest'
import { fixturTester } from '../fixturer'
import { byggVaggBana, VAGEN_MAX, VAGG_PLATSER } from '../vagen'

describe('vagen.ts (omgång 3, steg 3a)', () => {
  it('dagens träning med plan: provets del, en befintlig adress, ett stort tal med dagar kvar', () => {
    const d = fixturTester('b', 'premium')
    expect(d.plan?.typer).toContain(d.dagens.typ)
    expect(d.dagens.knapp.href.startsWith('/dashboard/tester')).toBe(true)
    if (d.plan?.dagarKvar && d.plan.dagarKvar > 0) expect(d.dagens.stort?.tal).toBe(d.plan.dagarKvar)
    expect(d.dagens.rubrik).not.toMatch(/\bpass\b/i)
  })

  it('gratis: Träna står låst eller ersätts av det som är öppet', () => {
    const d = fixturTester('b', 'gratis')
    if (d.dagens.slag === 'trana') expect(d.dagens.knapp.las).not.toBeNull()
    else expect(d.dagens.knapp.las).toBeNull()
  })

  it('vägen: ett kort per dag från i dag, högst sex, provdagen sist', () => {
    const d = fixturTester('b', 'premium')
    expect(d.vagen.length).toBeLessThanOrEqual(VAGEN_MAX)
    expect(d.vagen[0].dag).toBe(d.idag)
    expect(d.vagen[0].slag).toBe('idag')
    expect(d.vagen.at(-1)?.slag).toBe('prov')
    expect(d.vagen.at(-1)?.dag).toBe(d.plan?.provdatum)
    const dagar = d.vagen.map((v) => v.dag)
    expect(new Set(dagar).size).toBe(dagar.length)
    for (const v of d.vagen) if (v.slag !== 'prov') expect(v.href).toBeTruthy()
  })

  it('utan plan: vägen slutar i Har du ett prov, banan i provdagen när du vet den', () => {
    const d = fixturTester('a', 'premium')
    if (d.vagen.length) expect(d.vagen.at(-1)?.slag).toBe('valfritt')
    expect(d.vaggBana.at(-1)?.status).toBe('prov_okand')
    expect(d.vaggBana.length).toBe(VAGG_PLATSER)
  })

  it('banan utan plan ritas ur aktivaDagar: dagarna i rad bakåt, högst tre', () => {
    const b = byggVaggBana({
      idag: '2026-11-20',
      plan: null,
      bana: [],
      aktivaDagar: ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-10'],
      dagsmal: { mal: null, gjortIdag: 0, dagarIRad: 3 },
    })
    expect(b.slice(0, 3).map((n) => n.status)).toEqual(['gjord', 'gjord', 'gjord'])
    expect(b[3]).toEqual({ dag: '2026-11-20', status: 'idag' })
    expect(b.at(-1)?.status).toBe('prov_okand')
    const ny = byggVaggBana({ idag: '2026-11-20', plan: null, bana: [], aktivaDagar: [], dagsmal: { mal: null, gjortIdag: 0, dagarIRad: 0 } })
    expect(ny[0].status).toBe('idag')
  })

  it('banan med plan: provdagen som flagga, banans förslag på sina dagar', () => {
    const d = fixturTester('b', 'premium')
    const flagga = d.vaggBana.at(-1)!
    expect(flagga.status).toBe('prov')
    expect(flagga.dag).toBe(d.plan?.provdatum)
    for (const n of d.vaggBana.filter((x) => x.forslag)) expect(d.bana.find((b) => b.dag === n.dag)?.forslag).toBe(n.forslag)
  })
})
