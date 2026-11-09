// scripts/validate-ordforrad.mjs
// =============================================================================
// Kontrollerar ordförrådsbanken mot OF1 till OF8 (brief-tester-steg2-2026-11-09.md
// avsnitt 4) utan nätverk: SO- och SAOL-kontrollerna gjordes när banken
// byggdes (scripts/ordforrad/bygg-bank.mjs) och står i varje uppgifts fält
// `kalla` och `granskning`. Här kontrolleras att fälten finns och att allt
// som går att räkna på banken håller. Körs också av vitest.
//
// Kör: node scripts/validate-ordforrad.mjs
// Exit 1 vid fel.
// =============================================================================

import { readFileSync } from 'node:fs';

export const ORD_BANKER = ['bankGrund', 'bankAvancerad', 'bankExpert'].map((b) => `src/lib/ordforradV1/${b}.json`);
/** Minsta bank före live (briefen): 40 per nivå och typ. */
export const MINST_PER_TYP = 40;

const prefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

export function valideraOrd(filer = ORD_BANKER, { minst = MINST_PER_TYP } = {}) {
  const fel = [];
  const ids = new Set();
  const uppslag = new Map();
  const banker = filer.map((f) => JSON.parse(readFileSync(f, 'utf8')));
  const allaPar = new Set(banker.flat().map((q) => `${q.typ}:${[q.ord, q.options[q.correctAnswer]].sort().join('|')}`));
  for (const [i, bank] of banker.entries()) {
    const fil = filer[i];
    const somAlt = new Map();
    let extrem = 0;
    for (const q of bank) {
      const id = q.id;
      if (ids.has(id)) fel.push(`${id}: id finns två gånger`);
      ids.add(id);
      const facit = q.options[q.correctAnswer];
      if (q.options.length !== 5) fel.push(`${id}: ${q.options.length} alternativ, ska vara fem`);
      if (new Set(q.options).size !== 5) fel.push(`${id}: två alternativ är lika`);

      // OF1: belägg ifyllt, och inget alternativ är facit till samma ord någon annanstans
      // SO eller SAOL, eller (när de saknar uppgiften) två oberoende källor: Wiktionary och synonymer.se
      const tva = /^Wiktionary och synonymer.se/.test(q.kalla?.verifierad_mot ?? '');
      if (!q.kalla?.belagg?.length || (!tva && !/^(SO|SAOL)/.test(q.kalla.verifierad_mot)) || (tva && q.kalla.belagg.length < 2)) fel.push(`${id}: OF1 facit saknar belägg i SO eller SAOL (eller två oberoende källor)`);
      q.options.forEach((o, j) => {
        if (j !== q.correctAnswer && allaPar.has(`${q.typ}:${[q.ord, o].sort().join('|')}`)) fel.push(`${id}: OF1 ${o} är facit till ${q.ord} i en annan uppgift`);
      });
      // OF2 och OF3 och OF6: granskningsfälten från bygget
      if (!q.granskning?.of2_ordklass || q.granskning.of2_ordklass !== q.ordklass) fel.push(`${id}: OF2 ordklassen är inte kontrollerad`);
      if (!q.granskning?.of3_parvis) fel.push(`${id}: OF3 parvis kontroll saknas`);
      if (!q.granskning?.of6_stil) fel.push(`${id}: OF6 stilkontroll saknas`);
      // OF4: längd inom ±4 från facit
      q.options.forEach((o) => {
        if (Math.abs(o.length - facit.length) > 4) fel.push(`${id}: OF4 ${o} skiljer mer än fyra bokstäver från facit`);
      });
      const l = q.options.map((o) => o.length);
      const ensam = (v) => l.filter((x) => x === v).length === 1 && facit.length === v;
      if (ensam(Math.max(...l)) || ensam(Math.min(...l))) extrem++;
      // OF5: inga sammansättningar med uppslagsordet, ingen gemensam stam
      q.options.forEach((o) => {
        if (o.includes(q.ord) || q.ord.includes(o) || prefix(o, q.ord) >= 5) fel.push(`${id}: OF5 ${o} har samma stam som uppslagsordet`);
      });
      for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) if (prefix(q.options[a], q.options[b]) >= 5) fel.push(`${id}: OF5 ${q.options[a]} och ${q.options[b]} har samma stam`);
      // OF7: uppslagsord aldrig två gånger (inte heller i olika typer), alternativ högst två gånger per nivå
      if (uppslag.has(q.ord)) fel.push(`${id}: OF7 ${q.ord} är redan uppslagsord i ${uppslag.get(q.ord)}`);
      uppslag.set(q.ord, id);
      q.options.forEach((o) => somAlt.set(o, (somAlt.get(o) ?? 0) + 1));
      // OF8: motsatsen som distraktor bara från avancerad, alltid med "det är motsatsen"
      q.typer.forEach((t, j) => {
        if (t === 'antonym') {
          if (q.niva === 'grund') fel.push(`${id}: OF8 motsatsen som distraktor på grund`);
          if (!/^Det är motsatsen/.test(q.misstag[j])) fel.push(`${id}: OF8 motsatsdistraktorn saknar "det är motsatsen"`);
        }
      });
      // texterna
      if ([...q.misstag, q.exempel, q.facit_betyder].some((t) => /[–—]/.test(t))) fel.push(`${id}: tankstreck i texten`);
      if (q.misstag.filter(Boolean).length !== 4 || q.misstag[q.correctAnswer]) fel.push(`${id}: misstagstexterna stämmer inte`);
      // radbredd: alternativ upp till 16 bokstäver ryms på en rad (17 px på 328 px)
      q.options.forEach((o) => {
        if (o.length > 16) fel.push(`${id}: ${o} har fler än 16 bokstäver`);
      });
    }
    for (const [o, n] of somAlt) if (n > 2) fel.push(`${fil}: OF7 ${o} är alternativ i ${n} uppgifter (högst två)`);
    if (extrem > 0.25 * bank.length) fel.push(`${fil}: OF4 facit är ensamt längst eller kortast i ${extrem} av ${bank.length}`);
    for (const t of ['synonym', 'antonym']) {
      const n = bank.filter((q) => q.typ === t).length;
      if (n < minst) fel.push(`${fil}: ${n} uppgifter av typen ${t}, minst ${minst} före live`);
    }
  }
  return fel;
}

if (process.argv[1]?.endsWith('validate-ordforrad.mjs')) {
  const fel = valideraOrd(ORD_BANKER, { minst: process.argv.includes('--utan-antal') ? 0 : MINST_PER_TYP });
  for (const f of fel) console.log(f);
  console.log(fel.length ? `${fel.length} fel` : 'Ordförrådet klarar OF1 till OF8.');
  process.exit(fel.length ? 1 : 0);
}
