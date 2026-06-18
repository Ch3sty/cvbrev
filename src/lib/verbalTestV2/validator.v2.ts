// src/lib/verbalTestV2/validator.v2.ts
import type { Question, UserAnswer, TestAnswer } from './types.v2';
import questionBank from './questionBank.json';
import { TOTAL_STATEMENTS } from './selectPassages.v2';

const questions = questionBank as Question[];

/**
 * Validates and scores a user's answer to a statement
 */
export function validateAnswer(
  passageId: string,
  statementIndex: number,
  userAnswer: UserAnswer
): { isCorrect: boolean; correctAnswer: string } {
  const passage = questions.find(q => q.id === passageId);

  if (!passage) {
    throw new Error(`Passage not found: ${passageId}`);
  }

  if (statementIndex < 0 || statementIndex >= passage.statements.length) {
    throw new Error(`Invalid statement index: ${statementIndex}`);
  }

  const statement = passage.statements[statementIndex];
  const isCorrect = userAnswer === statement.correctAnswer;

  return {
    isCorrect,
    correctAnswer: statement.correctAnswer
  };
}

/**
 * Calculates final score for a test session
 */
export function calculateScore(answers: TestAnswer[]): {
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    correct: number;
    incorrect: number;
    unanswered: number;
  };
} {
  // Konstant per session (PASSAGES_PER_SESSION × 4), oberoende av bankstorlek.
  const totalQuestions = TOTAL_STATEMENTS;
  let correct = 0;
  let incorrect = 0;

  // Validate all answers
  for (const answer of answers) {
    if (answer.answer === null) continue;

    const validation = validateAnswer(
      answer.passageId,
      answer.statementIndex,
      answer.answer
    );

    if (validation.isCorrect) {
      correct++;
    } else {
      incorrect++;
    }
  }

  const unanswered = totalQuestions - (correct + incorrect);
  const score = correct;
  const percentage = Math.round((correct / totalQuestions) * 100);

  return {
    score,
    maxScore: totalQuestions,
    percentage,
    breakdown: {
      correct,
      incorrect,
      unanswered
    }
  };
}

/**
 * Get score breakdown by difficulty level
 */
export function getScoreByDifficulty(answers: TestAnswer[]): {
  difficulty1: { correct: number; total: number };
  difficulty2: { correct: number; total: number };
  difficulty3: { correct: number; total: number };
} {
  const byDifficulty = {
    difficulty1: { correct: 0, total: 0 },
    difficulty2: { correct: 0, total: 0 },
    difficulty3: { correct: 0, total: 0 }
  };

  for (const answer of answers) {
    const passage = questions.find(q => q.id === answer.passageId);
    if (!passage || answer.answer === null) continue;

    const key = `difficulty${passage.difficulty}` as keyof typeof byDifficulty;
    byDifficulty[key].total++;

    const validation = validateAnswer(
      answer.passageId,
      answer.statementIndex,
      answer.answer
    );

    if (validation.isCorrect) {
      byDifficulty[key].correct++;
    }
  }

  return byDifficulty;
}

/**
 * Get score breakdown by topic
 */
export function getScoreByTopic(answers: TestAnswer[]): Record<string, { correct: number; total: number }> {
  const byTopic: Record<string, { correct: number; total: number }> = {};

  for (const answer of answers) {
    const passage = questions.find(q => q.id === answer.passageId);
    if (!passage || answer.answer === null) continue;

    if (!byTopic[passage.topic]) {
      byTopic[passage.topic] = { correct: 0, total: 0 };
    }

    byTopic[passage.topic].total++;

    const validation = validateAnswer(
      answer.passageId,
      answer.statementIndex,
      answer.answer
    );

    if (validation.isCorrect) {
      byTopic[passage.topic].correct++;
    }
  }

  return byTopic;
}

/**
 * Get average time spent per statement
 */
export function getAverageTimePerStatement(answers: TestAnswer[]): number {
  const answeredStatements = answers.filter(a => a.answer !== null);

  if (answeredStatements.length === 0) return 0;

  const totalTime = answeredStatements.reduce((sum, a) => sum + a.timeSpent, 0);
  return Math.round(totalTime / answeredStatements.length);
}
