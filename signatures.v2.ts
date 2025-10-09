// src/logic/signatures.v2.ts
import type { Cell } from './types.v2';

export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    // Befintliga signaturer...
    case 'ring_ticks': {
      const uniq = Array.from(new Set(cell.indices.map(i => ((i % 8) + 8) % 8))).sort((a, b) => a - b);
      return `ring:${uniq.join(',')}`;
    }
    
    // --- NYA SIGNATURER FÖR V2 ---
    case 'polygon':
      return `poly:${cell.sides}:${cell.fill ? 1:0}:${cell.rotation ?? 0}`;
    case 'half_circle':
      return `half_circle:${cell.rotation}`;
    case 'pointer':
      return `pointer:${cell.rotation}:${cell.fill ? 1:0}`;
    case 'corner':
      return `corner:${cell.rotation}:${cell.mirror_h ? 1:0}:${cell.mirror_v ? 1:0}`;
    case 'intersections':
      return `intersect:${cell.count}`;
    case 'containment':
      return `contain:${cell.shape}:${cell.position}`;
    case 'piece':
      return `piece:${cell.shape}:${cell.piece}`;
    case 'lines':
      return `lines:${[...cell.lines].sort().join(',')}`;
    case 'grid_dot':
      return `griddot:${cell.x},${cell.y}`;
    case 'group':
      return `group:${cell.shape}:${cell.count}:${cell.pos ?? 'C'}`;
      
    default:
      // Fallback för okända typer
      const exhaustiveCheck: never = cell;
      return `unknown:${JSON.stringify(exhaustiveCheck)}`;
  }
};