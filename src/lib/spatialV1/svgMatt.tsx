// src/lib/spatialV1/svgMatt.tsx
// =============================================================================
// Mätning av ritarens riktiga utdata för Spatial förmåga, samma kedja som
// logicTestV7/svgMatt.tsx för G1 till G12 och V1 till V12: figuren renderas
// med renderToStaticMarkup och måtten läses ur markupens attribut, inte ur
// generatorns data. Används av scripts/spatial-geometri-check.mjs (via
// scripts/lib/spatial/svg-matt.tsx) och av enhetstesterna. Importeras aldrig
// av appen.
//
// Mäts per uppgift:
//   G2   allt målat (kontur inräknad) ligger i [14, 86]
//   V11  noder och bytes för hela uppgiften (referens eller sekvens, fyra alternativ)
//   V12  inga förbjudna element (text, image, use, filter, mask, clipPath ...)
//   G10  grå fyllning har alltid bläckkontur
//   A    brickruta minst 8 px och luft mellan rutor större än 0 och minst 2 px (360)
//   B    hål minst 6 px i diameter i sekvensen, minst 4 enheters fritt mellan
//        hål, hål fria från arkets kontur, klipp minst 8 px, viklinje minst 2,5
//   C    symbolens minsta axel minst 10 px, konturer 3, kontrast symbol mot
//        sida minst 4,5:1 på alla tre sidor
// =============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { kontrastkvot } from '@/lib/logicTestV7/geometri';
import { SpatialSvg, SPATIAL_GEOMETRI as G, ellips, halR } from './ritare';
import type { SpatialFigur, SpatialFraga } from './types';

export const FORBJUDNA = ['text', 'image', 'use', 'symbol', 'filter', 'mask', 'clipPath', 'linearGradient', 'radialGradient', 'pattern', 'foreignObject'];

export const figurSvg = (fig: SpatialFigur) => renderToStaticMarkup(<SpatialSvg fig={fig} />);
export const taggar = (markup: string) => markup.match(/<[a-zA-Z][^>]*>/g) ?? [];
const attr = (t: string, namn: string) => {
  const m = new RegExp(`\\s${namn}="([^"]*)"`).exec(t);
  return m ? m[1] : null;
};
const num = (t: string, namn: string) => Number(attr(t, namn) ?? 0);
const namn = (t: string) => /^<([a-zA-Z]+)/.exec(t)![1];

type Ram = { x0: number; y0: number; x1: number; y1: number };

/** Det målade området för ett element, kontur inräknad (konservativt för roterade ellipser). */
export function maladRam(t: string): Ram | null {
  const sw = attr(t, 'stroke') && attr(t, 'stroke') !== 'none' ? num(t, 'stroke-width') / 2 : 0;
  const n = namn(t);
  if (n === 'rect') {
    const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((a) => num(t, a));
    return { x0: x - sw, y0: y - sw, x1: x + w + sw, y1: y + h + sw };
  }
  if (n === 'circle') {
    const [cx, cy, r] = ['cx', 'cy', 'r'].map((a) => num(t, a));
    return { x0: cx - r - sw, y0: cy - r - sw, x1: cx + r + sw, y1: cy + r + sw };
  }
  if (n === 'ellipse') {
    const [cx, cy, rx, ry] = ['cx', 'cy', 'rx', 'ry'].map((a) => num(t, a));
    const r = Math.max(rx, ry);
    return { x0: cx - r - sw, y0: cy - r - sw, x1: cx + r + sw, y1: cy + r + sw };
  }
  if (n === 'line') {
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((a) => num(t, a));
    return { x0: Math.min(x1, x2) - sw, y0: Math.min(y1, y2) - sw, x1: Math.max(x1, x2) + sw, y1: Math.max(y1, y2) + sw };
  }
  if (n === 'path') {
    const tal = (attr(t, 'd') ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const xs = tal.filter((_, i) => i % 2 === 0);
    const ys = tal.filter((_, i) => i % 2 === 1);
    return { x0: Math.min(...xs) - sw, y0: Math.min(...ys) - sw, x1: Math.max(...xs) + sw, y1: Math.max(...ys) + sw };
  }
  return null;
}

export type SpatialMatt = { id: string; noder: number; bytes: number; fel: string[] };

/** Figurerna i en uppgift som de ritas: referens eller sekvens, och alternativen. */
export const uppgiftensFigurer = (q: SpatialFraga): { fig: SpatialFigur; skala: number; var: string }[] => {
  const S = G.skala360;
  const ut: { fig: SpatialFigur; skala: number; var: string }[] = [];
  if (q.referens) ut.push({ fig: q.referens, skala: S.referens, var: 'referens' });
  const sk = (q.sekvens?.length ?? 0) > 3 ? S.sekvens4 : S.sekvens3;
  q.sekvens?.forEach((f, i) => ut.push({ fig: f, skala: sk, var: `sekvens ${i + 1}` }));
  q.options.forEach((f, i) => ut.push({ fig: f, skala: S.alternativ, var: `alternativ ${'ABCD'[i]}` }));
  q.uppvikning?.forEach((f, i) => ut.push({ fig: f, skala: S.sekvens3, var: `uppvikning ${i + 1}` }));
  return ut;
};

const [INRE_MIN, INRE_MAX] = G.regler.inre;
const g5 = G.g5;

/** Mätningen av en figur i sin skala. */
export function matFigur(fig: SpatialFigur, skala: number, var_: string): string[] {
  const svg = figurSvg(fig);
  const t = taggar(svg).filter((x) => !x.startsWith('<svg') && !x.startsWith('<g'));
  const fel: string[] = [];
  for (const x of t) {
    const r = maladRam(x);
    if (r && (r.x0 < INRE_MIN - 1e-6 || r.y0 < INRE_MIN - 1e-6 || r.x1 > INRE_MAX + 1e-6 || r.y1 > INRE_MAX + 1e-6)) {
      fel.push(`${var_}: G2 ${namn(x)} målas utanför [14, 86] (${[r.x0, r.y0, r.x1, r.y1].map((v) => Math.round(v * 10) / 10).join(', ')})`);
    }
    if (attr(x, 'fill') === G.farger.gra && attr(x, 'stroke') !== G.farger.ink && attr(x, 'stroke') !== G.farger.koppar) {
      fel.push(`${var_}: G10 grå fyllning utan bläckkontur`);
    }
    const sw = attr(x, 'stroke-width');
    if (sw !== null && Number(sw) < 2.5) fel.push(`${var_}: V2 linje ${sw} under 2,5`);
  }
  if (fig.kind === 'brick') {
    const rects = t.filter((x) => x.startsWith('<rect')).map((x) => {
      const [rx, ry, w, h] = ['x', 'y', 'width', 'height'].map((a) => num(x, a));
      const s = attr(x, 'stroke') ? num(x, 'stroke-width') / 2 : 0;
      return { x0: rx - s, y0: ry - s, x1: rx + w + s, y1: ry + h + s, w: w + 2 * s };
    });
    const minRuta = Math.min(...rects.map((r) => r.w)) * skala;
    if (minRuta < g5.minRutaPx) fel.push(`${var_}: brickrutan är ${minRuta.toFixed(1)} px, minst ${g5.minRutaPx}`);
    let minLuft = Infinity;
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i];
        const b = rects[j];
        const dx = Math.max(b.x0 - a.x1, a.x0 - b.x1);
        const dy = Math.max(b.y0 - a.y1, a.y0 - b.y1);
        const d = Math.max(dx, dy);
        if (d < 30) minLuft = Math.min(minLuft, d);
      }
    if (minLuft <= 0) fel.push(`${var_}: brickrutor rör varandra (luft ${minLuft.toFixed(2)})`);
    else if (minLuft !== Infinity && minLuft * skala < g5.minLuftPx) fel.push(`${var_}: luften mellan rutor är ${(minLuft * skala).toFixed(1)} px, minst ${g5.minLuftPx}`);
  }
  if (fig.kind === 'ark-stans' || fig.kind === 'ark-ut') {
    const hal = t.filter((x) => x.startsWith('<circle')).map((x) => ({ cx: num(x, 'cx'), cy: num(x, 'cy'), r: num(x, 'r') }));
    for (const h of hal) if (2 * h.r * skala < g5.minHalPx) fel.push(`${var_}: hålet är ${(2 * h.r * skala).toFixed(1)} px, minst ${g5.minHalPx}`);
    for (let i = 0; i < hal.length; i++)
      for (let j = i + 1; j < hal.length; j++) {
        const fritt = Math.hypot(hal[i].cx - hal[j].cx, hal[i].cy - hal[j].cy) - hal[i].r - hal[j].r;
        if (fritt < G.regler.minGap - 1e-6) fel.push(`${var_}: G1 två hål har ${fritt.toFixed(1)} enheters fritt, minst ${G.regler.minGap}`);
      }
    // hål fria från arkets kontur (konturens inre kant) och från klippen
    const kontur = t.find((x) => x.startsWith('<path') && (attr(x, 'fill') === G.farger.papper || attr(x, 'fill') === G.farger.gra));
    const pts = (attr(kontur ?? '', 'd') ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    const P: [number, number][] = [];
    for (let i = 0; i + 1 < pts.length; i += 2) P.push([pts[i], pts[i + 1]]);
    const avstand = (p: [number, number], a: [number, number], b: [number, number]) => {
      const ab = [b[0] - a[0], b[1] - a[1]];
      const l2 = ab[0] ** 2 + ab[1] ** 2;
      const u = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2)) : 0;
      return Math.hypot(p[0] - a[0] - u * ab[0], p[1] - a[1] - u * ab[1]);
    };
    for (const h of hal) {
      const d = Math.min(...P.map((a, i) => avstand([h.cx, h.cy], a, P[(i + 1) % P.length])));
      const fritt = d - h.r - G.kontur.sw / 2;
      if (fritt < 1.5 - 1e-6) fel.push(`${var_}: hålet har ${fritt.toFixed(1)} enheters papper mot kanten, minst 1,5`);
    }
    const klipp = t.filter((x) => x.startsWith('<rect') && attr(x, 'fill') === G.farger.ink);
    for (const k of klipp) {
      const w = num(k, 'width') * skala;
      if (w < g5.minKlippPx) fel.push(`${var_}: klippet är ${w.toFixed(1)} px, minst ${g5.minKlippPx}`);
    }
  }
  if (fig.kind === 'ark-vik') {
    const linje = t.find((x) => x.startsWith('<line') && attr(x, 'stroke') === G.farger.ram);
    if (!linje) fel.push(`${var_}: viklinjen saknas`);
    else if (!attr(linje, 'stroke-dasharray')) fel.push(`${var_}: viklinjen är inte streckad`);
  }
  if (fig.kind === 'kub') {
    for (const sida of ['t', 'l', 'r'] as const) {
      const m = G.kub.matris[sida] as [number, number, number, number, number, number];
      const S = G.kub.symbol;
      const rho = { prick: S.prickR, ring: S.ringR, dubbelring: S.dubbelInre, kvadrat: S.kvadrat, fkvadrat: S.kvadrat, kryss: S.kryss, triangel: 0.45, pil: 0.5 }[fig[sida].symbol];
      // minsta axeln: symbolens utsträckning (2 rho) i sidans smalaste riktning
      const e = ellips(m, rho);
      const minAxel = 2 * Math.min(e.rx, e.ry) * skala;
      const grans = fig[sida].symbol === 'dubbelring' ? 0.5 * g5.minSymbolPx : g5.minSymbolPx;
      if (minAxel < grans) fel.push(`${var_}: symbolen ${fig[sida].symbol} på sidan ${sida} är ${minAxel.toFixed(1)} px i minsta axeln, minst ${grans}`);
    }
    const sidfarg = [G.farger.papper, G.farger.gra, G.farger.kopparMjuk];
    for (const f of sidfarg) {
      const k = kontrastkvot(G.farger.ink, f);
      if (k < 4.5) fel.push(`${var_}: kontrast bläck mot ${f} är ${k.toFixed(2)}`);
    }
  }
  return fel;
}

export function matUppgift(q: SpatialFraga): SpatialMatt {
  const figurer = uppgiftensFigurer(q);
  // V11 räknas på det som visas samtidigt: referens eller sekvens och alternativen
  const visas = figurer.filter((f) => !f.var.startsWith('uppvikning'));
  const markup = visas.map((f) => figurSvg(f.fig)).join('');
  const t = taggar(markup);
  const fel: string[] = [];
  const forbjudna = [...new Set(t.map(namn).filter((n) => FORBJUDNA.some((f) => f.toLowerCase() === n.toLowerCase())))];
  if (forbjudna.length) fel.push(`V12 förbjudna element: ${forbjudna.join(', ')}`);
  if (/url\(/.test(markup)) fel.push('V12 url( i markupen');
  const max = q.form === 'A' ? G.noder.brickMax : q.form === 'B' ? G.noder.arkMax : G.noder.kubMax;
  if (t.length > max) fel.push(`V11 ${t.length} noder, högst ${max}`);
  const bytes = Buffer.byteLength(markup, 'utf8');
  if (bytes > G.noder.bytes) fel.push(`V11 ${bytes} bytes, högst ${G.noder.bytes}`);
  for (const f of figurer) fel.push(...matFigur(f.fig, f.skala, f.var));
  return { id: q.id, noder: t.length, bytes, fel: fel.map((x) => `${q.id}: ${x}`) };
}

export function matSpatialBank(bank: SpatialFraga[]) {
  const matt = bank.map(matUppgift);
  return {
    uppgifter: matt.length,
    maxNoder: Math.max(0, ...matt.map((m) => m.noder)),
    maxBytes: Math.max(0, ...matt.map((m) => m.bytes)),
    fel: matt.flatMap((m) => m.fel),
  };
}

export { halR };
