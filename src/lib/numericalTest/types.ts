// Numerical Reasoning Test Types

export type QuestionType =
  | 'table'           // Table-based data interpretation
  | 'graph'           // Graph/chart interpretation
  | 'word_problem'    // Text-based word problems
  | 'series'          // Number series/patterns
  | 'conversion';     // Currency/unit conversions

export type DifficultyLevel = 1 | 2 | 3; // 1 = Easy, 2 = Medium, 3 = Hard

export type AnswerOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  passageId: string;
  questionNumber: number; // 1-4 within passage
  questionText: string;
  options: AnswerOption[];
  correctAnswerId: string;
  explanation: string;
  difficulty: DifficultyLevel;
  /** Strukturerat facit: räknevägen och vad frågan använder i underlaget (valfritt). */
  losning?: NumeriskLosning;
  /** Verbalt expert (samma typ): meningarna i contextText som avgör svaret, ordagrant (valfritt). */
  stod?: string[];
};

/**
 * Ett steg i räknevägen. `uttryck` i svensk form med = och ≈, till exempel
 * "(14,0 − 6,8) / 6,8 × 100 ≈ 105,9 %": decimalkomma, mellanslag som
 * tusentalsavgränsare, minustecken U+2212, × och /; % är en enhet sist i ett
 * led. Kontrolleras av scripts/lib/facit-kontroll.mjs.
 */
export type NumeriskSteg = { uttryck: string; etikett?: string };

/** Posterna i underlaget som frågan använder, exakt som de står där. */
export type NumeriskAnvander = {
  /** Tabellradernas första cell. */
  rader?: string[];
  /** Tabellens kolumnrubriker. */
  kolumner?: string[];
  /** Stapeldiagrammets etiketter. */
  staplar?: string[];
  /** Cirkeldiagrammets etiketter. */
  sektorer?: string[];
  /** Linjediagrammets x-värden som text. */
  punkter?: string[];
};

/** Sista ledet i sista steget ger det rätta alternativets tal. */
export type NumeriskLosning = { steg: NumeriskSteg[]; anvander?: NumeriskAnvander };

export type DataTable = {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  highlightLastRow?: boolean;
};

export type ChartType = 'bar' | 'pie' | 'line';

export type ChartData =
  | {
      chartType: 'bar';
      title?: string;
      data: { label: string; value: number }[];
      unit?: string;
      yAxisLabel?: string;
    }
  | {
      chartType: 'pie';
      title?: string;
      data: { label: string; value: number }[];
      unit?: string;
      centerLabel?: string;
    }
  | {
      chartType: 'line';
      title?: string;
      data: { x: string | number; y: number }[];
      unit?: string;
      xAxisLabel?: string;
      yAxisLabel?: string;
    };

export type Passage = {
  id: string;
  title: string;
  type: QuestionType;
  topic: string; // e.g., "Försäljningsanalys", "Budget", "Personalstatistik"
  difficulty: DifficultyLevel;
  contextText: string; // Introductory text explaining the scenario
  dataTable?: DataTable; // For table-based questions
  chartData?: ChartData; // For chart-based questions
  graphData?: any; // Legacy field - kept for backwards compatibility
  questions: Question[];
};

export type TestAnswer = {
  passageId: string;
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  timestamp: string;
};

export type TestSession = {
  id: string;
  user_id: string;
  test_type: 'numerical-reasoning';
  started_at: string;
  completed_at?: string;
  score?: number;
  time_spent?: number;
  answers: TestAnswer[];
  created_at: string;
  updated_at: string;
};

export type ScoreBreakdown = {
  byDifficulty: {
    difficulty1: { correct: number; total: number };
    difficulty2: { correct: number; total: number };
    difficulty3: { correct: number; total: number };
  };
  byType: {
    [key in QuestionType]: { correct: number; total: number };
  };
  byTopic: {
    [topic: string]: { correct: number; total: number };
  };
};
