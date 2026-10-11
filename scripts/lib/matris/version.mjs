// scripts/lib/matris/version.mjs
// =============================================================================
// Bankversionerna för matrisfrågorna (plan-facit-genvag 2.5 och A2), samma
// regel som valbarI i src/lib/logicTestV7/selectQuestions.v7.ts:
//
//   valbar i version v  =  inte pensionerad: true,
//                          (fran_version ?? 1) <= v,
//                          (pensionerad_fran ?? oändligt) > v
//
// fran_version saknas på de 84 frysta och på 3c (räknas som 1; poolFor för
// version 1 läser ändå bara de 28 råa per nivå). Nya frågor får
// fran_version: 3. pensionerad_fran: 3 betyder borta från version 3 men kvar
// i version 2, så att version 2-urvalet är oförändrat.
//
// Pensionslistan för version 3: varje valbar fråga i version 2 med facit
// lika rutan uppe till vänster (spärren S1, per dimension), plus nio
// uttryckligen uppräknade (tomma alternativ och två rörelser i takt).
// =============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { facitRutor } from './sparrar.mjs';

export const BANK_VERSION_V3 = 3;

export const valbarI = (q, v) => q.pensionerad !== true && (q.fran_version ?? 1) <= v && (q.pensionerad_fran ?? Infinity) > v;

const D = 'src/lib/logicTestV7';
/** Bankfilerna per nivå, i den ordning ALLA_<nivå> läser dem. */
export const BANKFILER = {
  grund: [`${D}/questionBankGrund.v7.json`, `${D}/questionBankGrund3c.v7.json`, `${D}/questionBankGrundV3.v7.json`],
  avancerad: [`${D}/questionBank.v7.json`, `${D}/questionBankAvancerad3c.v7.json`, `${D}/questionBankAvanceradV3.v7.json`],
  expert: [`${D}/questionBankExpert.v7.json`, `${D}/questionBankExpert3c.v7.json`, `${D}/questionBankExpertV3.v7.json`, `${D}/questionBankExpertPlus.v7.json`],
};
export const ALLA_BANKFILER = Object.values(BANKFILER).flat();

/** Uttryckligen pensionerade i version 3 utöver facit på ruta 0 (planen 2.5 och 5.2). */
export const UTTRYCKLIGA_V3 = {
  'v7g-q26-orbital-fill-latin': 'tomt alternativ',
  'v7g-3c-lform-07': 'tomt alternativ',
  'v7g-3c-over-01': 'tomt alternativ',
  'v7g-3c-over-04': 'tomt alternativ',
  'v7a-3c-lform-03': 'tomt alternativ',
  'v7a-3c-over-04': 'tomt alternativ',
  'v7a-3c-tva-05': 'balanslinje med sidbyte i läsordning, facit på mittrutan',
  'v7e-3c-over-07': 'tomt alternativ på expert',
  'v7e-b2': 'två rörelser i takt (G7)',
};

export const las = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : []);

/** Nivå -> frågor (alla filer, pensionerade inräknade). */
export function lasBanker() {
  const ut = {};
  for (const [niva, filer] of Object.entries(BANKFILER)) ut[niva] = filer.flatMap((f) => las(f).map((q) => ({ ...q, _fil: f })));
  return ut;
}

/** Poolen för en nivå och version, som poolFor i selectQuestions.v7.ts (version 2 och 3). */
export function pool(banker, niva, v) {
  return banker[niva].filter((q) => valbarI(q, v));
}

/**
 * Pensionslistan för version 3, räknad ur bankerna: valbara i version 2 med
 * facit lika ruta 0, och de uttryckligen uppräknade. Frågor som redan bär
 * pensionerad_fran räknas med (listan ska vara stabil efter att fältet satts).
 */
export function pensionsListaV3(banker = lasBanker()) {
  const ut = [];
  for (const [niva, fragor] of Object.entries(banker)) {
    for (const q of fragor) {
      if (q.pensionerad === true || (q.fran_version ?? 1) > 2) continue;
      const ruta0 = facitRutor(q).includes(0);
      const skal = ruta0 ? 'facit lika rutan uppe till vänster' : UTTRYCKLIGA_V3[q.id];
      if (skal) ut.push({ id: q.id, niva, fil: q._fil, family: q.family, skal });
    }
  }
  return ut;
}
