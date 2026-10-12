// src/lib/logicTestV7/selectQuestions.v7.ts
// =============================================================================
// Deterministiskt urval av N frågor ur grundpoolen, seedat på sessionId.
// Samma sessionId → samma frågor (stabilt under hela sessionen och identiskt
// mellan test-sidan, resultat-sidan och svar-API:t). Olika sessionId → olika
// uppsättning, så att "gör om testet" ger nya frågor.
//
// Urvalet returnerar frågorna i bankens form, med facit. Det får bara köras
// på servern: klienten får frågorna via fragor.server.ts, med blandade
// alternativ och utan correctAnswer.
// =============================================================================

import grundBank from './questionBankGrund.v7.json';
import avanceradBank from './questionBank.v7.json';
import expertBank from './questionBankExpert.v7.json';
import grund3c from './questionBankGrund3c.v7.json';
import avancerad3c from './questionBankAvancerad3c.v7.json';
import expert3c from './questionBankExpert3c.v7.json';
import grundV3 from './questionBankGrundV3.v7.json';
import avanceradV3 from './questionBankAvanceradV3.v7.json';
import expertV3 from './questionBankExpertV3.v7.json';
import expertPlus from './questionBankExpertPlus.v7.json';
import type { LayeredQuestion } from './layered.v7';
import { hashString, mulberry32 } from './blanda';
import { QUESTIONS_PER_SESSION } from './konstanter';

export const GRUND_POOL = grundBank as unknown as LayeredQuestion[];
export const AVANCERAD_POOL = avanceradBank as unknown as LayeredQuestion[];
export const EXPERT_POOL = expertBank as unknown as LayeredQuestion[];

// Våg 3c: nya frågor i egna banker. Urvalet för en befintlig session räknas
// om ur sessionId och poolens storlek, så poolen en session drar ur får
// aldrig ändras. Därför bankversionen (spec-rummen avsnitt 15):
// - sessioner utan meta.bank_version (version 1) drar som förut ur de 28
//   frusna frågorna per nivå, pensionerade inräknade;
// - nya klassiska sessioner (grund, avancerad, expert, provet, smakprovet)
//   får meta.bank_version: 2 och drar ur ALLA_<nivå> utan pensionerade.
// Test- och resultatsida läser versionen ur samma meta.
// Passen, mätningen och de riktade passen (våg 3a) drar ur ALLA_* utan
// pensionerade (src/lib/traning/bank.server.ts).
export const GRUND_3C = grund3c as unknown as LayeredQuestion[];
export const AVANCERAD_3C = avancerad3c as unknown as LayeredQuestion[];
export const EXPERT_3C = expert3c as unknown as LayeredQuestion[];
// Bank_version 3 (plan-facit-genvag 2.5 och A2): nya frågor i egna filer,
// sist i ALLA_<nivå>, med fran_version: 3. De 157 frågor som pensioneras i
// version 3 bär pensionerad_fran: 3 i sin fil och är kvar i version 2.
// Plus-bandet ("svår plus", beställningen 1.3) är en egen export som ingår
// i expert från version 3.
export const GRUND_V3 = grundV3 as unknown as LayeredQuestion[];
export const AVANCERAD_V3 = avanceradV3 as unknown as LayeredQuestion[];
export const EXPERT_V3 = expertV3 as unknown as LayeredQuestion[];
export const EXPERT_PLUS = expertPlus as unknown as LayeredQuestion[];
export const ALLA_GRUND = [...GRUND_POOL, ...GRUND_3C, ...GRUND_V3];
export const ALLA_AVANCERAD = [...AVANCERAD_POOL, ...AVANCERAD_3C, ...AVANCERAD_V3];
export const ALLA_EXPERT = [...EXPERT_POOL, ...EXPERT_3C, ...EXPERT_V3, ...EXPERT_PLUS];
/** Hela matrisbanken, alla nivåer, pensionerade inräknade. */
export const ALLA_MATRISFRAGOR = [...ALLA_GRUND, ...ALLA_AVANCERAD, ...ALLA_EXPERT];
export { QUESTIONS_PER_SESSION };

/** En pensionerad fråga väljs aldrig till något nytt. */
export const arValbar = (q: { pensionerad?: boolean }): boolean => q.pensionerad !== true;

/** Bankversionens fält på en fråga (plan-facit-genvag A2). */
export type Versionsfalt = { pensionerad?: boolean; fran_version?: number; pensionerad_fran?: number };

/**
 * Valbar i bankversion v: inte pensionerad, (fran_version ?? 1) <= v och
 * (pensionerad_fran ?? oändligt) > v. Samma regel som
 * scripts/lib/matris/version.mjs.
 */
export const valbarI = (q: Versionsfalt, v: number): boolean =>
  q.pensionerad !== true && (q.fran_version ?? 1) <= v && (q.pensionerad_fran ?? Infinity) > v;

/** De valbara frågorna per nivå i version 2 (oförändrade: 89, 80 och 83). */
export const VALBARA_GRUND = ALLA_GRUND.filter((q) => valbarI(q as Versionsfalt, 2));
export const VALBARA_AVANCERAD = ALLA_AVANCERAD.filter((q) => valbarI(q as Versionsfalt, 2));
export const VALBARA_EXPERT = ALLA_EXPERT.filter((q) => valbarI(q as Versionsfalt, 2));
/** De valbara frågorna per nivå i version 3. */
export const VALBARA_GRUND_V3 = ALLA_GRUND.filter((q) => valbarI(q as Versionsfalt, 3));
export const VALBARA_AVANCERAD_V3 = ALLA_AVANCERAD.filter((q) => valbarI(q as Versionsfalt, 3));
export const VALBARA_EXPERT_V3 = ALLA_EXPERT.filter((q) => valbarI(q as Versionsfalt, 3));

/**
 * Bankversionen nya klassiska sessioner och passen får (meta.bank_version,
 * TRANINGSBANK). Slås till 3 av scripts/befordra-bank-v3.mjs när de
 * granskade frågorna ligger i V3-filerna och kontrollerna är gröna.
 */
export const BANK_VERSION: BankVersion = 3;
export type BankVersion = 1 | 2 | 3;
/**
 * Versionen testmotorn väljer ur (bank 3.1, beställning omgång 2 C1):
 * TRANINGSBANK, dagens pass, riktade pass, Nivåkollen och logikens
 * övningsprov. De sparar urvalet i meta, så versionen behöver inte stå på
 * sessionen. Klassiska test står kvar på BANK_VERSION (3), så deras
 * sessioner och percentilen rörs inte. Frågor med fran_version: 4 är de 15
 * ombyggda ur omgång 2.
 */
export const TRANINGSVERSION = 4;

/** Meta som sätts på nya klassiska sessioner tillsammans med blandningen. */
export const BANK_VERSION_META = { bank_version: BANK_VERSION } as const;

/** Sessionens bankversion ur meta. Saknas fältet: version 1 (de 28). */
export function bankVersion(meta: unknown): BankVersion {
  const v = !!meta && typeof meta === 'object' ? (meta as Record<string, unknown>).bank_version : undefined;
  return v === 3 ? 3 : v === 2 ? 2 : 1;
}

export type Niva = 'grund' | 'avancerad' | 'expert';

/** Poolen en session drar ur, efter nivå och bankversion. */
export function poolFor(niva: Niva, version: BankVersion = 1): LayeredQuestion[] {
  if (version === 3) {
    return niva === 'grund' ? VALBARA_GRUND_V3 : niva === 'avancerad' ? VALBARA_AVANCERAD_V3 : VALBARA_EXPERT_V3;
  }
  if (version === 2) {
    return niva === 'grund' ? VALBARA_GRUND : niva === 'avancerad' ? VALBARA_AVANCERAD : VALBARA_EXPERT;
  }
  return niva === 'grund' ? GRUND_POOL : niva === 'avancerad' ? AVANCERAD_POOL : EXPERT_POOL;
}

// Deterministiskt urval ur en given pool, seedat på sessionId.
function selectFromPool(
  pool: LayeredQuestion[],
  sessionId: string,
  count: number
): LayeredQuestion[] {
  const shuffled = [...pool];
  const rng = mulberry32(hashString(sessionId));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Grund-testet: N frågor ur grundpoolen (version 2: alla valbara grundfrågor).
export function selectQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION,
  version: BankVersion = 1
): LayeredQuestion[] {
  return selectFromPool(poolFor('grund', version), sessionId, count);
}

// Avancerad-testet: N frågor ur avancerad-poolen.
export function selectAvanceradQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION,
  version: BankVersion = 1
): LayeredQuestion[] {
  return selectFromPool(poolFor('avancerad', version), sessionId, count);
}

// Expert-testet: N frågor ur expertpoolen.
export function selectExpertQuestionsForSession(
  sessionId: string,
  count: number = QUESTIONS_PER_SESSION,
  version: BankVersion = 1
): LayeredQuestion[] {
  return selectFromPool(poolFor('expert', version), sessionId, count);
}
