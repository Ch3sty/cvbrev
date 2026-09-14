import { describe, it, expect } from 'vitest';
import { byggRader, TRATT_ORDNING } from '../data';

// Tratten kan ljuga på tre sätt, och alla tre kostar ett felaktigt beslut.
//
// 1. Ett steg som inte mäts blir noll, och då ser tratten ut som ett ras. Två
//    av nio steg kommer ur Supabase och resten ur PostHog, och PostHog-stegen
//    paywall_shown och subscription_paid har noll rader i dag.
// 2. Andelen räknas mot raden ovanför i stället för mot närmast föregående
//    steg med en mätning, vilket ger division med noll eller med fel bas.
// 3. Bortfallet räknas mot nästa rad i stället för mot nästa mätta steg.

function steg(varden: Record<string, number>): Map<string, number> {
  return new Map(Object.entries(varden));
}

describe('byggRader', () => {
  it('ger en rad per steg i trattens ordning', () => {
    const rader = byggRader(steg({}), null, null);
    expect(rader.map((r) => r.steg)).toEqual([...TRATT_ORDNING]);
  });

  it('skriver null för ett steg som saknar mätning, aldrig noll', () => {
    const rader = byggRader(steg({ pageview: 100 }), null, null);
    const betalt = rader.find((r) => r.steg === 'subscription_paid');
    expect(betalt?.antal).toBeNull();
    expect(betalt?.antal).not.toBe(0);
  });

  it('skiljer ett uppmätt noll från ett saknat värde', () => {
    const rader = byggRader(
      steg({ pageview: 100, subscription_paid: 0 }),
      null,
      null
    );
    expect(rader.find((r) => r.steg === 'subscription_paid')?.antal).toBe(0);
    expect(rader.find((r) => r.steg === 'paywall_shown')?.antal).toBeNull();
  });

  it('räknar andelen mot föregående steg', () => {
    const rader = byggRader(
      steg({ pageview: 200, signup_gate_shown: 50 }),
      null,
      null
    );
    expect(rader.find((r) => r.steg === 'signup_gate_shown')?.andel).toBeCloseTo(
      0.25
    );
  });

  it('hoppar över ett omätt steg när andelen räknas', () => {
    // signup_gate_shown saknas. signup_started ska jämföras mot pageview,
    // inte mot ingenting och inte mot noll.
    const rader = byggRader(
      steg({ pageview: 400, signup_started: 40 }),
      null,
      null
    );
    expect(rader.find((r) => r.steg === 'signup_started')?.andel).toBeCloseTo(
      0.1
    );
  });

  it('ger ingen andel på första mätta steget', () => {
    const rader = byggRader(steg({ pageview: 100 }), null, null);
    expect(rader[0].andel).toBeNull();
  });

  it('väver in Supabase-stegen på rätt plats', () => {
    const rader = byggRader(steg({ signup_completed: 10 }), 6, 2);
    expect(rader.find((r) => r.steg === 'forsta_dokument')?.antal).toBe(6);
    expect(rader.find((r) => r.steg === 'forsta_analys')?.antal).toBe(2);
    expect(rader.find((r) => r.steg === 'forsta_dokument')?.kalla).toBe(
      'supabase'
    );
    expect(rader.find((r) => r.steg === 'pageview')?.kalla).toBe('posthog');
  });

  it('räknar bortfallet mot nästa mätta steg', () => {
    // pageview 100, nästa mätta steg är signup_started 30. Bortfallet är 70,
    // inte 100 för att signup_gate_shown saknas.
    const rader = byggRader(
      steg({ pageview: 100, signup_started: 30 }),
      null,
      null
    );
    expect(rader.find((r) => r.steg === 'pageview')?.bortfall).toBe(70);
  });

  it('ger inget negativt bortfall när ett steg växer', () => {
    const rader = byggRader(
      steg({ pageview: 10, signup_gate_shown: 20 }),
      null,
      null
    );
    expect(rader.find((r) => r.steg === 'pageview')?.bortfall).toBe(0);
  });

  it('ger inget bortfall på sista mätta steget', () => {
    const rader = byggRader(steg({ pageview: 100 }), null, null);
    expect(rader.find((r) => r.steg === 'pageview')?.bortfall).toBeNull();
  });

  it('delar inte med noll när föregående steg är noll', () => {
    const rader = byggRader(
      steg({ pageview: 0, signup_gate_shown: 0 }),
      null,
      null
    );
    for (const r of rader) {
      expect(Number.isFinite(r.andel ?? 0)).toBe(true);
    }
  });
});
