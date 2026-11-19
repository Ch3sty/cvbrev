// scripts/gen-spatial-v4.mjs
// =============================================================================
// Frågebanken 2026-11-19, omgång 2: cirka 100 nya uppgifter i Spatial förmåga
// med fran_version 4, lagda sist i bankfilerna. Befintliga rader ändras aldrig.
// Aktiveras senare med SPATIAL_VERSION 4 (docs/fragebank/spatial-2026-11-19-omg2.md).
//
// Samma arbetssätt som gen-spatial-v3.mjs, med tre skillnader:
//   1. Kopiespärren gäller alla banker och alla nivåer. En ny uppgift får inte
//      vara samma uppgift som någon befintlig (eller en annan ny, eller en av
//      artiklarnas) där bara startvridningen eller en spegling skiljer, på
//      någon nivå. Nyckeln är verifierarens kanoniskNyckel, som för tärningar
//      nu också vrider hörnet (ett tredjedels varv och spegling). Grund B är
//      inte undantagen för de nya.
//   2. Grund B har nya vikningsformer (vikning.mjs, VARIANTER_B): diagonal
//      halvvikning (testansvarigs beslut i granskningen av omgång 1), remsa
//      (en rutbred kant viks in) och två hål i en halv vikning. Den gamla
//      formen, ett hål i en halv vikning längs en mittlinje, är uttömd.
//      Avancerad B är nästan uttömd på samma sätt (två vikningar, ett hål,
//      första vikningen halv eller diagonal) och får två nya: första
//      vikningen en remsa, och två hål.
//   3. Expert C får en förklaring som säger vilken granne den riktade sidan
//      pekar mot och vilken sida som tagit grannens plats (forklaringGrannar
//      i kub.mjs), som testansvarig bad om.
//
// Varje ny uppgift ska dessutom, som i omgång 1:
//   - klara formens spärrar och den oberoende verifieraren utan fel och utan
//     varningar (undantag: grund B, där "fel axel" alltid är facit vridet i planet),
//   - inte ha formens nyckel i någon bank eller bland artiklarnas uppgifter,
//   - för C inte ha en referens som redan används på nivån,
//   - hålla formens tak räknat på hela nivån efter tillägget (A: fri form,
//     D: uppsättning distraktortyper).
//
// Kör: node scripts/gen-spatial-v4.mjs            (skriver bankerna)
//      node scripts/gen-spatial-v4.mjs --torr     (skriver inget)
//      node scripts/gen-spatial-v4.mjs --ersatt   (byter ut de uppgifter med
//        fran_version 4 som verifieraren fäller som kopior; id och plats behålls)
// Utan --ersatt vägrar den köra om version 4 redan finns i en bank.
//
// OBS: gen-spatial.mjs skriver om en form från början och skulle ta bort
// version 3 och 4. Kör den inte igen på de här bankerna.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';
import { verifieraFraga, kanoniskNyckel, dubbletter } from './spatial-verifiera.mjs';
import { friForm } from './lib/spatial/brick.mjs';
import { vyNyckel, forklaringGrannar } from './lib/spatial/kub.mjs';
import { VARIANTER_B } from './lib/spatial/vikning.mjs';

const VERSION = 4;
const FRO = 'spatial-v4-2026-11-19';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e' };
const P_PRIOR = { grund: 0.8, avancerad: 0.6, expert: 0.42 };
const SVARIGHET = { grund: 1, avancerad: 2, expert: 3 };
/** Nya per nivå och form: 34 + 33 + 33 = 100, samma tyngd per form som i omgång 1. */
const MAL = {
  grund: { A: 9, B: 8, C: 8, D: 9 },
  avancerad: { A: 8, B: 8, C: 8, D: 9 },
  expert: { A: 8, B: 8, C: 8, D: 9 },
};
/** Taken som i omgång 1: A per fri form på nivån, D andel per uppsättning distraktortyper. */
const TAK_A = { grund: 4, avancerad: 3, expert: 3 };
const TAK_D_ANDEL = { grund: 0.5, avancerad: 1 / 3, expert: 1 / 3 };
/** Grund och avancerad B: högst så många nya per variant (tom sträng: avancerads gamla form). */
const TAK_VARIANT_B = { grund: { diagonal: 4, remsa: 4, tva_hal: 4 }, avancerad: { remsa_forst: 5, tva_hal: 4, '': 4 } };

const torr = process.argv.includes('--torr');
const ersatt = process.argv.includes('--ersatt');
const fil = (niva) => `src/lib/spatialV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;

await laddaFormer();
const banker = Object.fromEntries(NIVAER.map((n) => [n, JSON.parse(readFileSync(fil(n), 'utf8'))]));
const formNyckel = (q) => `${q.form}:${FORMER[q.form].nyckel(q)}`;
const dGrupp = (x) => x.typer.filter(Boolean).sort().join('+');

/** B-variant ur uppgiften (för taket); null för grunds gamla form och för expert. */
function variantB(q) {
  if (q.form !== 'B' || !TAK_VARIANT_B[q.niva]) return null;
  const stans = q.sekvens.at(-1);
  if (stans.hal.length === 2) return 'tva_hal';
  const v = q.vikningar[0];
  const remsa = (v.typ === 'v' || v.typ === 'h') && v.k !== 2;
  if (q.niva === 'avancerad') return remsa ? 'remsa_forst' : '';
  if (v.typ === 'd' || v.typ === 'a') return 'diagonal';
  return remsa ? 'remsa' : null;
}

// artiklarnas egna uppgifter (artikel-steg2-check.mjs) får inte heller finnas i bankerna
const artiklar = JSON.parse(readFileSync('src/lib/artikelfigurer/spatial.json', 'utf8'));
const alla0 = [...NIVAER.flatMap((n) => banker[n]), ...artiklar];
const allaNycklar = new Set(alla0.map(formNyckel));
/** Kopiespärren: kanoniska nycklar för alla uppgifter på alla nivåer, och de nya allt eftersom. */
const kopior = new Map(alla0.map((q) => [kanoniskNyckel(q), q.id]));

/**
 * Prövar en byggd uppgift. `ovriga` är nivåns uppgifter i samma form som den
 * nya ska stå bredvid. Returnerar orsaken till avslag eller null.
 */
function provaKandidat(q, niva, form, ovriga, antalIForm, nyaVarianter) {
  if (FORMER[form].sparrar(q).length) return 'sparr';
  if (allaNycklar.has(formNyckel(q))) return 'dubblett';
  const v = verifieraFraga(q);
  // grund B: "fel axel" är facit speglat över den andra mittlinjen (eller diagonalen), alltså facit vridet i planet
  const varn = v.varn.filter((x) => !(form === 'B' && niva === 'grund' && /vridet i planet/.test(x)));
  if (v.fel.length || varn.length) return v.fel.length ? 'verifierare_fel' : 'verifierare_varning';
  if (kopior.has(kanoniskNyckel(q))) return 'kopia';
  if (form === 'A') {
    const g = friForm(q.referens);
    if (ovriga.filter((x) => friForm(x.referens) === g).length >= TAK_A[niva]) return 'tak_fri_form';
  }
  if (form === 'C' && ovriga.some((x) => vyNyckel(x.referens) === vyNyckel(q.referens))) return 'samma_referens';
  if (form === 'D') {
    const tak = Math.floor(TAK_D_ANDEL[niva] * antalIForm);
    if (ovriga.filter((x) => dGrupp(x) === dGrupp(q)).length >= tak) return 'tak_typer';
  }
  if (form === 'B' && TAK_VARIANT_B[niva]) {
    const vb = variantB(q);
    if (vb === null) return 'gammal_form';
    if ((nyaVarianter[vb] ?? 0) >= TAK_VARIANT_B[niva][vb]) return 'tak_variant';
  }
  if (form === 'C' && niva === 'expert' && !forklaringGrannar(q)) return 'forklaring';
  return null;
}
function medMeta(q, niva, form) {
  const ut = { ...q, difficulty: SVARIGHET[niva] + (form === 'A' ? 0 : 1), p_prior: P_PRIOR[niva], fran_version: VERSION };
  if (form === 'C' && niva === 'expert') ut.forklaring = forklaringGrannar(q);
  return ut;
}
// avancerad B: var tredje gång utan variant (den gamla formen), annars en av de nya
const variantFor = (niva, i) => {
  const v = VARIANTER_B[niva];
  if (!v) return undefined;
  const lista = niva === 'avancerad' ? [undefined, ...v] : v;
  return lista[i % lista.length];
};
const bygg = (form, niva, id, fro, i) => FORMER[form].bygg({ niva, id, fro, ...(form === 'B' && variantFor(niva, i) ? { variant: variantFor(niva, i) } : {}) });

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
    const form = gammal.form;
    const ovriga = bank.filter((q, i) => q.form === form && i !== plats);
    const nyaVarianter = {};
    for (const q of ovriga) if (q.fran_version === VERSION && variantB(q) !== null) nyaVarianter[variantB(q)] = (nyaVarianter[variantB(q)] ?? 0) + 1;
    kopior.delete(kanoniskNyckel(gammal));
    const avvisade = {};
    let ny = null;
    for (let i = 0; !ny && i < 60000; i++) {
      const q = bygg(form, niva, id, `${FRO}-ersatt:${id}:${i}`, i);
      if (!q) {
        avvisade.bygg = (avvisade.bygg ?? 0) + 1;
        continue;
      }
      const orsak = provaKandidat(q, niva, form, ovriga, ovriga.length + 1, nyaVarianter);
      if (orsak) avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
      else ny = medMeta(q, niva, form);
    }
    if (!ny) {
      kopior.set(kanoniskNyckel(gammal), id);
      brist++;
      rapport.push(`${id}: ingen ersättare ${JSON.stringify(avvisade)}`);
      continue;
    }
    allaNycklar.delete(formNyckel(gammal));
    allaNycklar.add(formNyckel(ny));
    kopior.set(kanoniskNyckel(ny), id);
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
    for (const form of ['A', 'B', 'C', 'D']) {
      const mal = MAL[niva][form];
      const befintliga = bank.filter((q) => q.form === form);
      const nummer0 = Math.max(...befintliga.map((q) => Number(q.id.split('-').pop())));
      const ut = [];
      const avvisade = {};
      const nyaVarianter = {};
      for (let i = 0; ut.length < mal && i < 60000; i++) {
        const id = `sp-${KORT[niva]}-${form.toLowerCase()}-${String(nummer0 + ut.length + 1).padStart(2, '0')}`;
        const q = bygg(form, niva, id, `${FRO}:${form}:${niva}:${i}`, i);
        if (!q) {
          avvisade.bygg = (avvisade.bygg ?? 0) + 1;
          continue;
        }
        const orsak = provaKandidat(q, niva, form, [...befintliga, ...ut], befintliga.length + mal, nyaVarianter);
        if (orsak) {
          avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
          continue;
        }
        allaNycklar.add(formNyckel(q));
        kopior.set(kanoniskNyckel(q), id);
        const vb = variantB(q);
        if (vb !== null) nyaVarianter[vb] = (nyaVarianter[vb] ?? 0) + 1;
        ut.push(medMeta(q, niva, form));
      }
      if (ut.length < mal) brist++;
      rapport.push(`${niva} ${form}: ${ut.length} av ${mal}${Object.keys(nyaVarianter).length ? ` ${JSON.stringify(nyaVarianter)}` : ''} ${JSON.stringify(avvisade)}`);
      nya.push(...ut);
    }
    if (!torr) writeFileSync(fil(niva), JSON.stringify([...bank, ...nya], null, 1) + '\n');
  }
}
console.log(rapport.join('\n'));
process.exit(brist ? 1 : 0);
