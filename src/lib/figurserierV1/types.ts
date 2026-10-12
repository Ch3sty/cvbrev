// src/lib/figurserierV1/types.ts
// =============================================================================
// Figurseriernas frågor (beställningen omgång 2, A2). En fråga är fem
// figurer i rad och sex alternativ; luckan är alltid sist. Figurerna är
// V7-celler (renderers.v7.tsx), duo inräknad.
// =============================================================================

import type { V7Cell } from '@/lib/logicTestV7/types.v7';
import type { SerieFamilj } from './familjer';

export type SerieNiva = 'grund' | 'avancerad' | 'expert';

export interface SerieFraga {
  /** fs-<g|a|e>-<familj>-<nn> */
  id: string;
  niva: SerieNiva;
  family: SerieFamilj;
  /** Mallen F1 till F7. */
  recept: string;
  variant?: string;
  difficulty: 1 | 2 | 3 | 4;
  /** Andel rätt innan frågan har svar, per mall. */
  p_prior: number;
  title: string;
  /** Regeln, ordagrant i genomgången. */
  rule: string;
  /** Fem figurer; luckan (den sjätte) ritas av vyn. */
  rad: V7Cell[];
  options: V7Cell[];
  correctAnswer: number;
  /** Ett per alternativ på originalindex, tomt för facit. */
  misstag: string[];
  fran_version: 1;
  /** Generatorns regler per egenskap (för kontrollerna, visas aldrig). */
  regler?: unknown;
}

/** Frågan under testet: alternativen i visad ordning, utan facit, regel och misstag. */
export interface VisadSerie {
  id: string;
  difficulty: number;
  rad: V7Cell[];
  options: V7Cell[];
}

/** Frågan i genomgången: visad ordning, var rätt svar stod, regeln och misstagen i visad ordning. */
export interface GenomgangSerie extends VisadSerie {
  title: string;
  rule: string;
  family: SerieFamilj;
  rattVisat: number;
  /** Misstaget per visat index, tomt för facit. */
  misstag: string[];
}
