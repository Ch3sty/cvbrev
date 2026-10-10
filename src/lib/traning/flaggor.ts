// src/lib/traning/flaggor.ts
// Flaggorna testansvarig sätter när frågebanken växer (spec-rummen avsnitt
// 6 våg 3c och 10.4). Ändra ett värde, inget annat.

/**
 * Sätts när banken passerar 250 validerade matrisfrågor, alltså när trettio
 * dagars pass räcker utan att en fråga kommer tillbaka.
 *
 * false (i dag, 84 frågor): en fråga får komma tillbaka efter
 * ATERANVAND_EFTER_DAGAR dagar, aldrig två dagar i rad och aldrig i samma
 * pass. Tar banken slut ändå släpper urvalet på kravet stegvis (se
 * passgenerator.ts, FRISKHET).
 *
 * true: en fråga kommer tillbaka först efter 30 dagar.
 */
export const BANK_RACKER_30_DAGAR = false;

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
