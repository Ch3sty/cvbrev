// scripts/lib/talserie/sparrar.mjs
// =============================================================================
// Spärrarna TS1 till TS8 (brief-tester-steg2-2026-11-09.md avsnitt 3) plus två
// egna, TS9 och TS10, som stänger ledtrådar i de sorterade alternativen.
// Körs av scripts/validate-talserier.mjs och av vitest
// (src/lib/talserierV1/__tests__/sparrar.test.ts) på de skarpa bankerna.
//
//  TS1  entydig: ingen regel i biblioteket (losare.mjs, inklusive alla polynom
//       av grad högst 2) ger ett annat svar, och generatorns regel finns där
//  TS2  minst fem visade tal, minst sex för varvade serier
//  TS3  alternativen olika, inget tal i något alternativ är ett visat tal
//  TS4  ingen konstant eller nästan konstant rad: minst fyra olika visade tal
//  TS5  varje distraktor har en typ ur listan och en misstagstext
//  TS6  alla tal inom nivåns gräns och högst fyra tecken
//  TS7  två luckor: minst en distraktor har rätt första tal och fel andra
//  TS8  nivå: samma familj och parametrar högst en gång; ett urval om 15 har
//       högst fem av samma familj (kontrolleras i select-testet)
//  TS9  två luckor: facit är inte ensamt om att dela flest tal med de andra
//       alternativen (annars går facit att gissa utan att räkna)
//  TS10 nivå: facit står på samma plats i den sorterade listan i högst
//       35 procent av uppgifterna
// =============================================================================

import { entydighet } from './losare.mjs';
import { NIVAER, DISTRAKTORTYPER, ts9Ok } from './generera.mjs';

const tecken = (x) => String(x).length;

export function sparrFel(q) {
  const fel = [];
  const N = NIVAER[q.niva];
  const facit = q.options[q.correctAnswer];
  const id = q.id;

  const e = entydighet(q.visade, facit);
  if (e.traffar.length === 0) fel.push(`${id}: TS1 ingen regel i biblioteket ger facit`);
  for (const a of e.andra) fel.push(`${id}: TS1 regeln ${a.modell} passar också och ger ${a.varden.join(' och ')}`);

  const minVisade = q.family === 'varvad' ? 6 : 5;
  if (q.visade.length < minVisade) fel.push(`${id}: TS2 ${q.visade.length} visade tal, minst ${minVisade}`);
  if (q.options.some((o) => o.length !== q.luckor)) fel.push(`${id}: TS2 alternativ med fel antal tal`);

  const nycklar = q.options.map((o) => o.join(','));
  if (new Set(nycklar).size !== nycklar.length) fel.push(`${id}: TS3 två alternativ är lika`);
  const visade = new Set(q.visade);
  q.options.forEach((o, i) => {
    if (o.some((x) => visade.has(x))) fel.push(`${id}: TS3 alternativ ${i + 1} innehåller ett visat tal`);
  });

  if (new Set(q.visade).size < 4) fel.push(`${id}: TS4 för få olika tal i raden`);

  q.options.forEach((o, i) => {
    if (i === q.correctAnswer) {
      if (q.typer[i].length !== 0 || q.misstag[i] !== '') fel.push(`${id}: TS5 facit har typ eller misstagstext`);
      return;
    }
    const t = q.typer[i];
    const giltig = t.length === 1 ? DISTRAKTORTYPER.includes(t[0]) : t.length === 2 && t[0] === 'ratt' && DISTRAKTORTYPER.includes(t[1]);
    if (!giltig) fel.push(`${id}: TS5 alternativ ${i + 1} saknar giltig typ`);
    if (!q.misstag[i]) fel.push(`${id}: TS5 alternativ ${i + 1} saknar misstagstext`);
  });

  const alla = [...q.visade, ...q.options.flat()];
  for (const x of alla) {
    if (!Number.isInteger(x) || x < N.min || x > N.max || tecken(x) > 4) fel.push(`${id}: TS6 talet ${x} utanför ${N.min} till ${N.max} eller över fyra tecken`);
  }

  if (q.luckor === 2) {
    const ok = q.options.some((o, i) => i !== q.correctAnswer && o[0] === facit[0] && o[1] !== facit[1]);
    if (!ok) fel.push(`${id}: TS7 ingen distraktor med rätt första tal och fel andra`);
    if (!ts9Ok(q.options, q.correctAnswer)) fel.push(`${id}: TS9 facit delar flest tal med de andra alternativen`);
  }

  // alternativen ska stå sorterade (briefen avsnitt 3, skissens beslut 6)
  const sorterad = q.options.every((o, i) => i === 0 || q.options[i - 1][0] < o[0] || (q.options[i - 1][0] === o[0] && q.options[i - 1][1] < o[1]));
  if (!sorterad) fel.push(`${id}: alternativen står inte sorterade stigande`);
  if (q.luckor !== N.luckor) fel.push(`${id}: ${q.luckor} luckor, nivån har ${N.luckor}`);
  return fel;
}

/** Nivåspärrar: TS8 (dubbletter av familj och parametrar) och TS10 (facits plats). */
export function nivaFel(bank) {
  const fel = [];
  const sedda = new Map();
  for (const q of bank) {
    const n = `${q.family}:${JSON.stringify(q.params)}`;
    if (sedda.has(n)) fel.push(`${q.id}: TS8 samma familj och parametrar som ${sedda.get(n)}`);
    else sedda.set(n, q.id);
    const rad = q.visade.join(',');
    const dubbel = bank.find((x) => x !== q && x.visade.join(',') === rad);
    if (dubbel && q.id < dubbel.id) fel.push(`${q.id}: TS8 samma rad som ${dubbel.id}`);
  }
  const platser = new Map();
  for (const q of bank) platser.set(q.correctAnswer, (platser.get(q.correctAnswer) ?? 0) + 1);
  for (const [p, n] of platser) {
    if (n > 0.35 * bank.length) fel.push(`TS10 facit står på plats ${p + 1} i ${n} av ${bank.length} uppgifter (högst 35 procent)`);
  }
  return fel;
}
