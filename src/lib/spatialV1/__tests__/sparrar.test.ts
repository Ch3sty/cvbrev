// @vitest-environment node
/**
 * Spatial förmåga (brief-tester-steg2-2026-11-09.md avsnitt 2): bankerna
 * klarar formernas spärrar och geometrin i riktig SVG, en fixtur per spärr
 * som fälls, urvalet och serverns API.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import { valideraSpatial } from '../../../../scripts/validate-spatial.mjs'
// @ts-ignore ren JavaScript
import * as A from '../../../../scripts/lib/spatial/brick.mjs'
// @ts-ignore ren JavaScript
import * as B from '../../../../scripts/lib/spatial/vikning.mjs'
import { matSpatialBank } from '../svgMatt'
import { valjSpatial, poolFor, FORMER, PER_FORM } from '../select'
import { spatialInnehall, hittaSpatial, bedomSpatialSvar, rattaSpatialSvar } from '../fragor.server'
import type { SpatialFraga } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const bank = (n: string): Q[] => JSON.parse(readFileSync(`src/lib/spatialV1/bank${n}.json`, 'utf8'))
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))
const NIVAER = ['Grund', 'Avancerad', 'Expert']

describe('bankerna', () => {
  it('klarar formernas spärrar', async () => {
    expect(await valideraSpatial()).toEqual([])
  })
  it('klarar geometrin i riktig SVG (G2, G10, V2, V11, V12, formernas mått)', () => {
    for (const n of NIVAER) expect(matSpatialBank(bank(n) as SpatialFraga[]).fel).toEqual([])
  })
})

describe('form A: spärrfixturer', () => {
  const ett = (n = 'Avancerad') => kopia(bank(n).find((q: Q) => q.form === 'A'))
  const fel = (q: Q) => (A.sparrarA(q) as string[]).join('\n')

  it('SP-A1 fäller en figur med rotationssymmetri', () => {
    const q = ett()
    q.referens.cells = [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3]].slice(0, 4) // S-tetromino, 180 grader symmetrisk
    expect(fel(q)).toMatch(/SP-A1/)
  })
  it('SP-A2 fäller en figur med spegelsymmetri', () => {
    const q = ett()
    q.referens.cells = [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]] // V-formen, symmetrisk i diagonalen
    expect(fel(q)).toMatch(/SP-A2/)
  })
  it('SP-A3 fäller två lika alternativ och referensen ovriden', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { ...q.referens }
    expect(fel(q)).toMatch(/SP-A3 ett alternativ är referensen ovriden/)
    q.options[d] = { ...q.options[q.correctAnswer] }
    expect(fel(q)).toMatch(/SP-A3 två alternativ är lika/)
  })
  it('SP-A4 fäller en "flyttad ruta" som blev en spegling', () => {
    const q = ett('Grund')
    const i = q.typer.indexOf('flyttad')
    q.options[i] = { kind: 'brick', n: q.n, ...A.spegla(q.referens, 'vagrat') }
    expect(fel(q)).toMatch(/SP-A4/)
  })
  it('SP-A5 fäller 180 grader på en nästan punktsymmetrisk figur', () => {
    const fig = { cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]] } // Z-pentomino (punktsymmetrisk)
    const q = { ...ett('Grund'), vridning: 180, referens: { kind: 'brick', n: 3, ...fig } }
    expect(fel(q)).toMatch(/SP-A5/)
  })
  it('SP-A6 fäller en distraktor som inte liknar facit på expert', () => {
    const q = kopia(bank('Expert').find((x: Q) => x.form === 'A'))
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = { kind: 'brick', n: 5, cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4]], mark: [0, 0] }
    expect(fel(q)).toMatch(/SP-A6/)
  })
  it('SP-A7 fäller ett L på grund', () => {
    const q = ett('Grund')
    q.referens.cells = [[0, 0], [1, 0], [2, 0], [2, 1]]
    expect(fel(q)).toMatch(/SP-A7/)
  })
  it('facit är en vridning, och spegelbilder går aldrig att vrida tillbaka', () => {
    for (const n of NIVAER) {
      for (const q of bank(n).filter((x: Q) => x.form === 'A')) {
        const vr = A.vridningar(q.referens).map(A.nyckel)
        expect(vr.slice(1)).toContain(A.nyckel(q.options[q.correctAnswer]))
        expect(A.nyckel(A.vrid(q.referens, q.vridning))).toBe(A.nyckel(q.options[q.correctAnswer]))
      }
    }
  })
})

describe('form B: vikningsmotorn och spärrfixturer', () => {
  const ett = (n = 'Avancerad') => kopia(bank(n).find((q: Q) => q.form === 'B'))
  const fel = (q: Q) => (B.sparrarB(q) as string[]).join(' | ')

  it('briefens exempel: nedre halvan upp, högra över vänstra, hål i rad 0 kolumn 1 ger fyra hål', () => {
    const v = [{ typ: 'h', k: 2, flytt: 1 }, { typ: 'v', k: 2, flytt: 1 }]
    const r = B.vik(v)
    const ut = B.uppvik([[0, 1]], v, r.steg.map((s: Q) => s.fore)).slut.map((x: number[]) => x.join(',')).sort()
    expect(ut).toEqual(['0,1', '0,2', '3,1', '3,2'])
  })
  it('framlänges och baklänges ger samma hål för varje uppgift (SP-B0)', () => {
    for (const n of NIVAER) for (const q of bank(n).filter((x: Q) => x.form === 'B')) expect(fel(q), q.id).not.toMatch(/SP-B0|stämmer inte/)
  })
  it('SP-B1 fäller ett hål på en viklinje', () => {
    const q = kopia(bank('Avancerad').find((x: Q) => x.form === 'B' && x.vikningar.some((v: Q) => v.typ === 'd' || v.typ === 'a')) ?? ett())
    const v = q.vikningar.find((x: Q) => x.typ === 'd' || x.typ === 'a')
    if (v) {
      q.sekvens[q.sekvens.length - 1].hal = [v.typ === 'd' ? [v.k > 0 ? v.k : 0, v.k > 0 ? 0 : -v.k] : [0, v.k - 1]]
      expect(fel(q)).toMatch(/SP-B1/)
    }
  })
  it('SP-B3 fäller två lika alternativ', () => {
    const q = ett()
    const d = q.correctAnswer === 0 ? 1 : 0
    q.options[d] = kopia(q.options[q.correctAnswer])
    expect(fel(q)).toMatch(/SP-B3/)
  })
  it('SP-B4 fäller ett facit som är symmetriskt kring en axel som inte vikts', () => {
    const q = kopia(bank('Grund').find((x: Q) => x.form === 'B' && x.vikningar[0].typ === 'v'))
    q.sekvens[1].hal = [[0, q.vikningar[0].flytt === 1 ? 1 : 2]]
    q.options[q.correctAnswer] = { kind: 'ark-ut', n: 4, hal: [[0, 1], [0, 2], [3, 1], [3, 2]], klipp: [] }
    expect(fel(q)).toMatch(/SP-B4|SP-B0|stämmer inte/)
  })
  it('SP-B5 fäller en pil som pekar fel', () => {
    const q = ett()
    q.sekvens[0].pil = [q.sekvens[0].pil[1], q.sekvens[0].pil[0]]
    expect(fel(q)).toMatch(/SP-B5/)
  })
  it('SP-B6 fäller klipp på grund och ett klipp mitt i det vikta arket', () => {
    const g = kopia(bank('Grund').find((x: Q) => x.form === 'B'))
    g.sekvens[g.sekvens.length - 1].klipp = [[0, 0]]
    expect(fel(g)).toMatch(/klipp på grund/)
    const e = kopia(bank('Expert').find((x: Q) => x.form === 'B'))
    e.sekvens[e.sekvens.length - 1].klipp = []
    expect(fel(e)).toMatch(/SP-B6/)
  })
  it('SP-B7 fäller fem rutor i sekvensen', () => {
    const q = kopia(bank('Expert').find((x: Q) => x.form === 'B'))
    q.sekvens.unshift(q.sekvens[0])
    expect(fel(q)).toMatch(/SP-B7/)
  })
  it('papperet får aldrig hänga i ett hörn eller sakna en hel rad', () => {
    expect(B.papperHel([[0, 1], [1, 0]])).toBe(false)
    expect(B.papperHel([[0, 0], [1, 0], [2, 0], [3, 0]])).toBe(false)
    expect(B.papperHel([[3, 1], [3, 2]])).toBe(true)
  })
})

describe('urvalet och API:t', () => {
  it('fem per form, och aldrig två av samma form i följd när flera former finns', () => {
    for (const niva of ['grund', 'avancerad', 'expert'] as const) {
      const former = FORMER.filter((f) => poolFor(niva).some((q) => q.form === f))
      for (let s = 0; s < 100; s++) {
        const u = valjSpatial(niva, `s-${s}`)
        expect(u.length).toBe(PER_FORM * former.length)
        if (former.length > 1) for (let i = 1; i < u.length; i++) expect(u[i].form, `${niva} ${s} ${i}`).not.toBe(u[i - 1].form)
      }
    }
  })
  it('klienten får aldrig facit under testet, och svaren rättas på originalindex', () => {
    const s = { id: 'sess-1', test_type: 'spatial-avancerad', meta: { alternativ_blandade: true, spatial_version: 1 }, completed_at: null }
    const inn = spatialInnehall(s)
    expect(inn.genomgang).toBeNull()
    expect(JSON.stringify(inn.fragor)).not.toMatch(/correctAnswer|misstag|forklaring|typer/)
    const q = hittaSpatial(inn.fragor[0].id)!
    const g = spatialInnehall({ ...s, completed_at: 'nu' }).genomgang![0]
    expect(bedomSpatialSvar(q, s.id, true, g.rattVisat)?.correct).toBe(true)
    const sel = bedomSpatialSvar(q, s.id, true, g.rattVisat)!.selected
    expect(rattaSpatialSvar([{ q_id: q.id, selected: sel }])).toBe(1)
  })
})
