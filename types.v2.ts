// src/logic/types.v2.ts

// --- Grundläggande typer ---
export type Angle = number; // Grader, 0–359

// --- Behåll gamla typer för bakåtkompatibilitet om det behövs ---
export type RingTicks = { kind: 'ring_ticks'; indices: number[] };
export type TDot      = { kind: 'T_dot'; rotation: 0|90|180|270; dot: -1|0|1 };
export type PlusDot   = { kind: 'plus_dot'; rotation: 0|90|180|270; dot: -1|0|1 };

// ===================================================
// --- NYA TYPER FÖR TESTPAKET V2 ---
// ===================================================

// För Q1, Q9, Q10: Generisk polygon där 0 sidor är en cirkel.
export type Polygon = {
  kind: 'polygon';
  sides: 0 | 3 | 4 | 5 | 6;
  fill: boolean;
  rotation?: Angle;
};

// För Q2, Q13: Specifika former som används i speglings- och transformationsregler.
export type HalfCircle = { kind: 'half_circle'; rotation: Angle };
export type Pointer = { kind: 'pointer'; rotation: Angle; fill: boolean };
export type Corner = { kind: 'corner'; rotation: Angle; mirror_h?: boolean; mirror_v?: boolean };

// För Q3: Representerar en cell med ett visst antal skärningspunkter.
export type Intersections = { kind: 'intersections'; count: number };

// För Q4: En liten prick i förhållande till en större form.
export type Containment = {
  kind: 'containment';
  shape: 'circle' | 'square' | 'triangle';
  position: -1 | 0 | 1; // Inuti, På linjen, Utanför
};

// För Q5: Delar som kombineras för att bilda en helhet.
export type Piece = {
  kind: 'piece';
  shape: 'square' | 'circle' | 'rhombus' | 'triangle';
  piece: 'full' | 'top_right' | 'bottom_left' | 'top' | 'bottom' | 'left' | 'right';
};

// För Q6, Q14: En uppsättning namngivna linjer för subtraktion och XOR.
export type LineName = 
  | 'frame' | 'diag_down' | 'diag_up' | 'cross' 
  | 'vert' | 'horiz' | 'top' | 'bottom' | 'left' | 'right';
export type Lines = { kind: 'lines'; lines: LineName[] };

// För Q7: En prick i ett implicit 3x3-rutnät.
export type GridDot = { kind: 'grid_dot'; x: -1 | 0 | 1; y: -1 | 0 | 1 };

// För Q8, Q15: En grupp av identiska former.
export type Group = {
  kind: 'group';
  shape: 'circle' | 'square' | 'triangle';
  count: number;
  pos?: 'L' | 'C' | 'R'; // Vänster, Center, Höger
  layout?: 'vert' | 'horiz'; // För arrangemang
};


// --- Huvudtypen som samlar alla möjliga celltyper ---
export type Cell =
  | RingTicks     // Från v1
  | TDot          // Från v1
  | PlusDot       // Från v1
  | Polygon       // Ny för v2
  | HalfCircle    // Ny för v2
  | Pointer       // Ny för v2
  | Corner        // Ny för v2
  | Intersections // Ny för v2
  | Containment   // Ny för v2
  | Piece         // Ny för v2
  | Lines         // Ny för v2
  | GridDot       // Ny för v2
  | Group;        // Ny för v2

// --- Datastruktur för en komplett fråga ---
export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  grid: (Cell | null)[][];    // 3×3 matris där R3C3 är null
  options: Cell[];            // Exakt 6 svarsalternativ (A-F)
  correctAnswer: number;      // Index 0-5 för rätt svar
};