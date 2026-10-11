// scripts/kalibrering-rapport.mjs
// =============================================================================
// Kalibreringsrapporten för matrisfrågorna (beställningen "svarare frågor",
// avsnitt 3.3 och 3.4). Läser vyn fraga_kalibrering_vy (migreringen
// 20261012090000_fraga_kalibrering.sql) och alla bankfiler: de sex skarpa och
// kandidatfilerna under src/lib/logicTestV7/kandidater/.
//
// Kör: node scripts/kalibrering-rapport.mjs [--ut=docs/qa/tester-v2/kalibrering/<datum>.json]
//                                           [--min-svar=30] [--min-konton=20]
//                                           [--fran=<vyrader.json>]
//
// --fran läser vyns rader ur en JSON-fil i stället för databasen (för prov
// och för en tom vy). Annars läses .env.local (NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, Jobbcoach-projektet, aldrig Begone).
//
// Skriptet skriver aldrig till databasen och aldrig till bankerna.
//
// Per fråga: id, fil, family, difficulty, p_prior_bank, svar, konton, ratt,
// p, p_lugn, tid_median_s, per_typ och flaggorna
//   kalibrerad  svar >= 30 och konton >= 20. Motorn byter till uppmätt p
//               vid 30 svar oavsett konton; kontokravet är kalibreringens.
//   prior_fel   kalibrerad och |p - p_prior_bank| > 0,25
//   fel_niva    kalibrerad och p utanför filens band (grund p >= 0,56,
//               avancerad 0,33 till 0,72, expert p <= 0,50, plus p <= 0,35)
//
// När en fråga flyttas (3.4): den gamla får pensionerad: true i sin fil, en
// kopia läggs som {målprefix}-flytt-{gammalt id} i målnivåns kandidatfil och
// börjar på noll. Rapporten visar det gamla id:ts p som p_arv på den nya
// raden. Plus-frågor med p > 0,55 listas under "plus som inte höll".
// =============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

// Kopia av PRIOR_P i src/lib/traning/svarighet.ts (skripten importerar inte TS).
export const PRIOR_P = { 1: 0.85, 2: 0.7, 3: 0.55, 4: 0.4 };

export const BANKER = [
  ['src/lib/logicTestV7/questionBankGrund.v7.json', 'grund'],
  ['src/lib/logicTestV7/questionBankGrund3c.v7.json', 'grund'],
  ['src/lib/logicTestV7/questionBank.v7.json', 'avancerad'],
  ['src/lib/logicTestV7/questionBankAvancerad3c.v7.json', 'avancerad'],
  ['src/lib/logicTestV7/questionBankExpert.v7.json', 'expert'],
  ['src/lib/logicTestV7/questionBankExpert3c.v7.json', 'expert'],
];
const KANDIDATER = 'src/lib/logicTestV7/kandidater';

export const BAND = {
  grund: (p) => p >= 0.56,
  avancerad: (p) => p >= 0.33 && p <= 0.72,
  expert: (p) => p <= 0.5,
  plus: (p) => p <= 0.35,
};

/** Bandet för en kandidatfil ur namnet (grund, avancerad, expert), plus per fråga. */
function filensBand(fil) {
  const n = path.basename(fil).toLowerCase();
  if (n.includes('grund')) return 'grund';
  if (n.includes('avancerad')) return 'avancerad';
  return 'expert';
}

export function lasBanker() {
  const filer = [...BANKER];
  if (existsSync(KANDIDATER)) for (const f of readdirSync(KANDIDATER).filter((x) => x.endsWith('.v7.json')).sort()) filer.push([path.posix.join(KANDIDATER, f), filensBand(f)]);
  const fragor = [];
  for (const [fil, band] of filer) {
    if (!existsSync(fil)) continue;
    for (const q of JSON.parse(readFileSync(fil, 'utf8'))) fragor.push({ q, fil, band: q.band === 'plus' ? 'plus' : band });
  }
  return fragor;
}

const tal = (x) => (x === null || x === undefined || x === '' ? null : Number(x));
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const avr = (x, d = 3) => (x === null ? null : Math.round(x * 10 ** d) / 10 ** d);

/**
 * Bygger rapporten ur vyns rader och bankernas frågor. Ren funktion, inga
 * sidoeffekter. Returnerar { fragor, sammanfattning }.
 */
export function byggRapport(vyRader, bankFragor, { minSvar = 30, minKonton = 20 } = {}) {
  const vy = new Map(vyRader.map((r) => [r.fraga_id, r]));
  const rader = bankFragor.map(({ q, fil, band }) => {
    const v = vy.get(q.id) ?? {};
    const svar = tal(v.svar) ?? 0;
    const konton = tal(v.konton) ?? 0;
    const p = tal(v.p);
    const pPrior = typeof q.p_prior === 'number' ? q.p_prior : PRIOR_P[q.difficulty] ?? PRIOR_P[3];
    const kalibrerad = svar >= minSvar && konton >= minKonton && p !== null;
    return {
      id: q.id, fil, band, family: q.family ?? null, difficulty: q.difficulty ?? null, p_prior_bank: pPrior,
      valbar: q.pensionerad !== true,
      svar, konton, ratt: tal(v.ratt) ?? 0, p, p_lugn: tal(v.p_lugn), tid_median_s: tal(v.tid_median_s), per_typ: v.per_typ ?? {},
      kalibrerad,
      prior_fel: kalibrerad && Math.abs(p - pPrior) > 0.25,
      fel_niva: kalibrerad && !BAND[band](p),
      p_arv: null,
    };
  });
  // p_arv: {prefix}-flytt-{gammalt id}
  const perId = new Map(rader.map((r) => [r.id, r]));
  for (const r of rader) {
    const m = r.id.match(/^[a-z0-9]+-flytt-(.+)$/);
    if (m && perId.has(m[1])) r.p_arv = perId.get(m[1]).p ?? null;
  }
  const kal = rader.filter((r) => r.kalibrerad);
  const perFil = {};
  for (const r of rader) {
    const f = (perFil[r.fil] ??= { fragor: 0, kalibrerade: 0, median_p: null, ps: [] });
    f.fragor++;
    if (r.kalibrerad) { f.kalibrerade++; f.ps.push(r.p); }
  }
  for (const f of Object.values(perFil)) { f.median_p = avr(median(f.ps)); delete f.ps; }
  const over = kal.filter((r) => r.valbar && r.p <= 0.278);
  const familjer = new Set(over.map((r) => r.family));
  const uppfyllt = over.length >= 20 && familjer.size >= 2;
  return {
    fragor: rader,
    sammanfattning: {
      kalibrerade: kal.length,
      per_fil: perFil,
      prior_fel: kal.filter((r) => r.prior_fel).map((r) => r.id),
      fel_niva: kal.filter((r) => r.fel_niva).map((r) => r.id),
      plus_som_inte_holl: kal.filter((r) => r.band === 'plus' && r.p > 0.55).map((r) => r.id),
      bank_kalibrerad_over_7_5: { antal: over.length, familjer: familjer.size, uppfyllt, text: uppfyllt ? 'uppfyllt' : `inte uppfyllt, ${over.length} av 20${over.length >= 20 ? ' (färre än två familjer)' : ''}` },
    },
  };
}

export function sammanfattningText(rapport) {
  const s = rapport.sammanfattning;
  const ut = [];
  if (s.kalibrerade === 0) {
    ut.push('Inga kalibrerade frågor ännu.');
  } else {
    ut.push(`Kalibrerade frågor: ${s.kalibrerade}`);
    for (const [fil, f] of Object.entries(s.per_fil)) if (f.kalibrerade) ut.push(`  ${fil}: ${f.kalibrerade} av ${f.fragor}, median p ${String(f.median_p).replace('.', ',')}`);
    ut.push(`Prior mer än 0,25 fel: ${s.prior_fel.length}`);
    ut.push(`Fel nivå: ${s.fel_niva.length}${s.fel_niva.length ? ` (${s.fel_niva.join(', ')})` : ''}`);
    if (s.plus_som_inte_holl.length) ut.push(`Plus som inte höll (p över 0,55): ${s.plus_som_inte_holl.join(', ')}`);
  }
  ut.push(`BANK_KALIBRERAD_OVER_7_5: ${s.bank_kalibrerad_over_7_5.text}`);
  return ut.join('\n');
}

function lasEnv() {
  const fil = '.env.local';
  if (!existsSync(fil)) throw new Error('.env.local saknas (Jobbcoach-projektets NEXT_PUBLIC_SUPABASE_URL och SUPABASE_SERVICE_ROLE_KEY)');
  return Object.fromEntries(readFileSync(fil, 'utf8').split(/\r?\n/).filter((r) => r.includes('=') && !r.trim().startsWith('#')).map((r) => { const i = r.indexOf('='); return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
}

async function lasVy() {
  const env = lasEnv();
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const rader = [];
  for (let fran = 0; ; fran += 1000) {
    const { data, error } = await admin.from('fraga_kalibrering_vy').select('*').range(fran, fran + 999);
    if (error) throw new Error(`fraga_kalibrering_vy: ${error.message}`);
    rader.push(...data);
    if (data.length < 1000) break;
  }
  return rader;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/kalibrering-rapport.mjs')) {
  const arg = (namn, std) => process.argv.find((a) => a.startsWith(`--${namn}=`))?.slice(namn.length + 3) ?? std;
  const datum = new Date().toISOString().slice(0, 10);
  const ut = arg('ut', `docs/qa/tester-v2/kalibrering/${datum}.json`);
  const fran = arg('fran', null);
  try {
    const vy = fran ? JSON.parse(readFileSync(fran, 'utf8')) : await lasVy();
    const rapport = byggRapport(vy, lasBanker(), { minSvar: Number(arg('min-svar', 30)), minKonton: Number(arg('min-konton', 20)) });
    mkdirSync(path.dirname(ut), { recursive: true });
    writeFileSync(ut, JSON.stringify(rapport, null, 2) + '\n');
    console.log(sammanfattningText(rapport));
    console.log(`\nSkrev ${ut}`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
}
