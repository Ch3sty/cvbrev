// src/lib/nivakoll/typer.ts
// =============================================================================
// Nivåkollens klientform för figurserier, deduktivt, verbalt och numeriskt
// (testplanen steg 1, 2026-11-09). Som matrisens Nivåkoll: ingen
// återkoppling under tiden, facit och förklaringar först efter avslutet.
// Ren typfil, får importeras av klienten.
// =============================================================================

import type { V7Cell } from '@/lib/logicTestV7/types.v7';
import type { SerieForm } from '@/lib/figurserierV1/types';
import type { DeduktivLosning } from '@/lib/deduktivV1/types';
import type { VnUnderlag } from '@/lib/tester/pass-typer';
import type { NivakollKind } from './niva';

export type BankNiva = 'grund' | 'avancerad' | 'expert';

interface Bas {
  /** Uppgiftens nyckel, samma id som frågestatistiken använder. */
  nyckel: string;
  /** Bankens nivå, för genomgången och "per nivå" i resultatet. */
  niva: BankNiva;
}

export type NivakollUppgift =
  | (Bas & { kind: 'figurserie'; form: SerieForm; rad: V7Cell[]; options: V7Cell[] })
  | (Bas & { kind: 'deduktiv'; intro: string | null; villkor: string[]; fraga: string; options: string[]; premisser: boolean })
  | (Bas & { kind: 'verbal' | 'numerisk'; underlag: string; text: string; alternativ: { id: string; text: string }[] });

/** En uppgift i genomgången efter avslutet. */
export interface NivakollGenomgang {
  correct: boolean;
  /** Rätt svar: visat index som text (figurserier, deduktivt), svarsvärde eller alternativets id (verbalt, numeriskt). */
  ratt: string;
  /** Hennes svar i samma form, null för "Vet inte". */
  valt: string | null;
  /** Figurseriernas regel, verbalt och numeriskts förklaring. */
  forklaring: string | null;
  misstag: string | null;
  /** Deduktivt: lösningsgången och remsan. */
  losning?: DeduktivLosning | null;
}

export interface NivakollPerNiva {
  niva: BankNiva;
  ratt: number;
  antal: number;
}

export interface NivakollTappad {
  namn: string;
  ratt: number;
  antal: number;
  andel: number;
}

export interface NivakollResultat {
  niva: number;
  /** Nivån före (ny Nivåkoll), null första gången. */
  fore: number | null;
  delta: number;
  ratt: number;
  antal: number;
  tid_s: number;
  /** Provets tid för alla uppgifterna. */
  budget_s: number;
  /** Uppgifter över provets tid per uppgift. */
  over_tid: number;
  perNiva: NivakollPerNiva[];
  tappade: NivakollTappad[];
  /** Dagens pass efter Nivåkollen. */
  passNiva: 'grund' | 'avancerad';
  /** Väntad andel rätt per banknivå vid nivån (modellen i niva.ts), för meningen. */
  vantat: Record<BankNiva, number | null>;
}

export interface NivakollVy {
  id: string;
  kind: NivakollKind;
  typ: 'matning' | 'ommatning';
  startad: string;
  avslutad: boolean;
  /** Provets tid per uppgift i sekunder. */
  budget_s: number;
  uppgifter: NivakollUppgift[];
  /** Verbalt och numeriskt: texterna och underlagen per id. */
  underlag: Record<string, VnUnderlag>;
  besvarade: Record<string, { svar: string | null; tid_s: number }>;
  genomgang: Record<string, NivakollGenomgang> | null;
  resultat: NivakollResultat | null;
}
