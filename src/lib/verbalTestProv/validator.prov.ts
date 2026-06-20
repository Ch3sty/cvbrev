// src/lib/verbalTestProv/validator.prov.ts
// Validering/scoring för verbal-prov. Slår upp facit i den merged banken (v1+v2)
// så frågor från båda nivåerna kan rättas. Nämnaren är provets faktiska antal
// påståenden (PROV_TOTAL_STATEMENTS), inte en enskild banks storlek.

import { PROV_MERGED_BANK, PROV_TOTAL_STATEMENTS } from './selectProv';
import type { UserAnswer, TestAnswer } from '@/lib/verbalTestV1/types.v1';

export function validateAnswer(
  passageId: string,
  statementIndex: number,
  userAnswer: UserAnswer
): { isCorrect: boolean; correctAnswer: string } {
  const passage = PROV_MERGED_BANK.find((q) => q.id === passageId);
  if (!passage) {
    throw new Error(`Passage not found: ${passageId}`);
  }
  if (statementIndex < 0 || statementIndex >= passage.statements.length) {
    throw new Error(`Invalid statement index: ${statementIndex}`);
  }
  const statement = passage.statements[statementIndex];
  return { isCorrect: userAnswer === statement.correctAnswer, correctAnswer: statement.correctAnswer };
}

export function calculateScore(answers: TestAnswer[]): {
  score: number;
  maxScore: number;
  percentage: number;
} {
  let correct = 0;
  for (const answer of answers) {
    if (answer.answer === null) continue;
    if (validateAnswer(answer.passageId, answer.statementIndex, answer.answer).isCorrect) {
      correct++;
    }
  }
  return {
    score: correct,
    maxScore: PROV_TOTAL_STATEMENTS,
    percentage: Math.round((correct / PROV_TOTAL_STATEMENTS) * 100),
  };
}
