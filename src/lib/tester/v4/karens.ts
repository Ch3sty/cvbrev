// src/lib/tester/v4/karens.ts
// Kortare karens med sann mätning (ägarens besked omgång 3, planen A6). Ren.
//
// Frågorna kommer tillbaka oftare: karensen räknas i visningar, inte dagar,
// som hälften av banken i nivåfönstret men aldrig under golvet. Mätningen
// hålls sann genom vad som räknas mot nivån: en osedd fråga räknas; en
// upprepning räknas bara om den förra gången var fel och minst 14 dagar sedan.
//
// Kopplas in bakom KARENS_V4 (flaggor.ts), som står av tills bankräkningen
// och integrationstestet är gröna. Med flaggan av gäller dagkarensen som förut.

import { KARENS_V4 } from '@/lib/traning/flaggor';

/** Golvet innan bankräkningen är gjord: minst 20 andra visningar emellan. */
export const KARENS_GOLV_START = 20;
/** En upprepning räknas mot nivån först efter så här många dagar, och bara om den förra var fel. */
export const UPPREPAD_RAKNAS_EFTER_DAGAR = 14;

/** Antal visningar innan en fråga får komma tillbaka. */
export function karensVisningar(bankIFonstret: number, golv: number = KARENS_GOLV_START): number {
  const halva = Math.floor(Math.max(0, bankIFonstret) / 2);
  return Math.max(golv, halva);
}

/** Får frågan visas igen, givet hur många visningar som gjorts sedan den sist visades? */
export function friIgen(visningarSedan: number | null, bankIFonstret: number, golv?: number): boolean {
  return visningarSedan == null || visningarSedan >= karensVisningar(bankIFonstret, golv);
}

/** Räknas svaret mot nivån? */
export function raknasMotNivan(args: { sedd: boolean; tidigareFel?: boolean; dagarSedan?: number | null }): boolean {
  if (!args.sedd) return true;
  return !!args.tidigareFel && args.dagarSedan != null && args.dagarSedan >= UPPREPAD_RAKNAS_EFTER_DAGAR;
}

/** Karensen i dagar med KARENS_V4: en vecka i stället för 30 dagar. */
export const KARENS_V4_DAGAR = 7;

/**
 * Dagkarensen som gäller i urvalet: oförändrad med flaggan av, en vecka med
 * flaggan på. Mätningen räknar fortfarande bara uppgifter som inte setts
 * inom 30 dagar (pass-urval.ts settInomFonstret, motor.server.ts).
 */
export function karensDagar(standard: number, pa: boolean = KARENS_V4): number {
  return pa ? Math.min(standard, KARENS_V4_DAGAR) : standard;
}

/** Har de osedda frågorna i fönstret tagit slut (händelsen bank_slut_visad)? */
export function bankSlut(oseddaKvar: number, behov: number): boolean {
  return oseddaKvar < behov;
}
