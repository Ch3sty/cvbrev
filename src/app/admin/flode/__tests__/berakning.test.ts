import { describe, it, expect } from 'vitest';
import {
  byggBlockeringar,
  byggFornyelser,
  byggIntakt,
  byggKomIgang,
  byggTratt,
  manadskronor,
  paketFranDimension,
} from '../berakning';
import type { DagligaMetrik } from '@/lib/admin/collect';

// Flödes fem diagram kan ljuga på var sitt sätt. Här testas räkningen
// bakom dem: att paketens trattar inte börjar på noll besök, att
// bortfallet räknas mot närmast föregående mätta steg, att en spärr
// färgas efter paketet som säljs, att "inom 24 timmar" bara räknar
// köpare som är ett dygn gamla, att MRR normaliseras per vecka och att
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
});

describe('byggTratt', () => {
  it('ger totalen alla sex steg och paketen bara de fyra sista', () => {
    const alla = byggTratt('alla', new Map([['pageview', 100], ['subscription_paid', 2]]));
    expect(alla.steg.map((s) => s.antal)).toEqual([100, 0, 0, 0, 0, 2]);

    const cv = byggTratt('cv', new Map([['track_selected', 10], ['subscription_paid', 2]]));
    expect(cv.steg[0].antal).toBeNull();
    expect(cv.steg[1].antal).toBeNull();
    expect(cv.steg[2].antal).toBe(10);
  });

  it('räknar andelen mot föregående steg och bredden mot första', () => {
    const t = byggTratt('allt', new Map([['track_selected', 20], ['purchase_step_viewed', 10], ['checkout_started', 5], ['subscription_paid', 4]]));
    const steg = t.steg.filter((s) => s.antal !== null);
    expect(steg[0].andel).toBeNull();
    expect(steg[0].bredd).toBe(100);
    expect(steg[1].andel).toBeCloseTo(0.5);
    expect(steg[1].bredd).toBe(50);
    expect(steg[3].andel).toBeCloseTo(0.8);
    expect(t.helaVagen).toBeCloseTo(0.2);
  });

  it('ger ingen hela-vägen när första steget är noll', () => {
    const t = byggTratt('cv', new Map());
    expect(t.helaVagen).toBeNull();
    expect(t.steg.every((s) => s.bredd === 0)).toBe(true);
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
    expect(ut[0]).toMatchObject({ personer: 4, antal: 5, paket: 'cv', roll: 'mellan', namn: 'Ladda ned CV' });
    expect(ut[1]).toMatchObject({ paket: 'tester', roll: 'sekundar' });
    expect(ut[2]).toMatchObject({ paket: 'allt', roll: 'primar' });
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

describe('manadskronor och byggIntakt', () => {
  it('normaliserar veckopris till månad och kvartal till en tredjedel', () => {
    expect(manadskronor('cv_week')).toBeCloseTo((79 * 52) / 12, 0);
    expect(manadskronor('all_month')).toBe(149);
    expect(manadskronor('all_quarter')).toBeCloseTo(299 / 3, 0);
    expect(manadskronor('all_day')).toBe(0);
  });

  it('bygger serien stigande med null där Stripe-siffror saknas', () => {
    const dag = (d: string, extra: Partial<DagligaMetrik>): DagligaMetrik =>
      ({ dag: d, ...extra }) as DagligaMetrik;
    const ut = byggIntakt([
      dag('2026-09-22', { active_cv_week: 2, active_test_week: 0, active_all_week: 1, active_all_month: 3, active_all_quarter: 0 }),
      dag('2026-09-21', { active_cv_week: null, active_test_week: null, active_all_week: null, active_all_month: null, active_all_quarter: null }),
    ]);
    expect(ut.map((p) => p.dag)).toEqual(['2026-09-21', '2026-09-22']);
    expect(ut[0]).toMatchObject({ cv: null, tester: null, allt: null });
    expect(ut[1].cv).toBe(Math.round(2 * manadskronor('cv_week')));
    expect(ut[1].tester).toBe(0);
    expect(ut[1].allt).toBe(Math.round(manadskronor('all_week') + 3 * 149));
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
  });
});
