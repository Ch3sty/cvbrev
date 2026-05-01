// Numerical Reasoning Test V2 Types (with graphs)

export type QuestionType =
  | 'table'
  | 'graph'           // NEW: Graph/chart interpretation
  | 'word_problem'
  | 'series'
  | 'conversion';

export type GraphType = 'bar' | 'line' | 'pie';

export type DifficultyLevel = 1 | 2 | 3;

export type AnswerOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  passageId: string;
  questionNumber: number;
  questionText: string;
  options: AnswerOption[];
  correctAnswerId: string;
  explanation: string;
  difficulty: DifficultyLevel;
};

export type DataTable = {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
  highlightLastRow?: boolean;
};

// ChartData — matchar V1 så delade komponenter funkar med båda versioner
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
  topic: string;
  difficulty: DifficultyLevel;
  contextText: string;
  dataTable?: DataTable;
  chartData?: ChartData;
  // Legacy field - behålls om någon kod refererar till det, men användning är via chartData
  graphData?: any;
  questions: Question[];
};

export type TestAnswer = {
  passageId: string;
  questionId: string;
  selectedAnswerId: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: string;
};

export type TestSession = {
  id: string;
  user_id: string;
  test_type: 'numerical-reasoning-v2';
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
