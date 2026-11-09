// src/lib/deduktivV1/select.ts
// =============================================================================
// Urvalet: 12 uppgifter ur nivåns pool, seedad Fisher-Yates på sessionId
// (samma mekanik som matriserna och figurserierna). Test- och resultatsida
// härleder samma urval. Poolen en session drar ur får aldrig ändras; nya
// uppgifter läggs i en ny meta.deduktiv_version.
//
// Poolen är bankfilerna. De är tomma tills testansvarig godkänt kandidaterna
// och scripts/befordra-deduktiv.mjs fyllt dem; kandidatkatalogen importeras
// aldrig av appen. Bara serverkod: bankerna har facit.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { DeduktivFraga, DeduktivNiva } from './types';

export const FRAGOR_PER_SESSION = 12;
/**
 * Bankversion 2 (testplanen steg 1, 2026-11-09): uppgifter som fälls av DD7
 * eller DD8 har pensionerad_fran 2 och ersätts av lagade kopior med
 * fran_version 2 (scripts/laga-deduktiv-v2.mjs). Gamla sessioner utan
 * meta.deduktiv_version läser version 1.
 */
export const DEDUKTIV_VERSION = 2;
export type DeduktivVersion = 1 | 2;

/** Sessionens bankversion ur meta; saknas den gäller version 1. */
export function deduktivVersion(meta: unknown): DeduktivVersion {
  const v = (meta as { deduktiv_version?: unknown } | null)?.deduktiv_version;
  return v === 2 ? 2 : 1;
}
/** 15 minuter för hela testet, alla nivåer. */
export const TIDSGRANS_S = 15 * 60;

const BANK: Record<DeduktivNiva, DeduktivFraga[]> = {
  grund: grund as unknown as DeduktivFraga[],
  avancerad: avancerad as unknown as DeduktivFraga[],
  expert: expert as unknown as DeduktivFraga[],
};

/** Nivåns pool i en bankversion: uppgifterna som finns från versionen och inte är pensionerade i den. */
export function poolFor(niva: DeduktivNiva, version: DeduktivVersion = 1): DeduktivFraga[] {
  return BANK[niva].filter((q) => q.fran_version <= version && !(q.pensionerad_fran != null && q.pensionerad_fran <= version));
}

/** Alla uppgifter i alla versioner, för uppslag och rättning (gamla sessioner pekar på pensionerade). */
export function allaFragor(): DeduktivFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => BANK[n]);
}

export function valjFragor(niva: DeduktivNiva, sessionId: string, antal = FRAGOR_PER_SESSION, version: DeduktivVersion = 1): DeduktivFraga[] {
  const a = [...poolFor(niva, version)];
  const rng = mulberry32(hashString(sessionId));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(antal, a.length));
}
