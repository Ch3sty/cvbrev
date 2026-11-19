// scripts/gen-spatial-v5.mjs
// =============================================================================
// Frågebanken 2026-11-19, omgång 3: 100 nya uppgifter i Spatial förmåga med
// fran_version 5, lagda sist i bankfilerna. Befintliga rader ändras aldrig.
// Aktiveras senare med SPATIAL_VERSION 5 (docs/fragebank/spatial-2026-11-19-omg3.md).
//
// Formerna A till D börjar bli uttömda (omgång 2 fann 60 000 försök utan en
// ny avancerad B i den gamla formen). Omgång 3 bygger därför nya uppgiftstyper
// inom formerna, så att nivåtestets fördelning (4 A, 3 B, 4 C, 4 D) och allt
// som räknar per form är som förut:
//
//   A spegling   spegling i två linjer (spegling.mjs). Grund en lodrät och en
//                vågrät linje, avancerad och expert en rak och en sned, där
//                ordningen avgör åt vilket håll figuren vrids.
//   C vy         en kropp av kuber på en platta, sedd från pilens håll (kropp.mjs)
//   C snitt      samma kropp sågad itu längs en streckad linje, snittytan sedd
//                från pilens håll
//   B tva_vik    expert: två vikningar varav minst en sned, två hål, inga klipp
//                (vikning.mjs, EXPERT_TVA_VIK)
//
// Varje ny uppgift ska, som i omgång 2:
//   - klara formens spärrar (med de nya typernas egna: SP-S, SP-K, SP-B) och
//     den oberoende verifieraren utan fel och utan varningar,
//   - inte ha formens nyckel i någon bank eller bland artiklarnas uppgifter,
//   - inte vara en kopia (verifierarens kanoniskNyckel) av någon uppgift på
//     någon nivå, vriden, speglad eller, för kroppar, sedd från andra sidan
//     efter ett kvarts varv. En speglingsuppgift med samma figur och samma
//     facit som en vridningsuppgift i form A räknas också som kopia,
//   - för C-kroppar inte använda en kropp (i något läge på plattan) som en
//     annan ny uppgift redan har, och för A-spegling inte en fri form som en
//     annan ny speglingsuppgift på nivån redan har.
//
// Kör: node scripts/gen-spatial-v5.mjs            (skriver bankerna)
//      node scripts/gen-spatial-v5.mjs --torr     (skriver inget)
//      node scripts/gen-spatial-v5.mjs --ersatt   (byter ut de uppgifter med
//        fran_version 5 som verifieraren fäller som kopior; id och plats behålls)
// Utan --ersatt vägrar den köra om version 5 redan finns i en bank.
//
// OBS: gen-spatial.mjs skriver om en form från början och skulle ta bort
// version 3 till 5. Kör den inte på de här bankerna.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';
import { verifieraFraga, kanoniskNyckel, dubbletter } from './spatial-verifiera.mjs';
import { friForm } from './lib/spatial/brick.mjs';
import { byggUppgiftS } from './lib/spatial/spegling.mjs';
import { byggUppgiftK, kroppKanon } from './lib/spatial/kropp.mjs';
import { byggUppgiftB } from './lib/spatial/vikning.mjs';

const VERSION = 5;
const FRO = 'spatial-v5-2026-11-19';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e' };
const P_PRIOR = { grund: 0.8, avancerad: 0.6, expert: 0.42 };
const SVARIGHET = { grund: 1, avancerad: 2, expert: 3 };
/** Nya per nivå och typ: 33 + 33 + 34 = 100. */
const MAL = {
  grund: [['A', 'spegling', 11], ['C', 'vy', 11], ['C', 'snitt', 11]],
  avancerad: [['A', 'spegling', 11], ['C', 'vy', 11], ['C', 'snitt', 11]],
  expert: [['A', 'spegling', 8], ['B', 'tva_vik', 10], ['C', 'vy', 8], ['C', 'snitt', 8]],
};
const FORSOK = 60000;

const torr = process.argv.includes('--torr');
const ersatt = process.argv.includes('--ersatt');
const fil = (niva) => `src/lib/spatialV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;

await laddaFormer();
const banker = Object.fromEntries(NIVAER.map((n) => [n, JSON.parse(readFileSync(fil(n), 'utf8'))]));
const formNyckel = (q) => `${q.form}:${FORMER[q.form].nyckel(q)}`;

/** Typen ur uppgiften (det som ritas). */
function typAv(q) {
  if (q.form === 'A' && q.referens?.axlar) return 'spegling';
  if (q.form === 'C' && q.referens?.kind === 'kropp') return q.referens.snitt === undefined ? 'vy' : 'snitt';
  if (q.form === 'B' && q.niva === 'expert' && !q.klipp && q.vikningar?.length === 2) return 'tva_vik';
  return null;
}

const artiklar = JSON.parse(readFileSync('src/lib/artikelfigurer/spatial.json', 'utf8'));
const alla0 = [...NIVAER.flatMap((n) => banker[n]), ...artiklar];
const allaNycklar = new Set(alla0.map(formNyckel));
/** Kopiespärren: kanoniska nycklar för alla uppgifter på alla nivåer, och de nya allt eftersom. */
const kopior = new Map(alla0.map((q) => [kanoniskNyckel(q), q.id]));
/** Kroppar som redan används av en ny uppgift (alla nivåer). */
const kroppar = new Set(alla0.filter((q) => q.referens?.kind === 'kropp').map((q) => kroppKanon(q.referens.h)));

function bygg(typ, niva, id, fro) {
  if (typ === 'spegling') return byggUppgiftS({ niva, id, fro });
  if (typ === 'tva_vik') return byggUppgiftB({ niva, id, fro, variant: 'tva_vik' });
  return byggUppgiftK({ niva, id, fro, typ });
}

/** Prövar en byggd uppgift. Returnerar orsaken till avslag eller null. */
function provaKandidat(q, niva, typ, nyaPaNivan) {
  if (FORMER[q.form].sparrar(q).length) return 'sparr';
  if (allaNycklar.has(formNyckel(q))) return 'dubblett';
  const v = verifieraFraga(q);
  if (v.fel.length) return 'verifierare_fel';
  if (v.varn.length) return 'verifierare_varning';
  if (kopior.has(kanoniskNyckel(q))) return 'kopia';
  if (typ === 'spegling' && nyaPaNivan.some((x) => typAv(x) === 'spegling' && friForm(x.referens) === friForm(q.referens))) return 'samma_fria_form';
  if ((typ === 'vy' || typ === 'snitt') && kroppar.has(kroppKanon(q.referens.h))) return 'samma_kropp';
  return null;
}
function medMeta(q, niva) {
  return { ...q, difficulty: SVARIGHET[niva] + (q.form === 'A' ? 0 : 1), p_prior: P_PRIOR[niva], fran_version: VERSION };
}
function tag(q) {
  allaNycklar.add(formNyckel(q));
  kopior.set(kanoniskNyckel(q), q.id);
  if (q.referens?.kind === 'kropp') kroppar.add(kroppKanon(q.referens.h));
}

let brist = 0;
const rapport = [];

if (ersatt) {
  const alla = NIVAER.flatMap((n) => banker[n]);
  const fallda = [...new Set(dubbletter(alla).fel.map((t) => t.split(':')[0]))].filter((id) => alla.find((q) => q.id === id)?.fran_version === VERSION);
  for (const id of fallda) {
    const niva = NIVAER.find((n) => banker[n].some((q) => q.id === id));
    const bank = banker[niva];
    const plats = bank.findIndex((q) => q.id === id);
    const gammal = bank[plats];
    const typ = typAv(gammal);
    kopior.delete(kanoniskNyckel(gammal));
    if (gammal.referens?.kind === 'kropp') kroppar.delete(kroppKanon(gammal.referens.h));
    const nyaPaNivan = bank.filter((q, i) => q.fran_version === VERSION && i !== plats);
    const avvisade = {};
    let ny = null;
    for (let i = 0; !ny && i < FORSOK; i++) {
      const q = bygg(typ, niva, id, `${FRO}-ersatt:${id}:${i}`);
      if (!q) {
        avvisade.bygg = (avvisade.bygg ?? 0) + 1;
        continue;
      }
      const orsak = provaKandidat(q, niva, typ, nyaPaNivan);
      if (orsak) avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
      else ny = medMeta(q, niva);
    }
    if (!ny) {
      kopior.set(kanoniskNyckel(gammal), id);
      brist++;
      rapport.push(`${id}: ingen ersättare ${JSON.stringify(avvisade)}`);
      continue;
    }
    allaNycklar.delete(formNyckel(gammal));
    tag(ny);
    bank[plats] = ny;
    rapport.push(`${id}: ersatt ${JSON.stringify(avvisade)}`);
  }
  if (!torr) for (const n of NIVAER) writeFileSync(fil(n), JSON.stringify(banker[n], null, 1) + '\n');
} else {
  if (NIVAER.some((n) => banker[n].some((q) => q.fran_version === VERSION))) {
    console.log(`Version ${VERSION} finns redan i bankerna. Inget skrivet (byt ut kopior med --ersatt).`);
    process.exit(1);
  }
  for (const niva of NIVAER) {
    const bank = banker[niva];
    const nya = [];
    // löpnummer per form fortsätter efter nivåns högsta
    const nasta = {};
    for (const form of ['A', 'B', 'C', 'D']) nasta[form] = Math.max(0, ...bank.filter((q) => q.form === form).map((q) => Number(q.id.split('-').pop()))) + 1;
    for (const [form, typ, mal] of MAL[niva]) {
      const ut = [];
      const avvisade = {};
      for (let i = 0; ut.length < mal && i < FORSOK; i++) {
        const id = `sp-${KORT[niva]}-${form.toLowerCase()}-${String(nasta[form]).padStart(2, '0')}`;
        const q = bygg(typ, niva, id, `${FRO}:${typ}:${niva}:${i}`);
        if (!q) {
          avvisade.bygg = (avvisade.bygg ?? 0) + 1;
          continue;
        }
        if (q.form !== form) throw new Error(`${typ} gav form ${q.form}`);
        const orsak = provaKandidat(q, niva, typ, [...nya, ...ut]);
        if (orsak) {
          avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
          continue;
        }
        tag(q);
        ut.push(medMeta(q, niva));
        nasta[form]++;
      }
      if (ut.length < mal) brist++;
      rapport.push(`${niva} ${form} ${typ}: ${ut.length} av ${mal} ${JSON.stringify(avvisade)}`);
      nya.push(...ut);
    }
    // per form i id-ordning, sist i bankfilen
    nya.sort((a, b) => a.form.localeCompare(b.form) || a.id.localeCompare(b.id));
    if (!torr) writeFileSync(fil(niva), JSON.stringify([...bank, ...nya], null, 1) + '\n');
  }
}
console.log(rapport.join('\n'));
process.exit(brist ? 1 : 0);
