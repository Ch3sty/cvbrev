// src/logic/signatures.v3.ts
import type { Cell } from './types.v3';

export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    case 'dots':
      return `dots:${cell.count}:${cell.pos}:${cell.layout ?? 'h'}`;
    case 'arrow':
      return `arrow:${cell.rotation}:${cell.fill ? 1:0}`;
    case 'icon':
      return `icon:${cell.shape}:${cell.rotation ?? 0}`;
    case 'fill':
      return `fill:${cell.shape}:${cell.fill ? 1:0}`;
    case 'corner_dot':
      return `corner_dot:${cell.pos ?? 'null'}`;
    case 'lines':
      return `lines:${[...cell.lines].sort().join(',')}`;
    case 'shaded_shape':
      return `shaded:${cell.shape}:${cell.fill}`;
    case 'endpoints':
        return `endpoints:${cell.count}:${cell.shape ?? ''}`;
    case 'reflected_shape':
        return `reflect:${cell.shape}:${cell.mirror_v ? 1:0}`;
    case 'intersection':
        return `intersect:${cell.shape1}:${cell.shape2}`;
    case 'orbital_dot':
        return `orbital:${cell.step}`;
    case 'swap':
        return `swap:${cell.arrangement}:${cell.black_pos}`;
    case 'sized_shape':
        return `sized:${cell.shape}:${cell.size}`;
    case 'subtraction':
        return `sub:${cell.outer}:${cell.inner}`;
    case 'sweep':
        return `sweep:${cell.steps}`;
    default:
      const exhaustiveCheck: never = cell;
      return `unknown:${JSON.stringify(exhaustiveCheck)}`;
  }
};