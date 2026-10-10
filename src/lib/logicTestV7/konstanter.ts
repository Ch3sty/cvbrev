// src/lib/logicTestV7/konstanter.ts
// Antal frågor per session och prov. Ligger utan frågebank så att klientkod
// kan läsa dem utan att facit följer med i paketet.

export const QUESTIONS_PER_SESSION = 15;

/** Antal frågor per nivå i provet (6 × 3 nivåer = 18). */
export const PROV_PER_LEVEL = 6;
export const PROV_TOTAL_QUESTIONS = PROV_PER_LEVEL * 3;
