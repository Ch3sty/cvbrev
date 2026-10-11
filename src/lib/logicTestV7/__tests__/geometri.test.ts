/**
 * G5 och G10 på renderarens konstanter (granskning-figurer.md avsnitt 1 och
 * 5 punkt 7). Måtten ligger i geometri.json och delas med
 * scripts/v7-geometri-check.mjs, som räknar G1 till G12 på bankerna.
 *
 * - G5: minsta storlek på en 360-mobil. Rutnätet ritas i 0,84 px per enhet,
 *   alternativen i 0,56. Kontur, avstånd, prick och längdskillnad räknas i
 *   rutnätets skala, figurens storlek i båda.
 * - G10: informationsbärande kontur och fyllning minst 4,5:1 mot cellens
 *   vita bakgrund, referensramar minst 3:1, och grå fyllning alltid med mörk
 *   kontur.
 */
import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GEOMETRI as G, kontrastkvot } from '../geometri'
import { SvgCellV7 } from '../renderers.v7'
import type { V7Cell } from '../types.v7'

const rita = (cell: V7Cell) => renderToStaticMarkup(React.createElement(SvgCellV7, { cell }))
const px = (enheter: number) => enheter * G.skala360.rutnat

describe('G5: minsta storlek på 360 px', () => {
  it('figuren är minst 56 px i rutnätet och 48 px i alternativen', () => {
    expect(100 * G.skala360.rutnat).toBeGreaterThanOrEqual(G.g5.minFigurRutnatPx)
    expect(100 * G.skala360.alternativ).toBeGreaterThanOrEqual(G.g5.minFigurAlternativPx)
  })

  it('konturen är minst 2 px', () => {
    expect(px(G.kontur.sw)).toBeGreaterThanOrEqual(G.g5.minKonturPx)
  })

  it('den tunna konturen är ett känt gränsfall: 1,68 px, aldrig tunnare', () => {
    // Rutnätens ramar, sektorlinjer och ringkonturer ritas i 2 enheter.
    // Granskningen godkände 1,7 px för ringarna (dubbelt på DPR 2); testet
    // låser att den inte krymper ytterligare.
    expect(px(G.kontur.swThin)).toBeGreaterThanOrEqual(1.6)
  })

  it('minsta fria avstånd (G1) är minst 3 px', () => {
    expect(px(G.regler.minGap)).toBeGreaterThanOrEqual(G.g5.minAvstandPx)
  })

  it('minsta prick är minst 6 px i diameter', () => {
    const radier = [G.stack.prickR, G.lattice.prickR, G.ray.mittR, G.orbital.satellitR, G.dotsorbit.prickR]
    expect(px(2 * Math.min(...radier))).toBeGreaterThanOrEqual(G.g5.minPrickPx)
  })

  it('kort och lång pil skiljer minst 10 px', () => {
    const lang = G.vector.lang.svans - G.vector.lang.spets
    const kort = G.vector.kort.svans - G.vector.kort.spets
    expect(px(lang - kort)).toBeGreaterThanOrEqual(G.g5.minLangdskillnadPx)
  })

  it('balanslinjens grannformer har minst 4 enheters fritt (granskningen 2026-10-11)', () => {
    const B = G.balanceline
    const fritt = B.xs[1] - B.xs[0] - 2 * B.halvbredd - G.kontur.sw
    expect(fritt).toBeGreaterThanOrEqual(G.regler.minGap)
    expect(B.xs[2] - B.xs[1]).toBe(B.xs[1] - B.xs[0])
    expect([B.halvbredd, B.ovanY, B.underY, B.avdelareY]).toEqual([8, 31, 69, [47, 53]])
  })
})

describe('G10: kontrast mot cellens bakgrund', () => {
  const vit = G.farger.bakgrund

  it('kontur och svart fyllning minst 4,5:1', () => {
    expect(kontrastkvot(G.farger.stroke, vit)).toBeGreaterThanOrEqual(G.g10.information)
    expect(kontrastkvot(G.farger.fillBlack, vit)).toBeGreaterThanOrEqual(G.g10.information)
    expect(kontrastkvot(G.farger.vit, G.farger.fillBlack)).toBeGreaterThanOrEqual(G.g10.information)
  })

  it('orbitalens streckade bana är en referensram och klarar 3:1', () => {
    expect(G.farger.orbitalBana).toBe('#64748B')
    expect(kontrastkvot(G.farger.orbitalBana, vit)).toBeGreaterThanOrEqual(G.g10.referensram)
    // den gamla färgen klarade det inte
    expect(kontrastkvot('#94A3B8', vit)).toBeLessThan(G.g10.referensram)
  })

  it('renderaren ritar banan i den färgen', () => {
    expect(rita({ kind: 'orbital', satellite: 0, center: 'filled' })).toContain(`stroke="${G.farger.orbitalBana}"`)
  })

  it('grå fyllning har för låg kontrast ensam och ritas alltid med mörk kontur', () => {
    expect(kontrastkvot(G.farger.fillGray, vit)).toBeLessThan(G.g10.referensram)
    const graa: V7Cell[] = [
      { kind: 'poly', sides: 6, rotation: 0, fill: 'gray' },
      { kind: 'stack', base: 'square', symbol: 'none', baseFill: 'gray' },
      { kind: 'glyph', glyph: 'lambda', fill: 'gray' },
      { kind: 'balanceline', items: [{ shape: 'circle', posX: 0, side: 'above', fill: 'gray' }] },
    ]
    for (const cell of graa) {
      const svg = rita(cell)
      const graElement = svg.match(new RegExp(`<[^>]*fill="${G.farger.fillGray}"[^>]*>`, 'g')) ?? []
      expect(graElement.length, cell.kind).toBeGreaterThan(0)
      for (const e of graElement) expect(e, cell.kind).toContain(`stroke="${G.farger.stroke}"`)
    }
  })
})
