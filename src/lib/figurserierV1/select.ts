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
import parti2Grund from './bankParti2Grund.json';
import parti2Avancerad from './bankParti2Avancerad.json';
import bryterGrund from './bankBryterGrund.json';
import bryterAvancerad from './bankBryterAvancerad.json';
import parti3Grund from './bankParti3Grund.json';
import parti3Avancerad from './bankParti3Avancerad.json';
import parti3Expert from './bankParti3Expert.json';
import parti4Grund from './bankParti4Grund.json';
import parti4Avancerad from './bankParti4Avancerad.json';
import parti4Expert from './bankParti4Expert.json';
import parti5Grund from './bankParti5Grund.json';
import parti5Avancerad from './bankParti5Avancerad.json';
import parti5Expert from './bankParti5Expert.json';
import { hashString, mulberry32 } from '@/lib/logicTestV7/blanda';
import type { SerieFraga, SerieNiva } from './types';

export const FRAGOR_PER_SESSION = 15;
/**
 * Version 2 (granskning omgång 3, avsnitt 9): fs-e-vrid-02 och fs-e-antal-04
 * pensioneras (pensionerad_fran: 2 i bankExpert.json). De står kvar i filen så
 * att sessioner med serie_version 1 drar samma urval och visar sin genomgång,
 * men väljs aldrig till något nytt. Grund och avancerad är oförändrade.
 */
/**
 * Version 3 (frågebanken 2026-11-19, docs/fragebank/figurserier-2026-11-19.md):
 * parti 3 (bankParti3*.json, fran_version 3) går in i poolen på alla tre
 * nivåerna. Sessioner med version 1 och 2 drar som förut.
 */
/**
 * Version 4 (frågebanken 2026-11-19, omgång 2, docs/fragebank/figurserier-
 * 2026-11-19-omg2.md): parti 4 (bankParti4*.json, fran_version 4) går in i
 * poolen på alla tre nivåerna. Sessioner med version 1 till 3 drar som förut.
 */
export const SERIE_VERSION = 5;
export type SerieVersion = 1 | 2 | 3 | 4 | 5;

/** Sessionens version ur meta; saknas den, eller äldre: version 1. */
export function serieVersion(meta: unknown): SerieVersion {
  const v = (meta as { serie_version?: unknown } | null)?.serie_version;
  return v === 5 ? 5 : v === 4 ? 4 : v === 3 ? 3 : v === 2 ? 2 : 1;
}

const BANK: Record<SerieNiva, SerieFraga[]> = {
  grund: grund as unknown as SerieFraga[],
  avancerad: avancerad as unknown as SerieFraga[],
  expert: expert as unknown as SerieFraga[],
};

/** Parti 3 (fran_version 3): i poolen från serie_version 3. */
const PARTI3: Record<SerieNiva, SerieFraga[]> = {
  grund: parti3Grund as unknown as SerieFraga[],
  avancerad: parti3Avancerad as unknown as SerieFraga[],
  expert: parti3Expert as unknown as SerieFraga[],
};

/** Parti 4 (fran_version 4): i poolen från serie_version 4. */
const PARTI4: Record<SerieNiva, SerieFraga[]> = {
  grund: parti4Grund as unknown as SerieFraga[],
  avancerad: parti4Avancerad as unknown as SerieFraga[],
  expert: parti4Expert as unknown as SerieFraga[],
};

/** Parti 5 (fran_version 5, klockan, F9 och F10): i poolen från serie_version 5. */
const PARTI5: Record<SerieNiva, SerieFraga[]> = {
  grund: parti5Grund as unknown as SerieFraga[],
  avancerad: parti5Avancerad as unknown as SerieFraga[],
  expert: parti5Expert as unknown as SerieFraga[],
};

export function poolFor(niva: SerieNiva, version: SerieVersion = 1): SerieFraga[] {
  if (version === 1) return BANK[niva];
  const aktiva = BANK[niva].filter((q) => !q.pensionerad_fran || q.pensionerad_fran > version);
  return [...aktiva, ...(version >= 3 ? PARTI3[niva] : []), ...(version >= 4 ? PARTI4[niva] : []), ...(version >= 5 ? PARTI5[niva] : [])];
}

/**
 * Omgång 3 (beställning A2 till A4): parti 2 och bryter mönstret ligger i egna
 * bankfiler och används bara av figurpasset och övningsprovet. De klassiska
 * nivåtesten drar ur poolFor, som är oförändrad (serie_version 1).
 */
export type PassNiva = 'grund' | 'avancerad';
const PARTI2: Record<PassNiva, SerieFraga[]> = {
  grund: parti2Grund as unknown as SerieFraga[],
  avancerad: parti2Avancerad as unknown as SerieFraga[],
};
const BRYTER: Record<PassNiva, SerieFraga[]> = {
  grund: bryterGrund as unknown as SerieFraga[],
  avancerad: bryterAvancerad as unknown as SerieFraga[],
};
/** Golvet (A5): färre godkända bryter-uppgifter på nivån och passet och provet kör bara härnäst. */
export const BRYTER_GOLV = 12;

/** Härnäst för pass och prov: nivåtestets bank (parti 3 från version 3, parti 4 från version 4) plus parti 2. */
export function harnastPool(niva: SerieNiva): SerieFraga[] {
  return niva === 'expert' ? poolFor('expert', SERIE_VERSION) : [...poolFor(niva, SERIE_VERSION), ...PARTI2[niva]];
}

/** Bryter mönstret på nivån, tom under golvet. */
export function bryterPool(niva: PassNiva): SerieFraga[] {
  return BRYTER[niva].length >= BRYTER_GOLV ? BRYTER[niva] : [];
}

/** Allt figurpasset och övningsprovet kan visa, för uppslag och rättning. */
export function allaFigurFragor(): SerieFraga[] {
  return [...allaFragor(), ...PARTI2.grund, ...PARTI2.avancerad, ...BRYTER.grund, ...BRYTER.avancerad];
}

/**
 * Alla frågor oavsett nivå och version, för rättningen. Varje parti måste stå
 * här: rattaSerieSvar, hittaSerieFraga och FIGUR_PER_ID slår upp i den, och en
 * fråga som saknas rättas som fel.
 */
export function allaFragor(): SerieFraga[] {
  return (['grund', 'avancerad', 'expert'] as const).flatMap((n) => [...BANK[n], ...PARTI3[n], ...PARTI4[n], ...PARTI5[n]]);
}

export function valjFragor(niva: SerieNiva, sessionId: string, antal = FRAGOR_PER_SESSION, version: SerieVersion = 1): SerieFraga[] {
  const a = [...poolFor(niva, version)];
  const rng = mulberry32(hashString(sessionId));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(antal, a.length));
}
