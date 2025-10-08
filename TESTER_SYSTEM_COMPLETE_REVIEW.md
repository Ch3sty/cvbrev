# Komplett Granskning: Matrislogik Test-System

Detta dokument innehåller ALL kod och logik för att skapa, visa och rätta matrislogik-testerna. Använd detta för att verifiera korrekthet med kollegor eller AI-modeller.

---

## 📋 INNEHÅLL

1. [Frågedatabas (20 frågor)](#1-frågedatabas)
2. [SVG-rendering (ikoner/shapes)](#2-svg-rendering)
3. [Svarsalternativ UI](#3-svarsalternativ-ui)
4. [Rättningssystem](#4-rättningssystem)
5. [Poängberäkning](#5-poängberäkning)
6. [Kritiska verifieringspunkter](#6-kritiska-verifieringspunkter)

---

## 1. FRÅGEDATABAS

**Fil:** `src/lib/tester/questionBank.server.ts`

### Typedefinitioner för frågor

```typescript
export interface ServerQuestion {
  id: string; // UUID (statisk)
  testType: 'matrislogik-classic';
  difficulty: 1 | 2 | 3 | 4 | 5;
  matrix: Matrix3x3; // 3x3 matris, sista cellen [2,2] är tom
  options: MatrixCell[]; // 6 svarsalternativ (A-F)
  correctAnswer: number; // Index 0-5 som pekar på rätt svar i options
  explanation: string;
  patternTypes: PatternType[];
  timeEstimateSeconds: number;
}

export interface ClientQuestion {
  id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  matrix: Matrix3x3;
  options: MatrixCell[];
  // INGEN correctAnswer eller explanation - klienten ser aldrig rätt svar!
}
```

### Shape och Cell-struktur

```typescript
export interface Shape {
  form: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';
  fill: 'solid' | 'striped' | 'dotted' | 'crosshatch' | 'empty';
  color: 'blue' | 'red' | 'green' | 'black' | 'yellow' | 'purple';
  size: 'small' | 'medium' | 'large';
  rotation?: number; // grader: 0, 45, 90, 135, 180, 225, 270, 315
}

export interface MatrixCell {
  shapes: Shape[]; // Kan innehålla 0-N shapes (för överlappning)
}

export type Matrix3x3 = [
  [MatrixCell, MatrixCell, MatrixCell],
  [MatrixCell, MatrixCell, MatrixCell],
  [MatrixCell, MatrixCell, MatrixCell]
];
```

### Exempel: Fråga 1 (Enkel färgsekvens)

```typescript
{
  id: 'b7346bc7-1c41-4026-a1e3-8a1c2e7ed04b',
  testType: 'matrislogik-classic',
  difficulty: 1,
  matrix: [
    [
      { shapes: [{ form: 'circle', fill: 'solid', color: 'blue', size: 'medium', rotation: 0 }] },
      { shapes: [{ form: 'circle', fill: 'solid', color: 'red', size: 'medium', rotation: 0 }] },
      { shapes: [{ form: 'circle', fill: 'solid', color: 'green', size: 'medium', rotation: 0 }] }
    ],
    [
      { shapes: [{ form: 'square', fill: 'solid', color: 'blue', size: 'medium', rotation: 0 }] },
      { shapes: [{ form: 'square', fill: 'solid', color: 'red', size: 'medium', rotation: 0 }] },
      { shapes: [{ form: 'square', fill: 'solid', color: 'green', size: 'medium', rotation: 0 }] }
    ],
    [
      { shapes: [{ form: 'triangle', fill: 'solid', color: 'blue', size: 'medium', rotation: 0 }] },
      { shapes: [{ form: 'triangle', fill: 'solid', color: 'red', size: 'medium', rotation: 0 }] },
      { shapes: [] } // TOM CELL - detta är det saknade elementet
    ]
  ],
  options: [
    { shapes: [{ form: 'triangle', fill: 'solid', color: 'green', size: 'medium', rotation: 0 }] }, // A - RÄTT SVAR
    { shapes: [{ form: 'triangle', fill: 'solid', color: 'blue', size: 'medium', rotation: 0 }] },  // B
    { shapes: [{ form: 'circle', fill: 'solid', color: 'green', size: 'medium', rotation: 0 }] },   // C
    { shapes: [{ form: 'triangle', fill: 'solid', color: 'red', size: 'medium', rotation: 0 }] },   // D
    { shapes: [{ form: 'square', fill: 'solid', color: 'green', size: 'medium', rotation: 0 }] },   // E
    { shapes: [{ form: 'triangle', fill: 'striped', color: 'green', size: 'medium', rotation: 0 }] } // F
  ],
  correctAnswer: 0, // Index 0 = Alternativ A
  explanation: 'Färgsekvens per rad: blå → röd → grön. Formen ändras per rad (cirkel, fyrkant, triangel) men färgordningen är konsekvent.',
  patternTypes: ['color-change'],
  timeEstimateSeconds: 45
}
```

### ALLA 20 FRÅGOR - FULLSTÄNDIG LISTA

```typescript
export const QUESTION_BANK: ServerQuestion[] = [
  // Fråga 1: Enkel färgsekvens (Diff 1) - ID: b7346bc7-1c41-4026-a1e3-8a1c2e7ed04b
  // Matrix: Färg rotation (blå→röd→grön per rad), form ändras per rad
  // Rätt svar: Index 0 (grön solid triangel)

  // Fråga 2: Enkel formsekvens med fyllnad (Diff 1) - ID: fc00676e-0e4d-4fa7-b329-8f034d135a41
  // Matrix: Fyllnad rotation (solid→striped→empty per rad), form ändras per rad
  // Rätt svar: Index 0 (diamond empty black)

  // Fråga 3: Enkel rotation 90° (Diff 2) - ID: 0610794a-63aa-4593-9c29-e612aabca970
  // Matrix: Rotation 0°→90°→180° per rad, form ändras per rad
  // Rätt svar: Index 0 (star solid black 180°)

  // Fråga 4: Kvantitet - ökning (Diff 2) - ID: e014ea3c-6c67-4abe-b7f5-148ba6866b23
  // Matrix: Antal shapes ökar 1→2→3 per rad
  // Rätt svar: Index 0 (3 gröna solid trianglar)

  // Fråga 5: Färg + Rotation (Diff 3) - ID: bf088037-bdd2-4f13-8415-3135bf19f1ee
  // Matrix: Rotation per kolumn (0°→90°→180°), färgrotation per rad
  // Rätt svar: Index 0 (röd solid triangel 180°)

  // Fråga 6: Fyllnad + Form (Diff 3) - ID: 10cb8b73-7e0a-435a-be67-037c202d67f7
  // Matrix: Formrotation per rad, fyllnad per kolumn (solid→striped→empty)
  // Rätt svar: Index 0 (fyrkant empty black)

  // Fråga 7: Kvantitet + Färg (Diff 3) - ID: 18fd355e-2dba-4b71-ac74-c5b6255f4894
  // Matrix: Kvantitet per kolumn (1→2→3), färgrotation per rad
  // Rätt svar: Index 0 (3 röda solid trianglar)

  // Fråga 8: Storlek + Position (Diff 3) - ID: 26c25ae3-61c4-41bd-be06-a42a8353e3bc
  // Matrix: Storleksrotation per rad (small→medium→large varierar)
  // Rätt svar: Index 0 (triangel solid black medium)

  // Fråga 9: Form + Rotation + Fyllnad (Diff 3) - ID: 7e1fea09-1eae-4203-ae40-c2abf55f5fc4
  // Matrix: Formrotation per rad, fyllnad per kolumn, kolumn 2 har 45° rotation
  // Rätt svar: Index 0 (fyrkant empty black 0°)

  // Fråga 10: Diagonal + Kvantitet (Diff 3) - ID: 374c9350-521e-4cf0-b460-9b861d92465d
  // Matrix: Diagonalt mönster med kvantitet
  // Rätt svar: Index 0 (3 röda solid fyrkanter)

  // Fråga 11: Färg + Fyllnad + Form (Diff 3) - ID: ffff65c6-8faa-40b2-a673-85445c32520d
  // Matrix: Latin square - varje form, färg och fyllnad exakt en gång per rad/kolumn
  // Rätt svar: Index 0 (fyrkant striped blue)

  // Fråga 12: Tre överlappande former (Diff 4) - ID: 390b8e8f-a3e9-4926-aafa-8c199cb9d7e1
  // Matrix: Överlappning (2 former→3 former→1 form per kolumn)
  // Rätt svar: Index 0 (endast triangel solid green large)

  // Fråga 13: Diagonal rotation + färgbyte (Diff 4) - ID: f72002c0-fde2-4e27-9057-7c5006a1e2a2
  // Matrix: Diagonal rotation pattern på trianglar
  // Rätt svar: Index 0 (triangel solid red 180°)

  // Fråga 14: Komplex kvantitet + position (Diff 4) - ID: dcd6f671-32da-4eee-ad27-093ab08f500e
  // Matrix: Kvantitetsrotation per rad (1→2→3, 2→3→1, 3→1→2)
  // Rätt svar: Index 0 (2 trianglar solid black)

  // Fråga 15: Addition/Subtraktion av element (Diff 4) - ID: 21ecb81f-8677-478e-ab18-6d2cd8101317
  // Matrix: Kolumn 1 = A+B, Kolumn 2 = B, Kolumn 3 = A (subtraktionsmönster)
  // Rätt svar: Index 0 (fyrkant solid red medium)

  // Fråga 16: Komplex färg + fyllnad + rotation (Diff 5) - ID: d0ea7160-0df3-4b49-935c-6fb17c2db888
  // Matrix: Latin square med 3 dimensioner (färg, fyllnad, rotation)
  // Rätt svar: Index 0 (triangel striped blue 90°)

  // Fråga 17: Diagonal symmetri (Diff 5) - ID: 66756874-1ed5-422c-91fd-215249148e36
  // Matrix: Spegling längs huvuddiagonal
  // Rätt svar: Index 0 (fyrkant solid red)

  // Fråga 18: XOR-operation (Diff 5) - ID: 27fdb2cf-47ba-4f4e-a641-503b54847b15
  // Matrix: Set difference: (A∪B) - A = B
  // Rätt svar: Index 0 (triangel solid green small)

  // Fråga 19: Komplex överlappning + färgblandning (Diff 5) - ID: 16bbbce6-be4a-4f22-bcac-cd7ea786a93f
  // Matrix: Latin square med överlappande former och färgpar-rotation
  // Rätt svar: Index 0 (fyrkant solid blue large + fyrkant solid red medium)

  // Fråga 20: Ultra-komplex multi-dimensionell (Diff 5) - ID: c6e1b6a7-c0fe-4147-9e66-0d1d81abbc84
  // Matrix: 5 samtidiga transformationer (form, färg, fyllnad, storlek, rotation)
  // Rätt svar: Index 0 (triangel empty blue large 90° + cirkel solid red small 0°)
];
```

**OBS: Se den fullständiga filen `src/lib/tester/questionBank.server.ts` för exakt kod för alla 20 frågor.**

---

## 2. SVG-RENDERING

**Fil:** `src/app/dashboard/tester/matrislogik/components/ShapeSVG.tsx`

### Färgmappning (WCAG AA-compliant)

```typescript
const colorMap = {
  blue: '#2563eb',
  red: '#dc2626',
  green: '#16a34a',
  black: '#000000',
  yellow: '#ca8a04',
  purple: '#9333ea'
};
```

### Storleksmappning (procent av container)

```typescript
const sizeMap = {
  small: 40,   // 40% av container
  medium: 60,  // 60% av container
  large: 80    // 80% av container
};
```

### Fyllnadsmönster (Patterns)

```typescript
// STRIPED (randigt mönster)
<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="8" stroke={strokeColor} strokeWidth="4" />
</pattern>

// DOTTED (prickigt mönster)
<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
  <circle cx="4" cy="4" r="2" fill={strokeColor} />
</pattern>

// CROSSHATCH (korslagt mönster)
<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
  <path d="M0,0 L8,8 M8,0 L0,8" stroke={strokeColor} strokeWidth="1" />
</pattern>
```

### Form-rendering

```typescript
// CIRCLE
<circle cx={50} cy={50} r={sizePercent/2} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />

// SQUARE
const squareSize = r * 1.4;
<rect
  x={cx - squareSize}
  y={cy - squareSize}
  width={squareSize * 2}
  height={squareSize * 2}
  fill={getFillAttribute()}
  stroke={strokeColor}
  strokeWidth="2"
/>

// TRIANGLE
const h = r * 1.5;
<polygon
  points={`${cx},${cy - h} ${cx - h},${cy + h / 2} ${cx + h},${cy + h / 2}`}
  fill={getFillAttribute()}
  stroke={strokeColor}
  strokeWidth="2"
/>

// DIAMOND
<polygon
  points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
  fill={getFillAttribute()}
  stroke={strokeColor}
  strokeWidth="2"
/>

// HEXAGON
const hexPoints = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI / 3) * i;
  return `${cx + hexR * Math.cos(angle)},${cy + hexR * Math.sin(angle)}`;
}).join(' ');
<polygon points={hexPoints} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />

// STAR (5-pointed)
const starPoints = [];
for (let i = 0; i < 5; i++) {
  const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
  const innerAngle = outerAngle + Math.PI / 5;
  starPoints.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
  starPoints.push(`${cx + (r / 2) * Math.cos(innerAngle)},${cy + (r / 2) * Math.sin(innerAngle)}`);
}
<polygon points={starPoints.join(' ')} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" />
```

### Rotation

```typescript
// Rotation tillämpas via CSS transform på hela SVG-containern
<svg
  viewBox="0 0 100 100"
  style={{ transform: `rotate(${rotation}deg)` }}
>
  {/* shapes renderas här */}
</svg>
```

### Fullständig komponent

```typescript
export function ShapeSVG({ shape, className = '' }: ShapeSVGProps) {
  const { form, fill, color, size, rotation = 0 } = shape;

  const strokeColor = colorMap[color];
  const fillColor = fill === 'solid' ? strokeColor : 'none';
  const sizePercent = sizeMap[size];
  const patternId = `${fill}-${color}-${Math.random().toString(36).substr(2, 9)}`;

  const getFillAttribute = () => {
    if (fill === 'solid') return fillColor;
    if (fill === 'empty') return 'none';
    return `url(#${patternId})`; // Pattern för striped/dotted/crosshatch
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <defs>{renderPattern()}</defs>
      {renderShape()}
    </svg>
  );
}
```

---

## 3. SVARSALTERNATIV UI

**Fil:** `src/app/dashboard/tester/matrislogik/components/AnswerOptions.tsx`

### Keyboard Navigation (A-F tangenter)

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (disabled) return;
    const key = e.key.toUpperCase();
    const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3, E=4, F=5
    if (index >= 0 && index < options.length) {
      onSelect(index);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [disabled, options.length, onSelect]);
```

**KRITISKT**: Mappningen A-F till index 0-5:
- Tangent **A** → `key.charCodeAt(0) = 65` → `index = 65 - 65 = 0`
- Tangent **B** → `key.charCodeAt(0) = 66` → `index = 66 - 65 = 1`
- Tangent **C** → `key.charCodeAt(0) = 67` → `index = 67 - 65 = 2`
- Tangent **D** → `key.charCodeAt(0) = 68` → `index = 68 - 65 = 3`
- Tangent **E** → `key.charCodeAt(0) = 69` → `index = 69 - 65 = 4`
- Tangent **F** → `key.charCodeAt(0) = 70` → `index = 70 - 65 = 5`

### Label-generering

```typescript
const label = String.fromCharCode(65 + index); // 0→A, 1→B, 2→C, 3→D, 4→E, 5→F
```

### Fullständig komponent

```typescript
export function AnswerOptions({ options, selectedAnswer, onSelect, disabled = false }: AnswerOptionsProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {options.map((option, index) => {
        const label = String.fromCharCode(65 + index); // A, B, C, D, E, F
        const isSelected = selectedAnswer === index;

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={/* styling */}
          >
            {/* Label badge (A-F) */}
            <div className="absolute -top-2 -left-2 bg-gray-800 text-white w-6 h-6 rounded-full">
              {label}
            </div>

            {/* Shapes */}
            <div className="w-full h-full p-2">
              {option.shapes.length === 0 ? (
                <div>Tom</div>
              ) : (
                <div className="relative w-full h-full">
                  {option.shapes.map((shape, shapeIdx) => (
                    <ShapeSVG
                      key={shapeIdx}
                      shape={shape}
                      className={option.shapes.length > 1 ? 'absolute inset-0' : ''}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Selected checkmark */}
            {isSelected && <div className="absolute -top-2 -right-2">✓</div>}
          </button>
        );
      })}
    </div>
  );
}
```

**OBS**: När flera shapes finns i samma cell (`option.shapes.length > 1`), renderas de som `absolute inset-0` för överlappning.

---

## 4. RÄTTNINGSSYSTEM

**Fil:** `src/app/api/tester/submit/route.ts`

### Steg 1: Verifiera JWT-session

```typescript
const { sessionToken, answers, timeSpent } = await request.json();
const session = await verifyTestSession(sessionToken); // Verifierar JWT

if (session.userId !== user.id) {
  return NextResponse.json({ error: 'Invalid session' }, { status: 403 });
}
```

### Steg 2: Hämta server-frågor och rätta

```typescript
const breakdown: QuestionBreakdown[] = [];
let correctCount = 0;

for (const answer of answers) {
  const question = getQuestionById(answer.questionId); // Hämtar ServerQuestion från questionBank

  if (!question) continue;

  const isCorrect = answer.userAnswer === question.correctAnswer; // KRITISK JÄMFÖRELSE
  if (isCorrect) correctCount++;

  breakdown.push({
    questionId: question.id,
    isCorrect,
    userAnswer: answer.userAnswer,        // Index 0-5 från klient
    correctAnswer: question.correctAnswer, // Index 0-5 från server
    explanation: question.explanation,
    timeSpent: answer.timeSpent || 0,
    difficulty: question.difficulty,
    patternTypes: question.patternTypes,
    matrix: question.matrix,
    options: question.options
  });
}
```

**KRITISK LOGIK**:
```typescript
const isCorrect = answer.userAnswer === question.correctAnswer;
```
- `answer.userAnswer`: Kommer från klienten, index 0-5 (A-F)
- `question.correctAnswer`: Kommer från servern, index 0-5 i options-arrayen
- Måste matcha **EXAKT** för att räknas som rätt

### Steg 3: Beräkna poäng

```typescript
const scoreRaw = (correctCount / answers.length) * 100; // 0-100%
const scorePracticeRating = calculatePracticeRating(scoreRaw); // 1-10
const interpretation = getInterpretation(scorePracticeRating); // Textfeedback
```

### Steg 4: Spara i databas

```typescript
const { data: attempt } = await supabase
  .from('test_attempts')
  .insert({
    user_id: user.id,
    test_type: 'matrislogik-classic',
    test_mode: 'practice',
    score_raw: scoreRaw,
    score_practice_rating: scorePracticeRating,
    correct_answers: correctCount,
    total_questions: answers.length,
    time_spent_seconds: timeSpent || 0,
    answers: answers
  })
  .select()
  .single();
```

### Steg 5: Returnera resultat

```typescript
return NextResponse.json({
  attemptId: attempt.id,
  scoreRaw,
  scorePracticeRating,
  correctAnswers: correctCount,
  totalQuestions: answers.length,
  timeSpentSeconds: timeSpent || 0,
  breakdown, // Fullständig breakdown med alla frågor
  interpretation,
  completedAt: attempt.completed_at
});
```

---

## 5. POÄNGBERÄKNING

**Fil:** `src/lib/tester/scoringEngine.ts`

### Omvandling till 1-10 skala

```typescript
export function calculatePracticeRating(scoreRaw: number): number {
  // scoreRaw är 0-100%
  // Omvandla till 1-10 skala
  const rating = Math.ceil(scoreRaw / 10);
  return Math.max(1, Math.min(10, rating));
}
```

**Exempel:**
- 0-10% → rating = 1
- 11-20% → rating = 2
- 21-30% → rating = 3
- 31-40% → rating = 4
- 41-50% → rating = 5
- 51-60% → rating = 6
- 61-70% → rating = 7
- 71-80% → rating = 8
- 81-90% → rating = 9
- 91-100% → rating = 10

### Textuell feedback

```typescript
export function getInterpretation(scorePracticeRating: number): string {
  if (scorePracticeRating >= 9) {
    return '🎉 Exceptionellt! Du har mycket stark logisk förmåga. Detta resultat ligger i toppen av alla testtagare.';
  }
  if (scorePracticeRating >= 7) {
    return '👍 Mycket bra! Du ligger klart över genomsnittet och visar god problemlösningsförmåga.';
  }
  if (scorePracticeRating >= 5) {
    return '💪 Bra jobbat! Du ligger runt genomsnittet. Fortsätt träna för att förbättra din poäng ytterligare.';
  }
  if (scorePracticeRating >= 3) {
    return '📚 Fortsätt öva! Med mer träning kommer ditt resultat att förbättras. Fokusera på att känna igen mönster.';
  }
  return '🎯 Början är alltid svårast! Gör fler övningar för att utveckla din logiska förmåga. Varje test gör dig bättre.';
}
```

---

## 6. KRITISKA VERIFIERINGSPUNKTER

### ✅ A. Rätt svar-index måste stämma

**För varje fråga:**
1. Leta upp `correctAnswer`-värdet (0-5)
2. Gå till `options`-arrayen
3. Kontrollera att index matchar rätt alternativ

**Exempel från Fråga 1:**
```typescript
options: [
  createCell([createShape('triangle', 'solid', 'green')]), // Index 0 - DETTA SKA VARA RÄTT
  createCell([createShape('triangle', 'solid', 'blue')]),  // Index 1
  createCell([createShape('circle', 'solid', 'green')]),   // Index 2
  createCell([createShape('triangle', 'solid', 'red')]),   // Index 3
  createCell([createShape('square', 'solid', 'green')]),   // Index 4
  createCell([createShape('triangle', 'striped', 'green')])// Index 5
],
correctAnswer: 0, // ← Pekar på Index 0 = grön solid triangel
```

**Matrix-logik för Fråga 1:**
- Rad 1: blå cirkel, röd cirkel, grön cirkel
- Rad 2: blå fyrkant, röd fyrkant, grön fyrkant
- Rad 3: blå triangel, röd triangel, **?**

**Mönster:** Färgsekvens blå→röd→grön per rad, form ändras per rad.
**Saknat element:** Grön triangel (solid)
**Rätt svar:** Index 0 ✓

### ✅ B. Keyboard-mappning A-F → 0-5

**Verifiera:**
- Tangent A väljer index 0
- Tangent B väljer index 1
- Tangent C väljer index 2
- Tangent D väljer index 3
- Tangent E väljer index 4
- Tangent F väljer index 5

**Kod:**
```typescript
const index = key.charCodeAt(0) - 65; // A=65, så A→0, B→1, etc.
```

### ✅ C. Server-klient säkerhet

**Verifiera att:**
1. `ClientQuestion` **ALDRIG** innehåller `correctAnswer` eller `explanation`
2. Rättning sker **ENDAST** server-side i `/api/tester/submit`
3. JWT-token verifieras innan rättning

**Kod i `/api/tester/start`:**
```typescript
const clientQuestions: ClientQuestion[] = serverQuestions.map(q => ({
  id: q.id,
  difficulty: q.difficulty,
  matrix: q.matrix,
  options: q.options
  // INGEN correctAnswer eller explanation!
}));
```

### ✅ D. UUID-stabilitet

**Verifiera att:**
- Alla frågor har **statiska** UUID-strängar (inte `crypto.randomUUID()`)
- Detta säkerställer att sparade test-försök kan matchas mot frågor efter deploy

**Exempel:**
```typescript
{
  id: 'b7346bc7-1c41-4026-a1e3-8a1c2e7ed04b', // STATISK UUID ✓
  // ...
}
```

### ✅ E. Överlappande shapes

**Frågor med överlappning (flera shapes i samma cell):**
- Fråga 12 (difficulty 4)
- Fråga 15 (difficulty 4)
- Fråga 18 (difficulty 5)
- Fråga 19 (difficulty 5)
- Fråga 20 (difficulty 5)

**Rendering:**
```typescript
{option.shapes.map((shape, shapeIdx) => (
  <ShapeSVG
    key={shapeIdx}
    shape={shape}
    className={option.shapes.length > 1 ? 'absolute inset-0' : ''}
  />
))}
```

När `shapes.length > 1`, renderas alla shapes med `absolute inset-0` för att överlappa.

---

## 7. CHECKLISTA FÖR MANUELL GRANSKNING

### För varje fråga (1-20):

- [ ] **correctAnswer-index stämmer** - Rätt alternativ finns på angivet index i options
- [ ] **Matrix-mönster är korrekt** - Matrisen följer logiken som beskrivs i explanation
- [ ] **Distraktorer är trovärdiga** - Felaktiga svar liknar rätt svar men har subtila skillnader
- [ ] **Explanation är tydlig** - Förklaringen beskriver mönstret korrekt
- [ ] **UUID är statisk** - Inget `crypto.randomUUID()` används

### Systemövergripande:

- [ ] **Keyboard navigation fungerar** - A-F mappar till index 0-5
- [ ] **SVG-rendering är korrekt** - Alla former, färger, fyllnader renderas rätt
- [ ] **Överlappning fungerar** - Flera shapes i samma cell renderas korrekt
- [ ] **Rättning är server-side** - Klienten ser aldrig correctAnswer
- [ ] **JWT-säkerhet** - Sessions verifieras innan rättning

---

## 8. TESTFALL FÖR VERIFIERING

### Testfall 1: Enkel färgsekvens (Fråga 1)

**Input:**
- Matrix: Rad 1 (blå, röd, grön cirklar), Rad 2 (blå, röd, grön fyrkanter), Rad 3 (blå, röd, ?)
- Options: [grön triangel solid, blå triangel solid, grön cirkel solid, röd triangel solid, grön fyrkant solid, grön triangel striped]

**Förväntat:**
- Rätt svar: Index 0 (grön triangel solid)
- Mönster: Färgsekvens blå→röd→grön, form ändras per rad

**Verifiering:**
```typescript
correctAnswer: 0 ✓
options[0]: { shapes: [{ form: 'triangle', fill: 'solid', color: 'green' }] } ✓
```

### Testfall 2: XOR-operation (Fråga 18)

**Input:**
- Matrix: Rad 1 (cirkel+fyrkant, cirkel, ?), Rad 2 (triangel+cirkel, triangel, ?), Rad 3 (fyrkant+triangel, fyrkant, ?)
- Mönster: Kolumn 1 = A∪B, Kolumn 2 = A, Kolumn 3 = B

**Förväntat:**
- Rad 1, Kolumn 3: fyrkant
- Rad 2, Kolumn 3: cirkel
- Rad 3, Kolumn 3: triangel

**Verifiering:**
```typescript
correctAnswer: 0 ✓
options[0]: { shapes: [{ form: 'triangle', fill: 'solid', color: 'green', size: 'small' }] } ✓
```

### Testfall 3: Keyboard navigation

**Input:**
- Användaren trycker tangent "C"

**Förväntat:**
- `key.charCodeAt(0) = 67`
- `index = 67 - 65 = 2`
- Alternativ C (index 2) väljs

**Verifiering:**
```typescript
const index = key.charCodeAt(0) - 65;
// 'C'.charCodeAt(0) = 67
// 67 - 65 = 2 ✓
onSelect(2); // Väljer alternativ C ✓
```

---

## 9. KÖR DETTA MED AI FÖR VERIFIERING

Kopiera följande prompt till en AI-modell (t.ex. GPT-4, Claude) för verifiering:

```
Jag har ett matrislogik-testsystem. Nedan är en komplett fråga. Verifiera att:

1. correctAnswer-index pekar på rätt alternativ i options
2. Matrix-mönstret är logiskt korrekt
3. Förklaringen stämmer med mönstret

[KLISTRA IN EN FRÅGA FRÅN questionBank.server.ts HÄR]

Svara med:
- ✓ KORREKT om allt stämmer
- ✗ FEL och förklara vad som är fel
```

**Exempel:**

```
Fråga 1:
{
  id: 'b7346bc7-1c41-4026-a1e3-8a1c2e7ed04b',
  difficulty: 1,
  matrix: [
    [blå cirkel, röd cirkel, grön cirkel],
    [blå fyrkant, röd fyrkant, grön fyrkant],
    [blå triangel, röd triangel, TOM]
  ],
  options: [
    grön triangel solid,  // Index 0
    blå triangel solid,   // Index 1
    grön cirkel solid,    // Index 2
    röd triangel solid,   // Index 3
    grön fyrkant solid,   // Index 4
    grön triangel striped // Index 5
  ],
  correctAnswer: 0,
  explanation: 'Färgsekvens per rad: blå → röd → grön. Formen ändras per rad (cirkel, fyrkant, triangel) men färgordningen är konsekvent.'
}
```

**Förväntat AI-svar:**

```
✓ KORREKT

Analys:
1. Mönster: Färgsekvens blå→röd→grön återkommer per rad, form ändras per rad
2. Saknat element: Rad 3, Kolumn 3 ska vara grön triangel
3. correctAnswer: 0 pekar på options[0] = grön triangel solid ✓
4. Explanation: Stämmer med mönstret ✓
```

---

## 10. SLUTSATS

Alla filer och logik för att:
- Skapa frågor
- Visa ikoner (SVG)
- Lista svarsalternativ
- Rätta svar

är nu dokumenterade här. Använd detta dokument för att:

1. ✅ Manuellt granska frågor
2. ✅ Verifiera med kollegor
3. ✅ Köra AI-verifiering
4. ✅ Säkerställa korrekthet innan produktion

**Kritiska filer:**
- [src/lib/tester/questionBank.server.ts](../src/lib/tester/questionBank.server.ts) - ALLA FRÅGOR
- [src/app/dashboard/tester/matrislogik/components/ShapeSVG.tsx](../src/app/dashboard/tester/matrislogik/components/ShapeSVG.tsx) - SVG-RENDERING
- [src/app/dashboard/tester/matrislogik/components/AnswerOptions.tsx](../src/app/dashboard/tester/matrislogik/components/AnswerOptions.tsx) - SVARSALTERNATIV UI
- [src/app/api/tester/submit/route.ts](../src/app/api/tester/submit/route.ts) - RÄTTNING
- [src/lib/tester/scoringEngine.ts](../src/lib/tester/scoringEngine.ts) - POÄNG

**Status:** UUID-problemet är fixat (commit 85717f2). Systemet är redo för manuell granskning.
