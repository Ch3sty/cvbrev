import { describe, it, expect } from 'vitest';
import { byggRader, placera, testEtikett, TRATT_ORDNING } from '../data';

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

// ---------------------------------------------------------------------------
// Funktionsanvändningen ur sanningskällorna
// ---------------------------------------------------------------------------

// Talen på Funnel räknades tidigare ur user_activities, som skrivs
// fire-and-forget från klienten. Tester och mallnedladdningar syntes därför
// inte alls: test_completed skrevs bara när resultatsidan faktiskt
// renderades. Omskrivningen räknar på tabellerna i stället, och då är det
// fönsterindelningen som kan ljuga.
//
// Två fel kostar ett felaktigt beslut här:
//
// 1. "Veckan innan" överlappar "senaste sju", så varje rad räknas två gånger
//    och deltat blir systematiskt fel.
// 2. 30-dagarsfönstret görs till en tredje hink i stället för en summa, så
//    30-dagarstalet blir mindre än 7-dagarstalet.

describe('placera', () => {
  // Fasta gränser, så testet inte är beroende av när det körs.
  const f = {
    fran7: '2026-09-14T00:00:00.000Z',
    fran14: '2026-09-07T00:00:00.000Z',
    fran30: '2026-08-22T00:00:00.000Z',
  };

  it('lägger en färsk rad i senaste sju och i trettio', () => {
    const v = placera('2026-09-20T10:00:00.000Z', f);
    expect(v.senaste7).toBe(true);
    expect(v.forra7).toBe(false);
    expect(v.senaste30).toBe(true);
  });

  it('lägger en rad från veckan innan i forra7, inte i senaste7', () => {
    const v = placera('2026-09-10T10:00:00.000Z', f);
    expect(v.senaste7).toBe(false);
    expect(v.forra7).toBe(true);
    expect(v.senaste30).toBe(true);
  });

  it('räknar aldrig samma rad i både senaste7 och forra7', () => {
    // Deltat är antal7 minus antalForra7. Överlappar hinkarna blir deltat
    // alltid noll och sidan säger att ingenting rör sig.
    for (const tid of [
      '2026-09-21T00:00:00.000Z',
      '2026-09-14T00:00:00.000Z',
      '2026-09-13T23:59:59.999Z',
      '2026-09-07T00:00:00.000Z',
      '2026-08-25T00:00:00.000Z',
    ]) {
      const v = placera(tid, f);
      expect(v.senaste7 && v.forra7).toBe(false);
    }
  });

  it('tar med gränsen fran7 i senaste sju, inte i veckan innan', () => {
    const v = placera(f.fran7, f);
    expect(v.senaste7).toBe(true);
    expect(v.forra7).toBe(false);
  });

  it('låter trettio dagar täcka både senaste sju och veckan innan', () => {
    expect(placera('2026-09-20T00:00:00.000Z', f).senaste30).toBe(true);
    expect(placera('2026-09-10T00:00:00.000Z', f).senaste30).toBe(true);
    expect(placera('2026-08-25T00:00:00.000Z', f).senaste30).toBe(true);
  });

  it('lämnar en rad äldre än trettio dagar utanför alla tre', () => {
    // Raden hämtas ändå: 37 dagar behövs för att veckan innan ska gå att
    // räkna. Den ska bara inte synas i något av talen.
    const v = placera('2026-08-18T00:00:00.000Z', f);
    expect(v.senaste7).toBe(false);
    expect(v.forra7).toBe(false);
    expect(v.senaste30).toBe(false);
  });
});

describe('testEtikett', () => {
  it('översätter de kända testtyperna till läsbar svenska', () => {
    expect(testEtikett('matrislogik')).toBe('Matrislogik');
    expect(testEtikett('numerical-reasoning')).toBe('Numerisk');
    expect(testEtikett('verbal-resonemang')).toBe('Verbal');
    expect(testEtikett('personlighet-grund')).toBe('Personlighet');
  });

  it('visar en okänd testtyp rå i stället för att dölja den', () => {
    // En ny testtyp ska synas på sidan direkt, inte försvinna tills någon
    // kommer ihåg att fylla på tabellen.
    expect(testEtikett('helt-nytt-test')).toBe('helt-nytt-test');
  });
});
