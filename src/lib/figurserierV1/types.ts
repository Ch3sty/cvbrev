// src/lib/figurserierV1/types.ts
// =============================================================================
// Figurseriernas frågor (beställningen omgång 2, A2). En fråga är fem
// figurer i rad och sex alternativ; luckan är alltid sist. Figurerna är
// V7-celler (renderers.v7.tsx), duo inräknad.
// =============================================================================

import type { V7Cell } from '@/lib/logicTestV7/types.v7';
import type { SerieFamilj } from './familjer';

export type SerieNiva = 'grund' | 'avancerad' | 'expert';

/**
 * Frågans form (beställning omgång 3, A1): härnäst (fem figurer, luckan sist,
 * sex alternativ) eller bryter mönstret (sex figurer som är alternativen,
 * `options` tom, `correctAnswer` pekar i `rad`). Saknas fältet: härnäst.
 */
export type SerieForm = 'harnast' | 'bryter';

export interface SerieFraga {
  /** fs-<g|a|e>-<familj>-<nn>, bryter mönstret fsb-<g|a>-<familj>-<nn> */
  id: string;
  form?: SerieForm;
  niva: SerieNiva;
  family: SerieFamilj;
  /** Mallen F1 till F7, bryter mönstret B1 till B4. */
  recept: string;
  variant?: string;
  difficulty: 1 | 2 | 3 | 4;
  /** Andel rätt innan frågan har svar, per mall. */
  p_prior: number;
  title: string;
  /** Regeln, ordagrant i genomgången. */
  rule: string;
  /** Fem figurer; luckan (den sjätte) ritas av vyn. Bryter mönstret: sex. */
  rad: V7Cell[];
  options: V7Cell[];
  correctAnswer: number;
  /** Ett per alternativ på originalindex, tomt för facit. */
  misstag: string[];
  /** 1: de klassiska nivåtestens bank. 2: omgång 3 (parti 2 och bryter mönstret), bara i pass och övningsprov. */
  fran_version: 1 | 2;
  /** Pensionerad från den här serie_version (väljs aldrig till nya sessioner, står kvar för gamla). */
  pensionerad_fran?: number;
  /** Generatorns regler per egenskap (för kontrollerna, visas aldrig). */
  regler?: unknown;
}

/** Frågan under testet: alternativen i visad ordning, utan facit, regel och misstag. */
export interface VisadSerie {
  id: string;
  form?: SerieForm;
  difficulty: number;
  rad: V7Cell[];
  options: V7Cell[];
}

/** Frågan i genomgången: visad ordning, var rätt svar stod, regeln och misstagen i visad ordning. */
export interface GenomgangSerie extends VisadSerie {
  title: string;
  rule: string;
  family: SerieFamilj;
  /** Härnäst: index bland alternativen. Bryter mönstret: index i raden. */
  rattVisat: number;
  /** Misstaget per visat index, tomt för facit. */
  misstag: string[];
}
