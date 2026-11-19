import { describe, expect, it } from 'vitest';
import { bankSlut, friIgen, karensDagar, karensVisningar, raknasMotNivan, KARENS_GOLV_START } from '../karens';
import { KARENS_V4 } from '@/lib/traning/flaggor';
import { friskhet } from '@/lib/traning/passgenerator';
import { arOsett, settInomFonstret, valjUnderlag } from '@/lib/tester/pass-urval';
import { raknaNivakoll } from '@/lib/nivakoll/motor.server';

describe('karensen i visningar', () => {
  it('hälften av banken i fönstret, aldrig under golvet 20', () => {
    expect(KARENS_GOLV_START).toBe(20);
    expect(karensVisningar(100)).toBe(50);
    expect(karensVisningar(30)).toBe(20);
    expect(karensVisningar(0)).toBe(20);
    expect(karensVisningar(30, 10)).toBe(15);
  });

  it('frågan är fri igen först efter karensen', () => {
    expect(friIgen(null, 100)).toBe(true);
    expect(friIgen(49, 100)).toBe(false);
    expect(friIgen(50, 100)).toBe(true);
  });

  it('bank_slut när de osedda inte räcker', () => {
    expect(bankSlut(5, 12)).toBe(true);
    expect(bankSlut(12, 12)).toBe(false);
  });
});

describe('sann mätning: vad som räknas mot nivån', () => {
  it('osedd räknas alltid', () => {
    expect(raknasMotNivan({ sedd: false })).toBe(true);
  });
  it('upprepning räknas bara om den förra var fel och minst 14 dagar sedan', () => {
    expect(raknasMotNivan({ sedd: true, tidigareFel: false, dagarSedan: 40 })).toBe(false);
    expect(raknasMotNivan({ sedd: true, tidigareFel: true, dagarSedan: 13 })).toBe(false);
    expect(raknasMotNivan({ sedd: true, tidigareFel: true, dagarSedan: 14 })).toBe(true);
    expect(raknasMotNivan({ sedd: true, tidigareFel: true, dagarSedan: null })).toBe(false);
  });
});

describe('flaggan KARENS_V4', () => {
  it('är på: urvalet släpper fram en uppgift efter en vecka i stället för 30 dagar', () => {
    expect(KARENS_V4).toBe(true);
    expect(karensDagar(30)).toBe(7);
    expect(karensDagar(30, false)).toBe(30);
    expect(friskhet('2026-10-25', '2026-11-01')).toBe(1);
    expect(friskhet(undefined, '2026-11-01')).toBe(0);
  });

  it('VN, figur, deduktiv, steg 2 och nivåkollen: fri efter en vecka, men upprepad inom 30 dagar', () => {
    const sedda = new Map([['a', '2026-10-20']]);
    expect(arOsett('a', sedda, '2026-11-01')).toBe(true);
    expect(settInomFonstret('a', sedda, '2026-11-01')).toBe(true);
    expect(arOsett('a', new Map([['a', '2026-10-28']]), '2026-11-01')).toBe(false);
    expect(settInomFonstret('a', new Map([['a', '2026-09-20']]), '2026-11-01')).toBe(false);
    expect(valjUnderlag({ pool: [{ id: 'a' }], sedda, idag: '2026-11-01', seed: 's' })).toEqual({ id: 'a', upprepad: true });
  });

  it('nivåkollen: upprepade syns i resultatet men räknas inte i nivån', () => {
    const uppgifter = Array.from({ length: 12 }, (_, i) => ({ nyckel: `q${i}`, niva: 'avancerad' }) as never);
    const svar = Array.from({ length: 12 }, (_, i) => ({ q_id: `q${i}`, correct: i < 6, time_spent: 30, selected: 0, svar: null }) as never);
    const bas = { kind: 'deduktiv' as const, uppgifter, svar, fore: 5, budget_s: 60, p: () => 0.55, pBank: { grund: [], avancerad: [], expert: [] }, pGrund: [] };
    const alla = raknaNivakoll(bas);
    // De sex rätta är upprepade: bara sex fel räknas, nivån går ned.
    const utan = raknaNivakoll({ ...bas, upprepade: new Set(['q0', 'q1', 'q2', 'q3', 'q4', 'q5']) });
    expect(utan.ratt).toBe(alla.ratt);
    expect(utan.niva).toBeLessThan(alla.niva);
    const allaUpprepade = raknaNivakoll({ ...bas, upprepade: new Set(Array.from({ length: 12 }, (_, i) => `q${i}`)) });
    expect(allaUpprepade.niva).toBe(5);
  });
});
