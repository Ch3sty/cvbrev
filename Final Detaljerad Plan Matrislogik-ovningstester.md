## **Final Detaljerad Plan: Matrislogik-Övningstester för Jobbcoach.ai**

---

## **Projektöversikt**

### **Vad vi bygger:**

Ett **Matrislogik-övningstest** (Raven-stil) integrerat i Jobbcoach.ai dashboard där användare kan träna på kognitiva tester före rekryteringsprocesser.

### **Scope (MVP):**

* ✅ 20 manuellt skapade frågor (egen konstruktion, MIT-licensierad)  
* ✅ Klassiskt övningsläge (15 frågor, 20 min)  
* ✅ Server-side rättning (säker, anti-cheat)  
* ✅ Resultat med övningsskala 1-10 \+ breakdown  
* ✅ Historik & progresstracking  
* ✅ GDPR-compliant, EU-hosting  
* ✅ Highlighted i sidebar

### **INTE i MVP:**

* ❌ AI-analys per svar (för dyrt, anropar inte GPT)  
* ❌ Videogenomgångar  
* ❌ Adaptivt läge (kommer i Phase 2\)

---

## **Teknisk Arkitektur**

### **Stack**

Frontend:  
\- Framework: Next.js 14 (App Router)  
\- Styling: Tailwind CSS  
\- Animation: Framer Motion  
\- SVG Rendering: React components (native SVG)

Backend:  
\- API: Next.js API Routes (Edge Runtime)  
\- Database: Supabase (PostgreSQL)  
\- Auth: Supabase Auth (redan implementation)  
\- Session: JWT (jose library)

Hosting:  
\- Supabase: EU Region (Frankfurt) \- GDPR  
\- Vercel: Edge Network (Sverige/Nordics)

---

## **Fil & Mappstruktur**

jobbcoach-ai/  
├── src/  
│   ├── app/  
│   │   ├── dashboard/  
│   │   │   ├── tester/ ← NYTT  
│   │   │   │   ├── page.tsx (testöversikt)  
│   │   │   │   └── matrislogik/  
│   │   │   │       ├── page.tsx (starta test)  
│   │   │   │       ├── test/  
│   │   │   │       │   └── \[sessionId\]/  
│   │   │   │       │       └── page.tsx (testsession)  
│   │   │   │       ├── results/  
│   │   │   │       │   └── \[attemptId\]/  
│   │   │   │       │       └── page.tsx (resultat)  
│   │   │   │       └── components/  
│   │   │   │           ├── MatrixGrid.tsx  
│   │   │   │           ├── ShapeSVG.tsx  
│   │   │   │           ├── AnswerOptions.tsx  
│   │   │   │           ├── TestTimer.tsx  
│   │   │   │           ├── TestNavigation.tsx  
│   │   │   │           ├── TestResults.tsx  
│   │   │   │           ├── ProgressChart.tsx  
│   │   │   │           ├── DisclaimerBanner.tsx  
│   │   │   │           └── HistoryList.tsx  
│   │   │   │  
│   │   ├── api/  
│   │   │   └── tester/  
│   │   │       ├── start/  
│   │   │       │   └── route.ts (skapa session)  
│   │   │       ├── submit/  
│   │   │       │   └── route.ts (rätta test)  
│   │   │       ├── history/  
│   │   │       │   └── route.ts (hämta tidigare)  
│   │   │       └── validate-session/  
│   │   │           └── route.ts (check token)  
│   │   │  
│   ├── lib/  
│   │   ├── tester/  
│   │   │   ├── questionBank.server.ts ← SERVER ONLY  
│   │   │   ├── patternTypes.ts (type definitions)  
│   │   │   ├── scoringEngine.ts  
│   │   │   └── sessionManager.ts (JWT handling)  
│   │   │  
│   ├── components/  
│   │   └── ui/  
│   │       └── Sidebar.tsx ← UPPDATERA (highlight Tester)  
│   │  
├── supabase/  
│   └── migrations/  
│       └── YYYYMMDD\_tester\_schema.sql ← NY MIGRATION  
│  
└── .env.local  
    └── TEST\_SESSION\_SECRET=... ← LÄGG TILL

---

## **Database Schema**

### **Migration: supabase/migrations/20250108\_tester\_schema.sql**

\-- \============================================================================  
\-- TESTER SCHEMA \- Matrislogik Övningstester  
\-- \============================================================================

\-- Questions (server-side, ej exponerad till klient)  
CREATE TABLE test\_questions (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  test\_type TEXT NOT NULL DEFAULT 'matrislogik-classic',  
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),  
    
  \-- Serialized data (JSONB)  
  matrix JSONB NOT NULL, \-- 3x3 grid: \[\[cell, cell, cell\], \[...\], \[...\]\]  
  options JSONB NOT NULL, \-- 6 answer options: \[cell, cell, ...\]  
  correct\_answer INTEGER NOT NULL CHECK (correct\_answer BETWEEN 0 AND 5),  
  explanation TEXT NOT NULL,  
  pattern\_types TEXT\[\] NOT NULL, \-- \['color-change', 'rotation', ...\]  
    
  \-- Metadata  
  time\_estimate\_seconds INTEGER DEFAULT 60, \-- Genomsnittlig tid att lösa  
  created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
  updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- Index för snabb lookup  
CREATE INDEX idx\_test\_questions\_type\_difficulty   
  ON test\_questions(test\_type, difficulty);

\-- \============================================================================  
\-- USER TEST ATTEMPTS  
\-- \============================================================================

CREATE TABLE test\_attempts (  
  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  
    
  \-- Test info  
  test\_type TEXT NOT NULL, \-- 'matrislogik-classic'  
  test\_mode TEXT NOT NULL, \-- 'practice'  
    
  \-- Scores  
  score\_raw DECIMAL(5,2) NOT NULL, \-- % rätt (ex: 73.33)  
  score\_practice\_rating INTEGER NOT NULL CHECK (score\_practice\_rating BETWEEN 1 AND 10),  
  correct\_answers INTEGER NOT NULL,  
  total\_questions INTEGER NOT NULL,  
    
  \-- Performance  
  time\_spent\_seconds INTEGER NOT NULL,  
    
  \-- Detailed answers (for breakdown)  
  answers JSONB NOT NULL, \-- \[{ questionId, userAnswer, isCorrect, timeSpent }, ...\]  
    
  \-- Timestamps  
  completed\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
    
  CONSTRAINT valid\_score CHECK (score\_raw \>= 0 AND score\_raw \<= 100\)  
);

\-- Index för snabb user lookup  
CREATE INDEX idx\_test\_attempts\_user\_completed   
  ON test\_attempts(user\_id, completed\_at DESC);

\-- Index för test type  
CREATE INDEX idx\_test\_attempts\_type   
  ON test\_attempts(test\_type);

\-- \============================================================================  
\-- USER STATS (Aggregerad data för dashboard)  
\-- \============================================================================

CREATE TABLE test\_user\_stats (  
  user\_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
    
  \-- Matrislogik stats  
  matrislogik\_attempts INTEGER DEFAULT 0,  
  matrislogik\_best\_score INTEGER DEFAULT 0,  
  matrislogik\_avg\_score DECIMAL(4,2) DEFAULT 0.0,  
    
  \-- Overall stats  
  total\_test\_time\_seconds INTEGER DEFAULT 0,  
  streak\_days INTEGER DEFAULT 0,  
  last\_test\_date DATE,  
    
  \-- Achievements (future use)  
  achievements JSONB DEFAULT '\[\]'::jsonb,  
    
  updated\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- \============================================================================  
\-- RLS POLICIES  
\-- \============================================================================

\-- test\_questions: Endast backend kan läsa (ej RLS för users)  
ALTER TABLE test\_questions ENABLE ROW LEVEL SECURITY;

\-- Ingen SELECT policy för users \= endast server kan läsa

\-- test\_attempts: Users ser bara sina egna  
ALTER TABLE test\_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own test attempts"  
  ON test\_attempts FOR SELECT  
  USING (auth.uid() \= user\_id);

CREATE POLICY "Users can insert own test attempts"  
  ON test\_attempts FOR INSERT  
  WITH CHECK (auth.uid() \= user\_id);

\-- test\_user\_stats: Users ser bara sin egen stats  
ALTER TABLE test\_user\_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"  
  ON test\_user\_stats FOR SELECT  
  USING (auth.uid() \= user\_id);

CREATE POLICY "Users can update own stats"  
  ON test\_user\_stats FOR UPDATE  
  USING (auth.uid() \= user\_id)  
  WITH CHECK (auth.uid() \= user\_id);

CREATE POLICY "Users can insert own stats"  
  ON test\_user\_stats FOR INSERT  
  WITH CHECK (auth.uid() \= user\_id);

\-- \============================================================================  
\-- TRIGGERS \- Auto-update stats  
\-- \============================================================================

CREATE OR REPLACE FUNCTION update\_test\_user\_stats()  
RETURNS TRIGGER AS $$  
BEGIN  
  INSERT INTO test\_user\_stats (user\_id)  
  VALUES (NEW.user\_id)  
  ON CONFLICT (user\_id) DO NOTHING;  
    
  UPDATE test\_user\_stats  
  SET   
    matrislogik\_attempts \= matrislogik\_attempts \+ 1,  
    matrislogik\_best\_score \= GREATEST(matrislogik\_best\_score, NEW.score\_practice\_rating),  
    matrislogik\_avg\_score \= (  
      SELECT AVG(score\_practice\_rating)::DECIMAL(4,2)  
      FROM test\_attempts  
      WHERE user\_id \= NEW.user\_id AND test\_type \= 'matrislogik-classic'  
    ),  
    total\_test\_time\_seconds \= total\_test\_time\_seconds \+ NEW.time\_spent\_seconds,  
    last\_test\_date \= CURRENT\_DATE,  
    updated\_at \= NOW()  
  WHERE user\_id \= NEW.user\_id;  
    
  RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

CREATE TRIGGER after\_test\_attempt\_insert  
  AFTER INSERT ON test\_attempts  
  FOR EACH ROW  
  EXECUTE FUNCTION update\_test\_user\_stats();

\-- \============================================================================  
\-- GDPR RETENTION \- Auto-delete gamla försök  
\-- \============================================================================

CREATE OR REPLACE FUNCTION delete\_old\_test\_attempts()  
RETURNS void AS $$  
BEGIN  
  DELETE FROM test\_attempts  
  WHERE completed\_at \< NOW() \- INTERVAL '12 months';  
    
  RAISE NOTICE 'Deleted test attempts older than 12 months';  
END;  
$$ LANGUAGE plpgsql;

\-- Kör monthly (via Supabase cron eller manuellt)  
\-- SELECT cron.schedule('delete-old-tests', '0 0 1 \* \*', $$  
\--   SELECT delete\_old\_test\_attempts();  
\-- $$);

\-- \============================================================================  
\-- SEED DATA \- Exempel-frågor (20 st)  
\-- \============================================================================  
\-- Läggs till manuellt efter migration körs

---

## **TypeScript Type Definitions**

### **src/lib/tester/patternTypes.ts**

// \============================================================================  
// SHAPE & MATRIX TYPES  
// \============================================================================

export type ShapeForm \= 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'star';

export type ShapeFill \= 'solid' | 'striped' | 'dotted' | 'crosshatch' | 'empty';

export type ShapeColor \= 'black' | 'white' | 'gray';

export type ShapeSize \= 'small' | 'medium' | 'large';

export interface Shape {  
  form: ShapeForm;  
  fill: ShapeFill;  
  color: ShapeColor;  
  size: ShapeSize;  
  rotation?: number; // grader: 0, 45, 90, 135, 180, 225, 270, 315  
  count?: number; // antal shapes (för multipla shapes i en cell)  
  position?: { x: number; y: number }; // för spatial positioning  
}

export interface MatrixCell {  
  type: 'shape' | 'empty';  
  shapes?: Shape\[\];  
}

export type Matrix3x3 \= \[  
  \[MatrixCell, MatrixCell, MatrixCell\],  
  \[MatrixCell, MatrixCell, MatrixCell\],  
  \[MatrixCell, MatrixCell, MatrixCell\]  
\];

// \============================================================================  
// QUESTION TYPES  
// \============================================================================

export type PatternType \=   
  | 'color-change'      // Färgförändring (solid → striped → dotted → empty)  
  | 'rotation'          // Rotation (0° → 90° → 180°)  
  | 'quantity'          // Antal shapes ändras  
  | 'structural'        // Overlap, subtraction, addition  
  | 'spatial'           // Spatial förflyttning  
  | 'size-change'       // Storlek ändras  
  | 'shape-morph';      // Form ändras

export interface ServerQuestion {  
  id: string; // UUID  
  testType: 'matrislogik-classic';  
  difficulty: 1 | 2 | 3 | 4 | 5;  
  matrix: Matrix3x3; // Sista cellen (2,2) är alltid empty  
  options: MatrixCell\[\]; // 6 svarsalternativ  
  correctAnswer: number; // index 0-5  
  explanation: string;  
  patternTypes: PatternType\[\];  
  timeEstimateSeconds: number; // Genomsnittlig tid  
}

export interface ClientQuestion {  
  id: string;  
  difficulty: number; // Endast för UI  
  matrix: Matrix3x3;  
  options: MatrixCell\[\];  
  // INGEN correctAnswer eller explanation här\!  
}

// \============================================================================  
// TEST SESSION & RESULTS  
// \============================================================================

export interface TestSession {  
  sessionToken: string; // JWT  
  userId: string;  
  testType: 'matrislogik-classic';  
  questions: ClientQuestion\[\]; // UTAN svar  
  startedAt: string; // ISO timestamp  
  expiresAt: string; // ISO timestamp  
}

export interface UserAnswer {  
  questionId: string;  
  userAnswer: number; // 0-5  
  timeSpent: number; // sekunder  
}

export interface QuestionBreakdown {  
  questionId: string;  
  isCorrect: boolean;  
  userAnswer: number;  
  correctAnswer: number;  
  explanation: string;  
  timeSpent: number;  
  difficulty: number;  
  patternTypes: PatternType\[\];  
}

export interface TestResult {  
  attemptId: string;  
  scoreRaw: number; // % rätt (0-100)  
  scorePracticeRating: number; // 1-10  
  correctAnswers: number;  
  totalQuestions: number;  
  timeSpentSeconds: number;  
  breakdown: QuestionBreakdown\[\];  
  interpretation: string; // Textfeedback baserat på score  
  completedAt: string;  
}

export interface TestAttempt {  
  id: string;  
  userId: string;  
  testType: string;  
  testMode: string;  
  scoreRaw: number;  
  scorePracticeRating: number;  
  correctAnswers: number;  
  totalQuestions: number;  
  timeSpentSeconds: number;  
  completedAt: string;  
}

export interface UserStats {  
  userId: string;  
  matrislogikAttempts: number;  
  matrislogikBestScore: number;  
  matrislogikAvgScore: number;  
  totalTestTimeSeconds: number;  
  streakDays: number;  
  lastTestDate: string | null;  
  achievements: string\[\];  
}

---

## **Backend Implementation**

### **1\. Session Manager**

**src/lib/tester/sessionManager.ts**  
import { SignJWT, jwtVerify } from 'jose';

const SECRET \= new TextEncoder().encode(  
  process.env.TEST\_SESSION\_SECRET || 'default-secret-change-in-production'  
);

export interface SessionPayload {  
  userId: string;  
  testType: string;  
  questionIds: string\[\]; // Order viktigt för att matcha svar  
  nonce: string;  
  exp: number;  
}

export async function createTestSession(  
  userId: string,  
  testType: string,  
  questionIds: string\[\]  
): Promise\<string\> {  
  const token \= await new SignJWT({  
    userId,  
    testType,  
    questionIds,  
    nonce: crypto.randomUUID()  
  } as SessionPayload)  
    .setProtectedHeader({ alg: 'HS256' })  
    .setExpirationTime('30m') // 30 min session  
    .sign(SECRET);  
    
  return token;  
}

export async function verifyTestSession(token: string): Promise\<SessionPayload\> {  
  try {  
    const { payload } \= await jwtVerify(token, SECRET);  
    return payload as SessionPayload;  
  } catch (error) {  
    throw new Error('Invalid or expired session token');  
  }  
}

---

### **2\. Question Bank (Server-Only)**

**src/lib/tester/questionBank.server.ts**  
import { ServerQuestion, Matrix3x3, MatrixCell } from './patternTypes';

// \============================================================================  
// HELPER \- Skapa shapes  
// \============================================================================

function createShape(  
  form: ShapeForm,  
  fill: ShapeFill,  
  color: ShapeColor \= 'black',  
  size: ShapeSize \= 'medium',  
  rotation: number \= 0  
): Shape {  
  return { form, fill, color, size, rotation };  
}

function createCell(...shapes: Shape\[\]): MatrixCell {  
  return shapes.length \> 0   
    ? { type: 'shape', shapes }   
    : { type: 'empty' };  
}

const EMPTY: MatrixCell \= { type: 'empty' };

// \============================================================================  
// QUESTION BANK \- 20 FRÅGOR  
// \============================================================================

export const QUESTION\_BANK: ServerQuestion\[\] \= \[  
  // \============================================================================  
  // DIFFICULTY 1 \- Enkel färgförändring  
  // \============================================================================  
  {  
    id: crypto.randomUUID(),  
    testType: 'matrislogik-classic',  
    difficulty: 1,  
    matrix: \[  
      \[  
        createCell(createShape('circle', 'solid', 'black')),  
        createCell(createShape('circle', 'striped', 'black')),  
        createCell(createShape('circle', 'dotted', 'black'))  
      \],  
      \[  
        createCell(createShape('square', 'solid', 'black')),  
        createCell(createShape('square', 'striped', 'black')),  
        createCell(createShape('square', 'dotted', 'black'))  
      \],  
      \[  
        createCell(createShape('triangle', 'solid', 'black')),  
        createCell(createShape('triangle', 'striped', 'black')),  
        EMPTY // ?  
      \]  
    \],  
    options: \[  
      createCell(createShape('triangle', 'dotted', 'black')), // RÄTT  
      createCell(createShape('triangle', 'solid', 'black')),  
      createCell(createShape('circle', 'dotted', 'black')),  
      createCell(createShape('square', 'empty', 'black')),  
      createCell(createShape('triangle', 'empty', 'black')),  
      createCell(createShape('diamond', 'dotted', 'black'))  
    \],  
    correctAnswer: 0,  
    explanation: 'Mönstret följer en färgsekvens per rad: solid → striped → dotted. Formen ändras per rad (cirkel → kvadrat → triangel). Sista cellen ska därför vara en triangel med dotted fill.',  
    patternTypes: \['color-change'\],  
    timeEstimateSeconds: 45  
  },

  // \============================================================================  
  // DIFFICULTY 1 \- Enkel rotation  
  // \============================================================================  
  {  
    id: crypto.randomUUID(),  
    testType: 'matrislogik-classic',  
    difficulty: 1,  
    matrix: \[  
      \[  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 0)),  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 90)),  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 180))  
      \],  
      \[  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 0)),  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 90)),  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 180))  
      \],  
      \[  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 0)),  
        createCell(createShape('triangle', 'solid', 'black', 'medium', 90)),  
        EMPTY  
      \]  
    \],  
    options: \[  
      createCell(createShape('triangle', 'solid', 'black', 'medium', 180)), // RÄTT  
      createCell(createShape('triangle', 'solid', 'black', 'medium', 0)),  
      createCell(createShape('triangle', 'solid', 'black', 'medium', 90)),  
      createCell(createShape('triangle', 'solid', 'black', 'medium', 270)),  
      createCell(createShape('square', 'solid', 'black', 'medium', 180)),  
      createCell(createShape('triangle', 'striped', 'black', 'medium', 180))  
    \],  
    correctAnswer: 0,  
    explanation: 'Triangeln roterar 90° per kolumn: 0° → 90° → 180°. Alla rader följer samma mönster.',  
    patternTypes: \['rotation'\],  
    timeEstimateSeconds: 50  
  },

  // ... (fortsätt med 18 frågor till)  
    
  // \============================================================================  
  // DIFFICULTY 3 \- Kombination: Färg \+ Rotation  
  // \============================================================================  
  {  
    id: crypto.randomUUID(),  
    testType: 'matrislogik-classic',  
    difficulty: 3,  
    matrix: \[  
      \[  
        createCell(createShape('square', 'solid', 'black', 'medium', 0)),  
        createCell(createShape('square', 'striped', 'black', 'medium', 45)),  
        createCell(createShape('square', 'dotted', 'black', 'medium', 90))  
      \],  
      \[  
        createCell(createShape('square', 'striped', 'black', 'medium', 0)),  
        createCell(createShape('square', 'dotted', 'black', 'medium', 45)),  
        createCell(createShape('square', 'empty', 'black', 'medium', 90))  
      \],  
      \[  
        createCell(createShape('square', 'dotted', 'black', 'medium', 0)),  
        createCell(createShape('square', 'empty', 'black', 'medium', 45)),  
        EMPTY  
      \]  
    \],  
    options: \[  
      createCell(createShape('square', 'solid', 'black', 'medium', 90)), // RÄTT  
      createCell(createShape('square', 'empty', 'black', 'medium', 90)),  
      createCell(createShape('square', 'striped', 'black', 'medium', 90)),  
      createCell(createShape('square', 'solid', 'black', 'medium', 0)),  
      createCell(createShape('circle', 'solid', 'black', 'medium', 90)),  
      createCell(createShape('square', 'dotted', 'black', 'medium', 90))  
    \],  
    correctAnswer: 0,  
    explanation: 'Två mönster kombineras: (1) Färg går "baklänges" per rad: solid → striped → dotted → empty, och (2) Rotation ökar 45° per kolumn. Sista cellen: solid (en steg före dotted i sekvens) \+ 90° rotation.',  
    patternTypes: \['color-change', 'rotation'\],  
    timeEstimateSeconds: 95  
  },

  // ... (fortsätt med 15 frågor till \- totalt 20\)  
\];

// \============================================================================  
// HELPER \- Hämta frågor för test  
// \============================================================================

export function getQuestionsForTest(count: number \= 15): ServerQuestion\[\] {  
  // Shuffle och välj random frågor  
  const shuffled \= \[...QUESTION\_BANK\].sort(() \=\> Math.random() \- 0.5);  
    
  // Balansera svårighetsgrad (3 lätta, 7 medium, 5 svåra)  
  const easy \= shuffled.filter(q \=\> q.difficulty \<= 2).slice(0, 3);  
  const medium \= shuffled.filter(q \=\> q.difficulty \=== 3).slice(0, 7);  
  const hard \= shuffled.filter(q \=\> q.difficulty \>= 4).slice(0, 5);  
    
  return \[...easy, ...medium, ...hard\].slice(0, count);  
}

export function getQuestionById(id: string): ServerQuestion | undefined {  
  return QUESTION\_BANK.find(q \=\> q.id \=== id);  
}

**📝 NOTE:** Detta exempel visar strukturen. Fullständiga 20 frågor skapas manuellt baserat på variation av mönster.

---

### **3\. API Routes**

#### **A) src/app/api/tester/start/route.ts**

import { NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/lib/supabase/server';  
import { createTestSession } from '@/lib/tester/sessionManager';  
import { getQuestionsForTest } from '@/lib/tester/questionBank.server';  
import { ClientQuestion } from '@/lib/tester/patternTypes';

export async function POST(request: NextRequest) {  
  try {  
    const supabase \= createClient();  
    const { data: { user }, error: authError } \= await supabase.auth.getUser();  
      
    if (authError || \!user) {  
      return NextResponse.json(  
        { error: 'Unauthorized' },  
        { status: 401 }  
      );  
    }  
      
    // Hämta 15 frågor från server-side bank  
    const serverQuestions \= getQuestionsForTest(15);  
      
    // Konvertera till client-safe format (utan svar)  
    const clientQuestions: ClientQuestion\[\] \= serverQuestions.map(q \=\> ({  
      id: q.id,  
      difficulty: q.difficulty,  
      matrix: q.matrix,  
      options: q.options  
      // correctAnswer INTE här\!  
    }));  
      
    // Skapa session token  
    const sessionToken \= await createTestSession(  
      user.id,  
      'matrislogik-classic',  
      serverQuestions.map(q \=\> q.id)  
    );  
      
    return NextResponse.json({  
      sessionToken,  
      questions: clientQuestions,  
      testType: 'matrislogik-classic',  
      duration: 20 \* 60, // 20 min  
      totalQuestions: 15  
    });  
      
  } catch (error) {  
    console.error('\[API /tester/start\] Error:', error);  
    return NextResponse.json(  
      { error: 'Failed to start test' },  
      { status: 500 }  
    );  
  }  
}

#### **B) src/app/api/tester/submit/route.ts**

import { NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/lib/supabase/server';  
import { verifyTestSession } from '@/lib/tester/sessionManager';  
import { getQuestionById } from '@/lib/tester/questionBank.server';  
import { TestResult, QuestionBreakdown, UserAnswer } from '@/lib/tester/patternTypes';

export async function POST(request: NextRequest) {  
  try {  
    const supabase \= createClient();  
    const { data: { user }, error: authError } \= await supabase.auth.getUser();  
      
    if (authError || \!user) {  
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
    }  
      
    const { sessionToken, answers }: {  
      sessionToken: string;  
      answers: UserAnswer\[\];  
    } \= await request.json();  
      
    // Verifiera session  
    const session \= await verifyTestSession(sessionToken);  
      
    if (session.userId \!== user.id) {  
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 });  
    }  
      
    // Rätta varje svar  
    const breakdown: QuestionBreakdown\[\] \= \[\];  
    let correctCount \= 0;  
    let totalTime \= 0;  
      
    for (const answer of answers) {  
      const question \= getQuestionById(answer.questionId);  
        
      if (\!question) continue;  
        
      const isCorrect \= answer.userAnswer \=== question.correctAnswer;  
      if (isCorrect) correctCount++;  
      totalTime \+= answer.timeSpent;  
        
      breakdown.push({  
        questionId: question.id,  
        isCorrect,  
        userAnswer: answer.userAnswer,  
        correctAnswer: question.correctAnswer,  
        explanation: question.explanation,  
        timeSpent: answer.timeSpent,  
        difficulty: question.difficulty,  
        patternTypes: question.patternTypes  
      });  
    }  
      
    // Beräkna poäng  
    const scoreRaw \= (correctCount / answers.length) \* 100;  
    const scorePracticeRating \= Math.ceil(scoreRaw / 10); // 1-10  
      
    // Interpretation  
    const interpretation \=  
      scorePracticeRating \>= 9 ? 'Utmärkt\! Du är redo för riktiga tester.' :  
      scorePracticeRating \>= 7 ? 'Bra jobbat\! Fortsätt träna för att nå toppen.' :  
      scorePracticeRating \>= 5 ? 'Godkänt. Fokusera på svagare mönstertyper.' :  
      'Fortsätt öva – du förbättras snabbt med träning\!';  
      
    // Spara i Supabase  
    const { data: attempt, error: insertError } \= await supabase  
      .from('test\_attempts')  
      .insert({  
        user\_id: user.id,  
        test\_type: 'matrislogik-classic',  
        test\_mode: 'practice',  
        score\_raw: scoreRaw,  
        score\_practice\_rating: scorePracticeRating,  
        correct\_answers: correctCount,  
        total\_questions: answers.length,  
        time\_spent\_seconds: totalTime,  
        answers: answers  
      })  
      .select()  
      .single();  
      
    if (insertError) throw insertError;  
      
    const result: TestResult \= {  
      attemptId: attempt.id,  
      scoreRaw,  
      scorePracticeRating,  
      correctAnswers: correctCount,  
      totalQuestions: answers.length,  
      timeSpentSeconds: totalTime,  
      breakdown,  
      interpretation,  
      completedAt: attempt.completed\_at  
    };  
      
    return NextResponse.json(result);  
      
  } catch (error) {  
    console.error('\[API /tester/submit\] Error:', error);  
    return NextResponse.json(  
      { error: 'Failed to submit test' },  
      { status: 500 }  
    );  
  }  
}

#### **C) src/app/api/tester/history/route.ts**

import { NextRequest, NextResponse } from 'next/server';  
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {  
  try {  
    const supabase \= createClient();  
    const { data: { user }, error: authError } \= await supabase.auth.getUser();  
      
    if (authError || \!user) {  
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });  
    }  
      
    // Hämta attempts  
    const { data: attempts, error } \= await supabase  
      .from('test\_attempts')  
      .select('\*')  
      .eq('user\_id', user.id)  
      .eq('test\_type', 'matrislogik-classic')  
      .order('completed\_at', { ascending: false })  
      .limit(20);  
      
    if (error) throw error;  
      
    // Hämta stats  
    const { data: stats } \= await supabase  
      .from('test\_user\_stats')  
      .select('\*')  
      .eq('user\_id', user.id)  
      .single();  
      
    return NextResponse.json({  
      attempts: attempts || \[\],  
      stats: stats || {  
        matrislogikAttempts: 0,  
        matrislogikBestScore: 0,  
        matrislogikAvgScore: 0  
      }  
    });  
      
  } catch (error) {  
    console.error('\[API /tester/history\] Error:', error);  
    return NextResponse.json(  
      { error: 'Failed to fetch history' },  
      { status: 500 }  
    );  
  }  
}

---

## **Frontend Implementation**

### **1\. Sidebar (Highlight Tester)**

**src/components/ui/Sidebar.tsx** (UPPDATERA)  
// Lägg till i navigation items  
const navigationItems \= \[  
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },  
  { name: 'CV', href: '/dashboard/cv', icon: FileText },  
  { name: 'Jobbmatchning', href: '/dashboard/jobbmatchning', icon: Briefcase },  
  {   
    name: 'Tester', // ← NYTT  
    href: '/dashboard/tester',   
    icon: Brain, // från lucide-react  
    badge: 'Ny\!' // Optional badge  
  },  
  // ... rest  
\];

// I rendering (lägg till highlight för "Tester"):  
\<Link  
  href={item.href}  
  className={\`  
    ${pathname \=== item.href   
      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' // Active  
      : 'text-gray-700 hover:bg-gray-100'  
    }  
    ${item.name \=== 'Tester' ? 'ring-2 ring-purple-400 ring-opacity-50' : ''} // Highlight  
  \`}  
\>  
  \<item.icon className="w-5 h-5" /\>  
  {item.name}  
  {item.badge && (  
    \<span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"\>  
      {item.badge}  
    \</span\>  
  )}  
\</Link\>

---

### **2\. Test Overview Page**

**src/app/dashboard/tester/page.tsx**  
'use client';

import { useEffect, useState } from 'react';  
import { motion } from 'framer-motion';  
import { Brain, TrendingUp, Clock, Target } from 'lucide-react';  
import Link from 'next/link';

export default function TesterPage() {  
  const \[stats, setStats\] \= useState\<any\>(null);  
  const \[loading, setLoading\] \= useState(true);  
    
  useEffect(() \=\> {  
    async function fetchStats() {  
      const res \= await fetch('/api/tester/history');  
      const data \= await res.json();  
      setStats(data.stats);  
      setLoading(false);  
    }  
    fetchStats();  
  }, \[\]);  
    
  return (  
    \<div className="max-w-5xl mx-auto p-6"\>  
      {/\* Header \*/}  
      \<motion.div  
        initial={{ opacity: 0, y: \-20 }}  
        animate={{ opacity: 1, y: 0 }}  
        className="mb-8"  
      \>  
        \<div className="flex items-center gap-3 mb-2"\>  
          \<div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg"\>  
            \<Brain className="w-8 h-8 text-white" /\>  
          \</div\>  
          \<div\>  
            \<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"\>  
              Kognitiva Tester  
            \</h1\>  
            \<p className="text-gray-600 mt-1"\>  
              Träna inför rekryteringsprocesser  
            \</p\>  
          \</div\>  
        \</div\>  
      \</motion.div\>

      {/\* Stats Cards \*/}  
      {\!loading && stats && (  
        \<div className="grid md:grid-cols-3 gap-4 mb-8"\>  
          \<div className="bg-white rounded-xl p-6 border-2 border-gray-200"\>  
            \<TrendingUp className="w-8 h-8 text-purple-600 mb-2" /\>  
            \<p className="text-sm text-gray-600"\>Bästa Resultat\</p\>  
            \<p className="text-3xl font-bold text-purple-600"\>  
              {stats.matrislogikBestScore}/10  
            \</p\>  
          \</div\>  
            
          \<div className="bg-white rounded-xl p-6 border-2 border-gray-200"\>  
            \<Target className="w-8 h-8 text-indigo-600 mb-2" /\>  
            \<p className="text-sm text-gray-600"\>Genomsnitt\</p\>  
            \<p className="text-3xl font-bold text-indigo-600"\>  
              {stats.matrislogikAvgScore.toFixed(1)}/10  
            \</p\>  
          \</div\>  
            
          \<div className="bg-white rounded-xl p-6 border-2 border-gray-200"\>  
            \<Clock className="w-8 h-8 text-pink-600 mb-2" /\>  
            \<p className="text-sm text-gray-600"\>Antal Försök\</p\>  
            \<p className="text-3xl font-bold text-pink-600"\>  
              {stats.matrislogikAttempts}  
            \</p\>  
          \</div\>  
        \</div\>  
      )}

      {/\* Test Cards \*/}  
      \<div className="grid gap-6"\>  
        {/\* Matrislogik Test \*/}  
        \<Link href="/dashboard/tester/matrislogik"\>  
          \<motion.div  
            whileHover={{ scale: 1.02 }}  
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"  
          \>  
            \<div className="flex items-start justify-between mb-4"\>  
              \<div\>  
                \<h2 className="text-2xl font-bold text-gray-900 mb-2"\>  
                  Matrislogik (Raven-stil)  
                \</h2\>  
                \<p className="text-gray-700 mb-4"\>  
                  Träna på abstrakt problemlösning med 3x3 matriser.   
                  Förbered dig för tester som Matrigma, Alva Labs och liknande.  
                \</p\>  
                  
                \<div className="flex gap-4 text-sm text-gray-600"\>  
                  \<div className="flex items-center gap-1"\>  
                    \<Clock className="w-4 h-4" /\>  
                    20 min  
                  \</div\>  
                  \<div className="flex items-center gap-1"\>  
                    \<Target className="w-4 h-4" /\>  
                    15 frågor  
                  \</div\>  
                \</div\>  
              \</div\>  
                
              \<div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold"\>  
                Börja träna →  
              \</div\>  
            \</div\>  
          \</motion.div\>  
        \</Link\>

        {/\* Future tests placeholder \*/}  
        \<div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 opacity-60"\>  
          \<h3 className="text-xl font-bold text-gray-500 mb-2"\>  
            Fler tester kommer snart  
          \</h3\>  
          \<p className="text-gray-500"\>  
            Vi jobbar på att lägga till verbala och numeriska tester.  
          \</p\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}

---

### **3\. Matrislogik Start Page**

**src/app/dashboard/tester/matrislogik/page.tsx**  
'use client';

import { useState } from 'react';  
import { useRouter } from 'next/navigation';  
import { Brain, Clock, Target, AlertCircle } from 'lucide-react';  
import DisclaimerBanner from './components/DisclaimerBanner';

export default function MatrislogikStartPage() {  
  const router \= useRouter();  
  const \[accepted, setAccepted\] \= useState(false);  
  const \[starting, setStarting\] \= useState(false);  
    
  const handleStartTest \= async () \=\> {  
    if (\!accepted) {  
      alert('Du måste acceptera villkoren för att starta testet.');  
      return;  
    }  
      
    setStarting(true);  
      
    try {  
      const response \= await fetch('/api/tester/start', {  
        method: 'POST'  
      });  
        
      if (\!response.ok) throw new Error('Failed to start test');  
        
      const { sessionToken } \= await response.json();  
        
      // Navigera till test med session token  
      router.push(\`/dashboard/tester/matrislogik/test/${sessionToken}\`);  
        
    } catch (error) {  
      console.error('Error starting test:', error);  
      alert('Kunde inte starta testet. Försök igen.');  
      setStarting(false);  
    }  
  };  
    
  return (  
    \<div className="max-w-3xl mx-auto p-6"\>  
      \<div className="mb-8"\>  
        \<h1 className="text-3xl font-bold text-gray-900 mb-2"\>  
          Matrislogik-test (Raven-stil)  
        \</h1\>  
        \<p className="text-gray-600"\>  
          Träna på abstrakt problemlösning och mönsterigenkänning  
        \</p\>  
      \</div\>

      {/\* Info Cards \*/}  
      \<div className="grid md:grid-cols-3 gap-4 mb-8"\>  
        \<div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center"\>  
          \<Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" /\>  
          \<p className="font-semibold"\>20 minuter\</p\>  
          \<p className="text-sm text-gray-600"\>Total tid\</p\>  
        \</div\>  
          
        \<div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center"\>  
          \<Target className="w-8 h-8 text-purple-600 mx-auto mb-2" /\>  
          \<p className="font-semibold"\>15 frågor\</p\>  
          \<p className="text-sm text-gray-600"\>Varierande svårighetsgrad\</p\>  
        \</div\>  
          
        \<div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center"\>  
          \<Brain className="w-8 h-8 text-pink-600 mx-auto mb-2" /\>  
          \<p className="font-semibold"\>Poäng 1-10\</p\>  
          \<p className="text-sm text-gray-600"\>Övningsskala\</p\>  
        \</div\>  
      \</div\>

      {/\* Disclaimer \*/}  
      \<DisclaimerBanner /\>

      {/\* Instruktioner \*/}  
      \<div className="bg-white rounded-xl p-6 border-2 border-gray-200 mb-8"\>  
        \<h2 className="text-xl font-bold text-gray-900 mb-4"\>  
          Så fungerar testet  
        \</h2\>  
          
        \<ol className="space-y-3 text-gray-700"\>  
          \<li className="flex gap-3"\>  
            \<span className="font-bold text-purple-600"\>1.\</span\>  
            \<span\>  
              Du får se en 3x3 matris med geometriska former. En cell (nedre högra hörnet) är tom med ett frågetecken.  
            \</span\>  
          \</li\>  
            
          \<li className="flex gap-3"\>  
            \<span className="font-bold text-purple-600"\>2.\</span\>  
            \<span\>  
              Din uppgift är att hitta det logiska mönstret i matrisen och välja rätt form bland 6 svarsalternativ (A-F).  
            \</span\>  
          \</li\>  
            
          \<li className="flex gap-3"\>  
            \<span className="font-bold text-purple-600"\>3.\</span\>  
            \<span\>  
              Mönster kan vara: färgförändring, rotation, antal shapes, spatial förflyttning, eller kombinationer.  
            \</span\>  
          \</li\>  
            
          \<li className="flex gap-3"\>  
            \<span className="font-bold text-purple-600"\>4.\</span\>  
            \<span\>  
              Tips: Kolla rader, kolumner OCH diagonaler. Hoppa över svåra frågor och kom tillbaka senare.  
            \</span\>  
          \</li\>  
        \</ol\>  
      \</div\>

      {/\* Samtycke \*/}  
      \<label className="flex items-start gap-3 mb-6 cursor-pointer"\>  
        \<input   
          type="checkbox"  
          checked={accepted}  
          onChange={(e) \=\> setAccepted(e.target.checked)}  
          className="w-5 h-5 mt-0.5 text-purple-600"  
        /\>  
        \<span className="text-sm text-gray-700"\>  
          Jag förstår att detta är ett övningstest (inte diagnostik),   
          och att mina svar sparas för progresstracking enligt GDPR.  
        \</span\>  
      \</label\>

      {/\* Start Button \*/}  
      \<button  
        onClick={handleStartTest}  
        disabled={\!accepted || starting}  
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"  
      \>  
        {starting ? 'Startar test...' : 'Starta Test'}  
      \</button\>  
    \</div\>  
  );

}

# **DEL 2: Frontend-komponenter, 20 Frågor & Lansering**

## **1\. Komplett Frågebank (20 frågor)**

Här är alla 20 frågor med fullständiga implementationer:

### **src/lib/tester/questionBank.server.ts**

import { ServerQuestion, Shape, MatrixCell } from './patternTypes';

import crypto from 'crypto';

// Helper functions för att skapa shapes

const createShape \= (

  form: Shape\['form'\],

  fill: Shape\['fill'\],

  color: Shape\['color'\],

  size: Shape\['size'\] \= 'medium',

  rotation: number \= 0

): Shape \=\> ({ form, fill, color, size, rotation });

const createCell \= (shapes: Shape\[\]): MatrixCell \=\> ({ shapes });

export const QUESTION\_BANK: ServerQuestion\[\] \= \[

  // \==================== DIFFICULTY 1-2: Enkla mönster \====================


  // Fråga 1: Enkel färgsekvens (Difficulty 1\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 1,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'blue')\]),

        createCell(\[createShape('circle', 'solid', 'red')\]),

        createCell(\[createShape('circle', 'solid', 'green')\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'blue')\]),

        createCell(\[createShape('square', 'solid', 'red')\]),

        createCell(\[createShape('square', 'solid', 'green')\])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'blue')\]),

        createCell(\[createShape('triangle', 'solid', 'red')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'green')\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'blue')\]),

      createCell(\[createShape('circle', 'solid', 'green')\]),

      createCell(\[createShape('triangle', 'solid', 'red')\]),

      createCell(\[createShape('square', 'solid', 'green')\]),

      createCell(\[createShape('triangle', 'striped', 'green')\])

    \],

    correctAnswer: 0,

    explanation: 'Färgsekvens per rad: blå → röd → grön. Formen ändras per rad (cirkel, fyrkant, triangel) men färgordningen är konsekvent.',

    patternTypes: \['color-change'\]

  },

  // Fråga 2: Enkel formsekvens med fyllnad (Difficulty 1\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 1,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'black')\]),

        createCell(\[createShape('circle', 'striped', 'black')\]),

        createCell(\[createShape('circle', 'empty', 'black')\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'black')\]),

        createCell(\[createShape('square', 'striped', 'black')\]),

        createCell(\[createShape('square', 'empty', 'black')\])

      \],

      \[

        createCell(\[createShape('diamond', 'solid', 'black')\]),

        createCell(\[createShape('diamond', 'striped', 'black')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('diamond', 'empty', 'black')\]), // CORRECT

      createCell(\[createShape('diamond', 'solid', 'black')\]),

      createCell(\[createShape('diamond', 'dotted', 'black')\]),

      createCell(\[createShape('circle', 'empty', 'black')\]),

      createCell(\[createShape('diamond', 'striped', 'black')\]),

      createCell(\[createShape('square', 'empty', 'black')\])

    \],

    correctAnswer: 0,

    explanation: 'Fyllnadssekvens per rad: solid → striped → empty. Formen varierar per rad men fyllnadsmönstret är konstant.',

    patternTypes: \['color-change'\]

  },

  // Fråga 3: Enkel rotation 90° (Difficulty 2\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 2,

    matrix: \[

      \[

        createCell(\[createShape('triangle', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'black', 'medium', 90)\]),

        createCell(\[createShape('triangle', 'solid', 'black', 'medium', 180)\])

      \],

      \[

        createCell(\[createShape('diamond', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('diamond', 'solid', 'black', 'medium', 90)\]),

        createCell(\[createShape('diamond', 'solid', 'black', 'medium', 180)\])

      \],

      \[

        createCell(\[createShape('star', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('star', 'solid', 'black', 'medium', 90)\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('star', 'solid', 'black', 'medium', 180)\]), // CORRECT

      createCell(\[createShape('star', 'solid', 'black', 'medium', 270)\]),

      createCell(\[createShape('star', 'solid', 'black', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'solid', 'black', 'medium', 180)\]),

      createCell(\[createShape('star', 'solid', 'black', 'medium', 0)\]),

      createCell(\[createShape('star', 'striped', 'black', 'medium', 180)\])

    \],

    correctAnswer: 0,

    explanation: 'Rotationssekvens per rad: 0° → 90° → 180°. Formen varierar per rad men rotationsmönstret är detsamma.',

    patternTypes: \['rotation'\]

  },

  // Fråga 4: Kvantitet \- ökning (Difficulty 2\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 2,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'blue', 'small')\]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'red', 'small')\]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small'),

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small'),

          createShape('square', 'solid', 'red', 'small'),

          createShape('square', 'solid', 'red', 'small')

        \])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'green', 'small')\]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'small'),

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small')

      \]), // CORRECT

      createCell(\[

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small')

      \]),

      createCell(\[createShape('triangle', 'solid', 'green', 'small')\]),

      createCell(\[

        createShape('circle', 'solid', 'green', 'small'),

        createShape('circle', 'solid', 'green', 'small'),

        createShape('circle', 'solid', 'green', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'blue', 'small'),

        createShape('triangle', 'solid', 'blue', 'small'),

        createShape('triangle', 'solid', 'blue', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'striped', 'green', 'small'),

        createShape('triangle', 'striped', 'green', 'small'),

        createShape('triangle', 'striped', 'green', 'small')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Kvantitetssekvens per rad: 1 form → 2 former → 3 former. Formen och färgen varierar per rad men antalet ökar konsekvent.',

    patternTypes: \['quantity'\]

  },

  // \==================== DIFFICULTY 3: Kombinerade mönster \====================

  // Fråga 5: Färg \+ Rotation (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'red', 'medium', 90)\]),

        createCell(\[createShape('triangle', 'solid', 'green', 'medium', 180)\])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'red', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'green', 'medium', 90)\]),

        createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 180)\])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'green', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 90)\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'red', 'medium', 180)\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'green', 'medium', 180)\]),

      createCell(\[createShape('triangle', 'solid', 'red', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 180)\]),

      createCell(\[createShape('square', 'solid', 'red', 'medium', 180)\]),

      createCell(\[createShape('triangle', 'striped', 'red', 'medium', 180)\])

    \],

    correctAnswer: 0,

    explanation: 'Två mönster: (1) Rotation per kolumn: 0° → 90° → 180°. (2) Färgrotation per rad: blå→röd→grön, röd→grön→blå, grön→blå→röd.',

    patternTypes: \['rotation', 'color-change'\]

  },

  // Fråga 6: Fyllnad \+ Form (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'black')\]),

        createCell(\[createShape('square', 'striped', 'black')\]),

        createCell(\[createShape('triangle', 'empty', 'black')\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'black')\]),

        createCell(\[createShape('triangle', 'striped', 'black')\]),

        createCell(\[createShape('circle', 'empty', 'black')\])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'black')\]),

        createCell(\[createShape('circle', 'striped', 'black')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('square', 'empty', 'black')\]), // CORRECT

      createCell(\[createShape('square', 'solid', 'black')\]),

      createCell(\[createShape('triangle', 'empty', 'black')\]),

      createCell(\[createShape('square', 'striped', 'black')\]),

      createCell(\[createShape('circle', 'empty', 'black')\]),

      createCell(\[createShape('square', 'dotted', 'black')\])

    \],

    correctAnswer: 0,

    explanation: 'Två mönster: (1) Formrotation per rad: cirkel→fyrkant→triangel, fyrkant→triangel→cirkel, triangel→cirkel→fyrkant. (2) Fyllnad per kolumn: solid→striped→empty.',

    patternTypes: \['structural', 'color-change'\]

  },

  // Fråga 7: Kvantitet \+ Färg (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'blue', 'small')\]),

        createCell(\[

          createShape('circle', 'solid', 'red', 'small'),

          createShape('circle', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'green', 'small'),

          createShape('circle', 'solid', 'green', 'small'),

          createShape('circle', 'solid', 'green', 'small')

        \])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'red', 'small')\]),

        createCell(\[

          createShape('square', 'solid', 'green', 'small'),

          createShape('square', 'solid', 'green', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'blue', 'small'),

          createShape('square', 'solid', 'blue', 'small'),

          createShape('square', 'solid', 'blue', 'small')

        \])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'green', 'small')\]),

        createCell(\[

          createShape('triangle', 'solid', 'blue', 'small'),

          createShape('triangle', 'solid', 'blue', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('triangle', 'solid', 'red', 'small'),

        createShape('triangle', 'solid', 'red', 'small'),

        createShape('triangle', 'solid', 'red', 'small')

      \]), // CORRECT

      createCell(\[

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small')

      \]),

      createCell(\[

        createShape('circle', 'solid', 'red', 'small'),

        createShape('circle', 'solid', 'red', 'small'),

        createShape('circle', 'solid', 'red', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'blue', 'small'),

        createShape('triangle', 'solid', 'blue', 'small'),

        createShape('triangle', 'solid', 'blue', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'red', 'small'),

        createShape('triangle', 'solid', 'red', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'striped', 'red', 'small'),

        createShape('triangle', 'striped', 'red', 'small'),

        createShape('triangle', 'striped', 'red', 'small')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Två mönster: (1) Kvantitet per kolumn: 1→2→3. (2) Färgrotation per rad: blå→röd→grön, röd→grön→blå, grön→blå→röd.',

    patternTypes: \['quantity', 'color-change'\]

  },

  // Fråga 8: Storlek \+ Position (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'black', 'small')\]),

        createCell(\[createShape('circle', 'solid', 'black', 'medium')\]),

        createCell(\[createShape('circle', 'solid', 'black', 'large')\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'black', 'medium')\]),

        createCell(\[createShape('square', 'solid', 'black', 'large')\]),

        createCell(\[createShape('square', 'solid', 'black', 'small')\])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'black', 'large')\]),

        createCell(\[createShape('triangle', 'solid', 'black', 'small')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'black', 'medium')\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'black', 'large')\]),

      createCell(\[createShape('triangle', 'solid', 'black', 'small')\]),

      createCell(\[createShape('circle', 'solid', 'black', 'medium')\]),

      createCell(\[createShape('square', 'solid', 'black', 'medium')\]),

      createCell(\[createShape('triangle', 'striped', 'black', 'medium')\])

    \],

    correctAnswer: 0,

    explanation: 'Storleksrotation per rad: Rad 1 (liten→medium→stor), Rad 2 (medium→stor→liten), Rad 3 (stor→liten→medium). Formen varierar per rad.',

    patternTypes: \['size-change'\]

  },

  // Fråga 9: Form \+ Rotation \+ Fyllnad (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('triangle', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('square', 'striped', 'black', 'medium', 45)\]),

        createCell(\[createShape('circle', 'empty', 'black', 'medium', 0)\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('circle', 'striped', 'black', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'empty', 'black', 'medium', 45)\])

      \],

      \[

        createCell(\[createShape('circle', 'solid', 'black', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'striped', 'black', 'medium', 45)\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('square', 'empty', 'black', 'medium', 0)\]), // CORRECT

      createCell(\[createShape('square', 'solid', 'black', 'medium', 0)\]),

      createCell(\[createShape('circle', 'empty', 'black', 'medium', 0)\]),

      createCell(\[createShape('square', 'empty', 'black', 'medium', 45)\]),

      createCell(\[createShape('triangle', 'empty', 'black', 'medium', 0)\]),

      createCell(\[createShape('square', 'dotted', 'black', 'medium', 0)\])

    \],

    correctAnswer: 0,

    explanation: 'Tre mönster: (1) Formrotation per rad: triangel→fyrkant→cirkel, fyrkant→cirkel→triangel, cirkel→triangel→fyrkant. (2) Fyllnad per kolumn: solid→striped→empty. (3) Rotation: kolumn 2 har 45°.',

    patternTypes: \['structural', 'rotation', 'color-change'\]

  },

  // Fråga 10: Diagonal \+ Kvantitet (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small'),

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[createShape('triangle', 'solid', 'green', 'small')\])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'red', 'small'),

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'small'),

          createShape('triangle', 'solid', 'green', 'small'),

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \])

      \],

      \[

        createCell(\[createShape('triangle', 'solid', 'green', 'small')\]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('square', 'solid', 'red', 'small'),

        createShape('square', 'solid', 'red', 'small'),

        createShape('square', 'solid', 'red', 'small')

      \]), // CORRECT

      createCell(\[

        createShape('square', 'solid', 'red', 'small'),

        createShape('square', 'solid', 'red', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small'),

        createShape('triangle', 'solid', 'green', 'small')

      \]),

      createCell(\[createShape('square', 'solid', 'red', 'small')\]),

      createCell(\[

        createShape('circle', 'solid', 'blue', 'small'),

        createShape('circle', 'solid', 'blue', 'small'),

        createShape('circle', 'solid', 'blue', 'small')

      \]),

      createCell(\[

        createShape('square', 'striped', 'red', 'small'),

        createShape('square', 'striped', 'red', 'small'),

        createShape('square', 'striped', 'red', 'small')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Diagonalt mönster från top-left till bottom-right: Cirklar (3→2→?), Trianglar (2→3→?), Fyrkanter (1→2→3). Sista cellen ska ha 3 fyrkanter.',

    patternTypes: \['spatial', 'quantity'\]

  },

  // Fråga 11: Färg \+ Fyllnad \+ Form (Difficulty 3\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 3,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'blue')\]),

        createCell(\[createShape('square', 'striped', 'red')\]),

        createCell(\[createShape('triangle', 'empty', 'green')\])

      \],

      \[

        createCell(\[createShape('square', 'striped', 'green')\]),

        createCell(\[createShape('triangle', 'empty', 'blue')\]),

        createCell(\[createShape('circle', 'solid', 'red')\])

      \],

      \[

        createCell(\[createShape('triangle', 'empty', 'red')\]),

        createCell(\[createShape('circle', 'solid', 'green')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('square', 'striped', 'blue')\]), // CORRECT

      createCell(\[createShape('square', 'solid', 'blue')\]),

      createCell(\[createShape('circle', 'striped', 'blue')\]),

      createCell(\[createShape('square', 'striped', 'green')\]),

      createCell(\[createShape('triangle', 'striped', 'blue')\]),

      createCell(\[createShape('square', 'empty', 'blue')\])

    \],

    correctAnswer: 0,

    explanation: 'Latin square-mönster: Varje form, färg och fyllnad förekommer exakt en gång per rad och kolumn. Sista cellen måste vara en randig blå fyrkant.',

    patternTypes: \['structural', 'color-change'\]

  },

  // \==================== DIFFICULTY 4-5: Avancerade mönster \====================

  // Fråga 12: Tre överlappande former (Difficulty 4\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 4,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'large'),

          createShape('square', 'empty', 'red', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'large'),

          createShape('square', 'empty', 'red', 'small'),

          createShape('triangle', 'striped', 'green', 'medium')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'large')

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'red', 'large'),

          createShape('triangle', 'empty', 'green', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'large'),

          createShape('triangle', 'empty', 'green', 'small'),

          createShape('circle', 'striped', 'blue', 'medium')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'large')

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'green', 'large'),

          createShape('circle', 'empty', 'blue', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'large'),

          createShape('circle', 'empty', 'blue', 'small'),

          createShape('square', 'striped', 'red', 'medium')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'green', 'large')\]), // CORRECT

      createCell(\[

        createShape('triangle', 'solid', 'green', 'large'),

        createShape('circle', 'empty', 'blue', 'small')

      \]),

      createCell(\[createShape('circle', 'solid', 'blue', 'large')\]),

      createCell(\[

        createShape('triangle', 'solid', 'green', 'large'),

        createShape('square', 'striped', 'red', 'medium')

      \]),

      createCell(\[createShape('square', 'solid', 'red', 'large')\]),

      createCell(\[

        createShape('triangle', 'striped', 'green', 'large')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Överlappningsmönster per rad: Kolumn 1 (2 former), Kolumn 2 (3 former), Kolumn 3 (1 form \- endast basformen). Rad 3, Kolumn 3 ska ha endast triangeln.',

    patternTypes: \['quantity', 'structural'\]

  },

  // Fråga 13: Diagonal rotation \+ färgbyte (Difficulty 4\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 4,

    matrix: \[

      \[

        createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 0)\]),

        createCell(\[createShape('square', 'solid', 'red', 'medium', 0)\]),

        createCell(\[createShape('circle', 'solid', 'green', 'medium', 0)\])

      \],

      \[

        createCell(\[createShape('circle', 'solid', 'red', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'green', 'medium', 90)\]),

        createCell(\[createShape('square', 'solid', 'blue', 'medium', 0)\])

      \],

      \[

        createCell(\[createShape('square', 'solid', 'green', 'medium', 0)\]),

        createCell(\[createShape('circle', 'solid', 'blue', 'medium', 0)\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'red', 'medium', 180)\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'red', 'medium', 0)\]),

      createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 180)\]),

      createCell(\[createShape('square', 'solid', 'red', 'medium', 180)\]),

      createCell(\[createShape('triangle', 'solid', 'red', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'striped', 'red', 'medium', 180)\])

    \],

    correctAnswer: 0,

    explanation: 'Två mönster: (1) Formrotation per diagonal: top-left→center→bottom-right innehåller triangel (0°→90°→180°). (2) Färgrotation per rad med offset.',

    patternTypes: \['spatial', 'rotation', 'color-change'\]

  },

  // Fråga 14: Komplex kvantitet \+ position (Difficulty 4\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 4,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'black', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'black', 'small'),

          createShape('circle', 'solid', 'black', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'black', 'small'),

          createShape('circle', 'solid', 'black', 'small'),

          createShape('circle', 'solid', 'black', 'small')

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'black', 'small'),

          createShape('square', 'solid', 'black', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'black', 'small'),

          createShape('square', 'solid', 'black', 'small'),

          createShape('square', 'solid', 'black', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'black', 'small')

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'black', 'small'),

          createShape('triangle', 'solid', 'black', 'small'),

          createShape('triangle', 'solid', 'black', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'black', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('triangle', 'solid', 'black', 'small'),

        createShape('triangle', 'solid', 'black', 'small')

      \]), // CORRECT

      createCell(\[

        createShape('triangle', 'solid', 'black', 'small'),

        createShape('triangle', 'solid', 'black', 'small'),

        createShape('triangle', 'solid', 'black', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'black', 'small')

      \]),

      createCell(\[

        createShape('circle', 'solid', 'black', 'small'),

        createShape('circle', 'solid', 'black', 'small')

      \]),

      createCell(\[

        createShape('square', 'solid', 'black', 'small'),

        createShape('square', 'solid', 'black', 'small')

      \]),

      createCell(\[

        createShape('triangle', 'striped', 'black', 'small'),

        createShape('triangle', 'striped', 'black', 'small')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Kvantitetsmönster per rad roterar: Rad 1 (1→2→3), Rad 2 (2→3→1), Rad 3 (3→1→2). Formen varierar per rad.',

    patternTypes: \['quantity', 'structural'\]

  },

  // Fråga 15: Addition/Subtraktion av element (Difficulty 4\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 4,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'medium'),

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'medium')

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'green', 'medium'),

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'medium')

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'red', 'medium'),

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('square', 'solid', 'red', 'medium')\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'green', 'small')\]),

      createCell(\[

        createShape('square', 'solid', 'red', 'medium'),

        createShape('triangle', 'solid', 'green', 'small')

      \]),

      createCell(\[createShape('circle', 'solid', 'blue', 'medium')\]),

      createCell(\[createShape('square', 'solid', 'red', 'small')\]),

      createCell(\[createShape('square', 'striped', 'red', 'medium')\])

    \],

    correctAnswer: 0,

    explanation: 'Subtraktionsmönster per rad: Kolumn 1 innehåller två former, Kolumn 2 innehåller den form som ska subtraheras, Kolumn 3 är resultatet (återstående form).',

    patternTypes: \['structural', 'quantity'\]

  },

  // Fråga 16: Komplex färg \+ fyllnad \+ rotation (Difficulty 5\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 5,

    matrix: \[

      \[

        createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'striped', 'red', 'medium', 45)\]),

        createCell(\[createShape('triangle', 'empty', 'green', 'medium', 90)\])

      \],

      \[

        createCell(\[createShape('triangle', 'striped', 'green', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'empty', 'blue', 'medium', 45)\]),

        createCell(\[createShape('triangle', 'solid', 'red', 'medium', 90)\])

      \],

      \[

        createCell(\[createShape('triangle', 'empty', 'red', 'medium', 0)\]),

        createCell(\[createShape('triangle', 'solid', 'green', 'medium', 45)\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'striped', 'blue', 'medium', 90)\]), // CORRECT

      createCell(\[createShape('triangle', 'solid', 'blue', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'striped', 'red', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'striped', 'blue', 'medium', 45)\]),

      createCell(\[createShape('triangle', 'empty', 'blue', 'medium', 90)\]),

      createCell(\[createShape('triangle', 'dotted', 'blue', 'medium', 90)\])

    \],

    correctAnswer: 0,

    explanation: 'Latin square med tre dimensioner: (1) Färg per rad och kolumn unik, (2) Fyllnad per rad och kolumn unik, (3) Rotation per kolumn: 0°→45°→90°.',

    patternTypes: \['structural', 'color-change', 'rotation'\]

  },

  // Fråga 17: Diagonal symmetri (Difficulty 5\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 5,

    matrix: \[

      \[

        createCell(\[createShape('circle', 'solid', 'blue')\]),

        createCell(\[createShape('square', 'striped', 'red')\]),

        createCell(\[createShape('triangle', 'empty', 'green')\])

      \],

      \[

        createCell(\[createShape('square', 'striped', 'red')\]),

        createCell(\[createShape('triangle', 'solid', 'green')\]),

        createCell(\[createShape('circle', 'empty', 'blue')\])

      \],

      \[

        createCell(\[createShape('triangle', 'empty', 'green')\]),

        createCell(\[createShape('circle', 'empty', 'blue')\]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('square', 'solid', 'red')\]), // CORRECT

      createCell(\[createShape('circle', 'solid', 'blue')\]),

      createCell(\[createShape('triangle', 'solid', 'green')\]),

      createCell(\[createShape('square', 'striped', 'red')\]),

      createCell(\[createShape('square', 'empty', 'red')\]),

      createCell(\[createShape('square', 'dotted', 'red')\])

    \],

    correctAnswer: 0,

    explanation: 'Diagonal spegling: Matrisen är symmetrisk längs huvuddiagonalen (top-left till bottom-right). Position \[0,1\] \= \[1,0\], \[0,2\] \= \[2,0\], \[1,2\] \= \[2,1\]. Center-cellen \[2,2\] ska komplettera mönstret med solid fyllnad.',

    patternTypes: \['spatial', 'structural'\]

  },

  // Fråga 18: XOR-operation (Difficulty 5\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 5,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small'),

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small')

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'green', 'small'),

          createShape('circle', 'solid', 'blue', 'small')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small')

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'red', 'small'),

          createShape('triangle', 'solid', 'green', 'small')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'small')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[createShape('triangle', 'solid', 'green', 'small')\]), // CORRECT

      createCell(\[createShape('square', 'solid', 'red', 'small')\]),

      createCell(\[

        createShape('square', 'solid', 'red', 'small'),

        createShape('triangle', 'solid', 'green', 'small')

      \]),

      createCell(\[createShape('circle', 'solid', 'blue', 'small')\]),

      createCell(\[\]),

      createCell(\[createShape('triangle', 'striped', 'green', 'small')\])

    \],

    correctAnswer: 0,

    explanation: 'XOR-operation per rad: Kolumn 1 innehåller två former (A ∪ B), Kolumn 2 innehåller en form (A), Kolumn 3 innehåller den andra formen (B). Detta är en set difference operation: (A ∪ B) \- A \= B.',

    patternTypes: \['structural', 'quantity'\]

  },

  // Fråga 19: Komplex överlappning \+ färgblandning (Difficulty 5\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 5,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'large'),

          createShape('circle', 'solid', 'red', 'medium')

        \]),

        createCell(\[

          createShape('square', 'solid', 'red', 'large'),

          createShape('square', 'solid', 'green', 'medium')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'green', 'large'),

          createShape('triangle', 'solid', 'blue', 'medium')

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'green', 'large'),

          createShape('square', 'solid', 'blue', 'medium')

        \]),

        createCell(\[

          createShape('triangle', 'solid', 'blue', 'large'),

          createShape('triangle', 'solid', 'red', 'medium')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'red', 'large'),

          createShape('circle', 'solid', 'green', 'medium')

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'red', 'large'),

          createShape('triangle', 'solid', 'green', 'medium')

        \]),

        createCell(\[

          createShape('circle', 'solid', 'green', 'large'),

          createShape('circle', 'solid', 'blue', 'medium')

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('square', 'solid', 'blue', 'large'),

        createShape('square', 'solid', 'red', 'medium')

      \]), // CORRECT

      createCell(\[

        createShape('square', 'solid', 'red', 'large'),

        createShape('square', 'solid', 'blue', 'medium')

      \]),

      createCell(\[

        createShape('triangle', 'solid', 'blue', 'large'),

        createShape('triangle', 'solid', 'red', 'medium')

      \]),

      createCell(\[

        createShape('circle', 'solid', 'blue', 'large'),

        createShape('circle', 'solid', 'red', 'medium')

      \]),

      createCell(\[

        createShape('square', 'solid', 'green', 'large'),

        createShape('square', 'solid', 'blue', 'medium')

      \]),

      createCell(\[

        createShape('square', 'striped', 'blue', 'large'),

        createShape('square', 'striped', 'red', 'medium')

      \])

    \],

    correctAnswer: 0,

    explanation: 'Latin square med överlappning: Varje form förekommer en gång per rad/kolumn. Färgparen roterar: blå+röd, röd+grön, grön+blå. Rad 3, Kolumn 3 måste vara fyrkant (den enda formen som saknas i rad 3\) med färgpar blå+röd.',

    patternTypes: \['structural', 'color-change', 'quantity'\]

  },

  // Fråga 20: Ultra-komplex multi-dimensionell transformation (Difficulty 5\)

  {

    id: crypto.randomUUID(),

    testType: 'matrislogik-classic',

    difficulty: 5,

    matrix: \[

      \[

        createCell(\[

          createShape('circle', 'solid', 'blue', 'small', 0),

          createShape('square', 'striped', 'red', 'medium', 45\)

        \]),

        createCell(\[

          createShape('circle', 'striped', 'red', 'medium', 45),

          createShape('square', 'empty', 'green', 'large', 90\)

        \]),

        createCell(\[

          createShape('circle', 'empty', 'green', 'large', 90),

          createShape('square', 'solid', 'blue', 'small', 0\)

        \])

      \],

      \[

        createCell(\[

          createShape('square', 'solid', 'green', 'small', 0),

          createShape('triangle', 'striped', 'blue', 'medium', 45\)

        \]),

        createCell(\[

          createShape('square', 'striped', 'blue', 'medium', 45),

          createShape('triangle', 'empty', 'red', 'large', 90\)

        \]),

        createCell(\[

          createShape('square', 'empty', 'red', 'large', 90),

          createShape('triangle', 'solid', 'green', 'small', 0\)

        \])

      \],

      \[

        createCell(\[

          createShape('triangle', 'solid', 'red', 'small', 0),

          createShape('circle', 'striped', 'green', 'medium', 45\)

        \]),

        createCell(\[

          createShape('triangle', 'striped', 'green', 'medium', 45),

          createShape('circle', 'empty', 'blue', 'large', 90\)

        \]),

        createCell(\[\]) // Missing

      \]

    \],

    options: \[

      createCell(\[

        createShape('triangle', 'empty', 'blue', 'large', 90),

        createShape('circle', 'solid', 'red', 'small', 0\)

      \]), // CORRECT

      createCell(\[

        createShape('triangle', 'solid', 'blue', 'large', 90),

        createShape('circle', 'solid', 'red', 'small', 0\)

      \]),

      createCell(\[

        createShape('triangle', 'empty', 'red', 'large', 90),

        createShape('circle', 'solid', 'blue', 'small', 0\)

      \]),

      createCell(\[

        createShape('triangle', 'empty', 'blue', 'large', 0),

        createShape('circle', 'solid', 'red', 'small', 90\)

      \]),

      createCell(\[

        createShape('circle', 'empty', 'blue', 'large', 90),

        createShape('triangle', 'solid', 'red', 'small', 0\)

      \]),

      createCell(\[

        createShape('triangle', 'dotted', 'blue', 'large', 90),

        createShape('circle', 'solid', 'red', 'small', 0\)

      \])

    \],

    correctAnswer: 0,

    explanation: 'Multi-dimensionell transformation med fem samtidiga mönster: (1) Form 1 roterar per rad: cirkel→fyrkant→triangel. (2) Form 2 roterar per rad: fyrkant→triangel→cirkel. (3) Inom varje rad, färg på form 1 transformeras: kolumn 1 färg → kolumn 2 → kolumn 3 (cyklisk rotation). (4) Fyllnad transformeras: solid→striped→empty per kolumn för form 1\. (5) Storlek växer: small→medium→large per kolumn, samtidigt som rotation ökar: 0°→45°→90°.',

    patternTypes: \['structural', 'color-change', 'rotation', 'size-change', 'spatial'\]

  }

\];

// Helper function för att få frågor för test

export function getQuestionsForTest(count: number \= 15): ServerQuestion\[\] {

  // Balanserad distribution:

  // 3 easy (diff 1-2), 7 medium (diff 3), 5 hard (diff 4-5)


  const easy \= QUESTION\_BANK.filter(q \=\> q.difficulty \<= 2);

  const medium \= QUESTION\_BANK.filter(q \=\> q.difficulty \=== 3);

  const hard \= QUESTION\_BANK.filter(q \=\> q.difficulty \>= 4);


  // Shuffle och välj

  const selectedEasy \= shuffleArray(easy).slice(0, 3);

  const selectedMedium \= shuffleArray(medium).slice(0, 7);

  const selectedHard \= shuffleArray(hard).slice(0, 5);


  return shuffleArray(\[...selectedEasy, ...selectedMedium, ...selectedHard\]);

}

function shuffleArray\<T\>(array: T\[\]): T\[\] {

  const shuffled \= \[...array\];

  for (let i \= shuffled.length \- 1; i \> 0; i--) {

    const j \= Math.floor(Math.random() \* (i \+ 1));

    \[shuffled\[i\], shuffled\[j\]\] \= \[shuffled\[j\], shuffled\[i\]\];

  }

  return shuffled;

}

export function getQuestionById(id: string): ServerQuestion | undefined {

  return QUESTION\_BANK.find(q \=\> q.id \=== id);

}

---

## **2\. Frontend-komponenter**

### **2.1 MatrixGrid Component**

// src/app/dashboard/tester/matrislogik/components/MatrixGrid.tsx

'use client';

import { Matrix3x3 } from '@/lib/tester/patternTypes';

import { ShapeSVG } from './ShapeSVG';

interface MatrixGridProps {

  matrix: Matrix3x3;

  className?: string;

}

export function MatrixGrid({ matrix, className \= '' }: MatrixGridProps) {

  return (

    \<div className={\`grid grid-cols-3 gap-4 ${className}\`}\>

      {matrix.map((row, rowIdx) \=\>

        row.map((cell, colIdx) \=\> (

          \<div

            key={\`${rowIdx}-${colIdx}\`}

            className="aspect-square border-2 border-gray-300 rounded-lg bg-white flex items-center justify-center relative overflow-hidden"

          \>

            {cell.shapes.length \=== 0 ? (

              // Missing cell indicator

              \<div className="text-6xl font-bold text-gray-400"\>?\</div\>

            ) : (

              // Render shapes (may overlap)

              \<div className="relative w-full h-full"\>

                {cell.shapes.map((shape, shapeIdx) \=\> (

                  \<ShapeSVG

                    key={shapeIdx}

                    shape={shape}

                    className={cell.shapes.length \> 1 ? 'absolute inset-0' : ''}

                  /\>

                ))}

              \</div\>

            )}

          \</div\>

        ))

      )}

    \</div\>

  );

}

### **2.2 ShapeSVG Component**

// src/app/dashboard/tester/matrislogik/components/ShapeSVG.tsx

'use client';

import { Shape } from '@/lib/tester/patternTypes';

interface ShapeSVGProps {

  shape: Shape;

  className?: string;

}

export function ShapeSVG({ shape, className \= '' }: ShapeSVGProps) {

  const { form, fill, color, size, rotation \= 0 } \= shape;

  // Color mapping (WCAG AA-compliant)

  const colorMap \= {

    blue: '\#2563eb',

    red: '\#dc2626',

    green: '\#16a34a',

    black: '\#000000',

    yellow: '\#ca8a04',

    purple: '\#9333ea'

  };

  // Size mapping (percentage of container)

  const sizeMap \= {

    small: 40,

    medium: 60,

    large: 80

  };

  const strokeColor \= colorMap\[color\];

  const fillColor \= fill \=== 'solid' ? strokeColor : 'none';

  const sizePercent \= sizeMap\[size\];

  // Pattern definitions for fills

  const patternId \= \`${fill}-${color}-${Math.random().toString(36).substr(2, 9)}\`;

  const renderPattern \= () \=\> {

    if (fill \=== 'striped') {

      return (

        \<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform={\`rotate(45)\`}\>

          \<line x1="0" y1="0" x2="0" y2="8" stroke={strokeColor} strokeWidth="4" /\>

        \</pattern\>

      );

    }

    if (fill \=== 'dotted') {

      return (

        \<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8"\>

          \<circle cx="4" cy="4" r="2" fill={strokeColor} /\>

        \</pattern\>

      );

    }

    if (fill \=== 'crosshatch') {

      return (

        \<pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8"\>

          \<path d="M0,0 L8,8 M8,0 L0,8" stroke={strokeColor} strokeWidth="1" /\>

        \</pattern\>

      );

    }

    return null;

  };

  const getFillAttribute \= () \=\> {

    if (fill \=== 'solid') return fillColor;

    if (fill \=== 'empty') return 'none';

    return \`url(\#${patternId})\`;

  };

  const renderShape \= () \=\> {

    const cx \= 50; // Center X

    const cy \= 50; // Center Y

    const r \= sizePercent / 2;

    switch (form) {

      case 'circle':

        return \<circle cx={cx} cy={cy} r={r} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" /\>;

      case 'square':

        const squareSize \= r \* 1.4; // Adjusted for visual balance

        return (

          \<rect

            x={cx \- squareSize}

            y={cy \- squareSize}

            width={squareSize \* 2}

            height={squareSize \* 2}

            fill={getFillAttribute()}

            stroke={strokeColor}

            strokeWidth="2"

          /\>

        );

      case 'triangle':

        const h \= r \* 1.5;

        return (

          \<polygon

            points={\`${cx},${cy \- h} ${cx \- h},${cy \+ h / 2} ${cx \+ h},${cy \+ h / 2}\`}

            fill={getFillAttribute()}

            stroke={strokeColor}

            strokeWidth="2"

          /\>

        );

      case 'diamond':

        return (

          \<polygon

            points={\`${cx},${cy \- r} ${cx \+ r},${cy} ${cx},${cy \+ r} ${cx \- r},${cy}\`}

            fill={getFillAttribute()}

            stroke={strokeColor}

            strokeWidth="2"

          /\>

        );

      case 'hexagon':

        const hexR \= r;

        const hexPoints \= Array.from({ length: 6 }, (\_, i) \=\> {

          const angle \= (Math.PI / 3\) \* i;

          return \`${cx \+ hexR \* Math.cos(angle)},${cy \+ hexR \* Math.sin(angle)}\`;

        }).join(' ');

        return \<polygon points={hexPoints} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" /\>;

      case 'star':

        const starPoints \= \[\];

        for (let i \= 0; i \< 5; i++) {

          const outerAngle \= (Math.PI \* 2 \* i) / 5 \- Math.PI / 2;

          const innerAngle \= outerAngle \+ Math.PI / 5;

          starPoints.push(\`${cx \+ r \* Math.cos(outerAngle)},${cy \+ r \* Math.sin(outerAngle)}\`);

          starPoints.push(\`${cx \+ (r / 2\) \* Math.cos(innerAngle)},${cy \+ (r / 2\) \* Math.sin(innerAngle)}\`);

        }

        return \<polygon points={starPoints.join(' ')} fill={getFillAttribute()} stroke={strokeColor} strokeWidth="2" /\>;

      default:

        return null;

    }

  };

  return (

    \<svg

      viewBox="0 0 100 100"

      className={\`w-full h-full ${className}\`}

      style={{ transform: \`rotate(${rotation}deg)\` }}

    \>

      \<defs\>{renderPattern()}\</defs\>

      {renderShape()}

    \</svg\>

  );

}

### **2.3 AnswerOptions Component**

// src/app/dashboard/tester/matrislogik/components/AnswerOptions.tsx

'use client';

import { MatrixCell } from '@/lib/tester/patternTypes';

import { ShapeSVG } from './ShapeSVG';

import { useState, useEffect } from 'react';

interface AnswerOptionsProps {

  options: MatrixCell\[\];

  selectedAnswer: number | null;

  onSelect: (index: number) \=\> void;

  disabled?: boolean;

}

export function AnswerOptions({ options, selectedAnswer, onSelect, disabled \= false }: AnswerOptionsProps) {

  const \[hoveredIndex, setHoveredIndex\] \= useState\<number | null\>(null);

  // Keyboard navigation (A-F keys)

  useEffect(() \=\> {

    const handleKeyPress \= (e: KeyboardEvent) \=\> {

      if (disabled) return;

      const key \= e.key.toUpperCase();

      const index \= key.charCodeAt(0) \- 65; // A=0, B=1, etc.

      if (index \>= 0 && index \< options.length) {

        onSelect(index);

      }

    };

    window.addEventListener('keydown', handleKeyPress);

    return () \=\> window.removeEventListener('keydown', handleKeyPress);

  }, \[disabled, options.length, onSelect\]);

  return (

    \<div className="grid grid-cols-3 md:grid-cols-6 gap-4"\>

      {options.map((option, index) \=\> {

        const label \= String.fromCharCode(65 \+ index); // A, B, C, D, E, F

        const isSelected \= selectedAnswer \=== index;

        const isHovered \= hoveredIndex \=== index;

        return (

          \<button

            key={index}

            onClick={() \=\> \!disabled && onSelect(index)}

            onMouseEnter={() \=\> setHoveredIndex(index)}

            onMouseLeave={() \=\> setHoveredIndex(null)}

            disabled={disabled}

            className={\`

              relative aspect-square border-2 rounded-lg transition-all duration-200

              ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-200' : 'border-gray-300 bg-white'}

              ${isHovered && \!disabled ? 'border-indigo-400 shadow-lg scale-105' : ''}

              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}

            \`}

            aria-label={\`Alternativ ${label}\`}

          \>

            {/\* Label badge \*/}

            \<div className="absolute \-top-2 \-left-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold z-10"\>

              {label}

            \</div\>

            {/\* Shapes \*/}

            \<div className="w-full h-full p-2"\>

              {option.shapes.length \=== 0 ? (

                \<div className="flex items-center justify-center h-full text-gray-400"\>Tom\</div\>

              ) : (

                \<div className="relative w-full h-full"\>

                  {option.shapes.map((shape, shapeIdx) \=\> (

                    \<ShapeSVG

                      key={shapeIdx}

                      shape={shape}

                      className={option.shapes.length \> 1 ? 'absolute inset-0' : ''}

                    /\>

                  ))}

                \</div\>

              )}

            \</div\>

            {/\* Selected checkmark \*/}

            {isSelected && (

              \<div className="absolute \-top-2 \-right-2 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center z-10"\>

                ✓

              \</div\>

            )}

          \</button\>

        );

      })}

    \</div\>

  );

}

### **2.4 TestTimer Component**

// src/app/dashboard/tester/matrislogik/components/TestTimer.tsx

'use client';

import { useState, useEffect } from 'react';

interface TestTimerProps {

  totalSeconds: number;

  onTimeUp: () \=\> void;

}

export function TestTimer({ totalSeconds, onTimeUp }: TestTimerProps) {

  const \[secondsLeft, setSecondsLeft\] \= useState(totalSeconds);

  useEffect(() \=\> {

    if (secondsLeft \=== 0\) {

      onTimeUp();

      return;

    }

    const timer \= setInterval(() \=\> {

      setSecondsLeft(prev \=\> Math.max(0, prev \- 1));

    }, 1000);

    return () \=\> clearInterval(timer);

  }, \[secondsLeft, onTimeUp\]);

  const minutes \= Math.floor(secondsLeft / 60);

  const seconds \= secondsLeft % 60;

  const progressPercent \= (secondsLeft / totalSeconds) \* 100;

  // Color coding

  const getColorClass \= () \=\> {

    if (progressPercent \> 50\) return 'bg-green-500';

    if (progressPercent \> 20\) return 'bg-yellow-500';

    return 'bg-red-500';

  };

  return (

    \<div className="w-full"\>

      {/\* Time display \*/}

      \<div className="flex items-center justify-between mb-2"\>

        \<span className="text-sm font-medium text-gray-700"\>Återstående tid\</span\>

        \<span className={\`text-2xl font-bold ${progressPercent \< 20 ? 'text-red-600' : 'text-gray-900'}\`}\>

          {minutes}:{seconds.toString().padStart(2, '0')}

        \</span\>

      \</div\>

      {/\* Progress bar \*/}

      \<div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"\>

        \<div

          className={\`h-full transition-all duration-1000 ${getColorClass()}\`}

          style={{ width: \`${progressPercent}%\` }}

        /\>

      \</div\>

      {/\* Warning message \*/}

      {progressPercent \< 10 && (

        \<div className="mt-2 text-sm text-red-600 font-medium animate-pulse"\>

          ⚠️ Mindre än 2 minuter kvar\!

        \</div\>

      )}

    \</div\>

  );

}

### **2.5 TestNavigation Component**

// src/app/dashboard/tester/matrislogik/components/TestNavigation.tsx

'use client';

interface TestNavigationProps {

  totalQuestions: number;

  currentQuestion: number;

  answeredQuestions: Set\<number\>;

  onNavigate: (index: number) \=\> void;

}

export function TestNavigation({

  totalQuestions,

  currentQuestion,

  answeredQuestions,

  onNavigate

}: TestNavigationProps) {

  return (

    \<div className="space-y-3"\>

      \<h3 className="text-sm font-semibold text-gray-700"\>Navigering\</h3\>

      \<div className="grid grid-cols-5 gap-2"\>

        {Array.from({ length: totalQuestions }, (\_, i) \=\> {

          const isAnswered \= answeredQuestions.has(i);

          const isCurrent \= i \=== currentQuestion;

          return (

            \<button

              key={i}

              onClick={() \=\> onNavigate(i)}

              className={\`

                aspect-square rounded-lg text-sm font-medium transition-all

                ${isCurrent ? 'ring-2 ring-indigo-600 scale-110' : ''}

                ${isAnswered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}

                hover:shadow-md hover:scale-105

              \`}

              aria-label={\`Fråga ${i \+ 1}\`}

            \>

              {i \+ 1}

            \</button\>

          );

        })}

      \</div\>

      {/\* Progress summary \*/}

      \<div className="text-xs text-gray-600 pt-2 border-t"\>

        \<div className="flex justify-between"\>

          \<span\>Besvarade:\</span\>

          \<span className="font-semibold"\>{answeredQuestions.size}/{totalQuestions}\</span\>

        \</div\>

      \</div\>

    \</div\>

  );

}

### **2.6 Test Session Page (Active Test)**

// src/app/dashboard/tester/matrislogik/test/\[sessionId\]/page.tsx

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { MatrixGrid } from '../../components/MatrixGrid';

import { AnswerOptions } from '../../components/AnswerOptions';

import { TestTimer } from '../../components/TestTimer';

import { TestNavigation } from '../../components/TestNavigation';

import { ClientQuestion } from '@/lib/tester/patternTypes';

interface TestSessionPageProps {

  params: { sessionId: string };

}

export default function TestSessionPage({ params }: TestSessionPageProps) {

  const router \= useRouter();

  const \[questions, setQuestions\] \= useState\<ClientQuestion\[\]\>(\[\]);

  const \[currentQuestionIndex, setCurrentQuestionIndex\] \= useState(0);

  const \[answers, setAnswers\] \= useState\<Map\<number, number\>\>(new Map());

  const \[isSubmitting, setIsSubmitting\] \= useState(false);

  const \[error, setError\] \= useState\<string | null\>(null);

  const currentQuestion \= questions\[currentQuestionIndex\];

  const totalQuestions \= questions.length;

  const answeredQuestions \= new Set(answers.keys());

  // Load questions on mount

  useEffect(() \=\> {

    async function loadQuestions() {

      try {

        const response \= await fetch('/api/tester/validate-session', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ sessionToken: params.sessionId })

        });

        if (\!response.ok) {

          throw new Error('Ogiltig session');

        }

        const { questions: loadedQuestions } \= await response.json();

        setQuestions(loadedQuestions);

      } catch (err) {

        setError('Kunde inte ladda testet. Vänligen starta om.');

      }

    }

    loadQuestions();

  }, \[params.sessionId\]);

  const handleAnswerSelect \= (optionIndex: number) \=\> {

    setAnswers(prev \=\> new Map(prev).set(currentQuestionIndex, optionIndex));

  };

  const handleNext \= () \=\> {

    if (currentQuestionIndex \< totalQuestions \- 1\) {

      setCurrentQuestionIndex(prev \=\> prev \+ 1);

    }

  };

  const handlePrevious \= () \=\> {

    if (currentQuestionIndex \> 0\) {

      setCurrentQuestionIndex(prev \=\> prev \- 1);

    }

  };

  const handleSubmit \= async () \=\> {

    if (answers.size \< totalQuestions) {

      const confirmSubmit \= confirm(

        \`Du har besvarat ${answers.size} av ${totalQuestions} frågor. Vill du verkligen lämna in testet?\`

      );

      if (\!confirmSubmit) return;

    }

    setIsSubmitting(true);

    try {

      // Convert answers Map to array format

      const answersArray \= questions.map((q, idx) \=\> ({

        questionId: q.id,

        userAnswer: answers.get(idx) ?? \-1 // \-1 \= no answer

      }));

      const response \= await fetch('/api/tester/submit', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          sessionToken: params.sessionId,

          answers: answersArray

        })

      });

      if (\!response.ok) {

        throw new Error('Kunde inte skicka in testet');

      }

      const { attemptId } \= await response.json();

      router.push(\`/dashboard/tester/matrislogik/results/${attemptId}\`);

    } catch (err) {

      setError('Ett fel uppstod vid inlämning. Försök igen.');

      setIsSubmitting(false);

    }

  };

  const handleTimeUp \= () \=\> {

    alert('Tiden är ute\! Testet kommer att skickas in automatiskt.');

    handleSubmit();

  };

  if (error) {

    return (

      \<div className="max-w-2xl mx-auto p-8"\>

        \<div className="bg-red-50 border border-red-200 rounded-lg p-6"\>

          \<h2 className="text-xl font-bold text-red-800 mb-2"\>Ett fel uppstod\</h2\>

          \<p className="text-red-700"\>{error}\</p\>

          \<button

            onClick={() \=\> router.push('/dashboard/tester/matrislogik')}

            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"

          \>

            Tillbaka till start

          \</button\>

        \</div\>

      \</div\>

    );

  }

  if (questions.length \=== 0\) {

    return (

      \<div className="max-w-2xl mx-auto p-8 text-center"\>

        \<div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" /\>

        \<p className="text-gray-600"\>Laddar testet...\</p\>

      \</div\>

    );

  }

  return (

    \<div className="max-w-7xl mx-auto p-6"\>

      \<div className="grid lg:grid-cols-\[1fr\_300px\] gap-6"\>

        {/\* Main test area \*/}

        \<div className="space-y-6"\>

          {/\* Timer \*/}

          \<TestTimer totalSeconds={20 \* 60} onTimeUp={handleTimeUp} /\>

          {/\* Question counter \*/}

          \<div className="text-center"\>

            \<span className="text-2xl font-bold text-gray-900"\>

              Fråga {currentQuestionIndex \+ 1} av {totalQuestions}

            \</span\>

          \</div\>

          {/\* Matrix \*/}

          \<div className="bg-white rounded-xl shadow-lg p-8"\>

            \<MatrixGrid matrix={currentQuestion.matrix} /\>

          \</div\>

          {/\* Answer options \*/}

          \<div className="bg-white rounded-xl shadow-lg p-8"\>

            \<h3 className="text-lg font-semibold text-gray-800 mb-4"\>Välj det saknade elementet:\</h3\>

            \<AnswerOptions

              options={currentQuestion.options}

              selectedAnswer={answers.get(currentQuestionIndex) ?? null}

              onSelect={handleAnswerSelect}

              disabled={isSubmitting}

            /\>

            \<p className="text-sm text-gray-500 mt-4"\>Tips: Använd tangenterna A-F för snabbare navigation\</p\>

          \</div\>

          {/\* Navigation buttons \*/}

          \<div className="flex justify-between"\>

            \<button

              onClick={handlePrevious}

              disabled={currentQuestionIndex \=== 0}

              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"

            \>

              ← Föregående

            \</button\>

            {currentQuestionIndex \=== totalQuestions \- 1 ? (

              \<button

                onClick={handleSubmit}

                disabled={isSubmitting}

                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"

              \>

                {isSubmitting ? 'Skickar in...' : 'Lämna in test'}

              \</button\>

            ) : (

              \<button

                onClick={handleNext}

                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"

              \>

                Nästa →

              \</button\>

            )}

          \</div\>

        \</div\>

        {/\* Sidebar navigation \*/}

        \<div className="bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6"\>

          \<TestNavigation

            totalQuestions={totalQuestions}

            currentQuestion={currentQuestionIndex}

            answeredQuestions={answeredQuestions}

            onNavigate={setCurrentQuestionIndex}

          /\>

        \</div\>

      \</div\>

    \</div\>

  );

}

---

## **3\. Results Page**

// src/app/dashboard/tester/matrislogik/results/\[attemptId\]/page.tsx

'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/router';

import { MatrixGrid } from '../../components/MatrixGrid';

import { AnswerOptions } from '../../components/AnswerOptions';

import Link from 'next/link';

interface QuestionBreakdown {

  questionId: string;

  userAnswer: number;

  correctAnswer: number;

  isCorrect: boolean;

  explanation: string;

  difficulty: number;

  matrix: any;

  options: any\[\];

}

interface ResultsData {

  attemptId: string;

  scoreRaw: number;

  scorePracticeRating: number;

  breakdown: QuestionBreakdown\[\];

  completedAt: string;

  duration: number;

}

export default function ResultsPage({ params }: { params: { attemptId: string } }) {

  const \[results, setResults\] \= useState\<ResultsData | null\>(null);

  const \[showBreakdown, setShowBreakdown\] \= useState(false);

  useEffect(() \=\> {

    async function loadResults() {

      const response \= await fetch(\`/api/tester/results/${params.attemptId}\`);

      const data \= await response.json();

      setResults(data);

    }

    loadResults();

  }, \[params.attemptId\]);

  if (\!results) {

    return \<div className="p-8 text-center"\>Laddar resultat...\</div\>;

  }

  const correctCount \= results.breakdown.filter(q \=\> q.isCorrect).length;

  const totalQuestions \= results.breakdown.length;

  return (

    \<div className="max-w-4xl mx-auto p-6 space-y-8"\>

      {/\* Results summary \*/}

      \<div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl"\>

        \<h1 className="text-3xl font-bold mb-6 text-center"\>Testresultat \- Matrislogik\</h1\>

        

        {/\* Score display \*/}

        \<div className="grid md:grid-cols-3 gap-6 mb-6"\>

          \<div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center"\>

            \<div className="text-5xl font-bold mb-2"\>{results.scorePracticeRating}/10\</div\>

            \<div className="text-sm opacity-90"\>Träningsbetyg\</div\>

          \</div\>

          

          \<div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center"\>

            \<div className="text-5xl font-bold mb-2"\>{correctCount}/{totalQuestions}\</div\>

            \<div className="text-sm opacity-90"\>Rätt svar\</div\>

          \</div\>

          

          \<div className="bg-white/20 backdrop-blur rounded-xl p-6 text-center"\>

            \<div className="text-5xl font-bold mb-2"\>{Math.round(results.scoreRaw)}%\</div\>

            \<div className="text-sm opacity-90"\>Resultat\</div\>

          \</div\>

        \</div\>

        {/\* Performance feedback \*/}

        \<div className="text-center"\>

          {results.scorePracticeRating \>= 8 && (

            \<p className="text-lg"\>🎉 Utmärkt\! Du har mycket stark logisk förmåga.\</p\>

          )}

          {results.scorePracticeRating \>= 6 && results.scorePracticeRating \< 8 && (

            \<p className="text-lg"\>👍 Bra jobbat\! Du ligger över genomsnittet.\</p\>

          )}

          {results.scorePracticeRating \>= 4 && results.scorePracticeRating \< 6 && (

            \<p className="text-lg"\>💪 Fortsätt träna så förbättras ditt resultat\!\</p\>

          )}

          {results.scorePracticeRating \< 4 && (

            \<p className="text-lg"\>📚 Öva mer för att stärka din logiska förmåga.\</p\>

          )}

        \</div\>

      \</div\>

      {/\* Action buttons \*/}

      \<div className="flex gap-4 justify-center"\>

        \<Link

          href="/dashboard/tester/matrislogik"

          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"

        \>

          Gör nytt test

        \</Link\>

        

        \<button

          onClick={() \=\> setShowBreakdown(\!showBreakdown)}

          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"

        \>

          {showBreakdown ? 'Dölj' : 'Visa'} genomgång

        \</button\>

      \</div\>

      {/\* Question breakdown \*/}

      {showBreakdown && (

        \<div className="space-y-6"\>

          \<h2 className="text-2xl font-bold text-gray-900"\>Frågegenomgång\</h2\>

          

          {results.breakdown.map((question, idx) \=\> (

            \<div

              key={question.questionId}

              className={\`border-2 rounded-xl p-6 ${

                question.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'

              }\`}

            \>

              \<div className="flex items-center justify-between mb-4"\>

                \<h3 className="text-lg font-semibold"\>Fråga {idx \+ 1}\</h3\>

                \<span className={\`px-3 py-1 rounded-full text-sm font-medium ${

                  question.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'

                }\`}\>

                  {question.isCorrect ? '✓ Rätt' : '✗ Fel'}

                \</span\>

              \</div\>

              {/\* Matrix \*/}

              \<MatrixGrid matrix={question.matrix} className="mb-4" /\>

              {/\* Answer options with indicators \*/}

              \<div className="space-y-2 mb-4"\>

                \<p className="text-sm font-medium text-gray-700"\>Ditt svar: Alternativ {String.fromCharCode(65 \+ question.userAnswer)}\</p\>

                {\!question.isCorrect && (

                  \<p className="text-sm font-medium text-green-700"\>Rätt svar: Alternativ {String.fromCharCode(65 \+ question.correctAnswer)}\</p\>

                )}

              \</div\>

              {/\* Explanation \*/}

              \<div className="bg-white rounded-lg p-4 border border-gray-200"\>

                \<p className="text-sm font-semibold text-gray-700 mb-2"\>Förklaring:\</p\>

                \<p className="text-gray-600"\>{question.explanation}\</p\>

              \</div\>

            \</div\>

          ))}

        \</div\>

      )}

    \</div\>

  );

}

---

## **4\. Styling & Animations**

Alla komponenter använder:

* **Tailwind CSS** för styling  
* **Framer Motion** för animationer (optional)  
* **WCAG AA-compliant färger** (kontrast 4.5:1)  
* **Responsive design** (mobile-first)

---

## **5\. Testing & QA Checklist**

*  Alla 20 frågor renderas korrekt  
*  Keyboard navigation (A-F) fungerar  
*  Timer countdown fungerar och auto-submit vid 0  
*  Session tokens valideras korrekt  
*  Answers aldrig exponeras till client  
*  RLS policies fungerar (user kan bara se egna attempts)  
*  GDPR auto-delete fungerar (12 månader)  
*  Mobile responsiveness (iPhone SE → Desktop)  
*  Accessibility (screen readers, color contrast)  
*  Rate limiting på API endpoints (3 tests/week för free users)

---

## **6\. Launch Checklist**

*  **Legal disclaimer** på start page: "Ej diagnostiskt, endast träning"  
*  **GDPR consent** checkbox  
*  **Data retention policy** länk i footer  
*  **Trademark disclaimer**: "Ej affilierat med Assessio eller Matrigma"  
*  **Security audit**: JWT secret rotation, SQL injection tests  
*  **Performance**: Lighthouse score \>90  
*  **Analytics**: Track test completions, average scores  
*  **Freemium enforcement**: 3 tests/week limit för free users  
*  **Premium CTA**: Upgrade prompt efter 3rd test

---

# **Klart\! 🎉**

Detta är en **komplett implementationsplan** med alla 20 frågor, komponenter, API-routes, och checklists för lansering. Nästa steg är att börja implementera enligt planen. **Vill du att jag börjar implementera någon specifik del nu?** Till exempel:

1. Skapa database migration  
2. Implementera questionBank.server.ts med alla 20 frågor  
3. Bygga MatrixGrid \+ ShapeSVG komponenter  
4. Implementera API routes

