export function calculatePracticeRating(scoreRaw: number): number {
  // Convert raw score (0-100%) to practice rating (1-10)
  // Using ceiling to ensure even 10% gives a 1
  const rating = Math.ceil(scoreRaw / 10);
  return Math.max(1, Math.min(10, rating));
}

export function getInterpretation(scorePracticeRating: number): string {
  if (scorePracticeRating >= 9) {
    return '🎉 Exceptionellt! Du har mycket stark logisk förmåga. Detta resultat ligger i toppen av alla testtagare.';
  }
  if (scorePracticeRating >= 7) {
    return '👍 Mycket bra! Du ligger klart över genomsnittet och visar god problemlösningsförmåga.';
  }
  if (scorePracticeRating >= 5) {
    return '💪 Bra jobbat! Du ligger runt genomsnittet. Fortsätt träna för att förbättra din poäng ytterligare.';
  }
  if (scorePracticeRating >= 3) {
    return '📚 Fortsätt öva! Med mer träning kommer ditt resultat att förbättras. Fokusera på att känna igen mönster.';
  }
  return '🎯 Början är alltid svårast! Gör fler övningar för att utveckla din logiska förmåga. Varje test gör dig bättre.';
}

export function calculateTimeBonus(timeSpent: number, timeEstimate: number): number {
  // Optional: Could give bonus for completing quickly
  // Not implemented in MVP
  return 0;
}
