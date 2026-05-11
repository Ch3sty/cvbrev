// Scoring för Big Five-baserade personlighetstest.
//
// Algoritm:
//   1. För varje item: ta värdet 1-5. Om reverse=true, invertera (6 - value).
//   2. Summera per dimension/facett.
//   3. Normalisera till 0-100 baserat på antalet items i den dimensionen/facetten.
//
// Notera: detta är *råscores*, inte normaliserade mot en befolkning. För
// visuell presentation duger det bra — vi kommunicerar dock detta som "din
// profil" snarare än "du ligger i percentil X jämfört med svensk befolkning".

import type {
  BigFiveScores,
  Dimension,
  Facet,
  FacetScores,
  PersonalityAnswer,
  PersonalityItem,
  PersonalityProfile,
} from './types';

const DIMENSIONS: Dimension[] = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

function adjustedValue(value: number, reverse: boolean): number {
  return reverse ? 6 - value : value;
}

function normalize(sum: number, count: number): number {
  if (count === 0) return 50;
  // Sum är minst count (alla 1:or) och max count*5
  const min = count;
  const max = count * 5;
  const pct = ((sum - min) / (max - min)) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

export function computeScores(
  items: PersonalityItem[],
  answers: PersonalityAnswer[]
): PersonalityProfile {
  const answerMap = new Map<string, number>();
  for (const a of answers) {
    answerMap.set(a.questionId, a.value);
  }

  const dimSum: Record<Dimension, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };
  const dimCount: Record<Dimension, number> = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  const facetSum = new Map<Facet, number>();
  const facetCount = new Map<Facet, number>();

  for (const item of items) {
    const raw = answerMap.get(item.id);
    if (raw === undefined) continue;
    const adjusted = adjustedValue(raw, item.reverse);

    dimSum[item.dimension] += adjusted;
    dimCount[item.dimension] += 1;

    if (item.facet) {
      facetSum.set(item.facet, (facetSum.get(item.facet) ?? 0) + adjusted);
      facetCount.set(item.facet, (facetCount.get(item.facet) ?? 0) + 1);
    }
  }

  const scores = {} as BigFiveScores;
  for (const dim of DIMENSIONS) {
    scores[dim] = normalize(dimSum[dim], dimCount[dim]);
  }

  let facetScores: FacetScores | undefined;
  if (facetSum.size > 0) {
    facetScores = {};
    for (const [facet, sum] of facetSum.entries()) {
      facetScores[facet] = normalize(sum, facetCount.get(facet) ?? 0);
    }
  }

  return { scores, facetScores };
}

export function isComplete(
  items: PersonalityItem[],
  answers: PersonalityAnswer[]
): boolean {
  const answered = new Set(answers.map((a) => a.questionId));
  return items.every((i) => answered.has(i.id));
}
