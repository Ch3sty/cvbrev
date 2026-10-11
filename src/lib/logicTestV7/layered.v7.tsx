// src/lib/logicTestV7/layered.v7.tsx
// =============================================================================
// V7 LAGER-TILLÄGG (additivt — rör inte types.v7.ts / renderers.v7.tsx)
// =============================================================================
// Branschnivå kräver RIKA celler: flera oberoende element staplade i samma cell,
// där varje lager kan följa sin egen regel. De befintliga V7-primitiverna ritar
// alla i samma 0–100 viewBox och kan därför staplas direkt.
//
// En "layered cell" är helt enkelt en ARRAY av V7Cell-primitiver, ritade i
// ordning (underifrån och upp). Detta ger combination-frågor (branschens
// svåraste typ) utan att skriva en ny renderare — vi återanvänder SvgCellV7.
// =============================================================================

import React from 'react';
import type { V7Cell } from './types.v7';
import type { MatrisFamilj } from './familjer';
import { LuckaFigurV7, SvgCellV7 } from './renderers.v7';

// En cell kan vara EN primitiv (som idag) ELLER en stack av primitiver.
export type LayeredCell = V7Cell | V7Cell[];

export type LayeredQuestion = {
  id: string;
  title: string;
  rule: string;
  /** Svårighetsprior 1-4 (1 lättast) tills frågan har 30 svar. */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Mönsterfamilj, id ur familjer.json. Samma taxonomi i alla nivåer. */
  family?: MatrisFamilj;
  grid: (LayeredCell | null)[][];
  options: LayeredCell[];
  correctAnswer: number;
  /**
   * Ett per alternativ, på originalindex (före blandningen): vilken dimension
   * alternativet har fel i. Tom sträng för facit och för alternativ som
   * väntar på manuell granskning (de står i misstagGranskas).
   */
  misstag?: string[];
  /** Originalindex vars misstag ska skrivas av testansvarig. */
  misstagGranskas?: number[];
  /**
   * Pensionerad (spec-rummen avsnitt 15): ligger kvar i filen så att gamla
   * sessioners urval och genomgång stämmer, men väljs aldrig till något nytt.
   */
  pensionerad?: boolean;
  /** Frivillig andel rätt i [0,05, 0,95] när generatorn kan gradera (14.1 punkt 4). */
  p_prior?: number;
};

/**
 * Frågan så som den visas i testet: alternativen i den ordning hon ser dem,
 * och utan facit. Byggs på servern (fragor.server.ts). misstag och family
 * följer inte med under testet (misstag avslöjar facit).
 */
export type VisadFraga = Omit<LayeredQuestion, 'correctAnswer' | 'misstag' | 'misstagGranskas' | 'family'>;

/**
 * Frågan i genomgången efter avslutat test: samma visade ordning som i
 * testet, plus var rätt svar stod (visat index) och mönsterfamiljen, som
 * genomgången visar i stället för svårigheten (spec-rummen 15.9). Saknas för
 * V5-frågor.
 */
export type GenomgangsFraga = VisadFraga & { rattVisat: number; family?: MatrisFamilj | null };

export const isStack = (cell: LayeredCell): cell is V7Cell[] => Array.isArray(cell);

/**
 * En figur i sin ruta (grafik v3, spec avsnitt 1): svg i full storlek med
 * 10 procent luft per sida, så att figuren fyller 80 procent av rutan i både
 * matrisen och alternativen. Samma svg-i-full-storlek-mekanism för figurer
 * och lucka ger samma höjd (höjdfällan i reference_matrix_test_system).
 * Ska stå inne i .matrisyta, som mappar de fasta färgerna till tokens.
 */
export const FigurV7: React.FC<{ cell: LayeredCell; className?: string }> = ({ cell, className }) => (
  <svg
    viewBox="0 0 100 100"
    className={`block h-full w-full p-[10%] ${className ?? ''}`}
    shapeRendering="geometricPrecision"
    aria-hidden="true"
    focusable="false"
  >
    <SvgLayeredCell cell={cell} />
  </svg>
);

/** Luckan före svaret: streckad ram och ritat frågetecken i ram-grått, ingen text (V10). */
export const LuckaV7: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={`block h-full w-full ${className ?? ''}`}
    shapeRendering="geometricPrecision"
    aria-hidden="true"
    focusable="false"
  >
    <LuckaFigurV7 />
  </svg>
);

// Ritar en layered cell: en eller flera primitiver staplade i samma SVG-rymd.
export const SvgLayeredCell: React.FC<{ cell: LayeredCell }> = ({ cell }) => {
  const layers = isStack(cell) ? cell : [cell];
  return (
    <>
      {layers.map((prim, i) => (
        <SvgCellV7 key={i} cell={prim} />
      ))}
    </>
  );
};
