import type { TestAnswer, QuestionType, Passage } from '@/lib/numericalTest/types';
import questionBank from './questionBank.json';

const passages = questionBank as unknown as Passage[];

export function validateAnswer(
  passageId: string,
  questionId: string,
  selectedAnswerId: string
): boolean {
  const passage = passages.find((p) => p.id === passageId);
  if (!passage) return false;
  const question = passage.questions.find((q) => q.id === questionId);
  if (!question) return false;
  return question.correctAnswerId === selectedAnswerId;
}

export function calculateScore(answers: TestAnswer[]): number {
  return answers.filter((a) => a.isCorrect).length;
}

export function getScoreByDifficulty(answers: TestAnswer[]) {
  const breakdown = {
    difficulty1: { correct: 0, total: 0 },
    difficulty2: { correct: 0, total: 0 },
    difficulty3: { correct: 0, total: 0 },
  };
  answers.forEach((answer) => {
    const passage = passages.find((p) => p.id === answer.passageId);
    const question = passage?.questions.find((q) => q.id === answer.questionId);
    if (!question) return;
    const diffKey = `difficulty${question.difficulty}` as keyof typeof breakdown;
    breakdown[diffKey].total++;
    if (answer.isCorrect) breakdown[diffKey].correct++;
  });
  return breakdown;
}

export function getScoreByType(answers: TestAnswer[]) {
  const breakdown: { [key in QuestionType]: { correct: number; total: number } } = {
    table: { correct: 0, total: 0 },
    graph: { correct: 0, total: 0 },
    word_problem: { correct: 0, total: 0 },
    series: { correct: 0, total: 0 },
    conversion: { correct: 0, total: 0 },
  };
  answers.forEach((answer) => {
    const passage = passages.find((p) => p.id === answer.passageId);
    if (!passage) return;
    breakdown[passage.type].total++;
    if (answer.isCorrect) breakdown[passage.type].correct++;
  });
  return breakdown;
}

export function getAllPassages(): Passage[] {
  return passages;
}
