// src/lib/traning/svarighet.ts
// =============================================================================
// Frågans svårighet som andel rätt (p) och som nivå på skalan 1 till 10.
//
// p kommer ur fraga_statistik när frågan har minst MIN_SVAR_FOR_KALIBRERING
// svar från blandade sessioner, annars ur priorn för bankens svarighet_prior
// (dagens difficulty): 1: 0,85, 2: 0,7, 3: 0,55, 4: 0,4 (spec 3a).
//
// Nivån för en fråga är en rak avbildning av p: b = 1 + 9 × (1 − p).
// En fråga som 40 procent klarar ligger på nivå 6,4, en som 85 procent
// klarar på 2,35. Avbildningen är monoton och går att säga i en mening.
// Testansvarig äger formeln (spec 3a, niva.ts); den här är byggets förslag.
// =============================================================================

import { MIN_SVAR_FOR_KALIBRERING } from './flaggor';

export type Prior = 1 | 2 | 3 | 4;

export const PRIOR_P: Readonly<Record<Prior, number>> = { 1: 0.85, 2: 0.7, 3: 0.55, 4: 0.4 };

/** Bankens svarighet_prior eller difficulty som 1..4. Okänt ger 3. */
export function svarighetPrior(varde: unknown): Prior {
  const n = typeof varde === 'number' && Number.isFinite(varde) ? Math.round(varde) : 3;
  return Math.min(4, Math.max(1, n)) as Prior;
}

export interface FragaStatistik {
  antal: number;
  ratt: number;
}

/** p för en fråga: uppmätt från 30 svar, annars priorn. */
export function pForFraga(prior: Prior, stat?: FragaStatistik | null): number {
  if (stat && stat.antal >= MIN_SVAR_FOR_KALIBRERING && stat.antal > 0) {
    // Hålls inom (0,02, 0,98) så att en fråga alla klarat inte blir nivå 1,0.
    return Math.min(0.98, Math.max(0.02, stat.ratt / stat.antal));
  }
  return PRIOR_P[prior];
}

/** Frågans nivå ur p. Monotont avtagande i p. */
export function nivaForP(p: number): number {
  return Math.min(10, Math.max(1, 1 + 9 * (1 - p)));
}

/** Omvändningen: p för en fråga som ligger precis på nivån. */
export function pForNiva(niva: number): number {
  return Math.min(1, Math.max(0, 1 - (niva - 1) / 9));
}

/** Mätningens tre svårighetsband efter p. */
export type Band = 'latt' | 'mellan' | 'svar';

export const BAND_GRANS = { lattFran: 0.65, mellanFran: 0.48 } as const;

export function bandForP(p: number): Band {
  if (p >= BAND_GRANS.lattFran) return 'latt';
  if (p >= BAND_GRANS.mellanFran) return 'mellan';
  return 'svar';
}

/** Hur nära nivån en fråga ska vara för att räknas som "nära" (tempo och pass). */
export const NARA_NIVAN_P = 0.15;

export function arNaraNivan(p: number, niva: number): boolean {
  return Math.abs(p - pForNiva(niva)) <= NARA_NIVAN_P + 1e-9;
}
