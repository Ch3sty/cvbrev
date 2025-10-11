// src/lib/logicTestV6/signatures.v6.ts
import type { Cell } from './types.v6';

// Normaliserar rotation för visuellt symmetriska former
const normalizeRotation = (rotation: number, shape: string): number => {
  const normRot = ((rotation % 360) + 360) % 360;

  // Symmetriska former
  if (shape === 'square' || shape === 'plus') {
    return normRot % 90; // Symmetrisk var 90:e grad
  }
  if (shape === 'circle') {
    return 0; // Alltid symmetrisk
  }

  return normRot;
};

export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    case 'arrow':
      return `arrow:${((cell.rotation % 360) + 360) % 360}:${cell.fill ? 1 : 0}`;

    case 'multi_shape':
      return `multi_shape:${cell.shape}:${cell.pos}:${((cell.rotation ?? 0) % 360 + 360) % 360}`;

    case 'composition':
      return `composition:${[...cell.items].sort().join(',')}`;

    case 'analogy': {
      const normRot = cell.shape === 'l_shape'
        ? ((cell.rotation ?? 0) % 360 + 360) % 360
        : normalizeRotation(cell.rotation ?? 0, cell.shape);
      return `analogy:${cell.shape}:${normRot}:${cell.dot ? 1 : 0}:${cell.fill ? 1 : 0}`;
    }

    case 'lines':
      return `lines:${[...cell.lines].sort().join(',')}`;

    case 'l_shape':
      return `l_shape:${((cell.rotation % 360) + 360) % 360}:${cell.fill ? 1 : 0}:${cell.mirror_v ? 1 : 0}`;

    case 'pointer':
      return `pointer:${((cell.rotation % 360) + 360) % 360}:${cell.fill ? 1 : 0}:${cell.mirror_v ? 1 : 0}`;

    case 'count_areas':
      return `count_areas:${cell.shape}:${cell.dots ?? 0}`;

    case 'subtraction_inv':
      return `subtraction_inv:${cell.base}:${cell.line}`;

    case 'sudoku': {
      const normSudokuRot = normalizeRotation(cell.rotation ?? 0, cell.shape);
      return `sudoku:${cell.shape}:${cell.fill}:${normSudokuRot}`;
    }

    case 'dots':
      return `dots:${cell.count}:${cell.pos}:${cell.layout ?? 'horiz'}`;

    case 'three_vars':
      return `three_vars:${cell.shape}:${((cell.rotation % 360) + 360) % 360}:${cell.pos}`;

    case 'shaded_shape': {
      const normShadedRot = normalizeRotation(cell.rotation ?? 0, cell.shape);
      return `shaded:${cell.shape}:${cell.fill}:${normShadedRot}`;
    }

    case 'positioned_shape':
      return `positioned_shape:${cell.shape}:${cell.pos}`;

    default: {
      const exhaustiveCheck: never = cell;
      return `unknown:${JSON.stringify(exhaustiveCheck)}`;
    }
  }
};
