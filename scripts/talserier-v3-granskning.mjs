// scripts/talserier-v3-granskning.mjs
// =============================================================================
// Åtgärderna efter testansvarigs granskning av bankversion 3
// (docs/fragebank/talserier-2026-11-19-omg2-granskning.md), en gång före
// aktiveringen. Raderna har aldrig visats (version 3 var inte påslagen).
//
//  1. ts-e-andra-32 hade samma stegföljd som ts-a-andra-02 (raden minus 84).
//     Samma id och familj, nya parametrar, kontrollerade mot V7 och V8.
//  2. ts-a-andra-01 och ts-a-andra-05: regeltexten listar alla fem visade steg
//     (fyra steg som +1, +1, +2, +4 läses som dubblering).
//
// Kör: node scripts/talserier-v3-granskning.mjs [--torr]
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, byggFraga, valjAlternativ, misstagText, slumpare } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera, arForskjuten, harSammaSteg } from './talserier-verifiera.mjs';
import { PARAMS, VERSION } from './gen-talserier-v3.mjs';

const torr = process.argv.includes('--torr');
const ERSATT = 'ts-e-andra-32';
const REGELTEXT = ['ts-a-andra-01', 'ts-a-andra-05'];

const NIV = Object.keys(NIVAER);
const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const fil = (niva) => `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
const banker = Object.fromEntries(NIV.map((n) => [n, las(fil(n))]));
const artiklar = las('src/lib/artikelfigurer/talserier.json');
const allaRader = () => [...NIV.flatMap((n) => banker[n]), ...artiklar];
const logg = [];

// 1. Ersättaren
{
  const bank = banker.expert;
  const gammal = bank.find((q) => q.id === ERSATT);
  if (gammal.fran_version !== VERSION) throw new Error(`${ERSATT} är inte en ny rad`);
  const platser = [0, 0, 0, 0, 0];
  for (const q of bank) if (q.id !== ERSATT) platser[q.correctAnswer]++;
  const rng = slumpare(`talserier-v3-granskning:${ERSATT}`);
  let ny = null;
  for (let forsok = 0; forsok < 200000 && !ny; forsok++) {
    const params = PARAMS.expert.andra_ordningen(rng);
    if (bank.some((q) => q.family === gammal.family && JSON.stringify(q.params) === JSON.stringify(params))) continue;
    const f = byggFraga({ familj: gammal.family, params, niva: 'expert', visade: 6, id: ERSATT });
    // inget tal upprepas, facit inräknat
    if (!f || new Set([...f.visade, ...f.facit]).size !== f.visade.length + f.facit.length) continue;
    if (allaRader().some((q) => q.visade.join(',') === f.visade.join(','))) continue;
    if (bank.filter((q) => q.id !== ERSATT && q.family === f.familj && q.regelnyckel === f.regelnyckel).length >= 2) continue;
    const val = valjAlternativ(f, platser, rng);
    if (!val) continue;
    const fraga = {
      ...gammal,
      params,
      regel: f.regel,
      regelnyckel: f.regelnyckel,
      visade: f.visade,
      options: val.alla.map((x) => x.v),
      correctAnswer: val.plats,
      typer: val.alla.map((x) => x.typer),
      misstag: val.alla.map((x) => (x.typer.length ? misstagText(x.typer, { sista: f.visade[f.visade.length - 1], varde: x.v, facit: f.facit }) : '')),
      bagar: f.bagar,
    };
    const andra = allaRader().filter((q) => q.id !== ERSATT);
    if (arForskjuten(fraga, andra) || harSammaSteg(fraga, andra)) continue;
    if (sparrFel(fraga).length) continue;
    const v = verifiera(fraga);
    if (v.fel.length || v.varn.length) continue;
    if (nivaFel(bank.map((q) => (q.id === ERSATT ? fraga : q))).length) continue;
    ny = fraga;
  }
  if (!ny) throw new Error(`hittade ingen ersättare för ${ERSATT}`);
  bank[bank.indexOf(gammal)] = ny;
  logg.push(`${ERSATT}: ${gammal.visade.join(' ')} -> ${ny.visade.join(' ')} (facit ${ny.options[ny.correctAnswer].join(' och ')}); ${ny.regel}`);
}

// 2. Regeltexterna med alla fem steg
for (const id of REGELTEXT) {
  const q = banker.avancerad.find((x) => x.id === id);
  const f = byggFraga({ familj: q.family, params: q.params, niva: 'avancerad', visade: q.visade.length, id });
  logg.push(`${id}: "${q.regel}" -> "${f.regel}"`);
  q.regel = f.regel;
}

let fel = 0;
for (const n of NIV) {
  const nf = nivaFel(banker[n]);
  for (const x of nf) console.log(n, x);
  fel += nf.length;
  for (const q of banker[n]) {
    const v = verifiera(q);
    fel += v.fel.length;
    for (const x of v.fel) console.log(x);
  }
}
for (const l of logg) console.log(l);
if (!torr && !fel) for (const n of NIV) writeFileSync(fil(n), (JSON.stringify(banker[n], null, 1) + '\n').replace(/\n/g, '\r\n'));
console.log(fel ? `${fel} fel, inget skrivet` : torr ? 'torrkörning, inget skrivet' : 'skrivet');
process.exit(fel ? 1 : 0);
