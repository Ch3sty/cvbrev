// src/lib/logicV2/signatures.ts
import type { Cell } from './types';

const norm = (a: number) => ((a % 360) + 360) % 360;

export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    // Existing signatures from v1
    case 'ring_ticks': {
      const uniq = Array.from(new Set(cell.indices.map(i => ((i % 8) + 8) % 8))).sort((a, b) => a - b);
      return `ring:${uniq.join(',')}`;
    }
    case 'T_dot':
      return `T:${cell.rotation}:${cell.dot}`;
    case 'plus_dot':
      return `plus:${cell.rotation}:${cell.dot}`;

    // --- NEW SIGNATURES FOR V2 ---
    case 'polygon':
      return `poly:${cell.sides}:${cell.fill ? 1 : 0}:${norm(cell.rotation ?? 0)}`;
    case 'half_circle':
      return `half_circle:${norm(cell.rotation)}`;
    case 'pointer':
      return `pointer:${norm(cell.rotation)}:${cell.fill ? 1 : 0}`;
    case 'corner':
      return `corner:${norm(cell.rotation)}:${cell.mirror_h ? 1 : 0}:${cell.mirror_v ? 1 : 0}`;
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
      // Fallback for unknown types
      const exhaustiveCheck: never = cell;
      return `unknown:${JSON.stringify(exhaustiveCheck)}`;
  }
};

/**
 * Assert that all options are unique
 * @throws Error if duplicate options found
 */
export const assertUniqueOptions = (options: Cell[]) => {
  const seen = new Map<string, number>();
  options.forEach((opt, i) => {
    const sig = signature(opt);
    if (seen.has(sig)) {
      const firstIndex = seen.get(sig)!;
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      throw new Error(
        `Duplicate option: ${letters[firstIndex]} and ${letters[i]} share signature "${sig}"`
      );
    }
    seen.set(sig, i);
  });
};

/**
 * Validate that a question has exactly 6 unique options
 * @throws Error if validation fails
 */
export const validateQuestion = (question: {
  id: string;
  options: Cell[];
  correctAnswer: number;
}) => {
  if (question.options.length !== 6) {
    throw new Error(
      `Question ${question.id} must have exactly 6 options, got ${question.options.length}`
    );
  }
  if (question.correctAnswer < 0 || question.correctAnswer > 5) {
    throw new Error(
      `Question ${question.id} correctAnswer must be 0-5, got ${question.correctAnswer}`
    );
  }
  assertUniqueOptions(question.options);
};
