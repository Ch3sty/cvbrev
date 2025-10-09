/**
 * Scoring and grading logic for logic test V3 (grundnivå)
 */

/**
 * Calculate practice rating (1-10) from raw score (0-100)
 */
export function practiceRating(scoreRaw: number): number {
  const r = Math.ceil(scoreRaw / 10);
  return Math.max(1, Math.min(10, r));
}

/**
 * Grade test answers
 * @param expectedIds - Question IDs that should be answered
 * @param answersById - Map of questionId => userAnswer index
 * @param correctById - Map of questionId => correct answer index
 * @returns Grading result with correct count, raw score, and rating
 */
export function grade(
  expectedIds: string[],
  answersById: Map<string, number>,
  correctById: Map<string, number>
) {
  let correct = 0;
  for (const qid of expectedIds) {
    const user = answersById.get(qid);
    const key = correctById.get(qid);
    if (user !== undefined && user === key) {
      correct++;
    }
  }
  const scoreRaw = (correct / expectedIds.length) * 100;
  return {
    correct,
    scoreRaw,
    rating: practiceRating(scoreRaw),
  };
}

/**
 * Get interpretation text based on rating (for grundnivå test)
 */
export function getInterpretation(rating: number): string {
  if (rating >= 9) {
    return 'Utmärkt! Du har mycket god grundläggande logisk förmåga och mönsterigenkänning.';
  } else if (rating >= 7) {
    return 'Mycket bra! Du har stark grundläggande logisk förmåga.';
  } else if (rating >= 5) {
    return 'Bra! Du har god grundläggande logisk förmåga.';
  } else if (rating >= 3) {
    return 'Okej resultat. Fortsätt öva för att stärka din logiska förmåga.';
  } else {
    return 'Fortsätt öva - logisk förmåga kan tränas! Detta är ett bra sätt att börja.';
  }
}
