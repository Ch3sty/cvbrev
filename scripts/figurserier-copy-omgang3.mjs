#!/usr/bin/env node
// scripts/figurserier-copy-omgang3.mjs
// =============================================================================
// Copywriterns putsning av figurseriernas texter (copy-omgang3.md avsnitt 6),
// körd ut i bankerna och kandidatfilerna med sök och ersätt. Bara text: inga
// figurer, alternativ eller facit ändras. Mallarna i
// scripts/lib/serie/misstag-serie.mjs ger samma texter för nya frågor.
//
//   6.1 F7 antal: sista meningen i regeln byts per id
//   6.2 F7 antal: misstagen per id och index
//   6.3 M1 till M8 i alla misstag
//
// Kör: node scripts/figurserier-copy-omgang3.mjs   (idempotent)
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { utanUpprepadEnhet } from './lib/serie/misstag-serie.mjs';

const FILER = [
  'src/lib/figurserierV1/bankGrund.json',
  'src/lib/figurserierV1/bankAvancerad.json',
  'src/lib/figurserierV1/bankExpert.json',
  'src/lib/figurserierV1/kandidater/grund.json',
  'src/lib/figurserierV1/kandidater/avancerad.json',
  'src/lib/figurserierV1/kandidater/expert.json',
];

const PLURAL = new Set(['Strecken', 'De svarta sektorerna', 'De svarta rutorna', 'Prickarna']);
const VRID = new Set(['Strecken', 'De svarta sektorerna', 'Pilen', 'Pilen i mitten']);
const ETT = new Set(['streck', 'hörn']);

export function putsa(m) {
  if (!m) return m;
  let s = m;
  s = s.replaceAll('Följer serien i den första, tredje och femte figuren, men luckan hör till den andra serien.', 'Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde.');
  s = s.replace(/([A-ZÅÄÖ][^.]*?) står som i den fjärde figuren, men den andra serien tar ett steg till\./g, '$1 står som i den fjärde figuren. Den andra serien tar ett steg till innan luckan.');
  s = s.replace(/([A-ZÅÄÖ][^.]*?) står i fel vridning\./g, (_, S) => `${S} är ${PLURAL.has(S) ? 'vridna' : 'vriden'} till fel läge.`);
  s = s.replace(/Antalet ([a-zåäö ]+?) har inte (minskat|ökat) sista steget\./g, (_, e, v) => `Antalet ${e} har inte ${v}. Luckan ska ha ${ETT.has(e) ? 'ett' : 'en'} ${v === 'ökat' ? 'mer' : 'färre'} än den femte figuren.`);
  s = s.replace(/ för lite\./g, ' för få.').replace(/ för mycket\./g, ' för många.');
  s = s.replace(/([A-ZÅÄÖ][^.]*?) står på fel plats\. I raden står [^.]+? still\./g, (_, S) => {
    const p = PLURAL.has(S);
    return VRID.has(S) ? `${S} är ${p ? 'vridna' : 'vriden'}, men i raden står ${p ? 'de' : 'den'} still.` : `${S} har flyttat sig, men i raden står ${p ? 'de' : 'den'} still.`;
  });
  // "En sektor" räknas med en (6.2): en, inte ett, för sektorer, rutor och prickar.
  s = s.replace(/Antalet (svarta sektorer|svarta rutor|prickar) ska vara ([a-zåäö]+), inte ([a-zåäö]+)\./g, (_, e, a, b) => `Antalet ${e} ska vara ${a === 'ett' ? 'en' : a}, inte ${b === 'ett' ? 'en' : b}.`);
  return utanUpprepadEnhet(s.split(/(?<=\.) /)).join(' ');
}

// 6.1: regeln, sista meningen per id.
const REGEL = {
  'fs-e-antal-04': ['En sektor till blir svart medurs i varje steg.', 'Antalet svarta sektorer ökar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
  'fs-e-antal-05': ['Ett streck till läggs till medurs i varje steg.', 'Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
  'fs-e-antal-06': ['Den sista svarta sektorn medurs blir vit i varje steg.', 'Antalet svarta sektorer minskar med en i varje figur, oavsett serie. De sitter ihop medurs från den första svarta.'],
  'fs-e-antal-07': ['Ett streck till läggs till medurs i varje steg.', 'Antalet streck ökar med ett i varje figur, oavsett serie. Strecken sitter ihop medurs från det första.'],
};
// 6.2: misstagen per id och index, ordagrant.
const MISSTAG = {
  'fs-e-antal-04': {
    3: 'De svarta sektorerna står kvar som i den femte figuren. Antalet ska vara sju, inte två.',
    4: 'Antalet svarta sektorer ska vara sju, inte två.',
    5: 'De svarta sektorerna har vridits ett steg för långt. Antalet ska vara sju, inte två.',
  },
  'fs-e-antal-05': {
    0: 'Strecken är vridna till fel läge. Antalet ska vara sju, inte fem.',
    1: 'Strecken är vridna till fel läge.',
    4: 'Strecken är vridna till fel läge. Antalet ska vara sju, inte fem.',
    5: 'Strecken är vridna till fel läge. Antalet ska vara sju, inte tre.',
  },
  'fs-e-antal-06': {
    0: 'De svarta sektorerna är vridna till fel läge. Antalet har inte minskat, luckan ska ha en färre än den femte figuren.',
    2: 'De svarta sektorerna är vridna till fel läge. Antalet ska vara en, inte tre.',
    3: 'De svarta sektorerna är vridna till fel läge.',
    4: 'Antalet svarta sektorer har inte minskat. Luckan ska ha en färre än den femte figuren.',
    5: 'De svarta sektorerna är vridna till fel läge. Antalet ska vara en, inte tre.',
  },
  'fs-e-antal-07': {
    0: 'Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde.',
    2: 'Strecken är vridna till fel läge. Antalet ska vara sju, inte tre.',
    4: 'Fortsätter serien i den första, tredje och femte figuren. Luckan hör till den andra serien, den i andra och fjärde. Antalet ska vara sju, inte fem.',
    5: 'Strecken är vridna till fel läge. Antalet ska vara sju, inte fem.',
  },
};

if (process.argv[1] && process.argv[1].endsWith('figurserier-copy-omgang3.mjs')) {
  for (const f of FILER) {
    if (!existsSync(f)) continue;
    const bank = JSON.parse(readFileSync(f, 'utf8'));
    let n = 0;
    for (const q of bank) {
      const fore = JSON.stringify([q.rule, q.misstag]);
      q.misstag = q.misstag.map(putsa);
      const r = REGEL[q.id];
      if (r && q.rule.endsWith(r[0])) q.rule = q.rule.slice(0, -r[0].length) + r[1];
      for (const [i, t] of Object.entries(MISSTAG[q.id] ?? {})) {
        // Index i id:ts originalordning; facit har ingen text.
        if (Number(i) !== q.correctAnswer) q.misstag[Number(i)] = t;
      }
      if (JSON.stringify([q.rule, q.misstag]) !== fore) n++;
    }
    writeFileSync(f, JSON.stringify(bank, null, 1) + '\n');
    console.log(`${f}: ${n} frågor med ny text`);
  }
}
