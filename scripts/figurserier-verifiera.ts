// scripts/figurserier-verifiera.ts
// =============================================================================
// Verifieraren för figurseriernas härnäst-banker (frågebanken 2026-11-19).
// En kommando som kör hela kedjan och dessutom en egen, oberoende kontroll:
//
//   1. Egen regeltolkning, skriven fristående från scripts/lib/serie: per
//      egenskap prövas ett bibliotek av enkla regler (konstant, lika steg,
//      växande steg, två serier varannan gång, upprepning med period 2 till 4,
//      "andra och fjärde lika", spegling kring mitten) mot de fem visade. Varje
//      regel som passar ger en förutsägelse. Kravet: exakt ett alternativ går
//      att få ur förutsägelserna (alla kombinationer över egenskaperna), och
//      det är facit. Ingen distraktor kan alltså motiveras av en enkel
//      alternativ regel i någon egenskap.
//   2. Rendering: varje figur ritas med appens renderare (cellSvg), ska ge en
//      svg med ritade element och utan NaN eller undefined, och de sex
//      alternativen och de fem visade ska ge sex plus fem olika bilder (ingen
//      distraktor ser ut som facit eller som en visad figur).
//   3. Banken: unika id över alla figurbanker, ingen rad två gånger, inga
//      tankstreck, fran_version 3 bara i parti 3.
//   3b. Följden (granskningen av parti 3, punkt 5): samma lägesföljd inom
//      nivå och familj, också under en annan primitiv eller vriden
//      (foljdNycklar i scripts/lib/serie/struktur.mjs). Fel när en fråga som
//      inte är granskad delar följd med någon annan; par där båda redan är
//      granskade (version 1 och 2 och de 95 godkända i parti 3) är upplysning.
//   3c. Regelnyckeln (granskningen av parti 4, punkt 2): primitiven, de
//      rörliga reglerna utan startläge och konstanterna, cykelns värden
//      sorterade (regelNyckel i struktur.mjs). Två frågor med samma nyckel är
//      samma uppgift med nytt startläge. Över alla banker och nivåer; fel när
//      en fråga från parti 4 eller senare som inte är granskad delar nyckel med
//      någon annan, upplysning för äldre par (parti 3 tog in några, de står kvar).
//   4. Kedjan: validate-figurserier, v7-facit-check --serie,
//      v7-distraktor-check --serie och v7-geometri-check --serie på alla
//      härnäst-banker.
//
// Kör: node node_modules/tsx/dist/cli.mjs scripts/figurserier-verifiera.ts [fil ...]
// Utan filer: alla härnäst-banker. --utan-kedja hoppar över steg 4. Exit 1 vid fel.
// =============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { cellSvg } from '../src/lib/logicTestV7/svgMatt';
import type { LayeredCell } from '../src/lib/logicTestV7/layered.v7';
// @ts-expect-error ren JavaScript
import { foljdNycklar, regelNyckel } from './lib/serie/struktur.mjs';

const B = 'src/lib/figurserierV1';
const HARNAST = ['Grund', 'Avancerad', 'Expert', 'Parti2Grund', 'Parti2Avancerad', 'Parti3Grund', 'Parti3Avancerad', 'Parti3Expert', 'Parti4Grund', 'Parti4Avancerad', 'Parti4Expert'].map((n) => `${B}/bank${n}.json`);
const BRYTER = ['BryterGrund', 'BryterAvancerad'].map((n) => `${B}/bank${n}.json`);

/** Parti 3, godkända i granskningen 2026-11-19 (de fem ersättarna står inte här). */
const GODKANDA_PARTI3 = new Set([
  'fs-g-vand-08', 'fs-g-vand-09', 'fs-g-vrid-15', 'fs-g-vrid-16', 'fs-g-vand-10', 'fs-g-vrid-17',
  'fs-g-vrid-18', 'fs-g-vand-11', 'fs-g-vand-12', 'fs-g-vand-13', 'fs-g-vrid-19', 'fs-g-vrid-20',
  'fs-g-vand-14', 'fs-g-vrid-21', 'fs-g-vrid-22', 'fs-g-vand-15', 'fs-g-vand-16', 'fs-g-vand-17',
  'fs-g-vrid-23', 'fs-g-vrid-24', 'fs-g-vand-18', 'fs-g-vrid-25', 'fs-g-vrid-26', 'fs-g-vand-19',
  'fs-g-vand-20', 'fs-g-vax-09', 'fs-g-vax-10', 'fs-g-vax-11', 'fs-g-vax-12', 'fs-g-vax-14', 'fs-g-vax-15',
  'fs-g-vax-16', 'fs-g-vax-18', 'fs-g-vax-19', 'fs-g-vax-20', 'fs-g-vax-21', 'fs-g-vax-22', 'fs-a-antal-10',
  'fs-a-flera-07', 'fs-a-flera-08', 'fs-a-antal-11', 'fs-a-vrid-07', 'fs-a-vrid-08', 'fs-a-vand-04',
  'fs-a-antal-12', 'fs-a-antal-13', 'fs-a-fyll-04', 'fs-a-flera-09', 'fs-a-flera-10', 'fs-a-vax-05',
  'fs-a-vax-06', 'fs-a-flera-11', 'fs-a-flera-12', 'fs-a-antal-15', 'fs-a-vrid-09', 'fs-a-vrid-10',
  'fs-a-vand-05', 'fs-a-antal-16', 'fs-a-antal-17', 'fs-a-fyll-05', 'fs-a-vaxl-17', 'fs-a-vaxl-18',
  'fs-a-vaxl-19', 'fs-a-vaxl-20', 'fs-a-vaxl-21', 'fs-a-vaxl-22', 'fs-a-vaxl-23', 'fs-a-vaxl-24',
  'fs-a-vaxl-25', 'fs-a-vaxl-26', 'fs-a-vaxl-27', 'fs-a-vaxl-28', 'fs-a-vaxl-29', 'fs-a-vaxl-30',
  'fs-e-vaxl-11', 'fs-e-vaxl-12', 'fs-e-vaxl-13', 'fs-e-vaxl-14', 'fs-e-vaxl-15', 'fs-e-vaxl-16',
  'fs-e-antal-08', 'fs-e-antal-09', 'fs-e-vaxl-17', 'fs-e-vaxl-18', 'fs-e-vaxl-19', 'fs-e-vaxl-20',
  'fs-e-vaxl-21', 'fs-e-vaxl-22', 'fs-e-antal-10', 'fs-e-antal-11', 'fs-e-vaxl-23', 'fs-e-antal-12',
  'fs-e-antal-13', 'fs-e-vaxl-25', 'fs-e-vaxl-26',
]);
/**
 * Parti 4, godkända i granskningen 2026-11-19 (omgång 2): 79 av 102, utom
 * fs-a-flera-17 och fs-a-fyll-10, som regelnyckeln fällde (samma cykelordning
 * som fs-a-flera-02 och fs-a-fyll-05). Ersättarna står inte här.
 */
const GODKANDA_PARTI4 = new Set([
  'fs-g-vand-21', 'fs-g-vand-22', 'fs-g-vrid-27', 'fs-g-vrid-29', 'fs-g-vrid-30', 'fs-g-vand-25',
  'fs-g-vand-26', 'fs-g-vrid-31', 'fs-g-vand-27', 'fs-g-vrid-33', 'fs-g-vrid-34', 'fs-g-vand-29',
  'fs-g-vand-30', 'fs-g-antal-18', 'fs-g-antal-19', 'fs-g-vax-23', 'fs-g-vax-24', 'fs-g-vax-25',
  'fs-g-vax-27', 'fs-g-vax-28', 'fs-g-vax-29', 'fs-g-vax-30', 'fs-g-vax-31', 'fs-g-vax-34',
  'fs-g-vax-35', 'fs-a-antal-18', 'fs-a-flera-14', 'fs-a-flera-15', 'fs-a-fyll-06', 'fs-a-vrid-12',
  'fs-a-fyll-07', 'fs-a-flera-16', 'fs-a-vax-07', 'fs-a-vax-08', 'fs-a-antal-20', 'fs-a-flera-18',
  'fs-a-flera-19', 'fs-a-fyll-08', 'fs-a-vrid-14', 'fs-a-vand-07', 'fs-a-fyll-09', 'fs-a-flera-20',
  'fs-a-flera-21', 'fs-a-flera-22', 'fs-a-flera-23', 'fs-a-flera-24', 'fs-a-flera-25', 'fs-a-vaxl-31',
  'fs-a-vaxl-32', 'fs-a-vaxl-33', 'fs-a-vaxl-34', 'fs-a-vaxl-35', 'fs-a-vaxl-36', 'fs-a-vaxl-37',
  'fs-a-vaxl-38', 'fs-a-vaxl-39', 'fs-a-vaxl-40', 'fs-a-vaxl-41', 'fs-e-antal-15', 'fs-e-antal-16',
  'fs-e-vaxl-27', 'fs-e-vaxl-28', 'fs-e-antal-17', 'fs-e-antal-18', 'fs-e-vaxl-29', 'fs-e-vaxl-30',
  'fs-e-antal-19', 'fs-e-vaxl-31', 'fs-e-flera-07', 'fs-e-flera-08', 'fs-e-vax-04', 'fs-e-vax-05',
  'fs-e-flera-09', 'fs-e-flera-10', 'fs-e-vax-08', 'fs-e-vax-09', 'fs-e-flera-11',
]);
const granskad = (q: { fran_version: number; id: string }) =>
  q.fran_version <= 2 || (q.fran_version === 3 && GODKANDA_PARTI3.has(q.id)) || (q.fran_version === 4 && GODKANDA_PARTI4.has(q.id));

type Cell = Record<string, unknown> & { kind: string };
type Fraga = { id: string; niva: string; regler?: unknown; rad: Cell[]; options: Cell[]; correctAnswer: number; rule: string; title: string; misstag: string[]; fran_version: number; form?: string };

// ---------------------------------------------------------------- avkodning av figurerna
// Egen avkodning till egenskaper: rot (åtta lägen runt), tal (heltal) eller kat.
type Egenskap = { typ: 'rot' | 'tal' | 'kat'; v: number | string; min?: number; max?: number };
const KANT = [0, 1, 2, 5, 8, 7, 6, 3];
const mod8 = (x: number) => ((x % 8) + 8) % 8;

/** En båge av sammanhängande lägen: [start, antal], eller null. */
function bage(lagen: number[]): [number, number] | null {
  const s = new Set(lagen.map(mod8));
  if (s.size === 0 || s.size === 8) return null;
  for (const st of s) {
    if (s.has(mod8(st - 1))) continue;
    for (let i = 0; i < s.size; i++) if (!s.has(mod8(st + i))) return null;
    return [st, s.size];
  }
  return null;
}

function avkoda(c: Cell): Record<string, Egenskap> | null {
  const rot = (v: number): Egenskap => ({ typ: 'rot', v: mod8(v) });
  const kat = (v: unknown): Egenskap => ({ typ: 'kat', v: String(v) });
  const tal = (v: number, min: number, max: number): Egenskap => ({ typ: 'tal', v, min, max });
  switch (c.kind) {
    case 'vector': return { form: kat('pil'), vinkel: rot((c.angle as number) / 45), langd: kat(c.length), spets: kat(c.head) };
    case 'orbital': return c.satellite === null ? null : { form: kat('orbital'), lage: rot(c.satellite as number), mitt: kat(c.center) };
    case 'ray': case 'sectorwheel': case 'dotsorbit': {
      const b = bage((c.kind === 'ray' ? c.rays : c.kind === 'dotsorbit' ? c.dots : c.filled) as number[]);
      return b ? { form: kat(c.kind), start: rot(b[0]), antal: tal(b[1], c.kind === 'sectorwheel' ? 1 : 2, 7) } : null;
    }
    case 'tile': {
      const p = c.pattern as number;
      if ((p >> 4) & 1) return null;
      const b = bage(KANT.map((bit, i) => ((p >> bit) & 1 ? i : -1)).filter((i) => i >= 0));
      return b ? { form: kat('tile'), start: rot(b[0]), antal: tal(b[1], 1, 7) } : null;
    }
    case 'poly': return { form: kat('poly'), horn: tal(c.sides as number, 3, 8), fyll: kat(c.fill), vridning: kat(c.rotation) };
    case 'stack': return { form: kat('stack'), bas: kat(c.base), symbol: kat(c.symbol), fyll: kat(c.baseFill) };
    case 'duo': {
      const y = c.ytter as { typ: string; lage: number; antal?: number };
      const k = c.karna as Record<string, unknown>;
      const ut: Record<string, Egenskap> = { form: kat(`duo-${y.typ}-${k.typ}`), ylage: rot(y.lage), yantal: tal(y.antal ?? 1, 1, 6) };
      if (k.typ === 'pil') ut.kvinkel = rot((k.vinkel as number) / 45);
      else if (k.typ === 'form') { ut.kform = kat(k.form); ut.kfyll = kat(k.fyllning); }
      else ut.ksymbol = kat(k.symbol);
      return ut;
    }
    default: return null;
  }
}

// ---------------------------------------------------------------- regelbiblioteket
/** Alla förutsägelser för den sjätte ur fem värden, en per regel som passar. */
function forutsagelser(e: Egenskap[]): { regel: string; v: number | string }[] {
  const typ = e[0].typ;
  const s = e.map((x) => x.v);
  const ut: { regel: string; v: number | string }[] = [];
  const lika = (a: unknown, b: unknown) => a === b;
  // upprepning med period 1 till 4 (period 1 är konstant)
  for (let p = 1; p <= 4; p++) {
    let ok = true;
    for (let i = p; i < 5; i++) if (!lika(s[i], s[i - p])) ok = false;
    if (ok) ut.push({ regel: p === 1 ? 'konstant' : `period ${p}`, v: s[5 - p] });
  }
  // andra och fjärde lika: luckan som den andra serien
  if (lika(s[1], s[3])) ut.push({ regel: 'andra och fjärde lika', v: s[3] });
  // spegling kring mitten (a b c b a ... ger b): figur 6 som figur 2 när 1 och 5, 2 och 4 är lika
  if (lika(s[0], s[4]) && lika(s[1], s[3])) ut.push({ regel: 'spegling', v: s[1] });
  if (typ === 'kat') {
    if (lika(s[0], s[2]) && lika(s[2], s[4]) && lika(s[1], s[3])) ut.push({ regel: 'varannan', v: s[3] });
    return ut;
  }
  const n = s as number[];
  const sub = (a: number, b: number) => (typ === 'rot' ? mod8(a - b) : a - b);
  const add = (a: number, b: number) => (typ === 'rot' ? mod8(a + b) : a + b);
  const giltig = (x: number) => typ === 'rot' || (x >= (e[0].min ?? -Infinity) && x <= (e[0].max ?? Infinity));
  const d = [0, 1, 2, 3].map((i) => sub(n[i + 1], n[i]));
  // lika steg
  if (d.every((x) => x === d[0])) { const v = add(n[4], d[0]); if (giltig(v)) ut.push({ regel: 'lika steg', v }); }
  // växande steg (andra differensen konstant)
  const dd = [0, 1, 2].map((i) => sub(d[i + 1], d[i]));
  if (dd.every((x) => x === dd[0])) { const v = add(n[4], add(d[3], dd[0])); if (giltig(v)) ut.push({ regel: 'växande steg', v }); }
  // två serier varannan gång, var och en med lika steg
  if (sub(n[2], n[0]) === sub(n[4], n[2])) { const v = add(n[3], sub(n[3], n[1])); if (giltig(v)) ut.push({ regel: 'varannan', v }); }
  // steget upprepas med period 2 (1, 2, 1, 2 steg)
  if (d[0] === d[2] && d[1] === d[3]) { const v = add(n[4], d[0]); if (giltig(v)) ut.push({ regel: 'stegen växlar', v }); }
  return ut;
}

function regelFel(q: Fraga): string[] {
  const fel: string[] = [];
  const rad = q.rad.map(avkoda);
  const alt = q.options.map(avkoda);
  if (rad.some((x) => !x) || alt.some((x) => !x)) return [`${q.id}: en figur går inte att avkoda`];
  const nycklar = Object.keys(rad[0]!);
  for (const r of [...rad, ...alt]) if (Object.keys(r!).join() !== nycklar.join()) return [`${q.id}: figurerna har olika egenskaper (blandade primitiver)`];
  const mojliga: Record<string, Set<string>> = {};
  for (const k of nycklar) {
    const f = forutsagelser(rad.map((r) => r![k]));
    if (!f.length) { fel.push(`${q.id}: ingen enkel regel passar ${k}`); continue; }
    mojliga[k] = new Set(f.map((x) => String(x.v)));
  }
  if (fel.length) return fel;
  const traffar = alt.map((a, i) => (nycklar.every((k) => mojliga[k].has(String(a![k].v))) ? i : -1)).filter((i) => i >= 0);
  if (traffar.length !== 1 || traffar[0] !== q.correctAnswer) {
    const tvetydiga = nycklar.filter((k) => mojliga[k].size > 1).map((k) => `${k} {${[...mojliga[k]].join(', ')}}`);
    fel.push(`${q.id}: ${traffar.length} alternativ följer en enkel regel (${traffar.map((i) => 'ABCDEF'[i]).join(', ') || 'inget'}), facit ${'ABCDEF'[q.correctAnswer]}${tvetydiga.length ? `; flera läsningar i ${tvetydiga.join('; ')}` : ''}`);
  }
  return fel;
}

// ---------------------------------------------------------------- rendering
const RITAT = /<(path|circle|line|rect|polygon|polyline|ellipse)\b/;
function renderFel(q: Fraga): string[] {
  const fel: string[] = [];
  const bild = (c: Cell, namn: string) => {
    let s = '';
    try { s = cellSvg(c as unknown as LayeredCell); } catch (e) { fel.push(`${q.id}: ${namn} kan inte ritas (${(e as Error).message})`); return ''; }
    if (!s.startsWith('<svg') || !RITAT.test(s)) fel.push(`${q.id}: ${namn} ritas tom`);
    if (/NaN|undefined|null/.test(s)) fel.push(`${q.id}: ${namn} har NaN, undefined eller null i bilden`);
    return s;
  };
  const rad = q.rad.map((c, i) => bild(c, `figur ${i + 1}`));
  const alt = q.options.map((c, i) => bild(c, `alternativ ${'ABCDEF'[i]}`));
  if (new Set(rad).size !== rad.length) fel.push(`${q.id}: två visade figurer ser likadana ut`);
  if (new Set(alt).size !== alt.length) fel.push(`${q.id}: två alternativ ser likadana ut`);
  alt.forEach((a, i) => { const j = rad.indexOf(a); if (j >= 0) fel.push(`${q.id}: alternativ ${'ABCDEF'[i]} ser ut som figur ${j + 1}`); });
  return fel;
}

// ---------------------------------------------------------------- körning
const args = process.argv.slice(2);
const utanKedja = args.includes('--utan-kedja');
const filer = args.filter((a) => !a.startsWith('--'));
const valda = (filer.length ? filer : HARNAST).filter((f) => existsSync(f));
const fel: string[] = [];
const ids = new Map<string, string>();
const rader = new Map<string, string>();
let n = 0;
// Id unika över alla figurbanker, bryter inräknade.
for (const f of [...new Set([...HARNAST, ...BRYTER, ...valda])].filter((x) => existsSync(x))) {
  for (const q of JSON.parse(readFileSync(f, 'utf8')) as Fraga[]) {
    if (ids.has(q.id)) fel.push(`${q.id}: id finns i både ${ids.get(q.id)} och ${f}`);
    ids.set(q.id, f);
  }
}
for (const f of valda) {
  const bank = JSON.parse(readFileSync(f, 'utf8')) as Fraga[];
  const parti3 = /Parti3/.test(f);
  for (const q of bank) {
    n++;
    if (q.form === 'bryter') { fel.push(`${q.id}: bryter mönstret i en härnäst-bank`); continue; }
    if (q.rad.length !== 5 || q.options.length !== 6) fel.push(`${q.id}: ska ha fem figurer och sex alternativ`);
    const parti4 = /parti4/i.test(f);
    if (parti4 ? q.fran_version !== 4 : parti3 !== (q.fran_version === 3)) fel.push(`${q.id}: fran_version ${q.fran_version} i ${f}`);
    if (/[–—]/.test([q.rule, q.title, ...q.misstag].join(' '))) fel.push(`${q.id}: tankstreck i texten`);
    const rk = JSON.stringify([...q.rad, q.options[q.correctAnswer]]);
    if (rader.has(rk)) fel.push(`${q.id}: samma rad som ${rader.get(rk)}`);
    rader.set(rk, q.id);
    fel.push(...regelFel(q), ...renderFel(q));
  }
  console.log(`${f}: ${bank.length} uppgifter`);
}
// Följden: över alla valda banker.
const info: string[] = [];
const foljd = new Map<string, Fraga>();
const SLAG: Record<string, string> = { lage: 'lägesföljd', vriden: 'vridna lägesföljd', antal: 'antalsföljd' };
for (const f of valda) for (const q of JSON.parse(readFileSync(f, 'utf8')) as Fraga[]) {
  for (const k of foljdNycklar(q) as string[]) {
    const forra = foljd.get(k);
    if (!forra) { foljd.set(k, q); continue; }
    const text = `${q.id}: samma ${SLAG[k.split('|')[2]]} som ${forra.id} inom ${q.niva} och familjen ${k.split('|')[1]}`;
    if (granskad(q) && granskad(forra)) info.push(text); else fel.push(text);
  }
}
console.log(`\nFöljder: ${info.length} kända par bland granskade uppgifter (upplysning).`);
// Regelnyckeln: över alla härnäst-banker och de valda filerna, alla nivåer.
const regelInfo: string[] = [];
const regel = new Map<string, Fraga>();
const nyckelKrav = (q: Fraga) => q.fran_version >= 4 && !granskad(q);
for (const f of [...new Set([...HARNAST, ...valda])].filter((x) => existsSync(x))) {
  for (const q of JSON.parse(readFileSync(f, 'utf8')) as Fraga[]) {
    if (!q.regler) continue;
    const k = regelNyckel(q) as string;
    const forra = regel.get(k);
    if (!forra) { regel.set(k, q); continue; }
    if (forra.id === q.id) continue;
    const text = `${q.id}: samma regelnyckel som ${forra.id} (${forra.niva}), bara startläget skiljer: ${k}`;
    if (nyckelKrav(q) || nyckelKrav(forra)) fel.push(text); else regelInfo.push(text);
  }
}
console.log(`Regelnyckeln: ${regelInfo.length} kända par bland granskade eller äldre uppgifter (upplysning).`);
console.log(`Egen kontroll: ${n} uppgifter, ${fel.length} fel.`);
fel.forEach((x) => console.log('  ' + x));

let kedjaOk = true;
if (!utanKedja) {
  const steg: [string, string[]][] = [
    ['validate-figurserier', ['scripts/validate-figurserier.mjs', ...valda]],
    ['v7-facit-check --serie', ['scripts/v7-facit-check.mjs', '--serie', ...valda]],
    ['v7-distraktor-check --serie', ['scripts/v7-distraktor-check.mjs', '--serie', ...valda]],
    ['v7-geometri-check --serie', ['scripts/v7-geometri-check.mjs', '--serie', ...valda]],
  ];
  for (const [namn, a] of steg) {
    try {
      const ut = execFileSync(process.execPath, a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
      console.log(`${namn}: ok (${ut.trim().split('\n').pop()})`);
    } catch (e) {
      kedjaOk = false;
      const x = e as { stdout?: string };
      console.log(`${namn}: FEL\n${(x.stdout ?? '').split('\n').slice(-25).join('\n')}`);
    }
  }
}
process.exit(fel.length || !kedjaOk ? 1 : 0);
