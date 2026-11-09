#!/usr/bin/env node
// scripts/laga-deduktiv-v2.mjs
// =============================================================================
// Deduktivens bankversion 2 (testplanen steg 1, 2026-11-09). Uppgifter i
// banken som fälls av DD7 (ett alternativ medför ett annat) eller DD8 (facit
// kräver inte alla villkor) pensioneras från version 2 och ersätts av en
// lagad kopia med nytt id:
//
//   - Samma pussel: tema, namn, villkor, antagande och fråga rörs inte.
//   - Facit behålls om det klarar DD8, annars väljs ett annat påstående som
//     måste gälla (eller är omöjligt) med generatorns regler.
//   - Distraktorerna väljs om bland generatorns kandidater: alla fyra är nära
//     missar, de täcker alla villkor (DD3) och inget av de fem alternativen
//     medför ett annat (DD7). De ursprungliga distraktorerna behålls i första
//     hand och står kvar på sina platser.
//   - Etiketter, misstag och lösningsgång byggs om av losningslager().
//
// Från granskning 03 klarar ersättarna också DD9 (inget udda facit).
//
// Gamla sessioner läser version 1 och ser uppgiften som den var. Kör:
//   node scripts/laga-deduktiv-v2.mjs            (torrt, skriver bara rapporten)
//   node scripts/laga-deduktiv-v2.mjs --skriv    (skriver bankfilerna)
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { allaTilldelningar, losningar, uppfyllt, villkorNyckel } from './lib/deduktiv/losare.mjs';
import { TEMAN, villkorText } from './lib/deduktiv/tema.mjs';
import { ETIKETT, PASTAENDE_TYPER, allaVillkor, foljerAv, motsagsAv, losningslager } from './lib/deduktiv/generera.mjs';
import { dd7, dd8, dd9, naraMissar, sparrFelV2 } from './lib/deduktiv/sparrar.mjs';

const VERSION = 2;
const skriv = process.argv.includes('--skriv');
const FILER = { grund: 'src/lib/deduktivV1/bankGrund.json', avancerad: 'src/lib/deduktivV1/bankAvancerad.json', expert: 'src/lib/deduktivV1/bankExpert.json' };

function laga(q, nyttId) {
  const f = q.formell;
  const n = f.namn.length;
  const T = TEMAN[f.tema];
  const g = T.grupper ?? null;
  const [losning] = losningar(n, f.antagande ? [...f.villkor, f.antagande] : f.villkor, g);
  const pastaenden = allaVillkor(f.tema, n, PASTAENDE_TYPER.filter((t) => T.tillatna.includes(t)));
  const villkor = f.villkor;
  const antagande = f.antagande ?? null;
  let facitKand;
  let distr;
  if (f.fraga.form === 'maste') {
    facitKand = pastaenden.filter((s) => uppfyllt(s, losning, g) && !villkor.some((c) => villkorNyckel(c) === villkorNyckel(s) || foljerAv(n, c, s, g)));
    distr = pastaenden.filter((s) => !uppfyllt(s, losning, g) && !villkor.some((c) => motsagsAv(n, c, s, g)));
  } else {
    const p2 = pastaenden.filter((s) => !(s.typ === 'plats' && s.a === antagande.a) && !villkor.some((c) => villkorNyckel(c) === villkorNyckel(s)));
    const bas = losningar(n, villkor, g);
    facitKand = p2.filter((s) => !uppfyllt(s, losning, g) && bas.some((p) => uppfyllt(s, p, g)) && !villkor.some((c) => motsagsAv(n, c, s, g)) && !motsagsAv(n, antagande, s, g));
    distr = p2.filter((s) => uppfyllt(s, losning, g) && !villkor.some((c) => foljerAv(n, c, s, g)) && !foljerAv(n, antagande, s, g));
  }
  const orig = f.alternativ;
  const origFacit = orig[q.correctAnswer];
  const arOrig = (s) => orig.some((x) => villkorNyckel(x) === villkorNyckel(s));
  facitKand.sort((a, b) => Number(villkorNyckel(b) === villkorNyckel(origFacit)) - Number(villkorNyckel(a) === villkorNyckel(origFacit)));
  const tillatna = allaTilldelningar(n).filter((p) => !antagande || uppfyllt(antagande, p, g));
  const medfor = (x, y) => {
    const dar = tillatna.filter((p) => uppfyllt(x, p, g));
    return dar.length > 0 && dar.every((p) => uppfyllt(y, p, g));
  };
  for (const facit of facitKand) {
    // DD8 för D2: pröva facit med originalets distraktorer som stomme.
    if (q.typ === 'D2' && dd8({ typ: 'D2', villkor: q.villkor, formell: { ...f, alternativ: [facit] }, correctAnswer: 0 }).length) continue;
    const nm = naraMissar({ typ: q.typ, formell: { ...f, alternativ: [facit, ...distr] }, correctAnswer: 0 });
    const kand = distr
      .map((d, i) => ({ d, missar: nm[i + 1] }))
      .filter((x) => x.missar.length > 0 && !medfor(x.d, facit) && !medfor(facit, x.d))
      .sort((a, b) => Number(arOrig(b.d)) - Number(arOrig(a.d)));
    const valda = [];
    let svar = null;
    const rek = (i) => {
      if (svar) return;
      if (valda.length === 4) {
        const tackta = new Set(valda.flatMap((x) => x.missar));
        // DD9 (granskning 03): inget drag förenar de fyra och saknas i facit.
        const ds = valda.map((x) => x.d);
        const el = (x) => (x.b != null ? [x.a, x.b] : [x.a]);
        const uddaForm = ds.every((d) => d.typ === ds[0].typ) && facit.typ !== ds[0].typ;
        const uddaElement = f.namn.some((_, e) => ds.every((d) => el(d).includes(e)) && !el(facit).includes(e));
        const ensamt = ds.every((d) => d.typ !== facit.typ) && el(facit).some((e) => ds.every((d) => !el(d).includes(e)));
        if (villkor.every((_, k) => tackta.has(k)) && !uddaForm && !uddaElement && !ensamt) svar = valda.slice();
        return;
      }
      for (let j = i; j < kand.length && !svar; j++) {
        const x = kand[j];
        if (valda.some((y) => medfor(x.d, y.d) || medfor(y.d, x.d))) continue;
        valda.push(x);
        rek(j + 1);
        valda.pop();
      }
    };
    rek(0);
    if (!svar) continue;
    // Platserna: facit på sin plats, kvarvarande originaldistraktorer på sina, nya i de lediga.
    const lista = new Array(5).fill(null);
    lista[q.correctAnswer] = facit;
    const nya = [];
    for (const x of svar) {
      const i = orig.findIndex((o, k) => k !== q.correctAnswer && villkorNyckel(o) === villkorNyckel(x.d));
      if (i >= 0 && !lista[i]) lista[i] = x.d;
      else nya.push(x.d);
    }
    for (let i = 0; i < 5; i++) if (!lista[i]) lista[i] = nya.shift();
    const formell = { ...f, alternativ: lista };
    const lager = losningslager(formell, q.typ);
    if (!lager) continue;
    const txt = (c) => villkorText(f.tema, f.namn, c);
    const ny = {
      ...q,
      id: nyttId,
      family: lager.family,
      options: lista.map(txt),
      etiketter: lista.map((_, i) =>
        i === q.correctAnswer ? (f.fraga.form === 'maste' ? ETIKETT.maste : q.etiketter[q.correctAnswer]) : f.fraga.form === 'maste' ? ETIKETT.strider : ETIKETT.gaarIhop
      ),
      misstag: lager.misstag,
      losning: lager.losning,
      formell,
      fran_version: VERSION,
      ersatter: q.id,
    };
    delete ny.pensionerad_fran;
    const fel = [...sparrFelV2(ny), ...dd9(ny)];
    if (!fel.length) return { ny, byttFacit: villkorNyckel(facit) !== villkorNyckel(origFacit), behallna: lista.filter((x, i) => i !== q.correctAnswer && arOrig(x)).length };
  }
  return null;
}

const rapport = [];
let avbrott = false;
for (const [niva, fil] of Object.entries(FILER)) {
  const bank = JSON.parse(readFileSync(fil, 'utf8'));
  const kod = { grund: 'g', avancerad: 'a', expert: 'e' }[niva];
  const ersatta = new Set(bank.map((q) => q.ersatter).filter(Boolean));
  const nummer = (typ) => Math.max(0, ...bank.filter((q) => q.id.startsWith(`dd-${kod}-${typ.toLowerCase()}-`)).map((q) => Number(q.id.slice(-2))));
  const tillagg = [];
  for (const q of bank) {
    if (q.pensionerad_fran || q.typ === 'D1' || ersatta.has(q.id)) continue;
    const fel = [...dd7(q), ...dd8(q), ...dd9(q)];
    if (!fel.length) continue;
    const nr = nummer(q.typ) + tillagg.filter((x) => x.typ === q.typ).length + 1;
    const nyttId = `dd-${kod}-${q.typ.toLowerCase()}-${String(nr).padStart(2, '0')}`;
    const r = laga(q, nyttId);
    rapport.push({ id: q.id, fel, ersattAv: r?.ny.id ?? null, byttFacit: r?.byttFacit ?? null, behallna: r?.behallna ?? null });
    if (!r) {
      avbrott = true;
      continue;
    }
    q.pensionerad_fran = VERSION;
    tillagg.push(r.ny);
  }
  if (skriv && tillagg.length) writeFileSync(fil, JSON.stringify([...bank, ...tillagg], null, 1) + '\n');
  console.log(`${niva}: ${tillagg.length} lagade`);
}
for (const r of rapport) console.log(`${r.id} -> ${r.ersattAv ?? 'GICK INTE ATT LAGA'}${r.byttFacit ? ' (nytt facit)' : ''} behåller ${r.behallna ?? '-'} av 4 distraktorer: ${r.fel.join('; ')}`);
writeFileSync('docs/qa/deduktiv/laga-v2.json', JSON.stringify(rapport, null, 1) + '\n');
if (avbrott) {
  console.error('Några uppgifter gick inte att laga; de står kvar opensionerade.');
  process.exit(1);
}
