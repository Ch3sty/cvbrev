#!/usr/bin/env node
// scripts/figurserier-omgang3-ersattare.mjs
// =============================================================================
// Granskningen av omgång 3, spår E (docs/qa/omgang3-e/granskning.md och
// beslut.json) strök fyra härnäst i parti 2. De får ersättare med samma id,
// samma mall och variant, ny rad:
//
//   fs-g-antal-17  F2: samma regel som fs-g-antal-14 med bara annan start.
//                  Ersättaren får inte dela primitiv, riktning och antal med
//                  någon F2 på nivån (validate-figurserier.mjs, F2-nyckeln);
//                  strålar moturs eller en annan primitiv.
//   fs-a-vaxl-11   F9: första serien förlängd gav facit. Ersättarna klarar F9
//   fs-a-vaxl-12   (sparrar.mjs, s0 + 3·ke ≠ s1 + 2·ko mod 8) och "rena först".
//   fs-a-vaxl-13
//
// Godkända frågor rörs inte. Deterministiskt. Kör:
//   node scripts/figurserier-omgang3-ersattare.mjs
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { MALLAR } from './lib/serie/recept-serie.mjs';
import { bygg } from './lib/serie/generera-serie.mjs';
import { sparrFelSerie } from './lib/serie/sparrar.mjs';
import { radNyckel, lagesNyckel } from './lib/serie/struktur.mjs';
import { analysera } from './lib/serie/distraktorer.mjs';
import { lasCell, byggCell, dimNyckel } from './lib/serie/celler-serie.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';

const K = 'src/lib/figurserierV1/kandidater';
const ERSATT = ['fs-g-antal-17', 'fs-a-vaxl-11', 'fs-a-vaxl-12', 'fs-a-vaxl-13'];
const VARIANT = Object.fromEntries(MALLAR.flatMap((m) => m.varianter.map((v) => [v.namn, { mall: m, v }])));

const filer = {
  grund: `${K}/parti2-grund.json`,
  avancerad: `${K}/parti2-avancerad.json`,
};
const parti2 = Object.fromEntries(Object.entries(filer).map(([n, f]) => [n, JSON.parse(readFileSync(f, 'utf8'))]));

// Allt som redan finns (utom de som ersätts): rader, lägesrader och F2-nycklar.
const ovriga = [
  'src/lib/figurserierV1/bankGrund.json', 'src/lib/figurserierV1/bankAvancerad.json', 'src/lib/figurserierV1/bankExpert.json',
  ...['', 'omgang1/', 'omgang2/'].flatMap((d) => ['grund', 'avancerad', 'expert'].map((n) => `${K}/${d}${n}.json`)),
].filter((f) => existsSync(f)).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')));
const finns = [...ovriga, ...Object.values(parti2).flat().filter((q) => !ERSATT.includes(q.id))];
const rader = new Set(finns.map(radNyckel));
const lagen = new Set(finns.map((q) => (lagesNyckel(q) ? `${q.niva}|${lagesNyckel(q)}` : null)).filter(Boolean));
const f2 = (q) => (q.recept === 'F2' && q.regler.dims.antal?.regel === 'steg' ? `${q.niva}|${q.regler.prim}|${q.regler.dims.antal.k}|${q.regler.dims.antal.s0}` : null);
const f2Nycklar = new Set(finns.map(f2).filter(Boolean));

/**
 * Rena först (granskning 01, punkt 6): distraktorer som bara bryter regeln och
 * håller konstanterna går före konstantbrott. Krav här: minst två rena i F5 (vaxl-14 till 16 har två)
 * (F2 vid gränsen har inga rena utan kopia), och ingen kopia i någon.
 */
function renaForst(q) {
  const V = q.options.map((o) => lasCell(o)?.v);
  if (V.some((v) => !v)) return false;
  const a = analysera(q, V);
  const dist = a.alternativ.filter((x) => !x.facit);
  if (dist.some((x) => x.kopia)) return false;
  const rena = dist.filter((x) => x.bryter.length === 1 && x.konst.length === 0).length;
  if (rena < (q.recept === 'F5' ? 2 : 0)) return false;
  // F5: fällan "fortsätter första serien" (granskning omgång 3, F9) står som
  // ren distraktor: facit med första seriens förlängning i det växelvisa läget.
  if (q.recept === 'F5') {
    const facit = V[q.correctAnswer];
    for (const [id, r] of Object.entries(q.regler.dims)) {
      if (r.regel !== 'vaxelvis') continue;
      const falla = byggCell(q.regler.prim, { ...facit, [id]: (((r.s0 + 3 * r.ke) % 8) + 8) % 8 });
      if (!q.options.some((o) => dimNyckel(o) === dimNyckel(falla))) return false;
    }
  }
  return true;
}

for (const id of ERSATT) {
  const niva = id.startsWith('fs-g-') ? 'grund' : 'avancerad';
  const lista = parti2[niva];
  const i = lista.findIndex((q) => q.id === id);
  if (i < 0) throw new Error(`${id} saknas i parti 2`);
  const gammal = lista[i];
  // F2: strålarnas båda F2-nycklar (uppåt från två, nedåt från sju) finns
  // redan på grund, så ersättaren tar en annan primitiv i samma mall.
  // Sektorhjulet uppåt till sju ger 125 noder (V11, gräns 120); blocket först.
  const varianter = gammal.recept === 'F2' ? ['block-antal'] : [gammal.variant];
  let ny = null;
  for (let n = 0; n < 5000 && !ny; n++) {
    const { mall, v } = VARIANT[varianter[n % varianter.length]];
    const r = mulberry32(hashString(`ersattare-omgang3:${id}:${n}`));
    const q = bygg(r, mall, v, { id, pos: gammal.correctAnswer });
    if (!q) continue;
    q.fran_version = 2;
    if (sparrFelSerie(q).fel.length) continue;
    if (rader.has(radNyckel(q))) continue;
    const l = lagesNyckel(q);
    if (l && lagen.has(`${q.niva}|${l}`)) continue;
    const k = f2(q);
    if (k && f2Nycklar.has(k)) continue;
    if (!renaForst(q)) continue;
    ny = q;
  }
  if (!ny) throw new Error(`${id}: ingen ersättare`);
  lista[i] = ny;
  rader.add(radNyckel(ny));
  if (lagesNyckel(ny)) lagen.add(`${ny.niva}|${lagesNyckel(ny)}`);
  if (f2(ny)) f2Nycklar.add(f2(ny));
  console.log(`${id}: ny rad (${ny.variant}), ${ny.rule}`);
}

for (const [n, f] of Object.entries(filer)) writeFileSync(f, JSON.stringify(parti2[n], null, 1) + '\n');
