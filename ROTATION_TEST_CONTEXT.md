# Rotation & Mönster Test - Implementation Context

## Overview
This document contains full context for implementing a new cognitive test called "Rotation & Mönster" (Rotation & Patterns). This test uses striped patterns with rotation to create a harder alternative to the matrislogik-classic test.

## Critical Design Constraints

### Visual Clarity Requirements
❌ **AVOID:**
- Solid overlapping forms (invisible when overlapped)
- Symmetrical single strokes (— or | look identical at 180°)
- Dots/circles rotating (rotation not visible)
- Any form where rotation creates identical appearance

✅ **USE:**
- Striped patterns with clear asymmetry
- Diagonal strokes that show rotation
- Cross/plus patterns (X becomes + at 45°)
- L-shapes, stairs, partial coverage
- Forms with different lengths/spacing

### User Feedback on Visual Clarity
- "En symbol som är solid och svart som överlappar en annan symbol går inte att se"
- "Man kommer inte kunna se om en prick roterar eller inte"
- "Ett sträck som ser ut så här | eller - ser likadant ut om man vänder dem 180 grader"

## Test Structure

**Name:** Rotation & Mönster
**Questions:** 15 total
**Difficulty:** Harder than matrislogik-classic
**URL:** `/dashboard/tester/rotation-monster` (Swedish URL-friendly)

### Difficulty Progression

**Nivå 1 (Q1-5):** Grundläggande rotation
- Single diagonal stroke rotation
- Simple pattern changes
- Clear visual differences

**Nivå 2 (Q6-10):** Kombinerad rotation
- Outer form + inner pattern rotate independently
- Asymmetric patterns (stairs, L-stripes)
- Two-element transformations

**Nivå 3 (Q11-15):** Avancerad logik
- Counter-rotation (outer vs inner opposite directions)
- XOR/Boolean operations on patterns
- Progressive size + rotation
- Nested transformations

## Type Definition

### New Type: StripedRotation

```typescript
// Add to src/lib/logicTestV4/types.v4.ts

export type StripedRotation = {
  kind: 'striped_rotation';
  outer: 'circle' | 'square' | 'triangle' | 'half_circle' | 'l_shape';
  outerRotation: Angle;
  pattern: 'diagonal' | 'cross' | 'plus' | 'l_stripes' | 'stairs' | 'partial';
  patternRotation: Angle;
  asymmetry?: 'different_lengths' | 'uneven_spacing' | 'partial_coverage';
  fill?: 'none' | 'outer';
};

// Update Cell union type
export type Cell =
  | Dot | LShape | Icon | Fill | CornerDot | Lines | ShadedShape | Endpoints
  | ReflectedShape | ExclusiveOr | OrbitalDot | Swap | SizedShape | Subtraction
  | Sudoku | Sweep | StripedRotation;
```

## Pattern Specifications

### Pattern: 'diagonal'
**Visual:** Single thick diagonal stroke at various angles
- 0° = NE diagonal (↗)
- 45° = Vertical (|)
- 90° = NW diagonal (↖)
- 135° = Horizontal (—)
- Asymmetry: Different stroke thickness at ends

### Pattern: 'cross'
**Visual:** X-shape that transforms to + at 45°
- 0° = X pattern
- 45° = + pattern
- Visual distinction clear at all angles

### Pattern: 'plus'
**Visual:** + shape
- 0° = + pattern
- 45° = X pattern
- Inverse of 'cross'

### Pattern: 'l_stripes'
**Visual:** L-shaped stripes (3 horizontal, 3 vertical forming L)
- Clear rotation visibility
- Asymmetric by nature
- Stripes: 3 horizontal top, 3 vertical right

### Pattern: 'stairs'
**Visual:** 3 diagonal lines of different lengths
- Short, Medium, Long creating stair effect
- Highly asymmetric
- Clear visual at all rotations

### Pattern: 'partial'
**Visual:** Stripes covering only half/section of outer form
- Creates clear asymmetry
- Visible rotation as coverage area moves

## Renderer Implementation

### SVG Structure

```typescript
// Add to src/lib/logicTestV4/renderers.v4.tsx

case 'striped_rotation': {
  const outerShapes: Record<string, React.ReactElement> = {
    circle: <circle cx="50" cy="50" r="35" />,
    square: <rect x="15" y="15" width="70" height="70" />,
    triangle: <path d="M50 15 L85 85 L15 85 Z" />,
    half_circle: <path d="M50 15 A 35 35 0 0 1 50 85 Z" />,
    l_shape: <path d="M 20 20 L 20 80 L 80 80 L 80 70 L 30 70 L 30 20 Z" />
  };

  const patternElements = (pattern: string, rotation: number) => {
    const baseStroke = { stroke: STROKE_COLOR, strokeWidth: 2, fill: 'none' };

    switch(pattern) {
      case 'diagonal':
        return <line x1="20" y1="20" x2="80" y2="80" {...baseStroke} />;

      case 'cross':
        return (
          <>
            <line x1="25" y1="25" x2="75" y2="75" {...baseStroke} />
            <line x1="75" y1="25" x2="25" y2="75" {...baseStroke} />
          </>
        );

      case 'plus':
        return (
          <>
            <line x1="50" y1="20" x2="50" y2="80" {...baseStroke} />
            <line x1="20" y1="50" x2="80" y2="50" {...baseStroke} />
          </>
        );

      case 'l_stripes':
        return (
          <>
            <line x1="30" y1="30" x2="70" y2="30" {...baseStroke} />
            <line x1="30" y1="40" x2="70" y2="40" {...baseStroke} />
            <line x1="30" y1="50" x2="70" y2="50" {...baseStroke} />
            <line x1="60" y1="50" x2="60" y2="70" {...baseStroke} />
            <line x1="65" y1="50" x2="65" y2="70" {...baseStroke} />
            <line x1="70" y1="50" x2="70" y2="70" {...baseStroke} />
          </>
        );

      case 'stairs':
        return (
          <>
            <line x1="30" y1="35" x2="40" y2="35" {...baseStroke} strokeWidth={3} />
            <line x1="40" y1="50" x2="60" y2="50" {...baseStroke} strokeWidth={3} />
            <line x1="50" y1="65" x2="80" y2="65" {...baseStroke} strokeWidth={3} />
          </>
        );

      case 'partial':
        return (
          <>
            <line x1="35" y1="25" x2="65" y2="25" {...baseStroke} />
            <line x1="35" y1="35" x2="65" y2="35" {...baseStroke} />
            <line x1="35" y1="45" x2="65" y2="45" {...baseStroke} />
          </>
        );

      default:
        return null;
    }
  };

  const outer = outerShapes[cell.outer];
  if (!outer) return null;

  const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
  const fill = cell.fill === 'outer' ? FILL_GRAY : FILL_NONE;
  const outerStroke = cell.fill === 'outer' ? 'none' : STROKE_COLOR;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          {React.cloneElement(outer as React.ReactElement<any>, {
            transform: `rotate(${cell.outerRotation} 50 50)`
          })}
        </clipPath>
      </defs>

      {/* Outer form */}
      {React.cloneElement(outer as React.ReactElement<any>, {
        fill,
        stroke: outerStroke,
        strokeWidth: STROKE_WIDTH,
        transform: `rotate(${cell.outerRotation} 50 50)`
      })}

      {/* Inner pattern clipped to outer form */}
      <g clipPath={`url(#${clipId})`} transform={`rotate(${cell.patternRotation} 50 50)`}>
        {patternElements(cell.pattern, cell.patternRotation)}
      </g>
    </>
  );
}
```

## Signature Implementation

```typescript
// Add to src/lib/logicTestV4/signatures.v4.ts

case 'striped_rotation':
  const normOuterRot = normalizeRotation(cell.outerRotation, cell.outer);
  const normPatternRot = ((cell.patternRotation % 360) + 360) % 360;
  return `striped:${cell.outer}:${normOuterRot}:${cell.pattern}:${normPatternRot}:${cell.fill ?? 'none'}`;
```

## Question Bank Structure

### Example Question (Q1 - Diagonal Rotation)

```json
{
  "id": "v4-rotation-q1-diagonal",
  "title": "FRÅGA 1 — Diagonal rotation",
  "rule": "Diagonalen roterar 45° för varje steg åt höger.",
  "difficulty": 1,
  "showGrid": true,
  "grid": [
    [
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 0 },
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 45 },
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 90 }
    ],
    [
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 0 },
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 45 },
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 90 }
    ],
    [
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 0 },
      { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 45 },
      null
    ]
  ],
  "options": [
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 90 },
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 135 },
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 45 },
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 0 },
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 180 },
    { "kind": "striped_rotation", "outer": "circle", "outerRotation": 0, "pattern": "diagonal", "patternRotation": 270 }
  ],
  "correctAnswer": 0
}
```

## Full Question Plan

### Q1: Diagonal rotation (Nivå 1)
- Rule: Diagonal rotates 45° each step right
- Pattern: diagonal, fixed circle outer

### Q2: Cross to Plus (Nivå 1)
- Rule: X becomes + at 45° rotation each column
- Pattern: cross → plus transformation

### Q3: L-stripes rotation (Nivå 1)
- Rule: L-pattern rotates 90° down each row
- Pattern: l_stripes, clear L asymmetry

### Q4: Stairs rotation (Nivå 1)
- Rule: Stair pattern rotates 45° each step
- Pattern: stairs with 3 different lengths

### Q5: Partial coverage rotation (Nivå 1)
- Rule: Striped half rotates around circle
- Pattern: partial, shows clear movement

### Q6: Independent rotation (Nivå 2)
- Rule: Outer rotates 45° right, inner rotates 45° down
- Both: outerRotation and patternRotation change

### Q7: Counter-rotation (Nivå 2)
- Rule: Outer clockwise, pattern counter-clockwise
- Both rotate opposite directions

### Q8: Form progression + rotation (Nivå 2)
- Rule: Form changes (circle→square→triangle), pattern rotates
- Outer changes, pattern rotates

### Q9: Pattern progression + outer rotation (Nivå 2)
- Rule: Pattern changes (diagonal→cross→plus), outer rotates
- Pattern changes, outer form rotates

### Q10: Double rotation (Nivå 2)
- Rule: Both outer and pattern rotate 90° each step
- Complex: both elements rotating

### Q11: XOR pattern rotation (Nivå 3)
- Rule: Two patterns, XOR result rotates
- Advanced: boolean logic + rotation

### Q12: Nested rotation (Nivå 3)
- Rule: Outer 45°, middle -45°, inner +90°
- Three-layer rotation

### Q13: Size + rotation progression (Nivå 3)
- Rule: Size increases, rotation increases
- Combined transformations

### Q14: Mirrored rotation (Nivå 3)
- Rule: Row 1 rotates clockwise, Row 2 same but mirrored
- Symmetry + rotation

### Q15: Full composite (Nivå 3)
- Rule: All previous concepts combined
- Ultimate challenge

## File Structure

```
src/
├── lib/
│   └── logicTestV4/
│       ├── types.v4.ts              [ADD StripedRotation type]
│       ├── signatures.v4.ts         [ADD striped_rotation signature]
│       ├── renderers.v4.tsx         [ADD striped_rotation renderer]
│       └── rotationQuestionBank.json [NEW FILE - 15 questions]
├── app/
│   ├── dashboard/
│   │   └── tester/
│   │       ├── page.tsx             [ADD new test card with preview]
│   │       └── rotation-monster/
│   │           └── page.tsx         [NEW FILE - test page]
│   └── api/
│       └── logicTestV4/
│           ├── start-rotation/
│           │   └── route.ts         [NEW FILE - start rotation test]
│           ├── answer-rotation/
│           │   └── route.ts         [NEW FILE - answer rotation test]
│           └── complete-rotation/
│               └── route.ts         [NEW FILE - complete rotation test]
```

## Database Schema

Reuse existing `logic_test_v4_sessions` table:
- `test_type` = 'rotation' (add this field if doesn't exist)
- Same structure as matrislogik-classic

## Implementation Steps

1. ✅ Create this context document
2. ⏳ Update types.v4.ts with StripedRotation
3. ⏳ Update signatures.v4.ts with signature function
4. ⏳ Update renderers.v4.tsx with renderer
5. ⏳ Create rotationQuestionBank.json with 15 questions
6. ⏳ Create test page at rotation-monster/page.tsx
7. ⏳ Create API routes (start, answer, complete)
8. ⏳ Update dashboard with new test card + preview
9. ⏳ Test compilation
10. ⏳ Manual testing
11. ⏳ Commit and push

## Key Dependencies

- Reuses existing logicTestV4 infrastructure
- Same renderer utilities (rotate, STROKE_COLOR, etc.)
- Same API pattern as matrislogik-classic
- Same session management

## Testing Checklist

- [ ] TypeScript compiles without errors
- [ ] All 15 questions render correctly
- [ ] Rotations are visually clear
- [ ] No symmetry issues (forms look different when rotated)
- [ ] Signatures correctly identify cells
- [ ] Answer validation works
- [ ] Session persistence works
- [ ] All patterns clip correctly to outer forms
- [ ] Preview symbols on dashboard show correctly

## Notes

- This test should be HARDER than matrislogik-classic
- Visual clarity is CRITICAL - user must see rotations
- Test with real patterns before finalizing
- Each question should have unique logic, not just variations
- Difficulty should genuinely progress from 1→3
