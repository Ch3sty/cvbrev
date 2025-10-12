import type { TestAnswer, ScoreBreakdown, QuestionType } from './types';
import questionBank from './questionBank.json';
import type { Passage } from './types';

const passages = questionBank as Passage[];

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
  return answers.filter((answer) => answer.isCorrect).length;
}

export function getScoreByDifficulty(answers: TestAnswer[]) {
  const breakdown = {
    difficulty1: { correct: 0, total: 0 },
    difficulty2: { correct: 0, total: 0 },
    difficulty3: { correct: 0, total: 0 },
  };

  answers.forEach((answer) => {
    const passage = passages.find((p) => p.id === answer.passageId);
    if (!passage) return;

    const question = passage.questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    const diffKey = `difficulty${question.difficulty}` as keyof typeof breakdown;
    breakdown[diffKey].total++;
    if (answer.isCorrect) {
      breakdown[diffKey].correct++;
    }
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
    if (answer.isCorrect) {
      breakdown[passage.type].correct++;
    }
  });

  return breakdown;
}

export function getScoreByTopic(answers: TestAnswer[]) {
  const breakdown: { [topic: string]: { correct: number; total: number } } = {};

  answers.forEach((answer) => {
    const passage = passages.find((p) => p.id === answer.passageId);
    if (!passage) return;

    if (!breakdown[passage.topic]) {
      breakdown[passage.topic] = { correct: 0, total: 0 };
    }

    breakdown[passage.topic].total++;
    if (answer.isCorrect) {
      breakdown[passage.topic].correct++;
    }
  });

  return breakdown;
}

export function getAverageTimePerQuestion(answers: TestAnswer[]): number {
  if (answers.length === 0) return 0;
  const totalTime = answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
  return Math.round(totalTime / answers.length);
}

export function getPassageById(passageId: string): Passage | undefined {
  return passages.find((p) => p.id === passageId);
}

export function getAllPassages(): Passage[] {
  return passages;
}
