// src/lib/figurserierV1/status.ts
// =============================================================================
// Om figurserierna syns. Testet visas när banken är befordrad
// (BANK_BEFORDRAD, sätts av scripts/befordra-figurserier.mjs i samma commit
// som bankfilerna fylls) eller med QA-flaggan NEXT_PUBLIC_FIGURSERIER_QA=1,
// som bara sätts i en lokal miljö för klicktest (med bankfilerna fyllda
// lokalt av befordringsskriptet med --lokalt). Ren fil, går att importera
// från klienten.
// =============================================================================

/** Sätts till true i samma commit som bankfilerna fylls. */
export const BANK_BEFORDRAD = true;

/** Kortet i Alla tester och sidorna under /dashboard/tester/figurserier-*. */
export function figurserierSynliga(): boolean {
  return BANK_BEFORDRAD || process.env.NEXT_PUBLIC_FIGURSERIER_QA === '1';
}
