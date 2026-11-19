// scripts/gen-spatial-v3.mjs
// =============================================================================
// Frågebanken 2026-11-19: cirka 100 nya uppgifter i Spatial förmåga med
// fran_version 3, lagda sist i bankfilerna. Befintliga rader ändras aldrig.
//
// Samma byggare och spärrar som gen-spatial.mjs (scripts/lib/spatial/), men
// ett nytt frö, och varje ny uppgift ska dessutom:
//   - klara den oberoende verifieraren (scripts/spatial-verifiera.mjs) utan
//     fel och utan varningar (undantag: grund B, se nedan),
//   - inte finnas i någon bank eller bland artiklarnas uppgifter (formens nyckel),
//   - inte vara samma uppgift vriden eller speglad som en annan på nivån
//     (verifierarens kanoniskNyckel, under kvadratens åtta symmetrier; grund B
//     är undantagen eftersom formen bara har 32 uppgifter),
//   - för C inte ha en referens som redan används på nivån,
//   - hålla formens tak räknat på hela nivån efter tillägget (A: fri form,
//     D: uppsättning distraktortyper).
//
// Kör: node scripts/gen-spatial-v3.mjs            (skriver bankerna)
//      node scripts/gen-spatial-v3.mjs --torr     (skriver inget)
//      node scripts/gen-spatial-v3.mjs --ersatt   (byter ut de uppgifter med
//        fran_version 3 som verifieraren fäller som vridna eller speglade
//        dubbletter; id och plats behålls, granskningen 2026-11-19)
// Utan --ersatt vägrar den köra om version 3 redan finns i en bank.
//
// OBS: gen-spatial.mjs skriver om en form från början och skulle ta bort
// version 3. Kör den inte igen på de här bankerna.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { FORMER, laddaFormer } from './gen-spatial.mjs';
import { verifieraFraga, kanoniskNyckel, dubbletter } from './spatial-verifiera.mjs';
import { friForm } from './lib/spatial/brick.mjs';
import { vyNyckel } from './lib/spatial/kub.mjs';

const VERSION = 3;
const FRO = 'spatial-v3-2026-11-19';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e' };
const P_PRIOR = { grund: 0.8, avancerad: 0.6, expert: 0.42 };
const SVARIGHET = { grund: 1, avancerad: 2, expert: 3 };
/** Nya per nivå och form: 34 + 33 + 33 = 100, samma tyngd per form som i dag. */
const MAL = {
  grund: { A: 9, B: 8, C: 8, D: 9 },
  avancerad: { A: 8, B: 8, C: 8, D: 9 },
  expert: { A: 8, B: 8, C: 8, D: 9 },
};
/** Taken som andel av formens uppgifter på nivån (gen-spatial.mjs: A 3/24, 2/24, 2/24; D 12/24, 8/24, 8/24). */
const TAK_A = { grund: 4, avancerad: 3, expert: 3 };
const TAK_D_ANDEL = { grund: 0.5, avancerad: 1 / 3, expert: 1 / 3 };

const torr = process.argv.includes('--torr');
const ersatt = process.argv.includes('--ersatt');
const fil = (niva) => `src/lib/spatialV1/bank${niva[0].toUpperCase()}${niva.slice(1)}.json`;

await laddaFormer();
const banker = Object.fromEntries(NIVAER.map((n) => [n, JSON.parse(readFileSync(fil(n), 'utf8'))]));
const formNyckel = (q) => `${q.form}:${FORMER[q.form].nyckel(q)}`;
const dGrupp = (x) => x.typer.filter(Boolean).sort().join('+');

/**
 * Prövar en byggd uppgift mot allt utom formens spärrar. `ovriga` är nivåns
 * uppgifter i samma form som den nya ska stå bredvid, `allaNycklar` formens
 * nycklar i alla banker. Returnerar orsaken till avslag eller null.
 */
function provaKandidat(q, niva, form, ovriga, allaNycklar, antalIForm) {
  if (FORMER[form].sparrar(q).length) return 'sparr';
  if (allaNycklar.has(formNyckel(q))) return 'dubblett';
  const v = verifieraFraga(q);
  // grund B: en halv vikning och ett hål ger bara 32 uppgifter, 24 finns redan. Där får
  // "fel axel" vara facit vridet ett kvarts varv (som i 13 av de 24 befintliga).
  const varn = v.varn.filter((x) => !(form === 'B' && niva === 'grund' && /vridet i planet/.test(x)));
  if (v.fel.length || varn.length) return v.fel.length ? 'verifierare_fel' : 'verifierare_varning';
  if (!(form === 'B' && niva === 'grund')) {
    const k = kanoniskNyckel(q);
    if (ovriga.some((x) => kanoniskNyckel(x) === k)) return 'vriden_dubblett';
  }
  if (form === 'A') {
    const g = friForm(q.referens);
    if (ovriga.filter((x) => friForm(x.referens) === g).length >= TAK_A[niva]) return 'tak_fri_form';
  }
  if (form === 'C' && ovriga.some((x) => vyNyckel(x.referens) === vyNyckel(q.referens))) return 'samma_referens';
  if (form === 'D') {
    const tak = Math.floor(TAK_D_ANDEL[niva] * antalIForm);
    if (ovriga.filter((x) => dGrupp(x) === dGrupp(q)).length >= tak) return 'tak_typer';
  }
  return null;
}
const medMeta = (q, niva, form) => ({ ...q, difficulty: SVARIGHET[niva] + (form === 'A' ? 0 : 1), p_prior: P_PRIOR[niva], fran_version: VERSION });

// artiklarnas egna uppgifter (artikel-steg2-check.mjs) får inte heller finnas i bankerna
const artiklar = JSON.parse(readFileSync('src/lib/artikelfigurer/spatial.json', 'utf8'));
const allaNycklar = new Set([...NIVAER.flatMap((n) => banker[n]), ...artiklar].map(formNyckel));
let brist = 0;
const rapport = [];

if (ersatt) {
  // de nya som verifieraren fäller som vridna eller speglade dubbletter
  const alla = NIVAER.flatMap((n) => banker[n]);
  const fallda = [...new Set(dubbletter(alla).fel.map((t) => t.split(':')[0]))].filter((id) => alla.find((q) => q.id === id)?.fran_version === VERSION);
  for (const id of fallda) {
    const niva = NIVAER.find((n) => banker[n].some((q) => q.id === id));
    const bank = banker[niva];
    const plats = bank.findIndex((q) => q.id === id);
    const gammal = bank[plats];
    const form = gammal.form;
    const ovriga = bank.filter((q, i) => q.form === form && i !== plats);
    const avvisade = {};
    let ny = null;
    for (let i = 0; !ny && i < 60000; i++) {
      const q = FORMER[form].bygg({ niva, id, fro: `${FRO}-ersatt:${id}:${i}` });
      if (!q) {
        avvisade.bygg = (avvisade.bygg ?? 0) + 1;
        continue;
      }
      const orsak = provaKandidat(q, niva, form, ovriga, allaNycklar, ovriga.length + 1);
      if (orsak) avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
      else ny = medMeta(q, niva, form);
    }
    if (!ny) {
      brist++;
      rapport.push(`${id}: ingen ersättare ${JSON.stringify(avvisade)}`);
      continue;
    }
    allaNycklar.delete(formNyckel(gammal));
    allaNycklar.add(formNyckel(ny));
    bank[plats] = ny;
    rapport.push(`${id}: ersatt ${JSON.stringify(avvisade)}`);
  }
  if (!torr) for (const n of NIVAER) writeFileSync(fil(n), JSON.stringify(banker[n], null, 1) + '\n');
} else {
  if (NIVAER.some((n) => banker[n].some((q) => q.fran_version === VERSION))) {
    console.log('Version 3 finns redan i bankerna. Inget skrivet (byt ut dubbletter med --ersatt).');
    process.exit(1);
  }
  for (const niva of NIVAER) {
    const bank = banker[niva];
    const nya = [];
    for (const form of ['A', 'B', 'C', 'D']) {
      const F = FORMER[form];
      const mal = MAL[niva][form];
      const befintliga = bank.filter((q) => q.form === form);
      const nummer0 = Math.max(...befintliga.map((q) => Number(q.id.split('-').pop())));
      const ut = [];
      const avvisade = {};
      for (let i = 0; ut.length < mal && i < 40000; i++) {
        const id = `sp-${KORT[niva]}-${form.toLowerCase()}-${String(nummer0 + ut.length + 1).padStart(2, '0')}`;
        const q = F.bygg({ niva, id, fro: `${FRO}:${form}:${niva}:${i}` });
        if (!q) {
          avvisade.bygg = (avvisade.bygg ?? 0) + 1;
          continue;
        }
        const orsak = provaKandidat(q, niva, form, [...befintliga, ...ut], allaNycklar, befintliga.length + mal);
        if (orsak) {
          avvisade[orsak] = (avvisade[orsak] ?? 0) + 1;
          continue;
        }
        allaNycklar.add(formNyckel(q));
        ut.push(medMeta(q, niva, form));
      }
      if (ut.length < mal) brist++;
      rapport.push(`${niva} ${form}: ${ut.length} av ${mal} ${JSON.stringify(avvisade)}`);
      nya.push(...ut);
    }
    if (!torr) writeFileSync(fil(niva), JSON.stringify([...bank, ...nya], null, 1) + '\n');
  }
}
console.log(rapport.join('\n'));
process.exit(brist ? 1 : 0);
