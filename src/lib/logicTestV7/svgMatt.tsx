// src/lib/logicTestV7/svgMatt.tsx
// =============================================================================
// Mätning av renderarnas utdata för grafik v3 (grafik-v3-spec.md avsnitt 9
// och 10, V5, V6, V10, V11 och V12). Används av enhetstesterna och av
// scripts/v7-geometri-check.mjs (via scripts/lib/matris/svg-matt.tsx), så att
// samma mätning gäller i båda. Importeras aldrig av appen.
// =============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GEOMETRI as G } from './geometri';
import { LuckaV7, SvgLayeredCell, type LayeredCell, type LayeredQuestion } from './layered.v7';
import { SvgCellV7 } from './renderers.v7';
import type { V7Cell } from './types.v7';

/** Gränserna i V11. */
export const MAX_NODER_PER_FRAGA = 160;
export const MAX_BYTES_PER_FRAGA = 18 * 1024;

/** Element som aldrig får finnas i figurerna (V12). */
export const FORBJUDNA = ['text', 'image', 'use', 'symbol', 'filter', 'mask', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'foreignObject'];

/** En cell som den ritas i testet: en svg 0..100 med figuren. */
export const cellSvg = (cell: LayeredCell) =>
  renderToStaticMarkup(
    <svg viewBox="0 0 100 100" shapeRendering="geometricPrecision" aria-hidden="true">
      <SvgLayeredCell cell={cell} />
    </svg>
  );

export const primitivSvg = (cell: V7Cell) => renderToStaticMarkup(<SvgCellV7 cell={cell} />);

export const luckaSvg = () => renderToStaticMarkup(<LuckaV7 />);

/** Alla öppningstaggar i en markup, som '<rect x="1" ...>'. */
export const taggar = (markup: string) => markup.match(/<[a-zA-Z][^>]*>/g) ?? [];

export type FragaMatt = { id: string; noder: number; bytes: number; forbjudna: string[]; url: boolean };

/** Noder och bytes för en fråga: åtta rutor och sex alternativ, svg-elementen inräknade (V11, V12). */
export function matFraga(q: Pick<LayeredQuestion, 'id' | 'grid' | 'options'>): FragaMatt {
  const celler = [...q.grid.flat().filter((c): c is LayeredCell => c !== null), ...q.options];
  const markup = celler.map(cellSvg).join('');
  const t = taggar(markup);
  const forbjudna = t
    .map((x) => /^<([a-zA-Z]+)/.exec(x)![1])
    .filter((namn) => FORBJUDNA.some((f) => f.toLowerCase() === namn.toLowerCase()));
  return {
    id: q.id,
    noder: t.length,
    bytes: Buffer.byteLength(markup, 'utf8'),
    forbjudna: [...new Set(forbjudna)],
    url: /url\(/.test(markup),
  };
}

/**
 * V5: ram-grått sitter bara på referens. Tillåtet: orbitalens prickade bana
 * (circle med stroke-dasharray), tomma rutor i blocken (rect utan fyllning)
 * och luckan. Och åt andra hållet: varje ofylld ruta i tile och lattice har
 * ramen i ram-grått.
 */
export function ramFel(cell: V7Cell): string[] {
  const fel: string[] = [];
  for (const t of taggar(primitivSvg(cell))) {
    const harRam = t.includes(`"${G.farger.ram}"`);
    const bana = t.startsWith('<circle') && t.includes('stroke-dasharray');
    const tomRuta = t.startsWith('<rect') && t.includes('fill="none"');
    if (harRam && !(bana || tomRuta)) fel.push(`${cell.kind}: ram-grått på ${t}`);
    if ((cell.kind === 'tile' || cell.kind === 'lattice') && tomRuta && !t.includes(`stroke="${G.farger.ram}"`)) {
      fel.push(`${cell.kind}: tom ruta utan ram-grått: ${t}`);
    }
    if (cell.kind === 'orbital' && bana && !t.includes(`stroke="${G.farger.ram}"`)) fel.push(`orbital: banan utan ram-grått`);
  }
  return fel;
}

const attr = (t: string, namn: string) => {
  const m = new RegExp(`\\s${namn}="([^"]*)"`).exec(t);
  return m ? m[1] : null;
};

/** V6: tom och fylld ruta i tile och lattice har samma målade yta (läge, storlek, konturbredd). */
export function samaYtaFel(): string[] {
  const fel: string[] = [];
  const jamfor = (namn: string, svg: string, tom: number, fylld: number) => {
    const rects = taggar(svg).filter((t) => t.startsWith('<rect'));
    const yta = (t: string) => {
      const [x, y, w, h, sw] = ['x', 'y', 'width', 'height', 'stroke-width'].map((a) => Number(attr(t, a)));
      return [w + sw, h + sw, sw];
    };
    const a = yta(rects[tom]);
    const b = yta(rects[fylld]);
    if (a.some((v, i) => Math.abs(v - b[i]) > 1e-9)) fel.push(`${namn}: tom ruta ${a.join('/')} mot fylld ${b.join('/')}`);
  };
  // tile: ruta 0 fylld, ruta 1 tom
  jamfor('tile', primitivSvg({ kind: 'tile', pattern: 1 }), 1, 0);
  // lattice: svart, grå, tom, prick
  const lat = primitivSvg({ kind: 'lattice', cells: ['fill_black', 'fill_gray', 'empty', 'dot'] });
  jamfor('lattice svart', lat, 2, 0);
  jamfor('lattice grå', lat, 2, 1);
  return fel;
}

/** V10: luckan har ingen text, och frågetecknet och pricken kommer ur geometri.json. */
export function luckaFel(): string[] {
  const svg = luckaSvg();
  const fel: string[] = [];
  if (/<text\b/i.test(svg)) fel.push('luckan innehåller <text>');
  if (!svg.includes(`d="${G.lucka.fragetecken}"`)) fel.push('frågetecknets bana kommer inte ur geometri.json');
  const [cx, cy, r] = G.lucka.prick;
  if (!svg.includes(`cx="${cx}"`) || !svg.includes(`cy="${cy}"`) || !svg.includes(`r="${r}"`)) fel.push('frågetecknets prick kommer inte ur geometri.json');
  if (!svg.includes(`stroke-dasharray="${G.lucka.streck}"`)) fel.push('luckans ram är inte streckad');
  if (/koppar|#E07A2F|#A8491A/i.test(svg)) fel.push('luckan har koppar före svaret');
  return fel;
}

/** Alla celltyper i alla fyllningar som V5 prövas på. */
export function allaPrimitiver(): V7Cell[] {
  const ut: V7Cell[] = [];
  const fyll = ['none', 'gray', 'black'] as const;
  for (const base of ['circle', 'square', 'triangle', 'diamond'] as const)
    for (const symbol of ['plus', 'minus', 'dot', 'ring', 'cross', 'none'] as const)
      for (const baseFill of fyll) ut.push({ kind: 'stack', base, symbol, baseFill });
  for (const f of fyll) ut.push({ kind: 'poly', sides: 6, rotation: 0, fill: f });
  for (const f of fyll) ut.push({ kind: 'ring', rings: [f, 'none', f] });
  ut.push({ kind: 'orbital', center: 'filled', satellite: 2 }, { kind: 'orbital', center: 'open', satellite: null });
  ut.push({ kind: 'lattice', cells: ['fill_black', 'fill_gray', 'dot', 'cross'] }, { kind: 'lattice', cells: ['empty', 'empty', 'empty', 'fill_black'] });
  ut.push({ kind: 'tile', pattern: 0b101010101 }, { kind: 'tile', pattern: 0 });
  ut.push({ kind: 'ray', rays: [0, 2, 5] });
  ut.push({ kind: 'tally', count: 3, orientation: 'vertical' }, { kind: 'tally', count: 5, orientation: 'horizontal' });
  for (const head of ['filled', 'open'] as const) ut.push({ kind: 'vector', angle: 45, length: 'long', head });
  ut.push({ kind: 'sectorwheel', filled: [0, 3, 5] });
  ut.push({ kind: 'balanceline', items: [{ shape: 'square', posX: 0, side: 'above', fill: 'gray' }, { shape: 'circle', posX: 2, side: 'below', fill: 'none' }] });
  return ut;
}

/**
 * Figurserier (figurserier-spec.md avsnitt 10): en härnäst-fråga är fem figurer,
 * luckan och sex alternativ, högst 120 noder och 14 kB.
 */
export const MAX_NODER_SERIE = G.serie.noder.harnastMax;
export const MAX_BYTES_SERIE = G.serie.noder.harnastBytes;

export function matSerieFraga(q: { id: string; rad: LayeredCell[]; options: LayeredCell[] }): FragaMatt {
  const markup = [...q.rad.map(cellSvg), luckaSvg(), ...q.options.map(cellSvg)].join('');
  const t = taggar(markup);
  const forbjudna = t
    .map((x) => /^<([a-zA-Z]+)/.exec(x)![1])
    .filter((namn) => FORBJUDNA.some((f) => f.toLowerCase() === namn.toLowerCase()));
  return { id: q.id, noder: t.length, bytes: Buffer.byteLength(markup, 'utf8'), forbjudna: [...new Set(forbjudna)], url: /url\(/.test(markup) };
}

export function matSerieBank(bank: { id: string; rad: LayeredCell[]; options: LayeredCell[] }[]): BankMatt {
  const ut: BankMatt = { fragor: 0, noder: { min: Infinity, max: 0, maxId: '' }, bytes: { min: Infinity, max: 0, maxId: '' }, over: [], forbjudna: [] };
  for (const q of bank) {
    const m = matSerieFraga(q);
    ut.fragor++;
    ut.noder.min = Math.min(ut.noder.min, m.noder);
    ut.bytes.min = Math.min(ut.bytes.min, m.bytes);
    if (m.noder > ut.noder.max) ut.noder = { ...ut.noder, max: m.noder, maxId: q.id };
    if (m.bytes > ut.bytes.max) ut.bytes = { ...ut.bytes, max: m.bytes, maxId: q.id };
    if (m.noder > MAX_NODER_SERIE || m.bytes > MAX_BYTES_SERIE) ut.over.push(`${q.id} (${m.noder} noder, ${m.bytes} B)`);
    if (m.forbjudna.length || m.url) ut.forbjudna.push(`${q.id}: ${[...m.forbjudna, ...(m.url ? ['url('] : [])].join(', ')}`);
  }
  return ut;
}

export type BankMatt = {
  fragor: number;
  noder: { min: number; max: number; maxId: string };
  bytes: { min: number; max: number; maxId: string };
  over: string[];
  forbjudna: string[];
};

/** V11 och V12 över en bank (bara valbara frågor). */
export function matBank(bank: LayeredQuestion[]): BankMatt {
  const ut: BankMatt = {
    fragor: 0,
    noder: { min: Infinity, max: 0, maxId: '' },
    bytes: { min: Infinity, max: 0, maxId: '' },
    over: [],
    forbjudna: [],
  };
  for (const q of bank) {
    if (q.pensionerad) continue;
    const m = matFraga(q);
    ut.fragor++;
    ut.noder.min = Math.min(ut.noder.min, m.noder);
    ut.bytes.min = Math.min(ut.bytes.min, m.bytes);
    if (m.noder > ut.noder.max) ut.noder = { ...ut.noder, max: m.noder, maxId: q.id };
    if (m.bytes > ut.bytes.max) ut.bytes = { ...ut.bytes, max: m.bytes, maxId: q.id };
    if (m.noder > MAX_NODER_PER_FRAGA || m.bytes > MAX_BYTES_PER_FRAGA) ut.over.push(`${q.id} (${m.noder} noder, ${m.bytes} B)`);
    if (m.forbjudna.length || m.url) ut.forbjudna.push(`${q.id}: ${[...m.forbjudna, ...(m.url ? ['url('] : [])].join(', ')}`);
  }
  return ut;
}
