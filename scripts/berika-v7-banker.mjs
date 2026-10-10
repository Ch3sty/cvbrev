// scripts/berika-v7-banker.mjs
// =============================================================================
// Sätter `family` och `misstag` på de 84 befintliga V7-frågorna (våg 3c).
//
// Kör: node scripts/berika-v7-banker.mjs [--kontroll]
//
// - Ordning, id, rutnät, alternativ, facit, regel, titel och difficulty rörs
//   inte. Skriptet läser banken, räknar fram fälten och skriver in dem som
//   rader i filen, så att den handformaterade grundbanken behåller sin form.
//   Efteråt jämförs filen mot originalet utan de nya fälten; skiljer något
//   annat avbryts körningen utan att skriva.
// - family: ur tolkningen av de åtta synliga rutorna (scripts/lib/matris).
// - misstag: en mening per fel alternativ, tom sträng för facit, på
//   originalindex. Går en distraktor inte att förklara maskinellt blir
//   posten tom och frågan får `misstagGranskas: [index]` (manuell granskning
//   hos testansvarig; Regelpanel visar då bara regeln).
// - --kontroll: skriv ingenting, avsluta med 1 om filerna inte är aktuella.
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { tolka, familjFor } from './lib/matris/tolka.mjs';
import { misstagFor } from './lib/matris/misstag.mjs';
import { stable } from './lib/matris/celler.mjs';

const BANKER = [
  'src/lib/logicTestV7/questionBankGrund.v7.json',
  'src/lib/logicTestV7/questionBank.v7.json',
  'src/lib/logicTestV7/questionBankExpert.v7.json',
];
const NYA = ['family', 'misstag', 'misstagGranskas'];
const kontroll = process.argv.includes('--kontroll');
const utan = (q) => Object.fromEntries(Object.entries(q).filter(([k]) => !NYA.includes(k)));

let avvikelser = 0;
const granskas = [];

for (const fil of BANKER) {
  const original = readFileSync(fil, 'utf8').replace(/\r\n/g, '\n');
  const bank = JSON.parse(original);
  const falt = bank.map((q) => {
    const t = tolka(q);
    const family = familjFor(q, t);
    if (!family) throw new Error(`${q.id}: ingen familj, tolkningen säger ${t.saknar ?? t.orsak}`);
    const m = misstagFor(q, t);
    const tomma = m.map((x, i) => (i !== q.correctAnswer && !x ? i : -1)).filter((i) => i >= 0);
    if (tomma.length) granskas.push({ id: q.id, index: tomma });
    return { family, misstag: m.map((x) => x ?? ''), misstagGranskas: tomma };
  });

  // Skriv in fälten rad för rad i varje toppnivåobjekt.
  const rader = original.split('\n');
  const ut = [];
  let qi = -1;
  for (let i = 0; i < rader.length; i++) {
    const rad = rader[i];
    if (rad === '  {') { qi++; ut.push(rad); continue; }
    if (/^ {4}"(family|misstagGranskas)":/.test(rad)) continue;
    if (/^ {4}"misstag": \[/.test(rad)) { // hoppa över hela listan
      if (!rad.trimEnd().endsWith('],') && !rad.trimEnd().endsWith(']')) while (i + 1 < rader.length && !/^ {4}\],?$/.test(rader[++i]));
      continue;
    }
    if (/^ {4}"difficulty": \d+,$/.test(rad)) {
      ut.push(rad, `    "family": ${JSON.stringify(falt[qi].family)},`);
      continue;
    }
    if (/^ {4}"correctAnswer": \d+,?$/.test(rad)) {
      const f = falt[qi];
      ut.push(rad.replace(/,$/, '') + ',');
      const lista = JSON.stringify(f.misstag, null, 2).split('\n').map((x, j) => (j === 0 ? x : '    ' + x));
      lista[0] = `    "misstag": ${lista[0]}`;
      if (f.misstagGranskas.length) {
        lista[lista.length - 1] += ',';
        ut.push(...lista, `    "misstagGranskas": ${JSON.stringify(f.misstagGranskas)}`);
      } else ut.push(...lista);
      continue;
    }
    ut.push(rad);
  }
  const nyText = ut.join('\n');
  const ny = JSON.parse(nyText);

  // Inget annat än de nya fälten får ha ändrats.
  if (ny.length !== bank.length) throw new Error(`${fil}: antalet frågor ändrades`);
  ny.forEach((q, i) => {
    if (stable(utan(q)) !== stable(utan(bank[i]))) throw new Error(`${fil}: ${q.id} ändrades utöver family/misstag`);
    if (q.family !== falt[i].family || stable(q.misstag) !== stable(falt[i].misstag)) throw new Error(`${fil}: ${q.id} fick fel fält`);
    if (Object.keys(q).filter((k) => !NYA.includes(k)).join() !== Object.keys(bank[i]).filter((k) => !NYA.includes(k)).join()) throw new Error(`${fil}: ${q.id} bytte nyckelordning`);
  });

  if (nyText !== original) {
    avvikelser++;
    if (!kontroll) writeFileSync(fil, nyText);
    console.log(`${kontroll ? '✗ inte aktuell' : '✓ skrev'} ${fil}`);
  } else console.log(`✓ aktuell ${fil}`);
}

console.log(`\nManuell granskning (${granskas.length} frågor, ${granskas.reduce((s, g) => s + g.index.length, 0)} alternativ):`);
granskas.forEach((g) => console.log(`  ${g.id}: alternativ ${g.index.join(', ')} (originalindex)`));
if (kontroll && avvikelser) process.exit(1);
