# 🚀 Implementeringsguide för Logiktest v3 (Grundnivå)

Detta dokument beskriver den tekniska implementationen för `v3`-testpaketet. Fokus ligger på enkla, visuellt entydiga regler och en robust implementation som förhindrar feltolkningar.

## 1. Datamodell (`types.v3.ts`)

Typerna för detta test är designade för att vara direkta och lätta att rendera. `showGrid` har lagts till för att explicit visa en referensram i positionsbaserade frågor.

```typescript
// src/logic/types.v3.ts
export type Angle = number; // Grader, 0–359

// --- TYPER SPECIFIKA FÖR V3 ---

// Q1: Progression av antal prickar
export type Dot = { kind: 'dots'; count: 1 | 2 | 3; pos: 'T' | 'C' | 'B'; layout?: 'horiz' | 'vert' };

// Q2: Roterande pil
export type Arrow = { kind: 'arrow'; rotation: Angle; fill: boolean };

// Q3: Latin square med ikoner
export type Icon = { kind: 'icon'; shape: 'pacman' | 'star' | 'heart'; rotation?: Angle };

// Q4: Fylld eller ofylld form
export type Fill = { kind: 'fill'; shape: 'square' | 'circle'; fill: boolean };

// Q5: Prick i ett hörn
export type CornerDot = { kind: 'corner_dot'; pos: 'TL' | 'TR' | 'BR' | 'BL' | null };

// Q6: Union av linjer
export type Lines = { kind: 'lines'; lines: ('horiz'|'vert'|'diag_down'|'diag_up'|'frame_h'|'frame_v'|'frame'|'cross')[] };

// Q7: Form med olika fyllnadsgrad
export type ShadedShape = { kind: 'shaded_shape'; shape: 'circle'|'square'|'triangle'; fill: 'none'|'gray'|'black'; rotation?: Angle };

// Q8: Räkna slutpunkter
export type Endpoints = { kind: 'endpoints'; count: 0 | 2 | 3 | 4; shape?: string };

// Q9: Vertikal spegling
export type ReflectedShape = { kind: 'reflected_shape'; shape: 'U'|'arc'|'wedge'; mirror_v?: boolean; mirror_h?: boolean, rotation?: Angle };

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

// Q15: Svepande linje
export type Sweep = { kind: 'sweep'; steps: 1 | 2 | 3 | 4; rotation?: Angle };

// --- HUVUDTYP OCH FRÅGESTruktur ---
export type Cell = 
  | Dot | Arrow | Icon | Fill | CornerDot | Lines | ShadedShape | Endpoints 
  | ReflectedShape | Intersection | OrbitalDot | Swap | SizedShape | Subtraction | Sweep;

export type Question = {
  id: string;
  title: string;
  rule: string;
  difficulty: 1 | 2 | 3;
  showGrid?: boolean; // **VIKTIGT: Används för att visa referensram**
  grid: (Cell | null)[][];
  options: Cell[];
  correctAnswer: number;
};