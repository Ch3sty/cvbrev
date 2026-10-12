import { describe, expect, it } from 'vitest';
import { klassiskStatistik } from '../klassiskStatistik';

describe('klassiskStatistik', () => {
  const svar = [
    { q_id: 'v7g-a', correct: true, time_spent: 12, selected: 2 },
    { q_id: 'v7g-b', correct: false, time_spent: 30, selected: -1 },
    { q_id: '', correct: true, time_spent: 1, selected: 0 },
  ];

  it('typ klassisk när meta saknar typ, samma form som vyn räknar', () => {
    expect(klassiskStatistik(svar, { alternativ_blandade: true }, 'matris')).toEqual([
      { fraga_id: 'v7g-a', test_kind: 'matris', correct: true, tid_s: 12, selected: 2, typ: 'klassisk' },
      { fraga_id: 'v7g-b', test_kind: 'matris', correct: false, tid_s: 30, selected: -1, typ: 'klassisk' },
    ]);
  });

  it('meta.typ vinner och upprepade frågor skickas inte', () => {
    const r = klassiskStatistik(svar, { typ: 'general', upprepade: ['v7g-b'] }, 'matris');
    expect(r.map((x) => [x.fraga_id, x.typ])).toEqual([['v7g-a', 'general']]);
  });
});
