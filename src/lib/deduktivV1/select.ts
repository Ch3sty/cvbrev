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
export const DEDUKTIV_VERSION = 1;
/** 15 minuter för hela testet, alla nivåer. */
export const TIDSGRANS_S = 15 * 60;

const BANK: Record<DeduktivNiva, DeduktivFraga[]> = {
  grund: grund as unknown as DeduktivFraga[],
  avancerad: avancerad as unknown as DeduktivFraga[],
  expert: expert as unknown as DeduktivFraga[],
};

export function poolFor(niva: DeduktivNiva): DeduktivFraga[] {
  return BANK[niva];
}

export function allaFragor(): DeduktivFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => poolFor(n));
}

export function valjFragor(niva: DeduktivNiva, sessionId: string, antal = FRAGOR_PER_SESSION): DeduktivFraga[] {
  const a = [...poolFor(niva)];
  const rng = mulberry32(hashString(sessionId));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(antal, a.length));
}
