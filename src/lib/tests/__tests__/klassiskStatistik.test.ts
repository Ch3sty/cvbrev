import { describe, expect, it } from 'vitest';
import { klassiskStatistik, underlagStatistik, underlagFragaId, UNDERLAG_TESTTYPER } from '../klassiskStatistik';

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

describe('verbala och numeriska testen (underlagStatistik)', () => {
  it('påståenden får registrets id passage:index, val som plats och obesvarat som -1', () => {
    const r = underlagStatistik(
      [
        { passageId: 'va-01', statementIndex: 0, answer: 'true', isCorrect: true, timeSpent: 14.6 },
        { passageId: 'va-01', statementIndex: 1, answer: 'cannot_say', isCorrect: false, timeSpent: 9 },
        { passageId: 'va-01', statementIndex: 2, answer: null, isCorrect: true, timeSpent: 3 },
        { passageId: 'va-01', statementIndex: 0, answer: 'false', isCorrect: false, timeSpent: 1 },
        { passageId: '', statementIndex: 0, answer: 'true', isCorrect: true },
      ],
      'verbal',
    );
    expect(r).toEqual([
      { fraga_id: 'va-01:0', test_kind: 'verbal', correct: true, tid_s: 15, selected: 0, typ: 'klassisk' },
      { fraga_id: 'va-01:1', test_kind: 'verbal', correct: false, tid_s: 9, selected: 2, typ: 'klassisk' },
      { fraga_id: 'va-01:2', test_kind: 'verbal', correct: false, tid_s: 3, selected: -1, typ: 'klassisk' },
    ]);
  });

  it('frågor får frågans id och a till d som 0 till 3', () => {
    const r = underlagStatistik(
      [{ passageId: 'num-p01', questionId: 'num-p01-q02', selectedAnswerId: 'c', isCorrect: true, timeSpent: 40 }],
      'numerisk',
    );
    expect(r).toEqual([{ fraga_id: 'num-p01-q02', test_kind: 'numerisk', correct: true, tid_s: 40, selected: 2, typ: 'klassisk' }]);
    expect(underlagFragaId({ passageId: 'v1-p01', statementIndex: 3 })).toBe('v1-p01:3');
    expect(underlagFragaId({ passageId: 'v1-p01', statementIndex: -1 })).toBeNull();
  });

  it('alla testtyper finns i tabellen', () => {
    expect(Object.values(UNDERLAG_TESTTYPER).filter((k) => k === 'verbal')).toHaveLength(4);
    expect(Object.values(UNDERLAG_TESTTYPER).filter((k) => k === 'numerisk')).toHaveLength(4);
  });
});
