#!/usr/bin/env node
// scripts/figurserier-omgang2.mjs
// =============================================================================
// Granskning 01 genomförd (docs/qa/figurserier/granskning-01.md och
// beslut-01.json). Läser omgång 1:s kandidater
// (src/lib/figurserierV1/kandidater/omgang1/) och skriver de granskade
// kandidaterna till src/lib/figurserierV1/kandidater/{grund,avancerad,expert}.json:
//
//   godkanda  oförändrade (regler utan yantal; grundformens regeltext och
//             misstag med "Fyllningen", avsnitt 4 punkt 8)
//   andra     samma rad och id, nya alternativ, correctAnswer och misstag
//             byggda med dagens spärrar (S12 skärpt, S14, rena först)
//   strukna   ersätts med nya frågor och nya löpnummer ur samma mall
//
// Deterministiskt (seed per id). Skriver också docs/qa/figurserier/omgang2/lista.json
// med vilka id som är ändrade och nya, för granskningsrenderingen.
//
// Kör: node scripts/figurserier-omgang2.mjs
// =============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { MALLAR, NIVA_KOD } from './lib/serie/recept-serie.mjs';
import { bygg, byggAlternativ, byggRad } from './lib/serie/generera-serie.mjs';
import { PRIM, lasCell } from './lib/serie/celler-serie.mjs';
import { regelText, misstagText } from './lib/serie/misstag-serie.mjs';
import { radNyckel } from './lib/serie/struktur.mjs';
import { mulberry32, hashString } from './lib/serie/slump.mjs';
import { stable } from './lib/serie/celler-serie.mjs';

const IN = 'src/lib/figurserierV1/kandidater/omgang1';
const UT = 'src/lib/figurserierV1/kandidater';
const beslut = JSON.parse(readFileSync('docs/qa/figurserier/beslut-01.json', 'utf8'));
const MALL = Object.fromEntries(MALLAR.map((m) => [m.id, m]));
const VARIANT = Object.fromEntries(MALLAR.flatMap((m) => m.varianter.map((v) => [v.namn, { mall: m, v }])));
const godkanda = new Set(beslut.godkanda);
const andra = new Set(beslut.andra.map((x) => x.id));
const strukna = new Set(beslut.strukna.map((x) => x.id));
const FAM_KOD = { vridning: 'vrid', vandring: 'vand', antal: 'antal', fyllning: 'fyll', vaxande: 'vax', vaxelvis: 'vaxl', flera: 'flera' };

/**
 * Ersättarna per struket id: mall och variant. Expertens F6 fördelas på duo
 * kant + form och duo orbital + form (pil är redan vid taket sju), F7:s
 * struket ersätts med antalet i tretakt (granskning 01, avsnitt 4 punkt 7).
 */
const ERSATTARE = {
  'fs-g-vrid-08': 'stralar-steg',
  'fs-g-antal-07': 'stralar-antal',
  'fs-a-antal-01': 'stralar-kvart-antal',
  'fs-e-vand-01': 'duo-kant-form-tre',
  'fs-e-vand-02': 'duo-kant-form-tre',
  'fs-e-vand-03': 'duo-kant-form-tre',
  'fs-e-fyll-06': 'duo-kant-form-tre',
  'fs-e-antal-01': 'duo-kant-form-tre',
  'fs-e-antal-02': 'duo-kant-form-tre',
  'fs-e-flera-01': 'duo-orbital-form-flera',
  'fs-e-flera-02': 'duo-orbital-form-flera',
  'fs-e-vaxl-08': 'sektor-vaxelvis-antal',
};

/** Regler utan yantal (en kantprick, granskning 01 F2). */
function utanYantal(regler) {
  const dims = { ...regler.dims };
  delete dims.yantal;
  return { ...regler, dims };
}

/** Grundformens texter med "Fyllningen" (avsnitt 4 punkt 8), räknade ur alternativen. */
function grundformText(q) {
  const V = q.options.map((o) => lasCell(o).v);
  const facit = V[q.correctAnswer];
  const ids = PRIM[q.regler.prim].dims.map((d) => d.id);
  const varierar = new Set(ids.filter((i) => new Set(V.map((x) => stable(x[i]))).size > 1));
  const misstag = V.map((v, i) => {
    if (i === q.correctAnswer) return '';
    const fel = ids.filter((id) => stable(v[id]) !== stable(facit[id])).map((id) => ({ dim: id, typ: 'annat', v: v[id] }));
    return misstagText(q.regler, facit, fel);
  });
  return { ...q, rule: regelText(q.regler, varierar), misstag };
}

const ut = { grund: [], avancerad: [], expert: [] };
const lista = { andrade: [], nya: [], godkanda: [] };
const nummer = {};
const rader = new Set();

const filer = ['grund', 'avancerad', 'expert'].flatMap((n) => JSON.parse(readFileSync(`${IN}/${n}.json`, 'utf8')));
for (const q of filer) {
  const m = /^fs-([gae])-([a-z]+)-(\d+)$/.exec(q.id);
  const k = `${m[1]}-${m[2]}`;
  nummer[k] = Math.max(nummer[k] ?? 0, Number(m[3]));
}

for (const q0 of filer) {
  const q = { ...q0, regler: utanYantal(q0.regler) };
  const mall = MALL[q.recept];
  if (godkanda.has(q.id)) {
    const g = q.regler.prim === 'grundform' ? grundformText(q) : q;
    // "kommer" står inte i figurseriernas texter (beställningen A7): läggs till.
    const lagg = (t) => t.replace(/ kommer till /g, ' läggs till ');
    const k = { ...g, rule: lagg(g.rule), misstag: g.misstag.map(lagg) };
    ut[mall.niva].push(k);
    lista.godkanda.push(q.id);
    rader.add(radNyckel(k));
    continue;
  }
  if (andra.has(q.id)) {
    const r = mulberry32(hashString(`omgang2:${q.id}`));
    const rad = byggRad(q.regler);
    if (rad.fel) throw new Error(`${q.id}: raden klarar inte dagens kontroller (${rad.fel})`);
    let ny = null;
    for (let f = 0; f < 40 && !ny; f++) {
      const pos = Math.floor(r() * 6);
      ny = byggAlternativ(r, mall, q.regler, { id: q.id, family: q.family, variant: q.variant }, { pos, rad });
    }
    if (!ny) throw new Error(`${q.id}: inga alternativ klarar spärrarna`);
    ut[mall.niva].push(ny);
    lista.andrade.push(q.id);
    rader.add(radNyckel(ny));
    continue;
  }
  if (strukna.has(q.id)) {
    const { mall: m2, v } = VARIANT[ERSATTARE[q.id]];
    const r = mulberry32(hashString(`omgang2:ersatt:${q.id}`));
    const kod = NIVA_KOD[m2.niva];
    const fam = FAM_KOD[v.family];
    let ny = null;
    for (let f = 0; f < 3000 && !ny; f++) {
      const id = `fs-${kod}-${fam}-${String((nummer[`${kod}-${fam}`] ?? 0) + 1).padStart(2, '0')}`;
      const kand = bygg(r, m2, v, { id, pos: Math.floor(r() * 6) });
      if (kand && !rader.has(radNyckel(kand))) ny = kand;
    }
    if (!ny) throw new Error(`${q.id}: ingen ersättare`);
    nummer[`${kod}-${fam}`] = (nummer[`${kod}-${fam}`] ?? 0) + 1;
    ut[m2.niva].push(ny);
    lista.nya.push({ id: ny.id, ersatter: q.id });
    rader.add(radNyckel(ny));
    continue;
  }
  throw new Error(`${q.id} saknar beslut`);
}

for (const [niva, fragor] of Object.entries(ut)) {
  writeFileSync(`${UT}/${niva}.json`, JSON.stringify(fragor, null, 1) + '\n');
  console.log(`${UT}/${niva}.json: ${fragor.length} frågor`);
}
mkdirSync('docs/qa/figurserier/omgang2', { recursive: true });
writeFileSync('docs/qa/figurserier/omgang2/lista.json', JSON.stringify(lista, null, 1) + '\n');
console.log(`godkända ${lista.godkanda.length}, ändrade ${lista.andrade.length}, nya ${lista.nya.length}`);
