/**
 * Parametric data model for minimal icon logic test
 * All cells are defined by parameters, not raw SVG
 */

export type Angle = number; // degrees 0-359

/**
 * Ring with ticks at specified indices
 * indices: 0..7 => 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
 */
export type RingTicks = {
  kind: 'ring_ticks';
  indices: number[]; // 0..7
};

/**
 * T-shape with rotation and dot position
 * rotation: 0, 90, 180, 270
 * dot: -1 (left), 0 (center), 1 (right) - relative to T's horizontal arm after rotation
 */
export type TDot = {
  kind: 'T_dot';
  rotation: 0 | 90 | 180 | 270;
  dot: -1 | 0 | 1;
};

/**
 * Plus-shape with rotation and dot position
 * rotation: 0, 90, 180, 270
 * dot: -1 (left), 0 (center), 1 (right) - relative to plus's horizontal arm after rotation
 */
export type PlusDot = {
  kind: 'plus_dot';
  rotation: 0 | 90 | 180 | 270;
  dot: -1 | 0 | 1;
};

/**
 * Symbol cell: X, O, or Triangle (Δ)
 */
export type SymbolCell = {
  kind: 'symbol';
  name: 'X' | 'O' | 'Δ';
  rotation?: Angle;
  solid?: boolean;
};

/**
 * All possible cell types
 */
export type Cell = RingTicks | TDot | PlusDot | SymbolCell;

/**
 * Question with 3x3 grid and 6 answer options
 */
export type Question = {
  id: string;
  title: string;
  rule: string;
  grid: (Cell | null)[][]; // 3x3; R3C3 (index [2][2]) is null (= ?)
  options: Cell[]; // exactly 6 (A-F)
  correctAnswer: number; // 0-5 (A-F)
};

/**
 * Client-safe question (without correctAnswer)
 */
export type ClientQuestion = Omit<Question, 'correctAnswer'>;

/**
 * User's answer to a question
 */
export type UserAnswer = {
  questionId: string;
  userAnswer: number; // 0-5 (A-F) or -1 for unanswered
  timeSpent: number; // seconds
};

/**
 * Test session
 */
export type TestSession = {
  sessionToken: string;
  userId: string;
  testType: 'matrislogik-minimal';
  questionIds: string[];
  startedAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
};

/**
 * Question breakdown for results
 */
export type QuestionBreakdown = {
  questionId: string;
  isCorrect: boolean;
  userAnswer: number; // -1 for unanswered
  correctAnswer: number;
  explanation: string;
  timeSpent: number;
  title: string;
  grid: (Cell | null)[][];
  options: Cell[];
};

/**
 * Test result
 */
export type TestResult = {
  attemptId: string;
  scoreRaw: number; // 0-100
  rating: number; // 1-10
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  breakdown: QuestionBreakdown[];
  interpretation: string;
  completedAt: string; // ISO 8601
};
