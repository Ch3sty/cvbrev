// src/lib/numericalTest/blandaAlternativ.ts
// =============================================================================
// Blandar svarsalternativen i numeriska testen och verbalt expert, per
// session och fråga, med samma seedade funktion som matrislogiken
// (src/lib/logicTestV7/blanda.ts, seed = sessionId + ':' + frågans id).
//
// Varför: rätt svar låg på samma position i de flesta frågor (verbalt expert
// 48 av 48 på A, numeriskt expert 38 av 48 på A, numeriskt grund 29 av 48
// och avancerad 26 av 48 på B). Här lagras svaren som alternativets id
// ('a'..'d') och rättas mot correctAnswerId, så ordningen påverkar varken
// rättning eller genomgång; ingen flagga på sessionen behövs. Bokstaven i
// vyn sätts efter position, inte efter id.
// =============================================================================

import { alternativSeed, blandaAlternativ } from '@/lib/logicTestV7/blanda';

interface MedAlternativ {
  id: string;
  options: readonly unknown[];
}

export function blandaPassagernasAlternativ<
  P extends { questions: readonly MedAlternativ[] },
>(passages: readonly P[], sessionId: string): P[] {
  return passages.map((p) => ({
    ...p,
    questions: p.questions.map((q) => ({
      ...q,
      options: blandaAlternativ(alternativSeed(sessionId, q.id), q).options,
    })),
  }));
}
