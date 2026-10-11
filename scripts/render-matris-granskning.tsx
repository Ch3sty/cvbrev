// scripts/render-matris-granskning.tsx
// =============================================================================
// Renderar ett urval matrisfrågor till PNG för okulär granskning (våg 3c).
//
// Kör: npx tsx scripts/render-matris-granskning.tsx [utkatalog]
//      npx tsx scripts/render-matris-granskning.tsx <utkatalog> --fil=<fil.json>
//
// Med --fil renderas alla frågor i filen, i filens ordning (kandidatfiler).
// För frågor med band (svår plus) står mekanismen, antalet regler och
// distraktorkontrollens utfall per alternativ under metan, ur
// scripts/lib/matris/distraktorer.mjs. PNG-namnet är då {mekanism}-{id}.png.
//
// Urvalet: för varje nivå och familj två frågor ur 3c-banken och en ur den
// frusna banken när familjen finns där. Frågan ritas med appens egna
// renderare (renderers.v7.tsx via SvgLayeredCell) i samma storlek som
// testvyn på Pixel 7: rutnätet 380 px brett, celler cirka 113 px,
// alternativen två i bredd. Under alternativen står regeln, facit och
// misstag per alternativ, så att granskaren ser både bild och text.
// En PNG per fråga, plus en index.html med alla.
// =============================================================================

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { SvgLayeredCell } from '../src/lib/logicTestV7/layered.v7';
import type { LayeredCell, LayeredQuestion } from '../src/lib/logicTestV7/layered.v7';
import familjer from '../src/lib/logicTestV7/familjer.json';
// @ts-ignore modulen är ren JavaScript utan typer
import { analysera, radPerAlternativ } from './lib/matris/distraktorer.mjs';

// Flaggor (spec-rummen 15.10 och 15.11):
//   --ringar          bara frågor med ringceller (alla nivåer, pensionerade märkta)
//   --fragor=a,b,c    bara de angivna frågorna (kan kombineras med --ringar)
const ARGS = process.argv.slice(2);
const UT = ARGS.find((a) => !a.startsWith('--')) ?? 'docs/qa/rummen/vag-3c/granskning';
const RINGAR = ARGS.includes('--ringar');
const FRAGOR = (ARGS.find((a) => a.startsWith('--fragor='))?.slice('--fragor='.length) ?? '').split(',').filter(Boolean);
const FIL = ARGS.find((a) => a.startsWith('--fil='))?.slice('--fil='.length) ?? null;
type BandFraga = LayeredQuestion & { band?: string; mekanism?: string };
mkdirSync(UT, { recursive: true });

const NIVAER = [
  { niva: 'grund', fryst: 'questionBankGrund.v7.json', ny: 'questionBankGrund3c.v7.json' },
  { niva: 'avancerad', fryst: 'questionBank.v7.json', ny: 'questionBankAvancerad3c.v7.json' },
  { niva: 'expert', fryst: 'questionBankExpert.v7.json', ny: 'questionBankExpert3c.v7.json' },
];
const las = (f: string) => JSON.parse(readFileSync(path.join('src/lib/logicTestV7', f), 'utf8')) as LayeredQuestion[];
const NAMN = Object.fromEntries((familjer as { id: string; namn: string }[]).map((f) => [f.id, f.namn]));

const svg = (cell: LayeredCell) =>
  renderToStaticMarkup(
    <svg viewBox="0 0 100 100" width="100%" height="100%" shapeRendering="geometricPrecision">
      <SvgLayeredCell cell={cell} />
    </svg>
  );

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function distraktorRad(q: BandFraga) {
  if (!q.band) return '';
  const a = analysera(q);
  if (!a.ok) return `<p class="band">${esc(q.mekanism ?? '')} · ingen tolkning</p>`;
  const rader = (radPerAlternativ(a) as string[]).filter((x) => !/rätt svar$/.test(x));
  return `<p class="band"><b>${esc(q.mekanism ?? '')}</b> · ${a.R.length} regler (${esc(a.R.join(', '))}) · nära miss ${a.naraMiss} av 5<br>${rader.map(esc).join(' · ')}</p>`;
}

function kort(q: LayeredQuestion, niva: string, kalla: string) {
  const celler = q.grid.flat().map((c) =>
    c ? `<div class="cell">${svg(c)}</div>` : '<div class="cell tom"><span>?</span></div>'
  );
  const alt = q.options.map((o, i) => {
    const ratt = i === q.correctAnswer;
    return `<div class="alt${ratt ? ' ratt' : ''}"><span class="bokstav">${String.fromCharCode(65 + i)}</span>${svg(o)}</div>`;
  });
  const misstag = q.options.map((_, i) => {
    const m = q.misstag?.[i] ?? '';
    const ratt = i === q.correctAnswer;
    const granskas = q.misstagGranskas?.includes(i);
    return `<li><b>${String.fromCharCode(65 + i)}</b> ${ratt ? '<em>Rätt svar</em>' : granskas ? '<em class="varn">Manuell granskning</em>' : esc(m)}</li>`;
  });
  return `<article id="${q.id}">
    <header><div class="id">${q.id}</div><div class="meta">${niva} · ${NAMN[q.family ?? ''] ?? q.family} · svårighet ${q.difficulty} · ${kalla}</div><h2>${esc(q.title)}</h2>${distraktorRad(q as BandFraga)}</header>
    <div class="grid">${celler.join('')}</div>
    <div class="alts">${alt.join('')}</div>
    <p class="regel">${esc(q.rule)}</p>
    <ol class="misstag">${misstag.join('')}</ol>
  </article>`;
}

const CSS = `
*{box-sizing:border-box} body{margin:0;background:#EBEDF6;font:14px/20px Inter,system-ui,sans-serif;color:#1A1A1F}
article{width:412px;padding:16px;background:#EBEDF6}
header .id{font:600 12px/16px ui-monospace,monospace;color:#65656E} header .meta{font-size:12px;color:#4A4A55}
h2{font-size:17px;line-height:22px;margin:4px 0 12px}
.grid{width:380px;background:#fff;border:1px solid #E3E1DC;border-radius:12px;padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.cell{aspect-ratio:1;border:1px solid #E3E1DC;border-radius:8px;padding:6px;background:#fff;display:flex}
.cell.tom{border:2px dashed #C9C6BF;background:#F4F3F0;align-items:center;justify-content:center;font-size:44px;color:#65656E}
.alts{width:380px;margin-top:12px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.alt{position:relative;aspect-ratio:1;background:#fff;border:1px solid #E3E1DC;border-radius:12px;padding:12px;display:flex}
.alt.ratt{border:2px solid #A8491A}
.bokstav{position:absolute;left:8px;top:8px;width:24px;height:24px;border:1px solid #E3E1DC;border-radius:50%;font-size:12px;display:flex;align-items:center;justify-content:center;color:#65656E;background:#fff}
.regel{margin:12px 0 4px;font-size:13px;line-height:18px;color:#4A4A55}
.misstag{margin:0;padding-left:0;list-style:none;font-size:12px;line-height:17px;color:#1A1A1F}
.band{margin:-6px 0 10px;font-size:12px;line-height:17px;color:#4A4A55;background:#F4F3F0;border:1px solid #E3E1DC;border-radius:8px;padding:6px 8px}
.misstag li{margin:2px 0} .misstag em{color:#A8491A;font-style:normal} .misstag .varn{color:#985A08}
`;

const valda: { q: LayeredQuestion; niva: string; kalla: string }[] = [];
const harRing = (q: LayeredQuestion) =>
  [...q.grid.flat(), ...q.options].some((c) => c && (Array.isArray(c) ? c : [c]).some((p) => (p as { kind?: string }).kind === 'ring'));
if (FIL) {
  for (const q of JSON.parse(readFileSync(FIL, 'utf8')) as BandFraga[]) valda.push({ q, niva: 'expert', kalla: q.band ? `kandidat, ${q.band}` : 'kandidat' });
} else if (RINGAR || FRAGOR.length) {
  for (const { niva, fryst, ny } of NIVAER) {
    for (const [fil, kalla] of [[fryst, 'fryst'], [ny, '3c']] as const) {
      for (const q of las(fil)) {
        if ((RINGAR && harRing(q)) || FRAGOR.includes(q.id)) {
          valda.push({ q, niva, kalla: q.pensionerad ? `${kalla}, pensionerad` : kalla });
        }
      }
    }
  }
}
for (const { niva, fryst, ny } of FIL || RINGAR || FRAGOR.length ? [] : NIVAER) {
  const F = las(fryst);
  const N = las(ny);
  for (const f of familjer as { id: string }[]) {
    N.filter((q) => q.family === f.id).slice(0, 2).forEach((q) => valda.push({ q, niva, kalla: '3c' }));
    F.filter((q) => q.family === f.id).slice(0, 1).forEach((q) => valda.push({ q, niva, kalla: 'fryst' }));
  }
  // de frusna frågor som väntar på manuell granskning tas alltid med
  F.filter((q) => q.misstagGranskas?.length && !valda.some((v) => v.q.id === q.id)).forEach((q) => valda.push({ q, niva, kalla: 'fryst' }));
}

const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>Matrisgranskning</title><style>${CSS}</style></head><body>${valda.map((v) => kort(v.q, v.niva, v.kalla)).join('\n')}</body></html>`;
const htmlFil = path.resolve(UT, 'index.html');
writeFileSync(htmlFil, html);

async function main() {
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 2 });
await page.goto('file:///' + htmlFil.replace(/\\/g, '/'), { waitUntil: 'load' });
let n = 0;
for (const v of valda) {
  const el = await page.$(`article[id="${v.q.id}"]`);
  if (!el) continue;
  const fam = v.q.family ?? 'okand';
  const mek = (v.q as BandFraga).mekanism;
  const namn = FIL && mek ? `${mek}-${v.q.id}.png` : `${v.niva}-${fam}-${v.q.id}.png`;
  await el.screenshot({ path: path.join(UT, namn) as `${string}.png` });
  n++;
}
await browser.close();
console.log(`Skrev ${n} PNG och index.html till ${UT}`);
const per: Record<string, number> = {};
valda.forEach((v) => { const k = `${v.niva}/${v.q.family}`; per[k] = (per[k] ?? 0) + 1; });
console.log(Object.entries(per).map(([k, x]) => `${k}: ${x}`).join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
