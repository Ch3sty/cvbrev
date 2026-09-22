/**
 * Gratisnivåns nya gränser (docs/plan-paket-och-onboarding.md avsnitt 4).
 *
 * Testet låser de fyra tal som ägaren beslutat, och brevets rullande
 * sjudagarsfönster. Ändras ett tal här ska avsnitt 4 ändras först.
 */

import { describe, expect, it } from 'vitest';
import {
  CV_ANALYSIS_LIMIT,
  DAILY_LIMIT_LETTERS,
  DAILY_LIMIT_TEST_SESSIONS,
  FREE_CHAT_MESSAGES_PER_ACCOUNT,
  FREE_LETTERS_PER_ACCOUNT,
  LETTER_WINDOW_DAYS,
  nextLetterResetAt,
  resolveWeeklyLetterCounter,
  featureRequiredBody,
} from '../quotaService';

describe('gränserna', () => {
  it('brev: ett per konto, sedan ett per rullande sju dygn', () => {
    expect(FREE_LETTERS_PER_ACCOUNT).toBe(1);
    expect(DAILY_LIMIT_LETTERS).toBe(1);
    expect(LETTER_WINDOW_DAYS).toBe(7);
  });

  it('chatt: tio per konto, inte per dygn', () => {
    expect(FREE_CHAT_MESSAGES_PER_ACCOUNT).toBe(10);
  });

  it('analys: en per konto', () => {
    expect(CV_ANALYSIS_LIMIT).toBe(1);
  });

  it('tester: en per testtyp och dygn på grundnivån, oförändrat', () => {
    expect(DAILY_LIMIT_TEST_SESSIONS).toBe(1);
  });
});

describe('brevets veckofönster', () => {
  const dagar = (n: number) => new Date(Date.now() - n * 24 * 3600_000);

  it('räknaren gäller inom sju dygn', () => {
    const { effectiveCount, windowIsStale } = resolveWeeklyLetterCounter(1, dagar(3));
    expect(effectiveCount).toBe(1);
    expect(windowIsStale).toBe(false);
  });

  it('räknaren är logiskt noll när fönstret löpt ut', () => {
    const { effectiveCount, windowIsStale } = resolveWeeklyLetterCounter(5, dagar(8));
    expect(effectiveCount).toBe(0);
    expect(windowIsStale).toBe(true);
  });

  it('en dag in i fönstret räknas fortfarande, till skillnad från förr', () => {
    // Under dygnsmodellen hade gårdagens brev nollställts. Nu ligger det
    // kvar i sex dygn till.
    expect(resolveWeeklyLetterCounter(1, dagar(1)).effectiveCount).toBe(1);
  });

  it('saknad fönsterstart ger noll', () => {
    expect(resolveWeeklyLetterCounter(4, null).effectiveCount).toBe(0);
    expect(resolveWeeklyLetterCounter(4, 'inte-ett-datum').effectiveCount).toBe(0);
  });

  it('nextLetterResetAt ligger sju dygn efter fönsterstarten', () => {
    const start = dagar(2);
    const forvantat = start.getTime() + LETTER_WINDOW_DAYS * 24 * 3600_000;
    expect(Date.parse(nextLetterResetAt(start))).toBe(forvantat);
  });

  it('utan levande fönster är återkomsttiden nu', () => {
    const nu = new Date();
    expect(nextLetterResetAt(null, nu)).toBe(nu.toISOString());
  });
});

describe('402-svaret', () => {
  it('bär feature och suggestedPlan, samma form överallt', () => {
    const body = featureRequiredBody('cv_templates_all', 'cv_week', { templateId: 'aurora' });
    expect(body).toEqual({
      error: 'premium_required',
      feature: 'cv_templates_all',
      suggestedPlan: 'cv_week',
      templateId: 'aurora',
    });
  });
});
