// src/lib/traning/flaggor.ts
// Flaggorna testansvarig sätter när frågebanken växer (spec-rummen avsnitt
// 6 våg 3c och 10.4). Ändra ett värde, inget annat.

/**
 * Sätts när varje nivå har minst 80 frågor som inte är pensionerade
 * (spec-rummen 14.6). Efter våg 3c och pensioneringarna i avsnitt 15:
 * grund 89, avancerad 80, expert 83, alltså sann.
 *
 * true: en fråga kommer tillbaka först efter 30 dagar.
 * false: efter 14 dagar. I båda fallen aldrig två dagar i rad och aldrig i
 * samma pass; tar banken slut ändå släpper urvalet på kravet stegvis (se
 * passgenerator.ts, FRISKHET).
 */
export const BANK_RACKER_30_DAGAR = true;
/** Minsta antal valbara frågor per nivå för BANK_RACKER_30_DAGAR. */
export const BANK_RACKER_MINST_PER_NIVA = 80;

/**
 * Sätts när frågestatistiken bär nivåer över 7,5. Till dess har nivån tak
 * 7,5, eftersom priorn ur difficulty inte skiljer de svåraste frågorna åt.
 */
export const BANK_KALIBRERAD_OVER_7_5 = false;

/** Dagar innan en fråga får komma tillbaka, med den lilla banken. */
export const ATERANVAND_EFTER_DAGAR = BANK_RACKER_30_DAGAR ? 30 : 14;

/** Antal svar per fråga innan den uppmätta andelen rätt ersätter priorn. */
export const MIN_SVAR_FOR_KALIBRERING = 30;

/** Nivåns tak tills banken är kalibrerad över 7,5. */
export function nivaTak(): number {
  return BANK_KALIBRERAD_OVER_7_5 ? 10 : 7.5;
}
