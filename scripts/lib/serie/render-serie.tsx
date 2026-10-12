// scripts/lib/serie/render-serie.tsx
// =============================================================================
// Granskningsrenderingen för figurserier (beställningen omgång 2, A6 punkt 3).
// Anropas av scripts/render-matris-granskning.tsx --serie --fil=<fil.json>.
//
// En PNG per fråga, ritad med appens renderare (renderers.v7.tsx, duo
// inräknad) i figurserier-spec.md:s mått på 360: remsan 3 + 3 med 8 px luft
// och hårlinjer bara inom en remsa, luckan sist, alternativen tre i bredd.
// Under: regeln, facit och misstaget per alternativ, vad varje distraktor
// bryter, perioden och strukturnyckeln, och frågans noder och bytes mot
// gränserna (120 noder, 14 kB). Plus en index.html med alla.
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { cellSvg as svg, luckaSvg, matSerieFraga, MAX_BYTES_SERIE, MAX_NODER_SERIE } from '../../../src/lib/logicTestV7/svgMatt';
import type { LayeredCell } from '../../../src/lib/logicTestV7/layered.v7';
// @ts-ignore ren JavaScript
import { analysera, radPerAlternativ } from './distraktorer.mjs';
// @ts-ignore ren JavaScript
import { lasCell } from './celler-serie.mjs';
// @ts-ignore ren JavaScript
import { period } from './tolka-serie.mjs';
// @ts-ignore ren JavaScript
import { strukturNyckel } from './struktur.mjs';

type SerieFraga = {
  id: string;
  niva: string;
  family: string;
  recept: string;
  variant?: string;
  p_prior: number;
  title: string;
  rule: string;
  rad: LayeredCell[];
  options: LayeredCell[];
  correctAnswer: number;
  misstag: string[];
  regler: { prim: string; dims: Record<string, { regel: string }> };
};

const FAMILJ: Record<string, string> = {
  vridning: 'Vridning', vandring: 'Vandring', antal: 'Antal', fyllning: 'Fyllning', vaxande: 'Växande steg', vaxelvis: 'Växelvis', flera: 'Flera regler',
};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const B = (i: number) => String.fromCharCode(65 + i);

function kort(q: SerieFraga) {
  const m = matSerieFraga(q);
  const over = m.noder > MAX_NODER_SERIE || m.bytes > MAX_BYTES_SERIE;
  const V = q.options.map((o) => lasCell(o)?.v);
  const a = analysera(q, V);
  const rader = (radPerAlternativ(a) as string[]).filter((x) => !/rätt svar$/.test(x));
  const P = period(q.regler.prim, q.regler.dims);
  const regler = Object.entries(q.regler.dims).map(([id, r]) => `${id} ${r.regel}`).join(', ');
  const rutor = [...q.rad.map((c) => `<div class="ruta">${svg(c)}</div>`), `<div class="ruta lucka">${luckaSvg()}</div>`].join('');
  const alt = q.options
    .map((o, i) => `<div class="alt${i === q.correctAnswer ? ' ratt' : ''}"><span class="b">${B(i)}</span>${i === q.correctAnswer ? '<span class="punkt"></span>' : ''}<div class="fig">${svg(o)}</div></div>`)
    .join('');
  const misstag = q.options.map((_, i) => `<li><b>${B(i)}</b> ${i === q.correctAnswer ? '<em>Rätt svar</em>' : esc(q.misstag[i] ?? '')}</li>`).join('');
  return `<article id="${q.id}">
  <header><div class="id">${q.id} <span class="${over ? 'varn' : 'matt'}">${m.noder} noder · ${(m.bytes / 1024).toFixed(1)} kB</span></div>
  <div class="meta">${q.niva} · ${FAMILJ[q.family] ?? q.family} · mall ${q.recept}${q.variant ? ` (${esc(q.variant)})` : ''} · p_prior ${String(q.p_prior).replace('.', ',')}</div>
  <h2>${esc(q.title)}</h2>
  <p class="band">${esc(regler)} · period ${P === Infinity ? 'oändlig' : P}<br>${rader.map(esc).join(' · ')}</p></header>
  <p class="fragerad">Vilken figur kommer härnäst?</p>
  <div class="kort matrisyta"><div class="serie">${rutor}</div></div>
  <div class="alts matrisyta">${alt}</div>
  <p class="regel">${esc(q.rule)}</p>
  <ol class="misstag">${misstag}</ol>
  <p class="nyckel">${esc(strukturNyckel(q))}</p>
</article>`;
}

const CSS = `
*{box-sizing:border-box} body{margin:0;background:#EBEDF6;font:14px/20px Inter,system-ui,sans-serif;color:#1A1A1F}
article{width:360px;padding:16px;background:#EBEDF6}
header .id{font:600 12px/16px ui-monospace,monospace;color:#65656E} header .meta{font-size:12px;color:#4A4A55}
h2{font-size:17px;line-height:22px;margin:4px 0 10px}
.matt{font-weight:400;color:#65656E} .varn{color:#985A08}
.band{margin:0 0 10px;font-size:12px;line-height:17px;color:#4A4A55;background:#F4F3F0;border:1px solid #E3E1DC;border-radius:8px;padding:6px 8px}
.fragerad{margin:0 0 8px;font-size:14px;font-weight:600;text-align:right}
.kort{width:328px;border-radius:16px;border:1px solid #E3E1DC;background:#fff;padding:10px;box-shadow:0 1px 2px rgba(20,20,40,.05),0 10px 24px -14px rgba(20,20,40,.18)}
.serie{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:0;row-gap:8px}
.ruta{position:relative;aspect-ratio:1;background:#fff;display:flex;align-items:center;justify-content:center;border-left:1px solid #E3E1DC}
.ruta:nth-child(3n+1){border-left:0}
.ruta svg{width:100%;height:100%;padding:10%;display:block}
.ruta.lucka{background:#F4F3F0;border-radius:0 4px 4px 0} .ruta.lucka svg{padding:0}
.alts{width:328px;margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.alt{position:relative;aspect-ratio:1;background:#fff;border:1px solid #E3E1DC;border-radius:12px}
.alt .fig{position:absolute;inset:0;display:flex}
.alt svg{width:100%;height:100%;padding:10%;display:block}
.alt.ratt{border-color:#E07A2F;box-shadow:inset 0 0 0 1px #E07A2F}
.b{position:absolute;left:8px;top:6px;font-size:11px;font-weight:600;color:#65656E;z-index:1}
.alt.ratt .b{color:#A8491A}
.punkt{position:absolute;right:8px;top:8px;width:10px;height:10px;border-radius:50%;background:#E07A2F}
.regel{margin:12px 0 4px;font-size:13px;line-height:18px;color:#4A4A55}
.misstag{margin:0;padding-left:0;list-style:none;font-size:12px;line-height:17px}
.misstag li{margin:2px 0} .misstag em{color:#A8491A;font-style:normal}
.nyckel{margin:6px 0 0;font:11px/15px ui-monospace,monospace;color:#65656E;word-break:break-all}
.matrisyta [fill="#64748B"]{fill:#65656E}.matrisyta [stroke="#64748B"]{stroke:#65656E}
.matrisyta [fill="#CBD5E1"]{fill:#C9C6BF}
.matrisyta [fill="#020617"]{fill:#1A1A1F}.matrisyta [stroke="#020617"]{stroke:#1A1A1F}
`;

export async function renderSerie(fil: string | null, ut: string, bara: Set<string>) {
  if (!fil) throw new Error('--serie kräver --fil=<fil.json>');
  const fragor = (JSON.parse(readFileSync(fil, 'utf8')) as SerieFraga[]).filter((q) => !bara.size || bara.has(q.id));
  const katalog = path.join(ut, path.basename(fil, '.json'));
  mkdirSync(katalog, { recursive: true });
  const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>Figurserier granskning</title><style>${CSS}</style></head><body>${fragor.map(kort).join('\n')}</body></html>`;
  const htmlFil = path.resolve(katalog, 'index.html');
  writeFileSync(htmlFil, html);
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 900, deviceScaleFactor: 2 });
  await page.goto('file:///' + htmlFil.replace(/\\/g, '/'), { waitUntil: 'load' });
  let n = 0;
  for (const q of fragor) {
    const el = await page.$(`article[id="${q.id}"]`);
    if (!el) continue;
    await el.screenshot({ path: path.join(katalog, `${q.recept}-${q.id}.png`) as `${string}.png` });
    n++;
  }
  await browser.close();
  const maxN = Math.max(...fragor.map((q) => matSerieFraga(q).noder));
  const maxB = Math.max(...fragor.map((q) => matSerieFraga(q).bytes));
  console.log(`Skrev ${n} PNG och index.html till ${katalog} (max ${maxN} noder, ${(maxB / 1024).toFixed(1)} kB)`);
}
