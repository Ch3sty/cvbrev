// src/logic/types.v4.ts
export type Angle = number; // Grader, 0–359

// --- TYPER SPECIFIKA FÖR V4 ---

// Q1, Q15: Progression av antal prickar
export type Dot = { kind: 'dots'; count: 1 | 2 | 3 | 4 | 5; pos: 'T' | 'C' | 'B'; layout?: 'horiz' | 'vertical' };

// Q2: Roterande L-form
export type LShape = { kind: 'l_shape'; rotation: Angle; fill: 'none' | 'gray' | 'black' };

// Q3: Latin square med ikoner
export type Icon = { kind: 'icon'; shape: 'pacman' | 'star' | 'heart'; rotation?: Angle, fill?: boolean };

// Q4: Fylld eller ofylld form
export type Fill = { kind: 'fill'; shape: 'square' | 'circle'; fill: boolean };

// Q5: Prick i ett hörn
export type CornerDot = { kind: 'corner_dot'; pos: 'TL' | 'TR' | 'BR' | 'BL' | null };

// Q6, Q12: Union/XOR av linjer
export type LineName = 'horiz'|'vert'|'diag_down'|'diag_up'|'frame_h'|'frame_v'|'frame'|'cross';
export type Lines = { kind: 'lines'; lines: LineName[] };

// Q7, Q13 (delvis), Q14: Form med olika fyllnadsgrad
export type ShadedShape = { kind: 'shaded_shape'; shape: 'circle'|'square'|'triangle'; fill: 'none'|'gray'|'black'; rotation?: Angle };

// Q8: Räkna slutpunkter
export type Endpoints = { kind: 'endpoints'; count: 0 | 2 | 3 | 4; shape?: string };

// Q9: Vertikal spegling
export type ReflectedShape = { kind: 'flag' | 'arc' | 'wedge'; mirror_v?: boolean; mirror_h?: boolean, rotation?: Angle };

// Q10: Skärning mellan former
export type Intersection = { kind: 'intersection'; shape1: string; shape2: string, fill?: 'none' | 'black' };

// Q11: Kretsande prick
export type OrbitalDot = { kind: 'orbital_dot'; step: number };

// Q12: Två objekt som byter plats
export type Swap = { kind: 'swap'; arrangement: 'diag'|'vert'|'horiz'; black_pos: 1 | 2; shape?: 'circle' | 'square' };

// Q13: Progression av storlek
export type SizedShape = { kind: 'sized_shape'; shape: 'rhombus'|'square'|'triangle'; size: 'S'|'M'|'L'; fill?: boolean, rotation?: Angle };

// Q14: Subtraktion av form
export type Subtraction = { kind: 'subtraction'; outer: 'square'|'circle'|'triangle'; inner: 'square'|'circle'|'triangle'|'none'; fill?: boolean };

// Q14: Sudoku-liknande cell
export type Sudoku = { kind: 'sudoku'; shape: 'arrow'|'plus'|'moon'; fill: 'black'|'gray'|'none'; rotation?: Angle };

// Q15: Svepande linje
export type Sweep = { kind: 'sweep'; steps: 1 | 2 | 3 | 4; rotation?: Angle };

// --- HUVUDTYP OCH FRÅGESTruktur ---
export type Cell = 
  | Dot | LShape | Icon | Fill | CornerDot | Lines | ShadedShape | Endpoints 
  | ReflectedShape | Intersection | OrbitalDot | Swap | SizedShape | Subtraction | Sudoku | Sweep;

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