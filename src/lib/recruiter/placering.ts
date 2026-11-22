// src/lib/recruiter/placering.ts
//
// Testens placering mot rekryteraren (ägarbeslut 2026-11-22): placeringen
// visas bara när resultatet är över mitten, alltså topp 50 % eller bättre.
// Annars visas bara att testet är genomfört, utan tal. Råpoäng (andel rätt)
// visas aldrig. Samma regel gäller för percentilfilter, sortering och
// matchförklaringar, så att en placering under mitten inte går att utläsa
// på omvägar. Kandidatens förhandsvisning använder samma etikett.

/** Lägsta percentil som visas: percentil 50 = topp 50 %. */
export const PLACERING_LAGST = 50;

/** Percentilen om den får visas, annars null. */
export function synligPercentil(percentile: number | null | undefined): number | null {
  if (percentile === null || percentile === undefined || !Number.isFinite(percentile)) return null;
  return percentile >= PLACERING_LAGST ? percentile : null;
}
