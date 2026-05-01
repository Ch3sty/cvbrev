// Premium-typsystem för matrislogik-grund (v5).
// Sju primitiver — varje cell-typ har ett tydligt syfte och konsekvent
// renderingsstil. Inga specialfall, inga gamla buggar.

export type Fill = 'none' | 'gray' | 'black';

export type DotsCell = {
  kind: 'dots';
  count: 1 | 2 | 3 | 4;
  arrangement?: 'row' | 'col' | 'square' | 'triangle';
};

export type ShapeCell = {
  kind: 'shape';
  shape: 'circle' | 'square' | 'triangle' | 'diamond';
  fill: Fill;
  size?: 'sm' | 'md' | 'lg';
};

export type ArrowCell = {
  kind: 'arrow';
  direction: 'up' | 'right' | 'down' | 'left';
  fill: 'none' | 'black';
};

export type LineSegment =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'diag_down'
  | 'diag_up'
  | 'horiz_mid'
  | 'vert_mid';

export type LinesCell = {
  kind: 'lines';
  segments: LineSegment[];
};

export type RotationCell = {
  kind: 'rotation';
  shape: 'L' | 'T' | 'F';
  angle: 0 | 90 | 180 | 270;
  fill: Fill;
};

export type CornerDotCell = {
  kind: 'corner_dot';
  pos: 'TL' | 'TR' | 'BR' | 'BL';
};

export type CompositeCell = {
  kind: 'composite';
  outer: 'square' | 'circle' | 'triangle';
  inner: 'circle' | 'square' | 'triangle' | 'none';
  mode: 'inside' | 'subtract';
};

export type V5Cell =
  | DotsCell
  | ShapeCell
  | ArrowCell
  | LinesCell
  | RotationCell
  | CornerDotCell
  | CompositeCell;

export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  grid: (V5Cell | null)[][];
  options: V5Cell[];
  correctAnswer: number;
};
