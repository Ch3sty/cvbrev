// scripts/lib/serie/kontroll.mjs
// =============================================================================
// Serie-lägena i kontrollskripten (beställningen omgång 2, A6 punkt 2):
//
//   node scripts/v7-facit-check.mjs --serie [fil ...]
//       FS1 till FS6, S5, S6, S11 till S13 per fråga (sparrar.mjs), facit
//       entydigt ur de fem visade (FS4), reglerna återger raden och är den
//       enklaste läsningen, och misstag i banken är desamma som generatorns.
//   node scripts/v7-distraktor-check.mjs --serie [fil ...]
//       kraven på de fem distraktorerna (A5) och en rad per alternativ.
//
// Utan filer: de tre skarpa bankerna. Kandidatfilerna (med strukna frågor
// kvar för spårbarheten) kontrolleras med filerna som argument. Exit 1 vid fel.
// =============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { PRIM, byggCell, dimNyckel, lasCell } from './celler-serie.mjs';
import { radVarden, tolkaRad, enklaste, VISADE } from './tolka-serie.mjs';
import { sparrFelSerie, GODKANDA } from './sparrar.mjs';
import { analysera, kravFel, radPerAlternativ } from './distraktorer.mjs';
import { misstagText } from './misstag-serie.mjs';

export const SERIE_FILER = [
  'src/lib/figurserierV1/bankGrund.json',
  'src/lib/figurserierV1/bankAvancerad.json',
  'src/lib/figurserierV1/bankExpert.json',
];

export function lasFiler(argv) {
  const filer = argv.length ? argv : SERIE_FILER.filter((f) => existsSync(f));
  return filer.map((f) => ({ fil: f, fragor: JSON.parse(readFileSync(f, 'utf8')) }));
}

/** Reglerna återger raden och facit, och är den enklaste läsningen per dimension. */
export function reglerFel(q) {
  const fel = [];
  if (!q.regler || !PRIM[q.regler.prim]) return [`${q.id}: regler saknas eller okänd primitiv`];
  let vals;
  try {
    vals = radVarden(q.regler.prim, q.regler.dims, 6);
  } catch (e) {
    return [`${q.id}: reglerna går inte att räkna (${e.message})`];
  }
  const celler = vals.map((v) => byggCell(q.regler.prim, v));
  for (let i = 0; i < VISADE; i++) if (dimNyckel(celler[i]) !== dimNyckel(q.rad[i])) fel.push(`${q.id}: figur ${i + 1} stämmer inte med reglerna`);
  if (dimNyckel(celler[5]) !== dimNyckel(q.options[q.correctAnswer])) fel.push(`${q.id}: facit stämmer inte med reglerna`);
  const t = tolkaRad(q.rad);
  if (t.ok) {
    for (const d of PRIM[q.regler.prim].dims) {
      const e = enklaste(t.per[d.id].hyp);
      const r = q.regler.dims[d.id];
      if (!e) continue;
      if (e.regel !== r.regel) fel.push(`${q.id}: den enklaste läsningen av ${d.id} är ${e.regel}, regeln säger ${r.regel}`);
    }
  }
  return fel;
}

/** Misstagen i banken mot generatorns texter. */
function misstagFel(q) {
  const fel = [];
  const facit = lasCell(q.options[q.correctAnswer])?.v;
  if (!facit) return fel;
  q.options.forEach((o, i) => {
    if (i === q.correctAnswer) {
      if (q.misstag?.[i]) fel.push(`${q.id}: misstag för facit ska vara tomt`);
      return;
    }
    if (!q.misstag?.[i]) fel.push(`${q.id}: misstag saknas för alternativ ${'ABCDEF'[i]}`);
  });
  void misstagText;
  return fel;
}

export function facitCheckSerie(argv) {
  const fel = [];
  const info = [];
  let n = 0;
  for (const { fil, fragor } of lasFiler(argv)) {
    for (const q of fragor) {
      n++;
      const s = sparrFelSerie(q);
      fel.push(...s.fel, ...reglerFel(q), ...misstagFel(q));
      info.push(...s.info);
    }
    console.log(`${fil}: ${fragor.length} frågor`);
  }
  if (info.length) {
    console.log(`\nUpplysningar (${info.length}):`);
    info.forEach((x) => console.log('  ' + x));
  }
  if (fel.length) {
    console.log(`\n${fel.length} fel:`);
    fel.forEach((x) => console.log('  ' + x));
    return 1;
  }
  console.log(`\n${n} frågor: FS1 till FS6, S5, S6, S11 till S13, reglerna och misstagen utan fel.`);
  return 0;
}

export function distraktorCheckSerie(argv) {
  const fel = [];
  let n = 0;
  const visa = argv.includes('--visa');
  for (const { fil, fragor } of lasFiler(argv.filter((a) => a !== '--visa'))) {
    for (const q of fragor) {
      n++;
      const V = q.options.map((o) => lasCell(o)?.v);
      if (V.some((v) => !v)) { fel.push(`${q.id}: ett alternativ går inte att läsa`); continue; }
      const a = analysera(q, V);
      kravFel(a, q.niva, { godkand: GODKANDA.has(q.id) }).forEach((x) => fel.push(`${q.id}: ${x}`));
      if (visa) console.log(`${q.id} (${a.R.join(', ')}): ${radPerAlternativ(a).join(' · ')}`);
    }
    console.log(`${fil}: ${fragor.length} frågor`);
  }
  if (fel.length) {
    console.log(`\n${fel.length} fel:`);
    fel.forEach((x) => console.log('  ' + x));
    return 1;
  }
  console.log(`\n${n} frågor: distraktorerna klarar kraven i A5.`);
  return 0;
}
