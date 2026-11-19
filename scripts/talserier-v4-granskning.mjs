// scripts/talserier-v4-granskning.mjs
// =============================================================================
// Åtgärderna efter testansvarigs granskning av bankversion 4
// (docs/fragebank/talserier-2026-11-19-omg3-granskning.md), en gång före
// aktiveringen. Raderna med fran_version 4 har aldrig visats.
//
//  1. Åtta geometriska grundrader delade räknesättspar (samma kvotföljd) med
//     en annan rad. Samma id och familj, ett eget räknesättspar per rad enligt
//     granskarens förslag. Klarar en rad inte spärrarna pensioneras den med
//     pensionerad_fran: 4.
//  2. ts-e-andra-43 (kvadrattalen) byts mot en rad med krympande skillnad
//     mellan stegen och en skillnadsföljd som ingen annan rad har.
//  3. Misstagstexten för "tredje_for_mycket" säger "ändras" i stället för
//     "växer" i rader där skillnaden minskar (ts-e-andra-33, 39, 40, 44).
//  4. Tolv regeltexter från omgång 2 listar alla fem steg (bara texten).
//
// Kör: node scripts/talserier-v4-granskning.mjs [--torr]
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, byggFraga, valjAlternativ, misstagText, slumpare } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera, arForskjuten, harSammaSteg, sammaStegPar } from './talserier-verifiera.mjs';
import { PARAMS, VERSION } from './gen-talserier-v4.mjs';

const torr = process.argv.includes('--torr');
const NIV = Object.keys(NIVAER);
const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const fil = (niva) => `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
const banker = Object.fromEntries(NIV.map((n) => [n, las(fil(n))]));
const artiklar = las('src/lib/artikelfigurer/talserier.json');
const allaRader = () => [...NIV.flatMap((n) => banker[n]), ...artiklar];
const logg = [];

/**
 * Granskarens förslag: ett eget räknesättspar per rad, fem visade tal.
 * Förslagen för 13 (×5, ÷4), 11 (×4, ÷5), 19 (÷2, ÷5), 17 och 15 får inte
 * fyra typade fel nära facit. 17 och 15 behåller paret med en annan start,
 * 13 och 11 får två par som ingen annan rad har (×2, ×4 och ÷4, ÷2), och 19
 * pensioneras: det finns inget mer par under 400 som klarar spärrarna.
 */
const GEOM = {
  'ts-g-geom-13': { a: 1, kv: [[2, 1], [4, 1]] },
  'ts-g-geom-11': { a: 256, kv: [[1, 4], [1, 2]] },
  'ts-g-geom-19': { a: 200, kv: [[1, 2], [1, 5]] },
  'ts-g-geom-17': { a: 27, kv: [[5, 1], [1, 3]] },
  'ts-g-geom-09': { a: 125, kv: [[2, 1], [1, 5]] },
  'ts-g-geom-15': { a: 125, kv: [[1, 5], [3, 1]] },
  'ts-g-geom-16': { a: 1, kv: [[2, 1], [5, 1]] },
  'ts-g-geom-18': { a: 216, kv: [[1, 2], [1, 3]] },
};

/** Granskarens punkt 4: de tolv regeltexterna, ord för ord. */
const REGELTEXT = {
  'ts-a-andra-02': 'Stegen är −3, −1, +3, +9, +17 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+2, +4, +6, +8).',
  'ts-a-andra-03': 'Stegen är +5, +8, +13, +20, +29 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+3, +5, +7, +9).',
  'ts-a-andra-04': 'Stegen är −2, −1, +2, +7, +14 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+1, +3, +5, +7).',
  'ts-a-andra-06': 'Stegen är +5, +8, +13, +20, +29 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (+3, +5, +7, +9).',
  'ts-e-andra-28': 'Stegen är +3, +2, +3, +6, +11 och så vidare. Skillnaden mellan två steg växer med 2 varje gång (−1, +1, +3, +5).',
  'ts-e-andra-29': 'Stegen är −9, −12, −11, −6, +3 och så vidare. Skillnaden mellan två steg växer med 4 varje gång (−3, +1, +5, +9).',
  'ts-e-andra-30': 'Stegen är +4, +8, +10, +10, +8 och så vidare. Skillnaden mellan två steg minskar med 2 varje gång (+4, +2, 0, −2).',
  'ts-e-andra-31': 'Stegen är +3, +1, −5, −15, −29 och så vidare. Skillnaden mellan två steg minskar med 4 varje gång (−2, −6, −10, −14).',
  'ts-e-andra-33': 'Stegen är −4, −2, −2, −4, −8 och så vidare. Skillnaden mellan två steg minskar med 2 varje gång (+2, 0, −2, −4).',
  'ts-e-andra-34': 'Stegen är −2, −4, −7, −11, −16 och så vidare. Skillnaden mellan två steg minskar med 1 varje gång (−2, −3, −4, −5).',
  'ts-e-andra-35': 'Stegen är +1, +3, +6, +10, +15 och så vidare. Skillnaden mellan två steg växer med 1 varje gång (+2, +3, +4, +5).',
  'ts-e-andra-36': 'Stegen är +1, −2, −4, −5, −5 och så vidare. Skillnaden mellan två steg växer med 1 varje gång (−3, −2, −1, 0).',
};
const MISSTAG = ['ts-e-andra-33', 'ts-e-andra-39', 'ts-e-andra-40', 'ts-e-andra-44'];
const GAMMAL_TEXT = 'Skillnaden mellan stegen växer lika mycket varje gång.';
const NY_TEXT = 'Skillnaden mellan stegen ändras lika mycket varje gång.';

const ENKLARE = ['forra_differensen', 'kvadratisk_tolkning'];
const nara = (f) => {
  const rad = [...f.visade, ...f.facit];
  const grans = 2 * Math.max(...rad.slice(1).map((x, i) => Math.abs(x - rad[i])));
  return f.kandidater.filter((c) => Math.abs(c.v[0] - f.facit[0]) <= grans);
};

/** Bygger en ersättare för `gammal` med `params`, eller null om någon spärr fäller den. */
function ersattare(gammal, params, bank, rng) {
  const f = byggFraga({ familj: gammal.family, params, niva: gammal.niva, visade: gammal.niva === 'grund' ? 5 : 6, id: gammal.id });
  if (!f) return [null, 'utanför'];
  if (new Set([...f.visade, ...f.facit]).size !== f.visade.length + f.facit.length) return [null, 'upprepat tal'];
  if (allaRader().some((q) => q.id !== gammal.id && q.visade.join(',') === f.visade.join(','))) return [null, 'rad finns'];
  if (bank.filter((q) => q.id !== gammal.id && q.family === f.familj && q.regelnyckel === f.regelnyckel).length >= 2) return [null, 'regel full'];
  if (gammal.niva === 'grund') f.kandidater = nara(f);
  if (params.t) f.kandidater = f.kandidater.filter((c) => !c.typer.some((t) => ENKLARE.includes(t)));
  const platser = [0, 0, 0, 0, 0];
  for (const q of bank) if (q.id !== gammal.id) platser[q.correctAnswer]++;
  let fraga = null;
  for (let i = 0; i < 50 && !fraga; i++) {
    const val = valjAlternativ(f, platser, rng);
    if (!val) return [null, 'alternativ'];
    const kand = {
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
    if (sparrFel(kand).length) continue;
    const v = verifiera(kand);
    if (v.fel.length || v.varn.length) continue;
    fraga = kand;
  }
  if (!fraga) return [null, 'spärr eller verifierare'];
  const andra = allaRader().filter((q) => q.id !== gammal.id);
  if (arForskjuten(fraga, andra)) return [null, 'V7'];
  if (harSammaSteg(fraga, andra)) return [null, 'V8'];
  if (nivaFel(bank.map((q) => (q.id === gammal.id ? fraga : q))).length) return [null, 'nivå'];
  return [fraga, null];
}

// 1. De geometriska grundraderna
{
  const bank = banker.grund;
  for (const [id, params] of Object.entries(GEOM)) {
    const gammal = bank.find((q) => q.id === id);
    if (gammal.fran_version !== VERSION) throw new Error(`${id} är inte en ny rad`);
    const [ny, varfor] = ersattare(gammal, params, bank, slumpare(`talserier-v4-granskning:${id}`));
    if (!ny) {
      gammal.pensionerad_fran = VERSION;
      logg.push(`${id}: pensioneras (${varfor})`);
      continue;
    }
    bank[bank.indexOf(gammal)] = ny;
    logg.push(`${id}: ${gammal.visade.join(' ')} -> ${ny.visade.join(' ')} (facit ${ny.options[ny.correctAnswer].join(' ')}); ${ny.regel}`);
  }
}

// 2. ts-e-andra-43: krympande skillnad, ny skillnadsföljd
{
  const ID = 'ts-e-andra-43';
  const bank = banker.expert;
  const gammal = bank.find((q) => q.id === ID);
  if (gammal.fran_version !== VERSION) throw new Error(`${ID} är inte en ny rad`);
  // skillnaderna mellan stegen (andra differensen) i raden med facit
  const skillnader = (q) => {
    const r = [...q.visade, ...q.options[q.correctAnswer]];
    const d = r.slice(1).map((x, i) => x - r[i]);
    return d.slice(1).map((x, i) => x - d[i]).join(',');
  };
  const sedda = new Set(allaRader().filter((q) => q.id !== ID && (q.family === 'andra_ordningen' || q.family === 'kvadratisk')).map(skillnader));
  const delar = (s) => s.split(',').map(Number);
  const gemensam = (a, b) => {
    let bast = 0;
    for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) {
      let n = 0;
      while (i + n < a.length && j + n < b.length && a[i + n] === b[j + n]) n++;
      bast = Math.max(bast, n);
    }
    return bast;
  };
  const rng = slumpare(`talserier-v4-granskning:${ID}`);
  let ny = null;
  for (let forsok = 0; forsok < 300000 && !ny; forsok++) {
    const params = PARAMS.expert.andra_ordningen(rng);
    if (params.t >= 0) continue; // krympande skillnad
    const [kand] = ersattare(gammal, params, bank, rng);
    if (!kand) continue;
    // ingen annan rad i andra eller tredje ordningen har fyra skillnader i följd gemensamma
    const s = delar(skillnader(kand));
    if ([...sedda].some((x) => gemensam(s, delar(x)) >= 4)) continue;
    ny = kand;
  }
  if (!ny) throw new Error(`hittade ingen ersättare för ${ID}`);
  bank[bank.indexOf(gammal)] = ny;
  logg.push(`${ID}: ${gammal.visade.join(' ')} -> ${ny.visade.join(' ')} (facit ${ny.options[ny.correctAnswer].join(' ')}); ${ny.regel}`);
}

// 3. Misstagstexten där skillnaden minskar
for (const id of MISSTAG) {
  const q = banker.expert.find((x) => x.id === id);
  let n = 0;
  q.misstag = q.misstag.map((m) => (m.includes(GAMMAL_TEXT) ? (n++, m.replace(GAMMAL_TEXT, NY_TEXT)) : m));
  if (!n) throw new Error(`${id} har inte den gamla texten`);
  logg.push(`${id}: misstagstexten säger "ändras"`);
}

// 4. Regeltexterna: granskarens text ska vara exakt det generatorn skriver
for (const [id, text] of Object.entries(REGELTEXT)) {
  const q = allaRader().find((x) => x.id === id);
  const f = byggFraga({ familj: q.family, params: q.params, niva: q.niva, visade: q.visade.length, id });
  if (f.regel !== text) throw new Error(`${id}: granskarens text skiljer sig från generatorns ("${f.regel}")`);
  q.regel = text;
}
logg.push(`regeltexterna: ${Object.keys(REGELTEXT).length} rader listar alla fem steg`);

let fel = 0;
for (const n of NIV) {
  const nf = nivaFel(banker[n]);
  for (const x of nf) console.log(n, x);
  fel += nf.length;
  for (const q of banker[n]) {
    const v = verifiera(q);
    fel += v.fel.length + v.varn.length;
    for (const x of [...v.fel, ...v.varn]) console.log(x);
  }
}
const par = sammaStegPar(NIV.flatMap((n) => banker[n]), 3);
for (const p of par) console.log(`${p.a.id} och ${p.b.id}: V8`);
fel += par.length;
for (const l of logg) console.log(l);
if (!torr && !fel) for (const n of NIV) writeFileSync(fil(n), (JSON.stringify(banker[n], null, 1) + '\n').replace(/\n/g, '\r\n'));
console.log(fel ? `${fel} fel, inget skrivet` : torr ? 'torrkörning, inget skrivet' : 'skrivet');
process.exit(fel ? 1 : 0);
