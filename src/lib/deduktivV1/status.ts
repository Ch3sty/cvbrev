// src/lib/deduktivV1/status.ts
// =============================================================================
// Om deduktiv slutledning syns. Testet visas när banken är befordrad
// (BANK_BEFORDRAD, sätts av scripts/befordra-deduktiv.mjs i samma commit som
// bankfilerna fylls) eller med QA-flaggan NEXT_PUBLIC_DEDUKTIV_QA=1, som bara
// sätts lokalt för klicktest (bankfilerna fyllda med --lokalt). Ren fil, går
// att importera från klienten.
// =============================================================================

/** Sätts till true i samma commit som bankfilerna fylls. */
export const BANK_BEFORDRAD = false;

/** Kortet i Alla tester och sidorna under /dashboard/tester/deduktiv-*. */
export function deduktivSynlig(): boolean {
  return BANK_BEFORDRAD || process.env.NEXT_PUBLIC_DEDUKTIV_QA === '1';
}
