// src/lib/logic/signatures.ts
import type { Cell } from './types';

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
    case 'grid_dot':
      return `griddot:${cell.x},${cell.y}`;
    default:
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