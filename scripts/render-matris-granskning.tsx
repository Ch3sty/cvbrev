// scripts/render-matris-granskning.tsx
// =============================================================================
// Renderar ett urval matrisfrågor till PNG för okulär granskning (våg 3c).
//
// Kör: npx tsx scripts/render-matris-granskning.tsx [utkatalog] [--alla] [--html]
//
// Urvalet: för varje nivå och familj två frågor ur 3c-banken och en ur den
// frusna banken när familjen finns där (--alla: alla valbara frågor). Frågan
// ritas med appens egna renderare (renderers.v7.tsx via SvgLayeredCell) i
// grafik v3:s mått på Pixel 7 (grafik-v3-spec.md avsnitt 1): kolumnen 328 px,
// ett kort med hårlinjer, rutan 102 px och figuren i 80 procent, alternativen
// tre i bredd i samma skala, luckan med ritat frågetecken. Under
// alternativen står regeln, facit och misstag per alternativ, och frågans
// svg-noder och bytes (V11). En PNG per fråga, plus en index.html med alla
// och max per bank (--html: bara index.html, inga PNG).
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import type { LayeredQuestion } from '../src/lib/logicTestV7/layered.v7';
import { cellSvg as svg, luckaSvg, matFraga, MAX_BYTES_PER_FRAGA, MAX_NODER_PER_FRAGA, type FragaMatt } from '../src/lib/logicTestV7/svgMatt';
import familjer from '../src/lib/logicTestV7/familjer.json';
// @ts-ignore modulen är ren JavaScript utan typer
import { analysera, radPerAlternativ } from './lib/matris/distraktorer.mjs';

// Kandidatfiler (bank_version 3):
//   --fil=<fil.json>  alla frågor i filen, i filens ordning; nivån ur id:t,
//                     mall och p_prior i metan, och för frågor med två eller
//                     fler regler vad varje alternativ bryter. PNG-namnet är
//                     {recept}-{id}.png.
//   --bara=a,b,c      med --fil: bara de angivna frågorna (granskningsomgång)
// Flaggor (spec-rummen 15.10 och 15.11):
//   --ringar          bara frågor med ringceller (alla nivåer, pensionerade märkta)
//   --fragor=a,b,c    bara de angivna frågorna (kan kombineras med --ringar)
const ARGS = process.argv.slice(2);
const UT = ARGS.find((a) => !a.startsWith('--')) ?? 'docs/qa/rummen/vag-3c/granskning';
const RINGAR = ARGS.includes('--ringar');
const FRAGOR = (ARGS.find((a) => a.startsWith('--fragor='))?.slice('--fragor='.length) ?? '').split(',').filter(Boolean);
const ALLA = ARGS.includes('--alla');
const BARA_HTML = ARGS.includes('--html');
const FIL = ARGS.find((a) => a.startsWith('--fil='))?.slice('--fil='.length) ?? null;
const BARA = new Set((ARGS.find((a) => a.startsWith('--bara='))?.slice('--bara='.length) ?? '').split(',').filter(Boolean));
type V3Fraga = LayeredQuestion & { band?: string; mekanism?: string; recept?: string; p_prior?: number };
mkdirSync(UT, { recursive: true });

const NIVAER = [
  { niva: 'grund', fryst: 'questionBankGrund.v7.json', ny: 'questionBankGrund3c.v7.json' },
  { niva: 'avancerad', fryst: 'questionBank.v7.json', ny: 'questionBankAvancerad3c.v7.json' },
  { niva: 'expert', fryst: 'questionBankExpert.v7.json', ny: 'questionBankExpert3c.v7.json' },
];
const las = (f: string) => JSON.parse(readFileSync(path.join('src/lib/logicTestV7', f), 'utf8')) as LayeredQuestion[];
const NAMN = Object.fromEntries((familjer as { id: string; namn: string }[]).map((f) => [f.id, f.namn]));

const matt = new Map<string, FragaMatt>();

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Vad varje alternativ bryter, för frågor med två eller fler regler (distraktorer.mjs). */
function distraktorRad(q: V3Fraga) {
  const a = analysera(q);
  if (!a.ok || a.R.length < 2) return '';
  const rader = (radPerAlternativ(a) as string[]).filter((x) => !/rätt svar$/.test(x));
  return `<p class="band">${q.mekanism ? `<b>${esc(q.mekanism)}</b> · ` : ''}${a.R.length} regler (${esc(a.R.join(', '))}) · nära miss ${a.naraMiss} av 5<br>${rader.map(esc).join(' · ')}</p>`;
}

function kort(q: LayeredQuestion, niva: string, kalla: string) {
  const b = q as V3Fraga;
  const mall = b.recept ? ` · mall ${esc(b.recept)}${b.p_prior != null ? `, p_prior ${String(b.p_prior).replace('.', ',')}` : ''}` : '';
  const celler = q.grid.flat().map((c) =>
    c ? `<div class="cell">${svg(c)}</div>` : `<div class="cell tom">${luckaSvg()}</div>`
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
  const m = matFraga(q);
  matt.set(q.id, m);
  const over = m.noder > MAX_NODER_PER_FRAGA || m.bytes > MAX_BYTES_PER_FRAGA;
  return `<article id="${q.id}">
    <header><div class="id">${q.id} <span class="${over ? 'varn' : 'matt'}">${m.noder} noder · ${(m.bytes / 1024).toFixed(1)} kB</span></div><div class="meta">${niva} · ${NAMN[q.family ?? ''] ?? q.family} · svårighet ${q.difficulty} · ${kalla}${mall}</div><h2>${esc(q.title)}</h2>${FIL ? distraktorRad(b) : ''}</header>
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
article{width:360px}
.matt{font-weight:400;color:#65656E} .varn{color:#985A08}
.grid{width:328px;background:#E3E1DC;border:1px solid #E3E1DC;border-radius:16px;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;overflow:hidden}
.cell{aspect-ratio:1;background:#fff;display:flex}
.cell svg{width:100%;height:100%;padding:10%;display:block}
.cell.tom{background:#F4F3F0} .cell.tom svg{padding:0}
.alts{width:328px;margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.alt{position:relative;aspect-ratio:1;background:#fff;border:1px solid #E3E1DC;border-radius:12px;display:flex}
.alt svg{width:100%;height:100%;padding:10%;display:block}
.alt.ratt{border-color:#E07A2F;box-shadow:inset 0 0 0 1px #E07A2F}
.bokstav{position:absolute;left:8px;top:6px;font-size:11px;font-weight:600;color:#65656E}
.alt.ratt .bokstav{color:#A8491A}
.regel{margin:12px 0 4px;font-size:13px;line-height:18px;color:#4A4A55}
.misstag{margin:0;padding-left:0;list-style:none;font-size:12px;line-height:17px;color:#1A1A1F}
.band{margin:-6px 0 10px;font-size:12px;line-height:17px;color:#4A4A55;background:#F4F3F0;border:1px solid #E3E1DC;border-radius:8px;padding:6px 8px}
.misstag li{margin:2px 0} .misstag em{color:#A8491A;font-style:normal} .misstag .varn{color:#985A08}
`;

const valda: { q: LayeredQuestion; niva: string; kalla: string }[] = [];
const harRing = (q: LayeredQuestion) =>
  [...q.grid.flat(), ...q.options].some((c) => c && (Array.isArray(c) ? c : [c]).some((p) => (p as { kind?: string }).kind === 'ring'));
if (FIL) {
  const nivaFor = (q: V3Fraga) => (q.band ? 'expert' : ({ g: 'grund', a: 'avancerad', e: 'expert' } as Record<string, string>)[/^v7([gae])-/.exec(q.id)?.[1] ?? 'e']);
  for (const q of JSON.parse(readFileSync(FIL, 'utf8')) as V3Fraga[]) {
    if (BARA.size && !BARA.has(q.id)) continue;
    valda.push({ q, niva: nivaFor(q), kalla: q.band ? `kandidat, ${q.band}` : 'kandidat' });
  }
} else if (ALLA) {
  for (const { niva, fryst, ny } of NIVAER) {
    for (const [fil, kalla] of [[fryst, 'fryst'], [ny, '3c']] as const) {
      for (const q of las(fil)) if (!q.pensionerad) valda.push({ q, niva, kalla });
    }
  }
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
for (const { niva, fryst, ny } of FIL || ALLA || RINGAR || FRAGOR.length ? [] : NIVAER) {
  const F = las(fryst);
  const N = las(ny);
  for (const f of familjer as { id: string }[]) {
    N.filter((q) => q.family === f.id).slice(0, 2).forEach((q) => valda.push({ q, niva, kalla: '3c' }));
    F.filter((q) => q.family === f.id).slice(0, 1).forEach((q) => valda.push({ q, niva, kalla: 'fryst' }));
  }
  // de frusna frågor som väntar på manuell granskning tas alltid med
  F.filter((q) => q.misstagGranskas?.length && !valda.some((v) => v.q.id === q.id)).forEach((q) => valda.push({ q, niva, kalla: 'fryst' }));
}

const artiklar = valda.map((v) => kort(v.q, v.niva, v.kalla));
// V11: max noder och bytes per nivå och källa
const perBank = new Map<string, { n: number; noder: number; bytes: number; id: string }>();
for (const v of valda) {
  const m = matt.get(v.q.id)!;
  const k = `${v.niva} ${v.kalla}`;
  const b = perBank.get(k) ?? { n: 0, noder: 0, bytes: 0, id: '' };
  b.n++;
  if (m.noder > b.noder) b.id = v.q.id;
  b.noder = Math.max(b.noder, m.noder);
  b.bytes = Math.max(b.bytes, m.bytes);
  perBank.set(k, b);
}
const summering = `<section class="summa"><h2>Noder och bytes per fråga (V11: högst ${MAX_NODER_PER_FRAGA} noder och ${MAX_BYTES_PER_FRAGA / 1024} kB)</h2><table>${[...perBank]
  .map(([k, b]) => `<tr><td>${k}</td><td>${b.n} frågor</td><td>max ${b.noder} noder (${b.id})</td><td>max ${(b.bytes / 1024).toFixed(1)} kB</td></tr>`)
  .join('')}</table></section>`;
const html = `<!doctype html><html lang="sv"><head><meta charset="utf-8"><title>Matrisgranskning</title><style>${CSS}.summa{padding:16px;font-size:12px}.summa td{padding:2px 8px 2px 0}</style></head><body>${summering}${artiklar.join('\n')}</body></html>`;
const htmlFil = path.resolve(UT, 'index.html');
writeFileSync(htmlFil, html);

async function main() {
if (BARA_HTML) {
  console.log(`Skrev index.html med ${valda.length} frågor till ${UT}`);
  for (const [k, b] of perBank) console.log(`${k}: ${b.n} frågor, max ${b.noder} noder, max ${(b.bytes / 1024).toFixed(1)} kB`);
  return;
}
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900, deviceScaleFactor: 2 });
await page.goto('file:///' + htmlFil.replace(/\\/g, '/'), { waitUntil: 'load' });
let n = 0;
for (const v of valda) {
  const el = await page.$(`article[id="${v.q.id}"]`);
  if (!el) continue;
  const fam = v.q.family ?? 'okand';
  const rec = (v.q as V3Fraga).recept ?? (v.q as V3Fraga).mekanism;
  await el.screenshot({ path: path.join(UT, FIL && rec ? `${rec}-${v.q.id}.png` : `${v.niva}-${fam}-${v.q.id}.png`) as `${string}.png` });
  n++;
}
await browser.close();
console.log(`Skrev ${n} PNG och index.html till ${UT}`);
const per: Record<string, number> = {};
valda.forEach((v) => { const k = `${v.niva}/${v.q.family}`; per[k] = (per[k] ?? 0) + 1; });
console.log(Object.entries(per).map(([k, x]) => `${k}: ${x}`).join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
