// src/logic/types.v6.ts
export type Angle = number; // Grader, 0–359
export type FillType = 'none' | 'gray' | 'black';

// --- TYPER SPECIFIKA FÖR V6 ---

// Q1: Roterande pil med fyllning
export type Arrow = { 
  kind: 'arrow'; 
  rotation: Angle; 
  fill: boolean; 
};

// Q2, Q11: Olika former på olika positioner
export type MultiShape = { 
  kind: 'multi_shape'; 
  shape: 'L' | 'T' | 'Z'; 
  pos: 'TL' | 'C' | 'BR'; 
  rotation?: Angle;
};

// Q3: Sammanslagning av element
export type CompositionItem = 'dot_tl' | 'dot_br' | 'square_tl' | 'square_br' | 'square_tr' | 'square_bl' | 'tri_t' | 'tri_b';
export type Composition = { 
  kind: 'composition'; 
  items: CompositionItem[];
};

// Q4: Analogiregel
export type Analogy = { 
  kind: 'analogy'; 
  shape: 'triangle' | 'l_shape' | 'pacman'; 
  rotation?: Angle; 
  dot?: boolean; 
  fill?: boolean;
};

// Q5, Q12: Union/XOR av linjer
export type LineName = 'horiz'|'vert'|'diag_down'|'diag_up'|'frame'|'cross'|'top'|'bottom';
export type Lines = {
  kind: 'lines';
  lines: LineName[];
};

// Q6: L-form med rotation, fill och vertikal spegling
export type LShape = {
  kind: 'l_shape';
  rotation: Angle;
  fill: boolean;
  mirror_v?: boolean;
};

// Q6: Villkorlig transformation
export type Pointer = { kind: 'pointer'; rotation: Angle; fill: boolean; mirror_v?: boolean };
export type ConditionalShape = LShape | Pointer; // Använder LShape

// Q7: Räkna slutna ytor
export type CountAreas = { 
  kind: 'count_areas'; 
  shape: 'X' | 'square' | 'divided_circle' | 'star_of_david' | 'double_ring' | 'hourglass' | 'four_squares' | 'overlapping_rings' | 'grid'; 
  dots?: number;
};

// Q8, Q14: Subtraktion med inverterad färg
export type SubtractionInverted = { 
  kind: 'subtraction_inv'; 
  base: 'square' | 'circle' | 'triangle' | 'none'; 
  line: 'diag_down' | 'horiz' | 'vert' | 'none';
};

// Q9: Sudoku-liknande cell
export type Sudoku = { 
  kind: 'sudoku'; 
  shape: 'arrow'|'plus'|'moon'; 
  fill: FillType; 
  rotation?: Angle 
};

// Q10, Q15: Addition av element
export type Dots = { 
  kind: 'dots'; 
  count: number; 
  pos: 'T' | 'C' | 'B'; 
  layout?: 'horiz' | 'vertical' 
};

// Q15: Tre variabler
export type ThreeVars = {
  kind: 'three_vars',
  shape: 'arrow' | 'T' | 'L',
  rotation: Angle,
  pos: 'TL' | 'C' | 'BR'
};

// Q9, Q13: Form med olika fyllnadsgrad
export type ShadedShape = {
  kind: 'shaded_shape';
  shape: 'circle' | 'square' | 'triangle';
  fill: 'none' | 'gray' | 'black';
  rotation?: Angle;
};

// --- HUVUDTYP OCH FRÅGESTruktur ---
export type Cell =
  | Arrow
  | MultiShape
  | Composition
  | Analogy
  | Lines
  | LShape
  | Pointer
  | CountAreas
  | SubtractionInverted
  | Sudoku
  | Dots
  | ThreeVars
  | ShadedShape;

export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  showGrid?: boolean;
  grid: (Cell | null)[][];
  options: Cell[];
  correctAnswer: number;
};