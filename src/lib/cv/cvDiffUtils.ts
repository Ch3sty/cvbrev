// src/lib/cv/cvDiffUtils.ts
/**
 * Utility functions for comparing and highlighting CV text changes
 */

export interface DiffSegment {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

/**
 * Simple word-based diff algorithm
 * More sophisticated than character-based, less complex than full diff-match-patch
 */
export function generateWordDiff(original: string, improved: string): DiffSegment[] {
  const originalWords = original.split(/(\s+)/);
  const improvedWords = improved.split(/(\s+)/);

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < improvedWords.length) {
    if (i >= originalWords.length) {
      // Rest of improved is added
      segments.push({ type: 'added', text: improvedWords.slice(j).join('') });
      break;
    }

    if (j >= improvedWords.length) {
      // Rest of original is removed
      segments.push({ type: 'removed', text: originalWords.slice(i).join('') });
      break;
    }

    if (originalWords[i] === improvedWords[j]) {
      // Same word
      segments.push({ type: 'unchanged', text: originalWords[i] });
      i++;
      j++;
    } else {
      // Different - look ahead to find matching sections
      const nextMatchInOriginal = originalWords.slice(i + 1, i + 10).indexOf(improvedWords[j]);
      const nextMatchInImproved = improvedWords.slice(j + 1, j + 10).indexOf(originalWords[i]);

      if (nextMatchInOriginal !== -1 && (nextMatchInImproved === -1 || nextMatchInOriginal < nextMatchInImproved)) {
        // Words removed from original
        segments.push({
          type: 'removed',
          text: originalWords.slice(i, i + nextMatchInOriginal + 1).join('')
        });
        i += nextMatchInOriginal + 1;
      } else if (nextMatchInImproved !== -1) {
        // Words added in improved
        segments.push({
          type: 'added',
          text: improvedWords.slice(j, j + nextMatchInImproved + 1).join('')
        });
        j += nextMatchInImproved + 1;
      } else {
        // No nearby match - treat as replacement
        segments.push({ type: 'removed', text: originalWords[i] });
        segments.push({ type: 'added', text: improvedWords[j] });
        i++;
        j++;
      }
    }
  }

  return segments;
}

/**
 * Apply improvements to CV text
 */
export function applyImprovements(
  originalText: string,
  improvements: {
    currentText?: string;
    suggestedText?: string;
  }[]
): string {
  let updatedText = originalText;

  improvements.forEach(improvement => {
    const { currentText, suggestedText } = improvement;

    if (currentText && suggestedText) {
      // Normalize whitespace for matching
      const normalizedCurrent = currentText.trim().replace(/\s+/g, ' ');
      const normalizedOriginal = updatedText.replace(/\s+/g, ' ');

      if (normalizedOriginal.includes(normalizedCurrent)) {
        // Escape special regex characters
        const escapedCurrent = currentText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        updatedText = updatedText.replace(
          new RegExp(escapedCurrent, 'g'),
          suggestedText
        );
      }
    }
  });

  return updatedText;
}
