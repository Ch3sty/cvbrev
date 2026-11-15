// scripts/artikelbild/figurer.tsx
// =============================================================================
// Testuppgifterna i artikelbilden, ritade med testernas egna ritare (FigurV7,
// LuckaV7 och SpatialSvg) till SVG-text i 0-100-rymden som mall.mjs placerar.
//
// Uppgifterna tas bara ur src/lib/artikelfigurer/*.json: artiklarnas egna och
// bildernas egna (bild-matriser.json, bild-serier.json, byggda av
// gen-uppgifter.mjs). De skarpa bankerna läses aldrig, utom i --exempel-läget
// som återskapar art-directors godkända exempel för jämförelse.
// =============================================================================

import React from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { SvgLayeredCell, type LayeredCell } from '../../src/lib/logicTestV7/layered.v7'
import { SpatialSvg } from '../../src/lib/spatialV1/ritare'

const DIR = 'src/lib/artikelfigurer/'
const las = (f: string) => JSON.parse(readFileSync(DIR + f, 'utf8')) as any[]

/**
 * Strecken i figurerna görs tjockare i bilden: ritaren är byggd för en ruta om
 * cirka 100 px, i bilden är rutan 176 px och läses ner till 40 px i en 360 px
 * bred miniatyr. Rutblocken (tile) har redan tjocka fält och lämnas som de är.
 */
const TJOCKLEK = 1.7
const tjock = (svg: string, k: number) => svg.replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${+(+w * k).toFixed(2)}"`)
const arTile = (c: LayeredCell) => (Array.isArray(c) ? c : [c]).every((p: any) => p.kind === 'tile')
const cell = (c: LayeredCell) => tjock(renderToStaticMarkup(<SvgLayeredCell cell={c} />), arTile(c) ? 1 : TJOCKLEK)
const spatial = (f: any) => renderToStaticMarkup(<SpatialSvg fig={f} />).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')

export type Uppgift =
  | { id: string; typ: 'matris'; kolumner: number; celler: (string | null)[]; fil: string }
  | { id: string; typ: 'serie'; celler: (string | null)[]; fil: string }
  | { id: string; typ: 'spatial'; steg: string[]; fil: string }
  | { id: string; typ: 'talserie'; visade: number[]; luckor: number; fil: string }
  | { id: string; typ: 'ord'; ord: string; ordTyp: string; options: string[]; fil: string }

/** Alla uppgifts-id som får användas i en bild, med filen de kommer ur. */
export function allaUppgifter(exempel = false): Map<string, () => Uppgift> {
  const m = new Map<string, () => Uppgift>()
  const matris = (fil: string, q: any) => () => ({ id: q.id, typ: 'matris' as const, kolumner: q.grid[0].length, celler: q.grid.flat().map((c: any) => (c ? cell(c) : null)), fil })
  const serie = (fil: string, q: any) => () => ({ id: q.id, typ: 'serie' as const, celler: [...q.rad.map(cell), null], fil })
  for (const f of ['matriser.json', 'analogier.json', 'bild-matriser.json']) for (const q of las(f)) m.set(q.id, matris(f, q))
  for (const f of ['serier.json', 'bild-serier.json']) for (const q of las(f)) m.set(q.id, serie(f, q))
  for (const q of las('spatial.json')) {
    m.set(q.id, () => {
      const steg = q.sekvens?.length ? q.sekvens : q.referens ? [q.referens] : []
      return { id: q.id, typ: 'spatial' as const, steg: steg.map(spatial), fil: 'spatial.json' }
    })
  }
  for (const q of las('talserier.json')) m.set(q.id, () => ({ id: q.id, typ: 'talserie' as const, visade: q.visade, luckor: q.luckor, fil: 'talserier.json' }))
  for (const q of las('ordforrad.json')) m.set(q.id, () => ({ id: q.id, typ: 'ord' as const, ord: q.ord, ordTyp: q.typ, options: q.options, fil: 'ordforrad.json' }))
  if (exempel) {
    // Bara för att återskapa art-directors exempel: bankfrågan som redan syns publikt i MatrisExpert.
    const bank = JSON.parse(readFileSync('src/lib/logicTestV7/questionBankExpertPlus.v7.json', 'utf8')) as any[]
    const q = bank.find((x) => x.id === 'v7e-plus-p2-17')
    if (q) m.set(q.id, matris('questionBankExpertPlus.v7.json', q))
  }
  return m
}
