/**
 * Signature generation and validation for cells
 * Ensures unique answer options by creating deterministic signatures
 */

import type { Cell } from './types';

const norm = (a: number) => ((a % 360) + 360) % 360;

/**
 * Generate unique signature for a cell
 * Two cells with the same signature are visually identical
 */
export const signature = (cell: Cell): string => {
  switch (cell.kind) {
    case 'ring_ticks': {
      // Normalize indices to 0..7 and sort
      const uniq = Array.from(
        new Set(cell.indices.map((i) => ((i % 8) + 8) % 8))
      ).sort((a, b) => a - b);
      return `ring:${uniq.join(',')}`;
    }
    case 'T_dot':
      return `T:${cell.rotation}:${cell.dot}`;
    case 'plus_dot':
      return `plus:${cell.rotation}:${cell.dot}`;
    case 'symbol':
      return `sym:${cell.name}:${norm(cell.rotation ?? 0)}:${cell.solid === false ? 0 : 1}`;
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
