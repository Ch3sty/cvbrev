// src/lib/logic/questionBank.server.ts
import type { Question } from './types';
import questionBankData from './questionBank.json';

// Ensure type safety
const questionBank = questionBankData as Question[];

/**
 * Get all question IDs shuffled (server-side only)
 */
export function getAllQuestionIdsShuffled(): string[] {
  return getRandomQuestionIds(15); // V3 has 15 questions
}

/**
 * Get N random question IDs
 */
export function getRandomQuestionIds(count: number): string[] {
  const allIds = questionBank.map(q => q.id);
  const shuffled = allIds.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allIds.length));
}

/**
 * Get a question by ID with full data (including correctAnswer)
 */
export function getQuestionById(id: string): Question | undefined {
  return questionBank.find(q => q.id === id);
}

/**
 * Get multiple questions by IDs
 */
export function getQuestionsByIds(ids: string[]): Question[] {
  return ids
    .map(id => getQuestionById(id))
    .filter((q): q is Question => q !== undefined);
}

/**
 * Validate an answer and return if it's correct
 */
export function validateAnswer(questionId: string, userAnswer: number): boolean {
  const question = getQuestionById(questionId);
  if (!question) return false;
  return question.correctAnswer === userAnswer;
}

/**
 * Get all questions (for development/testing only)
 */
export function getAllQuestions(): Question[] {
  return questionBank;
}
