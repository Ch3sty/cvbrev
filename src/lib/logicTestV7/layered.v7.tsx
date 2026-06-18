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
import { SvgCellV7 } from './renderers.v7';

// En cell kan vara EN primitiv (som idag) ELLER en stack av primitiver.
export type LayeredCell = V7Cell | V7Cell[];

export type LayeredQuestion = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  grid: (LayeredCell | null)[][];
  options: LayeredCell[];
  correctAnswer: number;
};

export const isStack = (cell: LayeredCell): cell is V7Cell[] => Array.isArray(cell);

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
