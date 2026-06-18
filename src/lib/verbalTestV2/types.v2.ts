// src/lib/verbalTestV2/types.v2.ts

/**
 * Represents a single statement to be evaluated against a passage
 */
export type Statement = {
  text: string;
  correctAnswer: 'true' | 'false' | 'cannot_say';
  /** Kort motivering till facit, visas i resultatvyn (togglas fram). */
  explanation?: string;
};

/**
 * Represents a text passage with associated statements
 * Each passage should be 180-220 words
 */
export type Passage = {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  text: string;
  topic: string; // e.g., "Utbildning", "Hälsa", "Miljö"
  statements: Statement[];
};

/**
 * A Question in the verbal test is a Passage with statements
 */
export type Question = Passage;

/**
 * User's answer to a statement
 */
export type UserAnswer = 'true' | 'false' | 'cannot_say' | null;

/**
 * Test session data
 */
export type TestSession = {
  id: string;
  user_id: string;
  test_type: 'verbal-resonemang-v2';
  answers: TestAnswer[];
  completed_at: string | null;
  score: number | null;
  created_at: string;
};

/**
 * Individual answer record
 */
export type TestAnswer = {
  passageId: string;
  statementIndex: number;
  answer: UserAnswer;
  timeSpent: number; // seconds
  isCorrect?: boolean;
};
