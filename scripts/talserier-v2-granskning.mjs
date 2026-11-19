// scripts/talserier-v2-granskning.mjs
// =============================================================================
// Åtgärderna efter testansvarigs granskning av bankversion 2
// (docs/fragebank/talserier-2026-11-19-granskning.md), en gång före aktivering:
//
//  1. Byter ut de nya rader som är samma serie som en annan rad, förskjuten
//     (V7 i scripts/talserier-verifiera.mjs): ts-a-affin-24, ts-a-affin-29,
//     ts-g-vaxel-32, ts-e-affin-21 och gränsfallen ts-g-andra-24 och
//     ts-g-vaxel-26. Samma id och familj, nya parametrar. Raderna har aldrig
//     visats (version 2 var inte påslagen).
//  2. Pensionerar ts-e-affin-11 och ts-e-affin-08 från version 2
//     (identiska med ts-a-affin-07 och ts-a-affin-21). Version 1 drar dem
//     som förut, så pågående sessioner påverkas inte.
//  3. Grund, version 2: distraktorer långt från facit (mer än två gånger det
//     största steget i raden, oftast "kvadratisk tolkning") byts mot närmare
//     typade fel när det finns tillräckligt många.
//  4. Regeltexten i version 2: "Steget dubblas" vid negativt steg i geometrisk
//     differens, "Multiplicera det förra med −2 och dra bort 8" för ×k + c med
//     negativt k.
//
// Kör: node scripts/talserier-v2-granskning.mjs [--torr]
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { NIVAER, KORT, byggFraga, valjAlternativ, misstagText, slumpare, valj } from './lib/talserie/generera.mjs';
import { sparrFel, nivaFel } from './lib/talserie/sparrar.mjs';
import { verifiera, arForskjuten } from './talserier-verifiera.mjs';
import { PARAMS, P_PRIOR, P_FAMILJ, SVARIGHET, VERSION } from './gen-talserier-v2.mjs';

const torr = process.argv.includes('--torr');
const ERSATT = ['ts-a-affin-24', 'ts-a-affin-29', 'ts-g-vaxel-32', 'ts-e-affin-21', 'ts-g-andra-24', 'ts-g-vaxel-26'];
const PENSIONERA = ['ts-e-affin-11', 'ts-e-affin-08'];

const las = (f) => JSON.parse(readFileSync(f, 'utf8'));
const NIV = Object.keys(NIVAER);
const fil = (niva) => `src/lib/talserierV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;
const banker = Object.fromEntries(NIV.map((n) => [n, las(fil(n))]));
const artiklar = las('src/lib/artikelfigurer/talserier.json');
const steg = (d) => (d < 0 ? `−${-d}` : `+${d}`);

/** Regeltexten efter granskningens punkt 10. */
function regelText(q) {
  const p = q.params;
  if (q.family === 'geodiff' && p.d < 0 && p.r === 2) return `Steget dubblas för varje tal (${steg(p.d)}, ${steg(2 * p.d)}, ${steg(4 * p.d)} och så vidare).`;
  if (q.family === 'affin' && p.k < 0) return `Multiplicera det förra med −${-p.k} och ${p.c > 0 ? `lägg till ${p.c}` : `dra bort ${-p.c}`}.`;
  return q.regel;
}

/** Granskningens punkt 7: inom två gånger radens största steg från facit. */
function nara(f) {
  const rad = [...f.visade, ...f.facit];
  const grans = 2 * Math.max(...rad.slice(1).map((x, i) => Math.abs(x - rad[i])));
  return f.kandidater.filter((c) => Math.abs(c.v[0] - f.facit[0]) <= grans);
}
const arLangt = (q) => {
  const rad = [...q.visade, ...q.options[q.correctAnswer]];
  const grans = 2 * Math.max(...rad.slice(1).map((x, i) => Math.abs(x - rad[i])));
  return q.options.some((o) => Math.abs(o[0] - q.options[q.correctAnswer][0]) > grans);
};

function fragaAv(f, val, q0) {
  return {
    id: f.id,
    niva: f.niva,
    family: f.familj,
    params: f.params,
    difficulty: Math.min(4, SVARIGHET[f.familj] + (f.niva === 'expert' ? 1 : 0)),
    p_prior: Math.round((P_PRIOR[f.niva] + P_FAMILJ[f.familj]) * 100) / 100,
    regel: regelText({ family: f.familj, params: f.params, regel: f.regel }),
    regelnyckel: f.regelnyckel,
    visade: f.visade,
    luckor: NIVAER[f.niva].luckor,
    options: val.alla.map((x) => x.v),
    correctAnswer: val.plats,
    typer: val.alla.map((x) => x.typer),
    misstag: val.alla.map((x) => (x.typer.length ? misstagText(x.typer, { sista: f.visade[f.visade.length - 1], varde: x.v, facit: f.facit }) : '')),
    bagar: f.bagar,
    fran_version: q0?.fran_version ?? VERSION,
  };
}

const allaRader = () => [...NIV.flatMap((n) => banker[n]), ...artiklar];
const platser = (bank, utom) => {
  const a = [0, 0, 0, 0, 0];
  for (const q of bank) if (q.id !== utom) a[q.correctAnswer]++;
  return a;
};
const godkand = (fraga, bank) => {
  if (sparrFel(fraga).length) return false;
  const v = verifiera(fraga);
  if (v.fel.length || v.varn.length) return false;
  if (nivaFel(bank.map((q) => (q.id === fraga.id ? fraga : q))).length) return false;
  return true;
};

const logg = [];

// 1. Ersättare
for (const id of ERSATT) {
  const niva = NIV.find((n) => banker[n].some((q) => q.id === id));
  const bank = banker[niva];
  const gammal = bank.find((q) => q.id === id);
  if (gammal.fran_version !== VERSION) throw new Error(`${id} är inte en ny rad`);
  const rng = slumpare(`talserier-v2-granskning:${id}`);
  let ny = null;
  for (let forsok = 0; forsok < 200000 && !ny; forsok++) {
    const params = PARAMS[niva][gammal.family](rng);
    if (bank.some((q) => q.family === gammal.family && JSON.stringify(q.params) === JSON.stringify(params))) continue;
    const f = byggFraga({ familj: gammal.family, params, niva, visade: valj(rng, NIVAER[niva].visade), id });
    if (!f) continue;
    if (allaRader().some((q) => q.visade.join(',') === f.visade.join(','))) continue;
    if (bank.filter((q) => q.id !== id && q.family === f.familj && q.regelnyckel === f.regelnyckel).length >= 2) continue;
    if (niva === 'grund') f.kandidater = nara(f);
    const val = valjAlternativ(f, platser(bank, id), rng);
    if (!val) continue;
    const fraga = fragaAv(f, val, gammal);
    if (arForskjuten(fraga, allaRader())) continue;
    if (!godkand(fraga, bank)) continue;
    ny = fraga;
  }
  if (!ny) throw new Error(`hittade ingen ersättare för ${id}`);
  bank[bank.indexOf(gammal)] = ny;
  logg.push(`${id}: ${gammal.visade.join(' ')} -> ${ny.visade.join(' ')} (facit ${ny.options[ny.correctAnswer].join(' och ')})`);
}

// 2. Pensionering
for (const id of PENSIONERA) {
  const q = banker.expert.find((x) => x.id === id);
  q.pensionerad_fran = VERSION;
  logg.push(`${id}: pensionerad_fran ${VERSION}`);
}

// 3. Närmare distraktorer på grund
for (const [i, q] of banker.grund.entries()) {
  if (q.fran_version !== VERSION || ERSATT.includes(q.id) || !arLangt(q)) continue;
  const f = byggFraga({ familj: q.family, params: q.params, niva: 'grund', visade: q.visade.length, id: q.id });
  const alla = f.kandidater;
  const narliggande = nara(f);
  const rng = slumpare(`talserier-v2-granskning:nara:${q.id}`);
  let val;
  if (narliggande.length >= 4) {
    f.kandidater = narliggande;
    val = valjAlternativ(f, platser(banker.grund, q.id), rng);
  } else {
    // För få närliggande: alla närliggande plus de närmaste av resten, så att
    // det mest avlägsna felet försvinner.
    const avst = (c) => Math.abs(c.v[0] - f.facit[0]);
    const urval = [...narliggande, ...alla.filter((c) => !narliggande.includes(c)).sort((a, b) => avst(a) - avst(b))].slice(0, 4);
    if (urval.length === 4) {
      const sorterade = [{ v: f.facit, typer: [] }, ...urval].sort((a, b) => a.v[0] - b.v[0]);
      val = { alla: sorterade, plats: sorterade.findIndex((x) => x.typer.length === 0) };
    }
  }
  const fraga = val && fragaAv(f, val, q);
  if (fraga && fraga.options.join(' ') === q.options.join(' ')) {
    logg.push(`${q.id}: inga närmare typade fel finns, alternativen står kvar (${q.options.join(' ')})`);
    continue;
  }
  if (fraga && godkand(fraga, banker.grund)) {
    banker.grund[i] = fraga;
    logg.push(`${q.id}: alternativ ${q.options.join(' ')} -> ${fraga.options.join(' ')}`);
  } else logg.push(`${q.id}: för få närliggande typade fel, alternativen står kvar (${q.options.join(' ')})`);
}

// 4. Regeltexter i version 2
for (const n of NIV) {
  for (const q of banker[n]) {
    if (q.fran_version !== VERSION) continue;
    const t = regelText(q);
    if (t !== q.regel) {
      logg.push(`${q.id}: regeltext "${t}"`);
      q.regel = t;
    }
  }
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
