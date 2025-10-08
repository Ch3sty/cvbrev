/**
 * P2: Unit-tester för scoringEngine
 *
 * Testar:
 * - calculatePracticeRating boundary values
 * - Rating 1-10 konvertering från raw score 0-100%
 * - Edge cases (0%, 100%, 10%, 11%, 90%, 91%)
 */

import { describe, it, expect } from 'vitest';
import { calculatePracticeRating, getInterpretation } from '@/lib/tester/scoringEngine';

describe('calculatePracticeRating', () => {
  it('should return 1 for 0% score', () => {
    expect(calculatePracticeRating(0)).toBe(1);
  });

  it('should return 1 for scores 1-10%', () => {
    expect(calculatePracticeRating(1)).toBe(1);
    expect(calculatePracticeRating(5)).toBe(1);
    expect(calculatePracticeRating(10)).toBe(1);
  });

  it('should return 2 for scores 11-20%', () => {
    expect(calculatePracticeRating(11)).toBe(2);
    expect(calculatePracticeRating(15)).toBe(2);
    expect(calculatePracticeRating(20)).toBe(2);
  });

  it('should return 3 for scores 21-30%', () => {
    expect(calculatePracticeRating(21)).toBe(3);
    expect(calculatePracticeRating(25)).toBe(3);
    expect(calculatePracticeRating(30)).toBe(3);
  });

  it('should return 4 for scores 31-40%', () => {
    expect(calculatePracticeRating(31)).toBe(4);
    expect(calculatePracticeRating(40)).toBe(4);
  });

  it('should return 5 for scores 41-50%', () => {
    expect(calculatePracticeRating(41)).toBe(5);
    expect(calculatePracticeRating(50)).toBe(5);
  });

  it('should return 6 for scores 51-60%', () => {
    expect(calculatePracticeRating(51)).toBe(6);
    expect(calculatePracticeRating(60)).toBe(6);
  });

  it('should return 7 for scores 61-70%', () => {
    expect(calculatePracticeRating(61)).toBe(7);
    expect(calculatePracticeRating(70)).toBe(7);
  });

  it('should return 8 for scores 71-80%', () => {
    expect(calculatePracticeRating(71)).toBe(8);
    expect(calculatePracticeRating(80)).toBe(8);
  });

  it('should return 9 for scores 81-90%', () => {
    expect(calculatePracticeRating(81)).toBe(9);
    expect(calculatePracticeRating(90)).toBe(9);
  });

  it('should return 10 for scores 91-100%', () => {
    expect(calculatePracticeRating(91)).toBe(10);
    expect(calculatePracticeRating(95)).toBe(10);
    expect(calculatePracticeRating(100)).toBe(10);
  });

  it('should handle edge case boundary values', () => {
    // Critical boundaries from feedback
    expect(calculatePracticeRating(0)).toBe(1);
    expect(calculatePracticeRating(10)).toBe(1);
    expect(calculatePracticeRating(11)).toBe(2);
    expect(calculatePracticeRating(90)).toBe(9);
    expect(calculatePracticeRating(91)).toBe(10);
    expect(calculatePracticeRating(100)).toBe(10);
  });

  it('should never return values outside 1-10 range', () => {
    // Test negative scores (should clamp to 1)
    expect(calculatePracticeRating(-10)).toBe(1);
    expect(calculatePracticeRating(-1)).toBe(1);

    // Test scores over 100 (should clamp to 10)
    expect(calculatePracticeRating(101)).toBe(10);
    expect(calculatePracticeRating(150)).toBe(10);
    expect(calculatePracticeRating(999)).toBe(10);
  });

  it('should handle decimal scores correctly', () => {
    expect(calculatePracticeRating(10.1)).toBe(2); // Ceiling should round up
    expect(calculatePracticeRating(10.9)).toBe(2);
    expect(calculatePracticeRating(20.01)).toBe(3);
  });
});

describe('getInterpretation', () => {
  it('should return exceptional message for rating 9-10', () => {
    const msg9 = getInterpretation(9);
    const msg10 = getInterpretation(10);

    expect(msg9).toContain('Exceptionellt');
    expect(msg10).toContain('Exceptionellt');
  });

  it('should return very good message for rating 7-8', () => {
    const msg7 = getInterpretation(7);
    const msg8 = getInterpretation(8);

    expect(msg7).toContain('Mycket bra');
    expect(msg8).toContain('Mycket bra');
  });

  it('should return good message for rating 5-6', () => {
    const msg5 = getInterpretation(5);
    const msg6 = getInterpretation(6);

    expect(msg5).toContain('Bra jobbat');
    expect(msg6).toContain('Bra jobbat');
  });

  it('should return practice message for rating 3-4', () => {
    const msg3 = getInterpretation(3);
    const msg4 = getInterpretation(4);

    expect(msg3).toContain('Fortsätt öva');
    expect(msg4).toContain('Fortsätt öva');
  });

  it('should return beginner message for rating 1-2', () => {
    const msg1 = getInterpretation(1);
    const msg2 = getInterpretation(2);

    expect(msg1).toContain('Början är alltid svårast');
    expect(msg2).toContain('Början är alltid svårast');
  });
});
