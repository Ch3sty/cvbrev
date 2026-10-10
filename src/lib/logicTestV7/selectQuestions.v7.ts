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
export const ALLA_GRUND = [...GRUND_POOL, ...GRUND_3C];
export const ALLA_AVANCERAD = [...AVANCERAD_POOL, ...AVANCERAD_3C];
export const ALLA_EXPERT = [...EXPERT_POOL, ...EXPERT_3C];
/** Hela matrisbanken, alla nivåer, pensionerade inräknade. */
export const ALLA_MATRISFRAGOR = [...ALLA_GRUND, ...ALLA_AVANCERAD, ...ALLA_EXPERT];
export { QUESTIONS_PER_SESSION };

/** En pensionerad fråga väljs aldrig till något nytt. */
export const arValbar = (q: { pensionerad?: boolean }): boolean => q.pensionerad !== true;

/** De valbara frågorna per nivå: ALLA_<nivå> utan pensionerade. */
export const VALBARA_GRUND = ALLA_GRUND.filter(arValbar);
export const VALBARA_AVANCERAD = ALLA_AVANCERAD.filter(arValbar);
export const VALBARA_EXPERT = ALLA_EXPERT.filter(arValbar);

/** Bankversionen nya klassiska sessioner får (meta.bank_version). */
export const BANK_VERSION = 2 as const;
export type BankVersion = 1 | 2;
/** Meta som sätts på nya klassiska sessioner tillsammans med blandningen. */
export const BANK_VERSION_META = { bank_version: BANK_VERSION } as const;

/** Sessionens bankversion ur meta. Saknas fältet: version 1 (de 28). */
export function bankVersion(meta: unknown): BankVersion {
  return !!meta && typeof meta === 'object' && (meta as Record<string, unknown>).bank_version === 2 ? 2 : 1;
}

export type Niva = 'grund' | 'avancerad' | 'expert';

/** Poolen en session drar ur, efter nivå och bankversion. */
export function poolFor(niva: Niva, version: BankVersion = 1): LayeredQuestion[] {
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
