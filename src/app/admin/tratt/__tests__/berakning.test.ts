import { describe, it, expect } from 'vitest';
import {
  byggBlockeringar,
  byggFornyelser,
  byggKomIgang,
  paketFranDimension,
  sparFranPaket,
} from '../berakning';

// Köpvägens sektioner kan ljuga på var sitt sätt. Här testas räkningen
// bakom dem: att en spärr färgas efter paketet som säljs (i spårfärgerna),
// att "inom 24 timmar" bara räknar köpare som är ett dygn gamla och att
// förnyelsekurvan inte drar ner kohorten med prenumerationer som inte
// hunnit förnyas.

describe('paketFranDimension', () => {
  it('mappar plan och spår till paket', () => {
    expect(paketFranDimension('cv_week')).toBe('cv');
    expect(paketFranDimension('test_week')).toBe('tester');
    expect(paketFranDimension('all_month')).toBe('allt');
    expect(paketFranDimension('tester')).toBe('tester');
    expect(paketFranDimension('okant')).toBeNull();
    expect(paketFranDimension('')).toBeNull();
  });

  it('lägger Stripe-paketen i sitt spår, Allt-dagen under Allt', () => {
    expect(sparFranPaket('cv_week')).toBe('cv');
    expect(sparFranPaket('all_day')).toBe('allt');
    expect(sparFranPaket(null)).toBeNull();
  });
});

describe('byggBlockeringar', () => {
  it('summerar per funktion, färgar efter paketet som säljs och sorterar fallande', () => {
    const rader = [
      { dag: '2026-09-22', handelse: 'feature_blocked', dimension: '', antal: 9, personer: 6 },
      { dag: '2026-09-22', handelse: 'feature_blocked', dimension: 'cv_export', antal: 3, personer: 2 },
      { dag: '2026-09-23', handelse: 'feature_blocked', dimension: 'cv_export', antal: 2, personer: 2 },
      { dag: '2026-09-22', handelse: 'feature_blocked', dimension: 'test_exam_mode', antal: 4, personer: 3 },
      { dag: '2026-09-22', handelse: 'feature_blocked', dimension: 'chat_unlimited', antal: 1, personer: 1 },
      { dag: '2026-09-22', handelse: 'gray_option_tapped', dimension: 'cv_export', antal: 7, personer: 7 },
    ];
    const ut = byggBlockeringar(rader, 'feature_blocked');
    expect(ut.map((r) => r.feature)).toEqual(['cv_export', 'test_exam_mode', 'chat_unlimited']);
    expect(ut[0]).toMatchObject({ personer: 4, antal: 5, paket: 'cv', roll: 'cv', namn: 'Ladda ned CV' });
    expect(ut[1]).toMatchObject({ paket: 'tester', roll: 'test' });
    expect(ut[2]).toMatchObject({ paket: 'allt', roll: 'allt' });
  });

  it('visar en okänd funktion med sitt råa namn under Allt', () => {
    const ut = byggBlockeringar(
      [{ dag: '2026-09-22', handelse: 'feature_blocked', dimension: 'ny_grej', antal: 1, personer: 1 }],
      'feature_blocked'
    );
    expect(ut[0]).toMatchObject({ namn: 'ny_grej', paket: 'allt' });
  });
});

describe('byggKomIgang', () => {
  const nu = new Date('2026-09-30T12:00:00Z');

  it('räknar andelen inom 24 timmar bara på köpare som är ett dygn gamla', () => {
    const kopare = [
      // Köpte för åtta dygn sedan, laddade upp CV efter två timmar.
      {
        premium_scope: 'cv',
        paket_started_at: '2026-09-22T12:00:00Z',
        onboarding_steps: { profil: '2026-09-22T12:30:00Z', cv_upp: '2026-09-22T14:00:00Z', analys: '2026-09-25T10:00:00Z' },
      },
      // Köpte för tre dygn sedan, ingenting provat.
      { premium_scope: 'cv', paket_started_at: '2026-09-27T12:00:00Z', onboarding_steps: {} },
      // Köpte för en timme sedan: räknas inte i någon av andelarna.
      { premium_scope: 'cv', paket_started_at: '2026-09-30T11:00:00Z', onboarding_steps: { cv_upp: '2026-09-30T11:10:00Z' } },
      // Annat paket.
      { premium_scope: 'tester', paket_started_at: '2026-09-20T12:00:00Z', onboarding_steps: {} },
    ];
    const [cv, tester] = byggKomIgang(kopare, nu);

    expect(cv.kopare).toBe(3);
    expect(cv.kopare24).toBe(2);
    expect(cv.kopare7d).toBe(1);

    const cvUpp = cv.brickor.find((b) => b.key === 'cv_upp')!;
    expect(cvUpp.inom24).toBe(50);
    expect(cvUpp.inom7d).toBe(100);

    const analys = cv.brickor.find((b) => b.key === 'analys')!;
    expect(analys.inom24).toBe(0);
    expect(analys.inom7d).toBe(100);

    expect(cv.alltInom7d).toBe(0);
    expect(cv.brickor.map((b) => b.key)).toEqual([
      'profil', 'cv_upp', 'analys', 'uppdatera_cv', 'mall', 'brev', 'linkedin', 'matris_grund',
    ]);

    expect(tester.kopare7d).toBe(1);
    expect(tester.brickor[0].inom7d).toBe(0);
  });

  it('ger null när inga köpare är gamla nog', () => {
    const [cv] = byggKomIgang([{ premium_scope: 'cv', paket_started_at: '2026-09-30T11:00:00Z', onboarding_steps: {} }], nu);
    expect(cv.brickor[0].inom24).toBeNull();
    expect(cv.alltInom24).toBeNull();
  });
});

describe('byggFornyelser', () => {
  const VECKA = 7 * 86_400;
  const nu = 1_800_000_000;

  it('räknar vecka n bara på prenumerationer som hunnit dit, med ett dygns frist', () => {
    const DYGN = 86_400;
    const subs = [
      // Fyra veckor gammal, förnyad två gånger: lever vecka 1, 2, 3, tappad vecka 4.
      { paket: 'cv' as const, created: nu - 4 * VECKA - 2 * DYGN, betaldaFakturor: 3 },
      // Två veckor och två dygn gammal, aldrig förnyad: tappad vecka 2, gammal nog för vecka 3.
      { paket: 'cv' as const, created: nu - 2 * VECKA - 2 * DYGN, betaldaFakturor: 1 },
      // Passerade veckogränsen för tre timmar sedan: får inte dra ner vecka 2 än.
      { paket: 'cv' as const, created: nu - VECKA - 3 * 3600, betaldaFakturor: 1 },
      // Köpt i går: får inte dra ner något.
      { paket: 'cv' as const, created: nu - DYGN, betaldaFakturor: 1 },
    ];
    const ut = byggFornyelser(subs, nu);
    expect(ut.kohort.cv).toBe(2);
    // Vecka 1: alla fyra. Vecka 2: två gamla nog, en kvar. Vecka 3: samma
    // två, en kvar. Vecka 4: bara den äldsta, och den är tappad.
    expect(ut.veckor.map((v) => v.cv)).toEqual([100, 50, 50, 0]);
    expect(ut.veckaTva.cv).toBe(50);
    expect(ut.veckor[0].tester).toBeNull();
    expect(ut.veckokopare).toBe(4);
    expect(ut.forstaVeckokop).toBe(nu - 4 * VECKA - 2 * DYGN);
  });

  it('ger ingen första veckoköpare när det inte finns några', () => {
    const ut = byggFornyelser([], nu);
    expect(ut.veckokopare).toBe(0);
    expect(ut.forstaVeckokop).toBeNull();
  });
});
