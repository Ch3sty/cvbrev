import type { Cell } from './types.v4';

// Normaliserar rotation för visuellt symmetriska former
const normalizeRotation = (rotation: number, shape: string): number => {
  const normRot = ((rotation % 360) + 360) % 360;
  if (shape === 'square' || shape === 'rhombus' || shape === 'plus') {
    return normRot % 90; // Symmetrisk var 90:e grad
  }
  if (shape === 'circle') {
    return 0; // Alltid symmetrisk
  }
  return normRot;
};

export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    case 'dots':
      return `dots:${cell.count}:${cell.pos}:${cell.layout ?? 'h'}`;
    case 'l_shape':
      return `l_shape:${((cell.rotation % 360) + 360) % 360}:${cell.fill}`;
    case 'icon':
      const normIconRot = normalizeRotation(cell.rotation ?? 0, cell.shape);
      return `icon:${cell.shape}:${cell.fill ? 1:0}:${normIconRot}`;
    case 'fill':
      return `fill:${cell.shape}:${cell.fill ? 1:0}`;
    case 'corner_dot':
      return `corner_dot:${cell.pos ?? 'null'}`;
    case 'lines':
      return `lines:${[...cell.lines].sort().join(',')}`;
    case 'shaded_shape':
      const normShadedRot = normalizeRotation(cell.rotation ?? 0, cell.shape);
      return `shaded:${cell.shape}:${cell.fill}:${normShadedRot}`;
    case 'endpoints':
        return `endpoints:${cell.count}:${cell.shape ?? ''}`;
    case 'hook':
    case 'arc':
    case 'wedge':
        return `reflect:${cell.kind}:${cell.mirror_v ? 1:0}:${cell.mirror_h ? 1:0}:${((cell.rotation ?? 0) % 360 + 360) % 360}`;
    case 'intersection':
        return `intersect:${cell.shape1}:${cell.fill ?? 'black'}`;
    case 'orbital_dot':
        return `orbital:${cell.step % 8}`; // Modulo 8 eftersom 8*45=360
    case 'swap':
        return `swap:${cell.arrangement}:${cell.black_pos}:${cell.shape ?? 'circle'}`;
    case 'sized_shape':
        const normSizedRot = normalizeRotation(cell.rotation ?? 0, cell.shape);
        return `sized:${cell.shape}:${cell.size}:${cell.fill ? 1:0}:${normSizedRot}`;
    case 'subtraction':
        return `sub:${cell.outer}:${cell.inner}:${cell.fill ? 1:0}`;
    case 'sudoku':
        return `sudoku:${cell.shape}:${cell.fill}:${normalizeRotation(cell.rotation ?? 0, cell.shape)}`;
    case 'sweep':
        return `sweep:${cell.steps}:${(((cell.rotation ?? 0) % 360) + 360) % 360}`;
    default:
      const exhaustiveCheck: never = cell;
      return `unknown:${JSON.stringify(exhaustiveCheck)}`;
  }
};