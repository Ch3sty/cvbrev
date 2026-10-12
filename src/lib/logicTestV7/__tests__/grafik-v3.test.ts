/**
 * Grafik v3 (docs/design/tester-v2-2026-10-11/grafik-v3-spec.md avsnitt 10),
 * V1 till V12 på renderarens riktiga utdata och geometri.json. Samma mätning
 * (svgMatt.tsx) körs av scripts/v7-geometri-check.mjs på alla banker.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GEOMETRI as G } from '../geometri'
import type { LayeredQuestion } from '../layered.v7'
import { FigurV7, LuckaV7 } from '../layered.v7'
import {
  allaPrimitiver,
  FORBJUDNA,
  luckaFel,
  matBank,
  MAX_BYTES_PER_FRAGA,
  MAX_NODER_PER_FRAGA,
  primitivSvg,
  ramFel,
  samaYtaFel,
  taggar,
} from '../svgMatt'

const BANKER = [
  'questionBankGrund.v7.json',
  'questionBank.v7.json',
  'questionBankExpert.v7.json',
  'questionBankGrund3c.v7.json',
  'questionBankAvancerad3c.v7.json',
  'questionBankExpert3c.v7.json',
].map((f) => JSON.parse(readFileSync(path.join(__dirname, '..', f), 'utf8')) as LayeredQuestion[])

describe('V1 och V4: yttermått och symbolens centrum', () => {
  it('grundformerna har yttermåttet 60 till 64', () => {
    const S = G.stack
    const bredd = (p: number[][]) => Math.max(...p.map((x) => x[0])) - Math.min(...p.map((x) => x[0]))
    for (const m of [2 * S.cirkelR, S.kvadrat.bredd, bredd(S.triangel), bredd(S.romb)]) {
      expect(m).toBeGreaterThanOrEqual(G.regler.yttermatt[0])
      expect(m).toBeLessThanOrEqual(G.regler.yttermatt[1])
    }
  })

  it('blocken, ringarna, hjulet och orbitalen ligger i fönstret', () => {
    const [lo, hi] = G.regler.yttermatt
    const matt = [
      3 * G.tile.ruta + 2 * G.tile.gap,
      2 * G.lattice.ruta + G.lattice.gap,
      2 * G.ring.radier['3'][0],
      2 * G.sectorwheel.radie,
      2 * (G.orbital.banaR + G.orbital.satellitR),
      2 * G.ray.langd,
      2 * G.poly.radie,
    ]
    for (const m of matt) {
      expect(m).toBeGreaterThanOrEqual(lo)
      expect(m).toBeLessThanOrEqual(hi)
    }
  })

  it('symbolen i triangeln står i tyngdpunkten, plus och minus som offset', () => {
    const ty = G.stack.triangel.reduce((a, p) => a + p[1] / 3, 0)
    expect(Math.abs(G.stack.symbolCentrum.triangle[1] - ty)).toBeLessThanOrEqual(0.5)
    const svg = primitivSvg({ kind: 'stack', base: 'triangle', symbol: 'dot', baseFill: 'none' })
    expect(svg).toContain(`cy="${G.stack.symbolCentrum.triangle[1]}"`)
    const plus = primitivSvg({ kind: 'stack', base: 'triangle', symbol: 'plus', baseFill: 'none' })
    expect(plus).toContain(`y1="${G.stack.symbolCentrum.triangle[1] - 10}"`)
  })
})

describe('V2: ingen linje under 2,5', () => {
  it('alla konturer i figurerna är minst 2,5, luckan minst 2', () => {
    for (const v of [G.kontur.sw, G.kontur.swThin, G.kontur.ram, G.orbital.banaSw, G.ring.skiljelinje, G.lattice.symbolSw]) {
      expect(v).toBeGreaterThanOrEqual(2.5)
    }
    expect(G.lucka.sw).toBeGreaterThanOrEqual(2)
  })

  it('ingen renderad stroke-width under 2,5 i någon primitiv', () => {
    for (const c of allaPrimitiver()) {
      for (const t of taggar(primitivSvg(c))) {
        const m = /stroke-width="([\d.]+)"/.exec(t)
        if (m) expect(Number(m[1]), `${c.kind}: ${t}`).toBeGreaterThanOrEqual(2.5)
      }
    }
  })
})

describe('V5 och V6: ram-grått och tomma rutor', () => {
  it('ram-grått sitter bara på banan, tomma rutor och luckan', () => {
    expect(allaPrimitiver().flatMap(ramFel)).toEqual([])
  })

  it('tom och fylld ruta har samma målade yta i tile och lattice', () => {
    expect(samaYtaFel()).toEqual([])
  })

  it('fylld ruta i tile är bläck med bläckkontur', () => {
    const fylld = taggar(primitivSvg({ kind: 'tile', pattern: 1 })).filter((t) => t.startsWith('<rect'))[0]
    expect(fylld).toContain(`fill="${G.farger.fillBlack}"`)
    expect(fylld).toContain(`stroke="${G.farger.stroke}"`)
  })
})

describe('V7: orbitalens prickade bana', () => {
  it('36 jämna prickar med runda ändar', () => {
    const steg = G.orbital.banaStreck.split(' ').map(Number).reduce((a, b) => a + b, 0)
    expect((2 * Math.PI * G.orbital.banaR) / steg).toBeCloseTo(36, 1)
    const svg = primitivSvg({ kind: 'orbital', center: 'filled', satellite: 0 })
    expect(svg).toContain(`stroke-dasharray="${G.orbital.banaStreck}"`)
    expect(svg).toContain('stroke-linecap="round"')
  })
})

describe('V9: en skala i matris och svar', () => {
  it('rutnät och alternativ har samma skala, figuren minst 80 px på 360', () => {
    expect(G.skala360.rutnat).toBe(G.skala360.alternativ)
    expect(100 * G.skala360.alternativ).toBeGreaterThanOrEqual(80)
  })

  it('figuren ritas med 10 procent luft per sida, 80 procent av rutan', () => {
    const svg = renderToStaticMarkup(React.createElement(FigurV7, { cell: { kind: 'ray', rays: [0] } }))
    expect(svg).toContain('padding:10%')
  })
})

describe('V10: luckan', () => {
  it('ingen text, frågetecknet och pricken ur geometri.json, aldrig koppar', () => {
    expect(luckaFel()).toEqual([])
    const svg = renderToStaticMarkup(React.createElement(LuckaV7))
    expect(svg).not.toMatch(/<text/)
    expect(svg).toContain(`stroke="${G.farger.ram}"`)
  })
})

describe('V11 och V12: noder, bytes och förbjudna element över alla valbara frågor', () => {
  const matt = BANKER.map(matBank)

  it('252 valbara frågor mäts', () => {
    expect(matt.reduce((a, b) => a + b.fragor, 0)).toBeGreaterThan(200)
  })

  it(`högst ${MAX_NODER_PER_FRAGA} svg-noder och ${MAX_BYTES_PER_FRAGA / 1024} kB per fråga`, () => {
    for (const b of matt) {
      expect(b.over).toEqual([])
      expect(b.noder.max).toBeLessThanOrEqual(MAX_NODER_PER_FRAGA)
      expect(b.bytes.max).toBeLessThanOrEqual(MAX_BYTES_PER_FRAGA)
    }
  })

  it(`inga ${FORBJUDNA.join(', ')} och inga url(-referenser`, () => {
    for (const b of matt) expect(b.forbjudna).toEqual([])
  })
})
