// @vitest-environment node
/**
 * Talseriernas spärrar TS1 till TS10 på de skarpa bankerna, en fixtur per
 * spärr som fälls, lösaren mot kända rader, urvalets familjetak och radens
 * bredd på 360 (brief-tester-steg2-2026-11-09.md avsnitt 3).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { sparrFel } from '../../../../scripts/lib/talserie/sparrar.mjs'
// @ts-ignore ren JavaScript
import { entydighet, forutsagelser } from '../../../../scripts/lib/talserie/losare.mjs'
// @ts-ignore ren JavaScript
import { valideraTalserier } from '../../../../scripts/validate-talserier.mjs'
import { valjTalserier, poolFor, MAX_PER_FAMILJ } from '../select'
import { talserieInnehall, bedomTalserieSvar, rattaTalserieSvar, hittaTalserie } from '../fragor.server'
import { TALRAD, rutbreddFor, visaTal } from '../layout'
import type { TalserieFraga } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/talserierV1/bank${n}.json`, 'utf8'))
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))

describe('talseriernas banker', () => {
  it('klarar TS1 till TS10 och har minst 60 uppgifter per nivå', () => {
    expect(valideraTalserier()).toEqual([])
    for (const n of ['Grund', 'Avancerad', 'Expert']) expect(bank(n).length).toBeGreaterThanOrEqual(60)
  })

  it('facit är deterministiskt: generatorns regel i lösaren ger facit', () => {
    for (const n of ['Grund', 'Avancerad', 'Expert']) {
      for (const q of bank(n)) expect(entydighet(q.visade, q.options[q.correctAnswer]).traffar.length, q.id).toBeGreaterThan(0)
    }
  })
})

describe('lösaren (TS1)', () => {
  it('känner igen briefens exempel', () => {
    const svar = (v: number[], k: number) => forutsagelser(v, k).filter((f: Q) => f.heltal).map((f: Q) => f.varden.join(','))
    expect(svar([4, 9, 14, 19, 24], 1)).toContain('29')
    expect(svar([3, 6, 12, 24, 48], 1)).toContain('96')
    expect(svar([2, 3, 5, 8, 12], 1)).toContain('17')
    expect(svar([2, 50, 4, 45, 6, 40], 2)).toContain('8,35')
    expect(svar([5, 6, 8, 12, 20, 36], 2)).toContain('68,132')
    expect(svar([1, 3, 7, 15, 31, 63], 2)).toContain('127,255')
    expect(svar([2, 5, 7, 12, 19, 31], 2)).toContain('50,81')
    expect(svar([3, 100, 6, 90, 12, 80], 2)).toContain('24,70')
  })

  it('stryker en rad som två regler förklarar olika', () => {
    // Ren dubbling är entydig. 1, 2, 4, 7, 11, 16 är kvadratisk (22) men inte 21.
    const e = entydighet([2, 4, 8, 16, 32], [64])
    expect(e.andra).toEqual([])
    const tvetydig = entydighet([1, 2, 4, 7, 11, 16], [21])
    expect(tvetydig.andra.length).toBeGreaterThan(0) // kvadratisk ger 22
  })
})

describe('spärrfixturer', () => {
  const ett = () => kopia(bank('Avancerad')[0])
  const fel = (q: Q) => (sparrFel(q) as string[]).join('\n')

  it('TS1 fäller ett facit som ingen regel ger', () => {
    const q = ett()
    q.options[q.correctAnswer] = [q.options[q.correctAnswer][0] + 1000, 3]
    expect(fel(q)).toMatch(/TS1/)
  })
  it('TS2 fäller fyra visade tal', () => {
    const q = kopia(bank('Grund')[0])
    q.visade = q.visade.slice(0, 4)
    expect(fel(q)).toMatch(/TS2/)
  })
  it('TS3 fäller ett alternativ med ett visat tal', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = [q.visade[2], q.options[d][1]]
    expect(fel(q)).toMatch(/TS3/)
  })
  it('TS4 fäller en nästan konstant rad', () => {
    const q = kopia(bank('Grund')[0])
    q.visade = [5, 6, 5, 6, 5]
    expect(fel(q)).toMatch(/TS4/)
  })
  it('TS5 fäller en distraktor utan typ', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.typer[d] = ['slump']
    expect(fel(q)).toMatch(/TS5/)
  })
  it('TS6 fäller ett tal med fem tecken', () => {
    const q = kopia(bank('Expert')[0])
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = [-1999, q.options[d][1]]
    expect(fel(q)).toMatch(/TS6/)
  })
  it('TS7 fäller två luckor utan "rätt första, fel andra"', () => {
    const q = ett()
    const f = q.options[q.correctAnswer]
    q.options = q.options.map((o: number[], i: number) => (i !== q.correctAnswer && o[0] === f[0] ? [o[0] + 977, o[1]] : o))
    expect(fel(q)).toMatch(/TS7/)
  })
})

describe('urvalet', () => {
  it('drar 15 med högst fem per familj, samma urval för samma session', () => {
    for (const niva of ['grund', 'avancerad', 'expert'] as const) {
      for (let s = 0; s < 200; s++) {
        const u = valjTalserier(niva, `session-${s}`)
        expect(u.length).toBe(15)
        const per = new Map<string, number>()
        for (const q of u) per.set(q.family, (per.get(q.family) ?? 0) + 1)
        expect(Math.max(...per.values())).toBeLessThanOrEqual(MAX_PER_FAMILJ)
      }
      expect(valjTalserier(niva, 'x').map((q) => q.id)).toEqual(valjTalserier(niva, 'x').map((q) => q.id))
      expect(poolFor(niva).length).toBeGreaterThanOrEqual(60)
    }
  })

  it('klienten får aldrig facit under testet, och rättningen räknar om mot banken', () => {
    const s = { id: 'abc', test_type: 'talserier-expert', meta: { talserie_version: 1 }, completed_at: null }
    const inn = talserieInnehall(s)
    expect(inn.fragor.length).toBe(15)
    expect(inn.genomgang).toBeNull()
    expect(JSON.stringify(inn.fragor)).not.toMatch(/correctAnswer|misstag|regel/)
    const q = hittaTalserie(inn.fragor[0].id) as TalserieFraga
    expect(bedomTalserieSvar(q, q.correctAnswer)?.correct).toBe(true)
    expect(bedomTalserieSvar(q, 7)).toBeNull()
    expect(rattaTalserieSvar([{ q_id: q.id, selected: q.correctAnswer }])).toBe(1)
    expect(talserieInnehall({ ...s, completed_at: 'nu' }).genomgang?.length).toBe(15)
  })
})

describe('radens bredd på 360 (briefen avsnitt 3, Mäts)', () => {
  it('åtta rutor med fyra tecken ryms på 328 px, högst 38 px per ruta', () => {
    expect(rutbreddFor(TALRAD.maxTecken)).toBeLessThanOrEqual(TALRAD.ruta360)
    expect(TALRAD.maxRutor * TALRAD.ruta360 + (TALRAD.maxRutor - 1) * TALRAD.luft).toBeLessThanOrEqual(TALRAD.bredd360)
  })
  it('inget tal i bankerna har fler än fyra tecken, minustecknet inräknat', () => {
    for (const n of ['Grund', 'Avancerad', 'Expert']) {
      for (const q of bank(n)) for (const x of [...q.visade, ...q.options.flat()]) expect(visaTal(x).length, q.id).toBeLessThanOrEqual(4)
    }
  })
})
