# 🚀 Implementeringsguide för Logiktest v2

Detta dokument beskriver hur man tekniskt implementerar det nya frågepaketet (`v2`) för logiktester. Det bygger vidare på den befintliga arkitekturen men introducerar nya datatyper och renderingslogik.

## 1. Datamodell: Nya Typer för v2 (`types.ts`)

För att kunna rendera de nya frågorna behöver den befintliga `Cell`-typen utökas med nya `kind`-varianter.

```typescript
// src/logic/types.ts

// Befintliga typer (behålls för bakåtkompatibilitet)
export type RingTicks = { kind: 'ring_ticks'; indices: number[] };
export type TDot      = { kind: 'T_dot'; rotation: 0|90|180|270; dot: -1|0|1 };
export type PlusDot   = { kind: 'plus_dot'; rotation: 0|90|180|270; dot: -1|0|1 };

// --- NYA TYPER FÖR V2 ---

// Q1, Q9, Q10: Generisk polygon
export type Polygon = {
  kind: 'polygon';
  sides: 0 | 3 | 4 | 5 | 6; // 0 för cirkel
  fill: boolean;
  rotation?: number; // i grader
};

// Q2, Q13: Specifika former med spegling
export type HalfCircle = { kind: 'half_circle'; rotation: number };
export type Pointer = { kind: 'pointer'; rotation: number; fill: boolean };
export type Corner = { kind: 'corner'; rotation: number; mirror_h?: boolean; mirror_v?: boolean };

// Q3: Räkna skärningspunkter
export type Intersections = { kind: 'intersections'; count: number }; // 0-8

// Q4: Inre/yttre position
export type Containment = {
  kind: 'containment';
  shape: 'circle' | 'square' | 'triangle';
  position: -1 | 0 | 1; // Inuti, På, Utanför
  rotation?: number;
};

// Q5: Form-kombination
export type Piece = {
  kind: 'piece';
  shape: 'square' | 'circle' | 'rhombus' | 'triangle';
  piece: 'full' | 'top_right' | 'bottom_left' | 'top' | 'bottom' | 'left' | 'right';
};

// Q6, Q14: Linjekombinationer (Subtraktion/XOR)
export type LineName = 'frame'|'diag_down'|'diag_up'|'cross'|'vert'|'horiz'|'top'|'bottom'|'left'|'right';
export type Lines = { kind: 'lines'; lines: LineName[] };

// Q7: Position i inre rutnät
export type GridDot = { kind: 'grid_dot'; x: -1 | 0 | 1; y: -1 | 0 | 1 };

// Q8, Q15: Grupper av element
export type Group = {
  kind: 'group';
  shape: 'circle' | 'square' | 'triangle';
  count: number;
  pos?: 'L' | 'C' | 'R'; // Vänster, Center, Höger
  layout?: 'vert' | 'horiz';
};

// --- HUVUDTYP ---
export type Cell =
  | RingTicks
  | TDot
  | PlusDot
  // Nya typer
  | Polygon
  | HalfCircle
  | Pointer
  | Corner
  | Intersections
  | Containment
  | Piece
  | Lines
  | GridDot
  | Group;