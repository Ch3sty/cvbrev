// src/lib/figurserierV1/status.ts
// =============================================================================
// Om figurserierna syns. Testet visas när banken är befordrad
// (BANK_BEFORDRAD, sätts när testansvarig godkänt kandidaterna och
// bankfilerna fyllts) eller med QA-flaggan NEXT_PUBLIC_FIGURSERIER_KANDIDATER=1,
// som bara sätts i en lokal miljö för klicktest. Ren fil, går att importera
// från klienten.
// =============================================================================

/** Sätts till true i samma commit som bankfilerna fylls. */
export const BANK_BEFORDRAD = false;

/** QA-flaggan: kandidaterna används som bank och kortet syns. */
export function figurserierKandidater(): boolean {
  return process.env.NEXT_PUBLIC_FIGURSERIER_KANDIDATER === '1';
}

/** Kortet i Alla tester och sidorna under /dashboard/tester/figurserier-*. */
export function figurserierSynliga(): boolean {
  return BANK_BEFORDRAD || figurserierKandidater();
}
