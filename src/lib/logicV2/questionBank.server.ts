/**
 * Server-side question bank
 * Contains full questions with correct answers
 * NEVER expose this to client - use getClientQuestions instead
 */

import type { Question } from './types';
import rawQuestions from './questionBank.json';
import { validateQuestion } from './signatures';

// Validate all questions on load (dev-time safety)
if (process.env.NODE_ENV !== 'production') {
  rawQuestions.forEach((q: any) => {
    try {
      validateQuestion(q);
    } catch (error) {
      console.error(`Question validation failed for ${q.id}:`, error);
      throw error;
    }
  });
}

export const QUESTION_BANK: Question[] = rawQuestions as Question[];

/**
 * Get a question by ID (server-side only)
 */
export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find((q) => q.id === id);
}

/**
 * Get random questions for a test
 * @param count - Number of questions to return
 * @returns Array of question IDs
 */
export function getRandomQuestionIds(count: number): string[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, QUESTION_BANK.length)).map((q) => q.id);
}

/**
 * Get all 13 questions in shuffled order (for full test)
 */
export function getAllQuestionIdsShuffled(): string[] {
  return getRandomQuestionIds(13);
}
