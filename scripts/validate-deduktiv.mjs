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
// "kommer", "samma test" (DV7), DD1 till DD6 och DV2, DV3, DV5 (sparrar.mjs).
// Bankens aktiva uppgifter (inte pensionerade) dessutom DD7 till DD9, och
// D4 (omgång 3, bankversion 5): de nya familjerna med spärrarna E1 till E7
// (lib/deduktiv/d4.mjs), fem alternativ, ingen remsa, och i uppgiftens text
// inget "bara" och inget "eller" utom i "varken ... eller" och "antingen
// sanningssägare eller lögnare".
// bankversionerna: fran_version 1 till 5 (3 till 5 bara i banken, frågebanken
// 2026-11-19 omgång 1 och 2), pensionerad_fran 2 eller 4, ersättarna pekar på en pensionerad
// uppgift (scripts/laga-deduktiv-v2.mjs).
// Över allt: unika id och ingen uppgift två gånger.
// Exit 1 vid fel.
// =============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { sparrFel, dd7, dd8, dd9 } from './lib/deduktiv/sparrar.mjs';
import { sparrFelD4, D4_P_PRIOR, D4_DIFFICULTY, lockvillkor, D4_LOCKTAK } from './lib/deduktiv/d4.mjs';
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
// Två siffror, tre från omgång 2 (version 4) när en nivå passerar 99.
const ID = /^dd-([gae])-(d[1234])-\d{2,3}$/;
const NIVA_FOR_KOD = { g: 'grund', a: 'avancerad', e: 'expert' };
const TILLATEN_NIVA = { D1: ['grund'], D2: ['grund', 'avancerad'], D3: ['expert'], D4: ['grund', 'avancerad', 'expert'] };
/** D4: ord som är tvetydiga i vardagen (omgång 3). eller bara i varken ... eller och i inledningen om sanningssägare. */
const D4_ORD = [/\bbara\b/i];
const D4_ELLER = (t) => t.replace(/[Vv]arken [^.]*? eller/g, '').replace(/antingen sanningssägare eller lögnare/g, '');
const FORBJUDET = [/[–—]/, /\blätt/i, /\bsnart\b/i, /\bkommer\b/i, /samma test/i, /\benkelt\b/i, /\buppenbart\b/i, /\bposition/i];

const fel = [];
const info = [];
const allaId = new Map();
const lock = new Map();
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
    // Grund-D2 i bankens aktiva pool har 0,62 (granskning 2026-11-19, punkt 7): fyra platser och tre villkor är lättare än avancerad-D2.
    const prior = q.typ === 'D4' ? D4_P_PRIOR[q.niva] : slag === 'bank' && q.niva === 'grund' && q.typ === 'D2' && !q.pensionerad_fran ? 0.62 : P_PRIOR[q.typ];
    if (q.p_prior !== prior) f(`p_prior ${q.p_prior}, ${q.niva} ${q.typ} ska ha ${prior}`);
    if (![1, 2, 3, 4, 5].includes(q.fran_version)) f('fran_version ska vara 1 till 5');
    if ((q.typ === 'D4') !== (q.fran_version === 5)) f('D4 och fran_version 5 hör ihop (omgång 3)');
    if (q.typ === 'D4' && q.difficulty !== D4_DIFFICULTY[q.niva]) f(`difficulty ${q.difficulty}, ${q.niva} D4 ska ha ${D4_DIFFICULTY[q.niva]}`);
    if (q.fran_version >= 3 && slag !== 'bank') f(`fran_version ${q.fran_version} finns bara i bankfilerna`);
    // 2: lagade i version 2. 4: nästan-dubbletter pensionerade i omgång 2 (granskning 2026-11-19).
    if (q.pensionerad_fran != null && ![2, 4].includes(q.pensionerad_fran)) f('pensionerad_fran ska vara 2 eller 4');
    if (q.pensionerad_fran != null && q.pensionerad_fran <= q.fran_version) f('pensionerad före sin första version');
    if (q.ersatter && !fragor.some((x) => x.id === q.ersatter && x.pensionerad_fran === q.fran_version)) f(`ersätter ${q.ersatter}, som inte är pensionerad i version ${q.fran_version}`);
    const antalAlt = q.typ === 'D1' ? 4 : 5;
    if (!Array.isArray(q.options) || q.options.length !== antalAlt) f(`${antalAlt} alternativ krävs`);
    if (!Array.isArray(q.etiketter) || q.etiketter.length !== q.options?.length) f('en etikett per alternativ krävs');
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= antalAlt) f('correctAnswer utanför alternativen');
    if (!Array.isArray(q.villkor) || q.villkor.length < 2) f('minst två villkor');
    if (typeof q.fraga !== 'string' || !q.fraga.endsWith('?')) f('frågan saknas');
    if (!Array.isArray(q.losning?.steg) || !q.losning.steg.length) f('lösningsgången saknas');
    if ((q.typ === 'D2' || q.typ === 'D3') && (!q.losning?.schema || q.losning.schema.namn?.length !== q.formell?.namn?.length)) f('DV1: remsan saknas');
    if (!Array.isArray(q.misstag) || q.misstag.length !== q.options?.length) f('ett misstag per alternativ krävs');
    else q.misstag.forEach((m, i) => {
      if (i === q.correctAnswer && m !== '') f('facit har ett misstag');
      if (i !== q.correctAnswer && !m) f(`alternativ ${i + 1} saknar misstag`);
    });
    if (new Set(q.options ?? []).size !== (q.options ?? []).length) f('två alternativ har samma text');
    const texter = [q.intro ?? '', ...(q.villkor ?? []), q.fraga ?? '', ...(q.options ?? []), ...(q.etiketter ?? []), ...(q.misstag ?? []), ...(q.losning?.steg ?? []).flatMap((x) => [...(x.villkor ?? []), x.foljd ?? ''])];
    for (const t of texter) for (const re of FORBJUDET) if (re.test(t)) f(`förbjudet ord eller tecken (${re}) i "${t}"`);
    if (q.typ === 'D4') {
      for (const t of texter) for (const re of D4_ORD) if (re.test(t)) f(`D4: tvetydigt ord (${re}) i "${t}"`);
      for (const t of [q.intro ?? '', ...(q.villkor ?? []), q.fraga ?? '', ...(q.options ?? [])]) if (/\beller\b/.test(D4_ELLER(t))) f(`D4: eller utan varken i "${t}"`);
    }
    if (q.typ === 'D2' && q.villkor && (q.villkor.length < 3 || q.villkor.length > 5)) f(`D2 ska ha tre till fem villkor, har ${q.villkor.length}`);
    if (q.typ === 'D3' && q.villkor && (q.villkor.length < 5 || q.villkor.length > 6)) f(`D3 ska ha fem till sex villkor, har ${q.villkor.length}`);
    // losning_granskad: testansvarig har skrivit om lösningstexten (dd-e-d3-77, omgranskning
    // 2026-11-19). Då får texten avvika från lösarens ordalydelse; stegens villkor, remsan och
    // lösningen kontrolleras ändå (DD5 i övrigt, DV1, DV3, DV5).
    const ordagrant = 'DD5: förklaringen är inte lösarens gång ordagrant';
    if (q.typ === 'D4') {
      for (const x of sparrFelD4(q)) f(x);
      if (lockvillkor(q).length) lock.set(q.niva, [...(lock.get(q.niva) ?? []), q.id]);
    }
    else for (const x of sparrFel(q)) if (!(q.losning_granskad === true && x === ordagrant)) f(x);
    if (q.losning_granskad === true && q.losning?.steg?.at(-1)?.foljd !== undefined) {
      const sista = q.losning.steg.at(-1);
      if (!Array.isArray(sista.markor) || !sista.markor.length) f('granskad lösningstext: sista steget saknar villkor');
    }
    // Pensionerad från 4 är fortfarande aktiv i version 3 och ska klara spärrarna.
    const aktiv = slag === 'bank' && (!q.pensionerad_fran || q.pensionerad_fran > 2);
    if (aktiv && q.typ !== 'D4') for (const x of [...dd7(q), ...dd8(q), ...dd9(q)]) f(x);
    // Strukturen jämförs bland de aktiva; en ersättare har samma pussel som den pensionerade.
    const k = q.typ === 'D4' ? `D4|${q.villkor.join('|')}|${q.fraga}` : strukturNyckel(q);
    if (!q.pensionerad_fran) {
      if (nycklar.has(k)) f('samma uppgift finns redan i filen');
      nycklar.add(k);
    }
    perTyp[q.typ] = (perTyp[q.typ] ?? 0) + 1;
  }
  info.push(`${fil}: ${fragor.length} uppgifter ${JSON.stringify(perTyp)}`);
}

// om_sa: högst tre uppgifter med lockvillkor per nivå (granskningen av omgång 3).
for (const [niva, ids] of lock) if (ids.length > D4_LOCKTAK) fel.push(`D4: ${ids.length} om_sa-uppgifter med lockvillkor på ${niva}, högst ${D4_LOCKTAK} (${ids.join(', ')})`);
for (const x of info) console.log(x);
if (fel.length) {
  for (const x of fel) console.error('FEL', x);
  console.error(`${fel.length} fel`);
  process.exit(1);
}
console.log('Deduktiv: alla kontroller gick igenom.');
