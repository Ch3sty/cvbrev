// ============================================================================
// SHAPE & MATRIX TYPES
// ============================================================================

export type ShapeForm = 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';

export type ShapeFill = 'solid' | 'striped' | 'dotted' | 'crosshatch' | 'empty';

export type ShapeColor = 'blue' | 'red' | 'green' | 'black' | 'yellow' | 'purple';

export type ShapeSize = 'small' | 'medium' | 'large';

export interface Shape {
  form: ShapeForm;
  fill: ShapeFill;
  color: ShapeColor;
  size: ShapeSize;
  rotation?: number; // grader: 0, 45, 90, 135, 180, 225, 270, 315
}

export interface MatrixCell {
  shapes: Shape[];
}

export type Matrix3x3 = [
  [MatrixCell, MatrixCell, MatrixCell],
  [MatrixCell, MatrixCell, MatrixCell],
  [MatrixCell, MatrixCell, MatrixCell]
];

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type PatternType =
  | 'color-change'      // Färgförändring (solid → striped → dotted → empty)
  | 'rotation'          // Rotation (0° → 90° → 180°)
  | 'quantity'          // Antal shapes ändras
  | 'structural'        // Overlap, subtraction, addition
  | 'spatial'           // Spatial förflyttning
  | 'size-change'       // Storlek ändras
  | 'shape-morph';      // Form ändras

export interface ServerQuestion {
  id: string; // UUID
  testType: 'matrislogik-classic';
  difficulty: 1 | 2 | 3 | 4 | 5;
  matrix: Matrix3x3; // Sista cellen (2,2) är alltid empty
  options: MatrixCell[]; // 6 svarsalternativ
  correctAnswer: number; // index 0-5
  explanation: string;
  patternTypes: PatternType[];
  timeEstimateSeconds: number; // Genomsnittlig tid
}

export interface ClientQuestion {
  id: string;
  difficulty: number; // Endast för UI
  matrix: Matrix3x3;
  options: MatrixCell[];
  // INGEN correctAnswer eller explanation här!
}

// ============================================================================
// TEST SESSION & RESULTS
// ============================================================================

export interface TestSession {
  sessionToken: string; // JWT
  userId: string;
  testType: 'matrislogik-classic';
  questions: ClientQuestion[]; // UTAN svar
  startedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
}

export interface UserAnswer {
  questionId: string;
  userAnswer: number; // 0-5 or -1 for no answer
  timeSpent?: number; // sekunder
}

export interface QuestionBreakdown {
  questionId: string;
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  explanation: string;
  timeSpent: number;
  difficulty: number;
  patternTypes: PatternType[];
  matrix: Matrix3x3;
  options: MatrixCell[];
}

export interface TestResult {
  attemptId: string;
  scoreRaw: number; // % rätt (0-100)
  scorePracticeRating: number; // 1-10
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  breakdown: QuestionBreakdown[];
  interpretation: string; // Textfeedback baserat på score
  completedAt: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testType: string;
  testMode: string;
  scoreRaw: number;
  scorePracticeRating: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface UserStats {
  userId: string;
  matrislogikAttempts: number;
  matrislogikBestScore: number;
  matrislogikAvgScore: number;
  totalTestTimeSeconds: number;
  streakDays: number;
  lastTestDate: string | null;
  achievements: string[];
}
