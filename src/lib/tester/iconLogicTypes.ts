// ============================================================================
// ICON LOGIC TEST TYPES
// ============================================================================

/**
 * Icon Logic Cell - contains raw SVG markup
 * This is different from Matrislogik which uses Shape objects
 */
export interface IconLogicCell {
  svg: string; // Raw SVG markup (complete <svg>...</svg>)
}

export type IconLogicMatrix3x3 = [
  [IconLogicCell, IconLogicCell, IconLogicCell],
  [IconLogicCell, IconLogicCell, IconLogicCell],
  [IconLogicCell, IconLogicCell, IconLogicCell]
];

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type IconPatternType =
  | 'rotation'          // Rotation patterns (spokes, T-shape, triangle)
  | 'quantity'          // Number of elements (spokes count)
  | 'position'          // Position of elements (dot placement)
  | 'latin-square'      // Each symbol once per row/column
  | 'sequential'        // Sequential progression (+45° etc)
  | 'diagonal-rule'     // Diagonal-based rules
  | 'matrix-rule';      // Complex matrix relationships

export interface IconLogicServerQuestion {
  id: string; // UUID
  testType: 'icon-logic';
  difficulty: 1 | 2 | 3; // 1=easy, 2=medium, 3=hard
  matrix: IconLogicMatrix3x3; // Last cell [2][2] is always empty (placeholder)
  options: IconLogicCell[]; // 6 answer options
  correctAnswer: number; // index 0-5
  explanation: string;
  patternTypes: IconPatternType[];
  timeEstimateSeconds: number;
}

export interface IconLogicClientQuestion {
  id: string;
  difficulty: 1 | 2 | 3;
  matrix: IconLogicMatrix3x3;
  options: IconLogicCell[];
  // NO correctAnswer or explanation here!
}

// ============================================================================
// TEST SESSION & RESULTS
// ============================================================================

export interface IconLogicTestSession {
  sessionToken: string; // JWT
  userId: string;
  testType: 'icon-logic';
  questions: IconLogicClientQuestion[]; // WITHOUT answers
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
}

export interface IconLogicUserAnswer {
  questionId: string;
  userAnswer: number; // 0-5 or -1 for no answer
  timeSpent?: number; // seconds
}

export interface IconLogicQuestionBreakdown {
  questionId: string;
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  timeSpent: number;
  difficulty: number;
  patternTypes: IconPatternType[];
  matrix: IconLogicMatrix3x3;
  options: IconLogicCell[];
}

export interface IconLogicTestResult {
  attemptId: string;
  scoreRaw: number; // % correct (0-100)
  scorePracticeRating: number; // 1-10
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  breakdown: IconLogicQuestionBreakdown[];
  interpretation: string; // Text feedback based on score
  completedAt: string;
}
