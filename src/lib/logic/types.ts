/**
 * Parametric data model for minimal icon logic test V3
 * All cells are defined by parameters, not raw SVG
 */

export type Angle = number; // degrees 0-359

// ===================================================
// --- CELL TYPES FOR TEST V3 (Grundnivå) ---
// ===================================================

// For Q1: Dots with specific position in frame
export type Dots = {
  kind: 'dots';
  count: number; // Number of dots (1-3)
  pos?: 'T' | 'C' | 'B'; // Top, Center, Bottom
  layout?: 'vertical' | 'horizontal'; // Optional layout pattern
};

// For Q2: Arrow with rotation and fill
export type Arrow = {
  kind: 'arrow';
  rotation: Angle;
  fill: boolean;
};

// For Q3: Named icon shapes (pacman, star, heart)
export type Icon = {
  kind: 'icon';
  shape: 'pacman' | 'star' | 'heart';
  rotation?: Angle;
};

// For Q4: Simple shape with fill property
export type Fill = {
  kind: 'fill';
  shape: 'square' | 'circle' | 'triangle';
  fill: boolean;
};

// For Q5: Corner dot in frame corners
export type CornerDot = {
  kind: 'corner_dot';
  pos: 'TL' | 'TR' | 'BR' | 'BL' | null; // TopLeft, TopRight, BottomRight, BottomLeft
};

// For Q6: Named lines for union/subtraction operations
export type LineName =
  | 'horiz' | 'vert' | 'cross'
  | 'diag_down' | 'diag_up'
  | 'frame_h' | 'frame_v' | 'frame'
  | 'top' | 'bottom' | 'left' | 'right';

export type Lines = {
  kind: 'lines';
  lines: LineName[];
};

// For Q7: Shapes with shading levels
export type ShadedShape = {
  kind: 'shaded_shape';
  shape: 'circle' | 'square' | 'triangle';
  fill: 'none' | 'gray' | 'black';
  rotation?: Angle;
};

// For Q8: Endpoints count (line endings)
export type Endpoints = {
  kind: 'endpoints';
  count: number; // Number of line endpoints (0-4)
  shape?: 'rhombus_open' | 'cross_diags' | 'triangle_open'; // Optional specific shape
};

// For Q9: Reflected shapes (mirroring)
export type ReflectedShape = {
  kind: 'reflected_shape';
  shape: 'U' | 'arc' | 'wedge';
  mirror_v?: boolean; // Vertical mirror
  mirror_h?: boolean; // Horizontal mirror
  rotation?: Angle;
};

// For Q10: Intersection of two shapes (A ∩ B)
export type Intersection = {
  kind: 'intersection';
  shape1: 'rect_full' | 'circle' | 'rect_top' | 'rect_left' | 'rect_top_left' | 'tri_bottom' | 'circle_half_bottom' | 'segment';
  shape2: 'rect_full' | 'circle' | 'rect_top' | 'rect_left' | 'rect_top_left' | 'tri_bottom' | 'circle_half_bottom' | 'segment';
  fill?: 'none' | 'black';
};

// For Q11: Orbital dot around central circle
export type OrbitalDot = {
  kind: 'orbital_dot';
  step: number; // 0-7 for 8 positions (0°, 45°, 90°, ... 315°)
};

// For Q12: Swap positions (black and white circles)
export type Swap = {
  kind: 'swap';
  arrangement: 'horiz' | 'vert' | 'diag'; // Horizontal, Vertical, Diagonal
  black_pos: 1 | 2; // Position of black circle (1 or 2)
  shape?: 'square'; // Optional shape variation
};

// For Q13: Sized shapes with progression
export type SizedShape = {
  kind: 'sized_shape';
  shape: 'rhombus' | 'square' | 'triangle';
  size: 'S' | 'M' | 'L'; // Small, Medium, Large
  fill?: boolean;
  rotation?: Angle;
};

// For Q14: Shape subtraction (outer - inner)
export type Subtraction = {
  kind: 'subtraction';
  outer: 'square' | 'circle' | 'triangle';
  inner: 'square' | 'circle' | 'triangle' | 'none';
  fill?: boolean;
};

// For Q15: Sweeping lines from center
export type Sweep = {
  kind: 'sweep';
  steps: number; // Number of lines (1-4)
  rotation?: Angle;
};

// For grid dot (used in some questions for position tracking)
export type GridDot = {
  kind: 'grid_dot';
  x: number; // Grid x position
  y: number; // Grid y position
};

// --- Main type that collects all possible cell types ---
export type Cell =
  | Dots
  | Arrow
  | Icon
  | Fill
  | CornerDot
  | Lines
  | ShadedShape
  | Endpoints
  | ReflectedShape
  | Intersection
  | OrbitalDot
  | Swap
  | SizedShape
  | Subtraction
  | Sweep
  | GridDot;

// --- Data structure for a complete question ---
export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  showGrid?: boolean; // Optional visual reference frame
  grid: (Cell | null)[][]; // 3×3 matrix where R3C3 is null
  options: Cell[]; // Exactly 6 answer options (A-F)
  correctAnswer: number; // Index 0-5 for correct answer
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
