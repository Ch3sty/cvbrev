/**
 * Parametric data model for minimal icon logic test V2
 * All cells are defined by parameters, not raw SVG
 */

export type Angle = number; // degrees 0-359

// --- Old types from v1 (kept for backwards compatibility) ---
export type RingTicks = { kind: 'ring_ticks'; indices: number[] };
export type TDot = { kind: 'T_dot'; rotation: 0 | 90 | 180 | 270; dot: -1 | 0 | 1 };
export type PlusDot = { kind: 'plus_dot'; rotation: 0 | 90 | 180 | 270; dot: -1 | 0 | 1 };

// ===================================================
// --- NEW TYPES FOR TEST PACKAGE V2 ---
// ===================================================

// For Q1, Q9, Q10: Generic polygon where 0 sides is a circle.
export type Polygon = {
  kind: 'polygon';
  sides: 0 | 3 | 4 | 5 | 6;
  fill: boolean;
  rotation?: Angle;
};

// For Q2, Q13: Specific forms used in mirroring and transformation rules.
export type HalfCircle = { kind: 'half_circle'; rotation: Angle };
export type Pointer = { kind: 'pointer'; rotation: Angle; fill: boolean };
export type Corner = { kind: 'corner'; rotation: Angle; mirror_h?: boolean; mirror_v?: boolean };

// For Q3: Represents a cell with a certain number of intersection points.
export type Intersections = { kind: 'intersections'; count: number };

// For Q4: A small dot in relation to a larger shape.
export type Containment = {
  kind: 'containment';
  shape: 'circle' | 'square' | 'triangle';
  position: -1 | 0 | 1; // Inside, On line, Outside
};

// For Q5: Parts that combine to form a whole.
export type Piece = {
  kind: 'piece';
  shape: 'square' | 'circle' | 'rhombus' | 'triangle';
  piece: 'full' | 'top_right' | 'bottom_left' | 'top' | 'bottom' | 'left' | 'right';
};

// For Q6, Q14: A set of named lines for subtraction and XOR.
export type LineName =
  | 'frame' | 'diag_down' | 'diag_up' | 'cross'
  | 'vert' | 'horiz' | 'top' | 'bottom' | 'left' | 'right';
export type Lines = { kind: 'lines'; lines: LineName[] };

// For Q7: A dot in an implicit 3x3 grid.
export type GridDot = { kind: 'grid_dot'; x: -1 | 0 | 1; y: -1 | 0 | 1 };

// For Q8, Q15: A group of identical shapes.
export type Group = {
  kind: 'group';
  shape: 'circle' | 'square' | 'triangle';
  count: number;
  pos?: 'L' | 'C' | 'R'; // Left, Center, Right
  layout?: 'vert' | 'horiz'; // For arrangement
};

// For Q11: Simple dots with count (no specific shape, just filled circles)
export type Dots = {
  kind: 'dots';
  count: number; // Number of dots to display
  layout?: 'standard' | 'vertical' | 'horizontal'; // Optional layout pattern
};

// For Q12: Named icon shapes used in Latin square
export type Icon = {
  kind: 'icon';
  shape: 'arrow' | 'cross' | 'L'; // Three distinct icon types
  rotation: Angle;
};

// --- Main type that collects all possible cell types ---
export type Cell =
  | RingTicks     // From v1
  | TDot          // From v1
  | PlusDot       // From v1
  | Polygon       // New for v2
  | HalfCircle    // New for v2
  | Pointer       // New for v2
  | Corner        // New for v2
  | Intersections // New for v2
  | Containment   // New for v2
  | Piece         // New for v2
  | Lines         // New for v2
  | GridDot       // New for v2
  | Group         // New for v2
  | Dots          // New for v2 (Q11)
  | Icon;         // New for v2 (Q12)

// --- Data structure for a complete question ---
export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  showGrid?: boolean;         // Optional visual reference frame
  grid: (Cell | null)[][];    // 3×3 matrix where R3C3 is null
  options: Cell[];            // Exactly 6 answer options (A-F)
  correctAnswer: number;      // Index 0-5 for correct answer
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
  testType: 'matrislogik-avancerad';
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
