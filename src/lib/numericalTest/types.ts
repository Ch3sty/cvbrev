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
};

export type DataTable = {
  headers: string[];
  rows: string[][];
  caption?: string;
};

export type Passage = {
  id: string;
  title: string;
  type: QuestionType;
  topic: string; // e.g., "Försäljningsanalys", "Budget", "Personalstatistik"
  difficulty: DifficultyLevel;
  contextText: string; // Introductory text explaining the scenario
  dataTable?: DataTable; // For table-based questions
  graphData?: any; // For graph-based questions (will use recharts)
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
