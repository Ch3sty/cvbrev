/**
 * Antalet kognitiva testtyper som syns för användarna (beslut om säljytorna
 * 2026-11-15, copywriterns avsnitt 2). Läst ur testkonfigurationens
 * synlighetsflaggor, inte ur QA-flaggorna, så att publika texter bara räknar
 * typer som faktiskt är öppna. Personlighetstestet räknas inte här; texterna
 * säger "åtta testtyperna och personlighetstestet".
 *
 * Ren fil utan tunga beroenden: läses av registreringens och reklamkortens
 * copy, som också hamnar i klientens JavaScript. Testet antal-testtyper
 * kontrollerar att talet stämmer mot TEST_GROUPS i Alla tester.
 */

import { BANK_BEFORDRAD as FIGURSERIER_OPPNA } from '@/lib/figurserierV1/status'
import { BANK_BEFORDRAD as DEDUKTIV_OPPEN } from '@/lib/deduktivV1/status'
import { VY_KLAR } from '@/lib/tester/steg2Status'

/** Matrislogik, verbalt och numeriskt har alltid funnits. */
const GRUNDTYPER = 3

export const ANTAL_TESTTYPER: number =
  GRUNDTYPER + [FIGURSERIER_OPPNA, DEDUKTIV_OPPEN, VY_KLAR.talserie, VY_KLAR.spatial, VY_KLAR.ordforrad].filter(Boolean).length
