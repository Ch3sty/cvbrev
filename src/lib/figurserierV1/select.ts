// src/lib/figurserierV1/select.ts
// =============================================================================
// Urvalet: 15 frågor ur nivåns pool, seedad Fisher-Yates på sessionId (samma
// mekanik som matriserna, selectQuestions.v7.ts). Test- och resultatsida
// härleder samma urval. Poolen en session drar ur får aldrig ändras; nya
// frågor kommer med en ny meta.serie_version.
//
// Poolen är bankfilerna. De är tomma tills testansvarig godkänt kandidaterna
// och scripts/befordra-figurserier.mjs fyllt dem; kandidatkatalogen importeras
// aldrig av appen (src/lib/logicTestV7/__tests__/kandidater.test.ts).
//
// Bara serverkod: bankerna har facit.
// =============================================================================

import grund from './bankGrund.json';
import avancerad from './bankAvancerad.json';
import expert from './bankExpert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { SerieFraga, SerieNiva } from './types';

export const FRAGOR_PER_SESSION = 15;
export const SERIE_VERSION = 1;

const BANK: Record<SerieNiva, SerieFraga[]> = {
  grund: grund as unknown as SerieFraga[],
  avancerad: avancerad as unknown as SerieFraga[],
  expert: expert as unknown as SerieFraga[],
};

export function poolFor(niva: SerieNiva): SerieFraga[] {
  return BANK[niva];
}

/** Alla frågor oavsett nivå, för rättningen. */
export function allaFragor(): SerieFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => poolFor(n));
}

export function valjFragor(niva: SerieNiva, sessionId: string, antal = FRAGOR_PER_SESSION): SerieFraga[] {
  const a = [...poolFor(niva)];
  const rng = mulberry32(hashString(sessionId));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(antal, a.length));
}
