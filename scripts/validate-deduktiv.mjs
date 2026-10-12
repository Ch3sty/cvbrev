#!/usr/bin/env node
// scripts/validate-deduktiv.mjs
// =============================================================================
// Deduktiv slutledning (beställningen omgång 3, B1): struktur, kvoter och
// spärrarna DD1 till DD5 för kandidaterna och bankerna.
//
// Kör: node scripts/validate-deduktiv.mjs            (kandidaterna och bankerna)
//      node scripts/validate-deduktiv.mjs <fil ...>   (bara de filerna)
//
// Per uppgift: id dd-<g|a|e>-<d1|d2|d3>-<nn>, nivå mot typ (D1 grund, D2 grund
// eller avancerad, D3 expert), family, p_prior per typ, villkor, fraga,
// alternativ (D1 fyra, D2 och D3 fem), correctAnswer, en etikett per
// alternativ, ett misstag per distraktor, lösningsgång och remsa (D2, D3,
// DV1), fran_version 1, inga tankstreck och inga ord som "lätt", "snart",
// "kommer", "samma test" (DV7), DD1 till DD5 och DV2, DV3, DV5 (sparrar.mjs).
// Över allt: unika id och ingen uppgift två gånger.
// Exit 1 vid fel.
// =============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { sparrFel } from './lib/deduktiv/sparrar.mjs';
import { strukturNyckel, P_PRIOR } from './lib/deduktiv/generera.mjs';
import { FAMILJER } from './lib/deduktiv/tema.mjs';

const STANDARD = [
  'src/lib/deduktivV1/kandidater/grund.json',
  'src/lib/deduktivV1/kandidater/avancerad.json',
  'src/lib/deduktivV1/kandidater/expert.json',
  'src/lib/deduktivV1/bankGrund.json',
  'src/lib/deduktivV1/bankAvancerad.json',
  'src/lib/deduktivV1/bankExpert.json',
];
const filer = process.argv.slice(2).length ? process.argv.slice(2) : STANDARD.filter((f) => existsSync(f));
const ID = /^dd-([gae])-(d[123])-\d{2}$/;
const NIVA_FOR_KOD = { g: 'grund', a: 'avancerad', e: 'expert' };
const TILLATEN_NIVA = { D1: ['grund'], D2: ['grund', 'avancerad'], D3: ['expert'] };
const FORBJUDET = [/[–—]/, /\blätt/i, /\bsnart\b/i, /\bkommer\b/i, /samma test/i, /\benkelt\b/i, /\buppenbart\b/i, /\bposition/i];

const fel = [];
const info = [];
const allaId = new Map();
for (const fil of filer) {
  const fragor = JSON.parse(readFileSync(fil, 'utf8'));
  if (!Array.isArray(fragor)) { fel.push(`${fil}: inte en lista`); continue; }
  if (!fragor.length) { info.push(`${fil}: tom (väntar på befordran)`); continue; }
  const nycklar = new Set();
  const perTyp = {};
  for (const q of fragor) {
    const f = (x) => fel.push(`${fil} ${q.id ?? '?'}: ${x}`);
    const m = ID.exec(q.id ?? '');
    if (!m) f('id ska vara dd-<g|a|e>-<d1|d2|d3>-<nn>');
    else {
      if (NIVA_FOR_KOD[m[1]] !== q.niva) f(`id säger ${NIVA_FOR_KOD[m[1]]}, niva är ${q.niva}`);
      if (m[2].toUpperCase() !== q.typ) f(`id säger ${m[2]}, typ är ${q.typ}`);
    }
    // Samma id får finnas i en kandidatfil och i en bankfil, aldrig två gånger i samma slag.
    const slag = fil.includes('kandidater') ? 'kandidat' : 'bank';
    if (allaId.has(`${slag}:${q.id}`)) f(`id finns redan i ${allaId.get(`${slag}:${q.id}`)}`);
    allaId.set(`${slag}:${q.id}`, fil);
    if (!TILLATEN_NIVA[q.typ]?.includes(q.niva)) f(`${q.typ} hör inte hemma på ${q.niva}`);
    if (!FAMILJER.includes(q.family)) f(`okänd familj ${q.family}`);
    if (q.p_prior !== P_PRIOR[q.typ]) f(`p_prior ${q.p_prior}, ${q.typ} ska ha ${P_PRIOR[q.typ]}`);
    if (q.fran_version !== 1) f('fran_version ska vara 1');
    const antalAlt = q.typ === 'D1' ? 4 : 5;
    if (!Array.isArray(q.options) || q.options.length !== antalAlt) f(`${antalAlt} alternativ krävs`);
    if (!Array.isArray(q.etiketter) || q.etiketter.length !== q.options?.length) f('en etikett per alternativ krävs');
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= antalAlt) f('correctAnswer utanför alternativen');
    if (!Array.isArray(q.villkor) || q.villkor.length < 2) f('minst två villkor');
    if (typeof q.fraga !== 'string' || !q.fraga.endsWith('?')) f('frågan saknas');
    if (!Array.isArray(q.losning?.steg) || !q.losning.steg.length) f('lösningsgången saknas');
    if (q.typ !== 'D1' && (!q.losning?.schema || q.losning.schema.namn?.length !== q.formell?.namn?.length)) f('DV1: remsan saknas');
    if (!Array.isArray(q.misstag) || q.misstag.length !== q.options?.length) f('ett misstag per alternativ krävs');
    else q.misstag.forEach((m, i) => {
      if (i === q.correctAnswer && m !== '') f('facit har ett misstag');
      if (i !== q.correctAnswer && !m) f(`alternativ ${i + 1} saknar misstag`);
    });
    if (new Set(q.options ?? []).size !== (q.options ?? []).length) f('två alternativ har samma text');
    const texter = [q.intro ?? '', ...(q.villkor ?? []), q.fraga ?? '', ...(q.options ?? []), ...(q.etiketter ?? []), ...(q.misstag ?? []), ...(q.losning?.steg ?? []).flatMap((x) => [...(x.villkor ?? []), x.foljd ?? ''])];
    for (const t of texter) for (const re of FORBJUDET) if (re.test(t)) f(`förbjudet ord eller tecken (${re}) i "${t}"`);
    if (q.typ === 'D2' && q.villkor && (q.villkor.length < 3 || q.villkor.length > 5)) f(`D2 ska ha tre till fem villkor, har ${q.villkor.length}`);
    if (q.typ === 'D3' && q.villkor && (q.villkor.length < 5 || q.villkor.length > 6)) f(`D3 ska ha fem till sex villkor, har ${q.villkor.length}`);
    for (const x of sparrFel(q)) f(x);
    const k = strukturNyckel(q);
    if (nycklar.has(k)) f('samma uppgift finns redan i filen');
    nycklar.add(k);
    perTyp[q.typ] = (perTyp[q.typ] ?? 0) + 1;
  }
  info.push(`${fil}: ${fragor.length} uppgifter ${JSON.stringify(perTyp)}`);
}

for (const x of info) console.log(x);
if (fel.length) {
  for (const x of fel) console.error('FEL', x);
  console.error(`${fel.length} fel`);
  process.exit(1);
}
console.log('Deduktiv: alla kontroller gick igenom.');
