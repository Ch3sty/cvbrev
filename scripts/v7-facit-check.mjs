// scripts/v7-facit-check.mjs
// =============================================================================
// Maskinell facit- och latin-square-kontroll av matrisbankerna (V7).
//
// Kör: node scripts/v7-facit-check.mjs            (alla banker, version 1 till 3)
//      node scripts/v7-facit-check.mjs <fil.json> (en bank eller kandidatfil)
//
// För varje fråga, ur de åtta synliga rutorna utan att titta på facit
// (scripts/lib/matris/tolka.mjs):
//   1. Varje dimension har en regel, och ingen annan enkel regel ger ett
//      annat svar (tvetydighet).
//   2. Regeln pekar på exakt ett alternativ, och det är facit.
//   3. Latinska kvadrater: med facit isatt har varje rad och kolumn varje
//      värde exakt en gång, och ingen distraktor fullbordar kvadraten.
//   4. family och misstag i banken är desamma som generatorns logik ger
//      (misstag som står i misstagGranskas räknas inte).
// Över alla banker: unika id och inget rutnät två gånger bland ej
// pensionerade frågor (fel, spec-rummen 15.3).
//
// 3c-bankerna körs dessutom genom den strikta kvalitetskontrollen
// (scripts/lib/matris/kontroll.mjs). För de 84 ursprungliga skrivs den som
// upplysning, eftersom de är frysta och redan granskade, utom två former i
// samma fack (15.4) och tankstreck (15.5), som är fel. Pensionerade frågor
// (pensionerad: true) facitkontrolleras men räknas inte som upplysningar.
//
// Kandidatfiler (src/lib/logicTestV7/kandidater/) och frågor med band "plus"
// körs alltid strikt. För bandet "svår plus" ingår oberoendet och plus-kraven
// i den strikta kontrollen och är fel; för övriga är oberoendet upplysning.
//
// Bank_version 3 (plan-facit-genvag avsnitt 3): frågor med fran_version 3,
// i bankerna eller i kandidatfilerna, får spärrarna S1 till S9 per fråga
// (sparrar.mjs) som fel; för de frysta frågorna skrivs antalet per spärr och
// nivå som upplysning. Kvoterna S1b (högst 20 procent per facitruta, högst
// 10 procent på ruta 0) och S4b (högst 40 procent enradsfrågor på avancerad)
// räknas över version 3-poolen per nivå: fel när poolen har minst 80 frågor
// per nivå (versionen är påfylld), annars upplysning. Tabellen "facit per
// ruta" skrivs per nivå och version, och för version 3 också som prognos med
// kandidatfilerna.
// =============================================================================

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tolka, familjFor } from './lib/matris/tolka.mjs';
import { misstagFor } from './lib/matris/misstag.mjs';
import { kontrollera, oberoende, facitRuta0, nivaFor } from './lib/matris/kontroll.mjs';
import { stable, vKey } from './lib/matris/celler.mjs';
import { sparrFel, s1, s3, s5, s9, arEnrad, kvotFel, facitrutaAndelar } from './lib/matris/sparrar.mjs';
import { ALLA_BANKFILER, valbarI, lasBanker, pool, las } from './lib/matris/version.mjs';
import { eliminerbara } from './lib/matris/distraktorer.mjs';

const ALLA = ALLA_BANKFILER.filter((f) => existsSync(f));
const filer = process.argv[2] ? [process.argv[2]] : ALLA;
const fel = [];
const info = [];
const infoOberoende = [];
const infoSparr = [];
const ids = new Map();
const rutnat = new Map();
let antal = 0;
let antalPensionerade = 0;
const ruta0 = {};
const sparrUpplysning = {};

const nivaForFil = (fil, q) => (q.band === 'plus' ? 'expert' : /Grund/.test(fil) ? 'grund' : /Expert/.test(fil) ? 'expert' : /questionBank(Avancerad3c|AvanceradV3)?\.v7\.json$/.test(fil) ? 'avancerad' : nivaFor(q) ?? 'okänd');

for (const fil of filer) {
  const bank = las(fil);
  const kandidat = /[\\/]kandidater[\\/]/.test(fil);
  const ny = /(3c|V3|Plus)\.v7\.json$/.test(fil) || kandidat;
  for (const q of bank) {
    antal++;
    const tag = `[${q.id}]`;
    if (ids.has(q.id)) fel.push(`${tag} id finns också i ${ids.get(q.id)}`);
    ids.set(q.id, fil);
    // Pensionerade frågor (spec-rummen 15) ligger kvar för gamla sessioner.
    const pensionerad = q.pensionerad === true;
    if (pensionerad) antalPensionerade++;
    const g = stable(q.grid);
    if (!pensionerad) {
      if (rutnat.has(g)) fel.push(`${tag} samma rutnät som ${rutnat.get(g)}`);
      else rutnat.set(g, q.id);
    }

    const t = tolka(q);
    if (!t.ok) { fel.push(`${tag} ingen regel för ${(t.saknar ?? [t.orsak]).join(', ')}`); continue; }
    if (t.tvetydig.length) fel.push(`${tag} tvetydig: ${t.tvetydig.map((x) => x.dim + ' ' + x.regler.join(' / ')).join('; ')}`);
    if (t.traffar.length !== 1) fel.push(`${tag} ${t.traffar.length} alternativ stämmer med regeln (${t.traffar.join(', ')})`);
    else if (t.traffar[0] !== q.correctAnswer) fel.push(`${tag} regeln pekar på alternativ ${t.traffar[0] + 1}, facit är ${q.correctAnswer + 1}`);

    // latinska kvadrater med facit isatt
    for (const [dimId, r] of Object.entries(t.regel)) {
      if (r.regel !== 'latin') continue;
      const val = (c) => vKey(t.dimsVy(c).find((d) => d.id === dimId).varde);
      const full = q.grid.map((rad) => rad.slice());
      full[2][2] = q.options[q.correctAnswer];
      const M = full.map((rad) => rad.map(val));
      const alla = new Set(M.flat());
      const ok = alla.size === 3 && [0, 1, 2].every((i) => new Set(M[i]).size === 3 && new Set(M.map((rad) => rad[i])).size === 3);
      if (!ok) fel.push(`${tag} ${dimId} är inte en latinsk kvadrat med facit isatt`);
      q.options.forEach((o, i) => {
        if (i === q.correctAnswer) return;
        const alla2 = Object.entries(t.regel).filter(([, x]) => x.regel === 'latin').every(([d]) => vKey(t.dimsVy(o).find((x) => x.id === d).varde) === vKey(t.pred[d]));
        const ovriga = Object.entries(t.regel).filter(([, x]) => x.regel !== 'latin').every(([d]) => vKey(t.dimsVy(o).find((x) => x.id === d).varde) === vKey(t.pred[d]));
        if (alla2 && ovriga) fel.push(`${tag} alternativ ${i + 1} fullbordar också kvadraten`);
      });
    }

    // fälten
    const fam = familjFor(q, t);
    if (q.family !== fam) fel.push(`${tag} family är ${q.family}, tolkningen säger ${fam}`);
    const m = misstagFor(q, t).map((x) => x ?? '');
    const granskas = new Set(q.misstagGranskas ?? []);
    (q.misstag ?? []).forEach((x, i) => {
      if (granskas.has(i)) return;
      if (x !== m[i]) fel.push(`${tag} misstag ${i + 1} skiljer sig från generatorns: "${x}" mot "${m[i]}"`);
    });

    const k = kontrollera(q, { strikt: true, familj: q.family, kandidat: kandidat || q.fran_version >= 3 });
    if (pensionerad) continue;
    const niva = nivaForFil(fil, q);
    if (!kandidat) {
      const n = (ruta0[niva] ??= { valbara: 0, ruta0: 0 });
      n.valbara++;
      if (facitRuta0(q)) n.ruta0++;
    }
    // Spärrarna för bank_version 3
    if ((q.fran_version ?? 1) >= 3) {
      const sp = sparrFel(q, { t });
      fel.push(...sp.fel.map((x) => `[spärr] ${x}`));
      infoSparr.push(...sp.info.map((x) => `[spärr] ${x}`));
    } else if (!kandidat && valbarI(q, 2)) {
      const u = (sparrUpplysning[niva] ??= { valbara: 0, S1: 0, S3: 0, S4: 0, S5: 0, S6: 0, S9: 0 });
      u.valbara++;
      if (s1(q).length) u.S1++;
      if (s3(q).length) u.S3++;
      if (arEnrad(q)) u.S4++;
      if (s5(q).length) u.S5++;
      if (eliminerbara(q).length) u.S6++;
      if (s9(q, t).length) u.S9++;
    }
    if (q.band !== 'plus') infoOberoende.push(...oberoende(q, t).map((x) => `[oberoende] ${x}`));
    if (ny || q.band === 'plus') fel.push(...k.map((x) => `[strikt] ${x}`));
    else {
      const hart = (x) => /två former i samma fack|tankstreck/.test(x);
      fel.push(...k.filter(hart).map((x) => `[strikt, fryst] ${x}`));
      info.push(...k.filter((x) => !hart(x) && !/saknar misstagstext/.test(x)).map((x) => `[strikt, fryst] ${x}`));
    }
  }
}

console.log(`\nFacit- och latin-square-kontroll: ${antal} frågor i ${filer.length} banker (${antalPensionerade} pensionerade, ${antal - antalPensionerade} valbara)\n`);
if (info.length) {
  console.log(`Upplysning om de frysta bankerna (${info.length}), räknas inte som fel:`);
  info.forEach((x) => console.log('  · ' + x));
  console.log('');
}
if (infoOberoende.length) {
  console.log(`Upplysning om oberoende (${infoOberoende.length}), räknas inte som fel (bankerna är frysta, beslut 15.6):`);
  infoOberoende.forEach((x) => console.log('  · ' + x));
  console.log('');
}
if (Object.keys(ruta0).length) {
  const tot = Object.values(ruta0).reduce((a, n) => ({ valbara: a.valbara + n.valbara, ruta0: a.ruta0 + n.ruta0 }), { valbara: 0, ruta0: 0 });
  console.log(`Upplysning facit_ruta0 (facit identiskt med rutan uppe till vänster), räknas inte som fel: ${Object.entries(ruta0).map(([n, x]) => `${n} ${x.ruta0} av ${x.valbara}`).join(', ')}, totalt ${tot.ruta0} av ${tot.valbara}
`);
}
if (Object.keys(sparrUpplysning).length) {
  console.log('Upplysning: spärrarna på de frysta frågorna som är valbara i version 2 (räknas inte som fel; fel bara för fran_version 3):');
  console.log('  nivå        valbara   S1 ruta 0   S3 vanligast   S4 enrad   S5 udda   S6 strykbar   S9 läsordning');
  for (const [n, u] of Object.entries(sparrUpplysning)) console.log(`  ${n.padEnd(10)}  ${String(u.valbara).padStart(7)}   ${String(u.S1).padStart(9)}   ${String(u.S3).padStart(12)}   ${String(u.S4).padStart(8)}   ${String(u.S5).padStart(7)}   ${String(u.S6).padStart(11)}   ${String(u.S9).padStart(13)}`);
  console.log('');
}
if (infoSparr.length) {
  console.log(`Upplysning om spärrar som inte stoppar på nivån (${infoSparr.length}): S4 enrad på grund och avancerad, S9 läsordning på grund.`);
}

// ---------------------------------------------------------------- facit per ruta, kvoterna
if (!process.argv[2]) {
  const banker = lasBanker();
  const tabell = (rubrik, pooler) => {
    console.log(`\nFacit per ruta, ${rubrik} (andel valbara frågor där facit är lika ruta 0 till 7; ruta 0 uppe till vänster, ruta 4 i mitten):`);
    console.log('  nivå        antal   ' + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `ruta ${i}`.padStart(8)).join('') + '   enrad');
    for (const [n, fr] of Object.entries(pooler)) {
      const a = facitrutaAndelar(fr);
      console.log(`  ${n.padEnd(10)}  ${String(fr.length).padStart(5)}   ${a.map((x) => `${Math.round(x.andel * 100)} %`.padStart(8)).join('')}   ${Math.round((fr.filter(arEnrad).length / (fr.length || 1)) * 100)} %`);
    }
  };
  const nivaer = ['grund', 'avancerad', 'expert'];
  tabell('version 2', Object.fromEntries(nivaer.map((n) => [n, pool(banker, n, 2)])));
  const v3 = Object.fromEntries(nivaer.map((n) => [n, pool(banker, n, 3)]));
  tabell('version 3 (bankerna)', v3);
  // Kvoterna är fel när version 3 är påslagen (BANK_VERSION i selectQuestions.v7.ts).
  const pafylld = /export const BANK_VERSION = 3/.test(readFileSync('src/lib/logicTestV7/selectQuestions.v7.ts', 'utf8'));
  for (const n of nivaer) {
    const k = kvotFel(v3[n], n);
    if (pafylld) fel.push(...k.map((x) => `[kvot] ${x}`));
    else if (k.length) k.forEach((x) => console.log(`  · upplysning, version 3 inte påslagen (${v3[n].length} valbara): ${x}`));
  }
  // Prognos med kandidaterna (fran_version 3 i kandidatfilerna, och plus-band utan version)
  const K = 'src/lib/logicTestV7/kandidater';
  if (existsSync(K)) {
    const kand = readdirSync(K).filter((f) => f.endsWith('.v7.json')).flatMap((f) => las(path.posix.join(K, f)));
    const nyaId = new Set(nivaer.flatMap((n) => v3[n].map((q) => q.id)));
    const prognos = Object.fromEntries(nivaer.map((n) => [n, [
      ...v3[n],
      ...kand.filter((q) => !nyaId.has(q.id) && (q.fran_version === 3 || (q.band === 'plus' && q.mekanism && /^P[45]$/.test(q.mekanism)))).filter((q) => (q.band === 'plus' ? 'expert' : nivaFor(q)) === n),
    ]]));
    tabell('version 3, prognos med kandidaterna (P1 till P3 ur parti 03, P4 och P5 ur parti 01)', prognos);
    for (const n of nivaer) kvotFel(prognos[n], n).forEach((x) => console.log(`  · prognos: ${x}`));
  }
  console.log('');
}

if (fel.length === 0) {
  console.log('✓ Facit stämmer, inga tvetydiga frågor, alla latinska kvadrater håller, family och misstag i takt med generatorn, spärrarna håller för version 3.');
  process.exit(0);
}
console.log(`✗ ${fel.length} fel:\n`);
fel.forEach((x) => console.log('  - ' + x));
process.exit(1);
