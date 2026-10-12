// src/lib/kalibrering/flaggor.ts
// =============================================================================
// Kalibreringens trösklar och statusen per fråga (beställningen omgång 3, B3).
// En sanning för admin Frågor. scripts/kalibrering-rapport.mjs har en kopia
// (skripten importerar inte TS); __tests__/flaggor.test.ts fäller om de
// skiljer sig.
//
//   kalibrerad   minst 30 svar och minst 20 konton
//   prior_fel    kalibrerad och |p − p_prior| > 0,25
//   fel_niva     kalibrerad och p utanför nivåns band
//
// Ren fil utan serverberoenden.
// =============================================================================

export const MIN_SVAR = 30;
export const MIN_KONTON = 20;
export const PRIOR_AVVIKELSE = 0.25;

export type Band = 'grund' | 'avancerad' | 'expert' | 'plus';

/** Nivåbanden för uppmätt p (samma som kalibrering-rapport.mjs BAND). */
export const BAND_GRANSER: Readonly<Record<Band, { min: number; max: number }>> = {
  grund: { min: 0.56, max: 1 },
  avancerad: { min: 0.33, max: 0.72 },
  expert: { min: 0, max: 0.5 },
  plus: { min: 0, max: 0.35 },
};

export function inomBand(band: Band, p: number): boolean {
  const g = BAND_GRANSER[band];
  return p >= g.min && p <= g.max;
}

export type KalibreringStatus = 'okalibrerad' | 'kalibrerad' | 'prior_fel' | 'fel_niva';

export const STATUS_ORDNING: readonly KalibreringStatus[] = ['prior_fel', 'fel_niva', 'okalibrerad', 'kalibrerad'];

/** Ord i gränssnittet (copy-omgang3.md 5.3). Flaggan är ett ord, ingen färg. */
export const STATUS_TEXT: Readonly<Record<KalibreringStatus, string>> = {
  okalibrerad: 'Okalibrerad',
  kalibrerad: 'Kalibrerad',
  prior_fel: 'Priorn stämmer inte',
  fel_niva: 'Fel nivå',
};

export interface KalibreringIn {
  svar: number;
  konton: number;
  p: number | null;
  p_prior: number;
  band: Band;
}

/** Statusen för en fråga. Priorn går före nivån när båda slår till. */
export function kalibreringStatus(f: KalibreringIn): KalibreringStatus {
  const kalibrerad = f.svar >= MIN_SVAR && f.konton >= MIN_KONTON && f.p != null;
  if (!kalibrerad) return 'okalibrerad';
  if (Math.abs((f.p as number) - f.p_prior) > PRIOR_AVVIKELSE) return 'prior_fel';
  if (!inomBand(f.band, f.p as number)) return 'fel_niva';
  return 'kalibrerad';
}

/** Flaggade först, sedan okalibrerade med flest svar, sist kalibrerade. */
export function sorteraKalibrering<T extends { status: KalibreringStatus; svar: number; id: string }>(rader: readonly T[]): T[] {
  return [...rader].sort(
    (a, b) =>
      STATUS_ORDNING.indexOf(a.status) - STATUS_ORDNING.indexOf(b.status) ||
      b.svar - a.svar ||
      a.id.localeCompare(b.id, 'sv'),
  );
}

/** Stapelns title (copy 5.3): "Antagen 0,55, uppmätt 0,71. Skillnad 0,16." */
export function avvikelseTitel(pPrior: number, p: number | null): string {
  const k = (x: number) => x.toFixed(2).replace('.', ',');
  if (p == null) return `Antagen ${k(pPrior)}, inga svar än.`;
  return `Antagen ${k(pPrior)}, uppmätt ${k(p)}. Skillnad ${k(Math.abs(p - pPrior))}.`;
}
