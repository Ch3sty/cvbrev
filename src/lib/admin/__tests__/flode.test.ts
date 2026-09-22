import { describe, it, expect } from 'vitest';
import {
  byggFlodeRader,
  byggFunnelRader,
  flodeLuckor,
  FLODE_SAMLAD,
  FUNNEL_STEG,
  ATERFYLL_FLODE_MAX,
} from '../collect';

/**
 * Insamlingen till admin_flode_daily och den paketuppdelade tratten (D3).
 *
 * Tre saker kan ga fel: en dubblett pa primarnyckeln nar unionens andra
 * halva ger tom dimension, en paket-tratt som borjar pa noll besok fast
 * besoken inte vet nagot paket, och en dag utan handelser som fylls igen
 * varje natt for att den ser ut som en lucka.
 */

describe('byggFlodeRader', () => {
  it('skriver totalen med tom dimension och per dimension', () => {
    const rader = byggFlodeRader('2026-09-22', [
      ['feature_blocked', '', 5, 3],
      ['feature_blocked', 'cv_export', 3, 2],
      ['feature_blocked', 'test_exam_mode', 2, 1],
    ]);
    const total = rader.find((r) => r.handelse === 'feature_blocked' && r.dimension === '');
    expect(total).toMatchObject({ antal: 5, personer: 3 });
    expect(rader.find((r) => r.dimension === 'cv_export')).toMatchObject({ antal: 3, personer: 2 });
  });

  it('slar ihop en tom dimension fran unionens andra halva med totalen', () => {
    // pageview har ingen plan, sa den andra halvan ger ocksa '' och samma
    // tal. Tva rader med samma nyckel hade fallt pa primarnyckeln.
    const rader = byggFlodeRader('2026-09-22', [
      ['$pageview', '', 198, 74],
      ['$pageview', '', 198, 74],
    ]);
    expect(rader.filter((r) => r.handelse === '$pageview')).toHaveLength(1);
  });

  it('lagger alltid till markorraden _samlad', () => {
    const rader = byggFlodeRader('2026-09-22', []);
    expect(rader).toEqual([
      { dag: '2026-09-22', handelse: FLODE_SAMLAD, dimension: '', antal: 0, personer: 0 },
    ]);
  });

  it('tal null-dimension och strangar som tal', () => {
    const rader = byggFlodeRader('2026-09-22', [['subscription_paid', null, '2', '2']]);
    expect(rader[0]).toMatchObject({ dimension: '', antal: 2, personer: 2 });
  });
});

describe('byggFunnelRader', () => {
  it('ger totalen alla steg och paketen bara stegen som bar ett paket', () => {
    const rader = byggFunnelRader('2026-09-21', [
      ['$pageview', '', 400],
      ['signup_completed', '', 40],
      ['track_selected', '', 30],
      ['track_selected', 'cv', 20],
      ['subscription_paid', 'cv', 3],
    ]);

    const alla = rader.filter((r) => r.kalla === 'alla');
    expect(alla.map((r) => r.steg)).toEqual([...FUNNEL_STEG]);
    expect(alla.find((r) => r.steg === 'pageview')?.antal).toBe(400);

    const cv = rader.filter((r) => r.kalla === 'cv');
    expect(cv.map((r) => r.steg)).toEqual([
      'track_selected',
      'purchase_step_viewed',
      'checkout_started',
      'subscription_paid',
    ]);
    expect(cv.find((r) => r.steg === 'track_selected')?.antal).toBe(20);
    expect(cv.find((r) => r.steg === 'subscription_paid')?.antal).toBe(3);
    // Ett steg utan rader i svaret ar ett uppmatt noll for veckan.
    expect(cv.find((r) => r.steg === 'checkout_started')?.antal).toBe(0);
  });

  it('hoppar over paket som inte finns', () => {
    const rader = byggFunnelRader('2026-09-21', [['subscription_paid', 'okant', 9]]);
    expect(rader.some((r) => r.kalla === 'okant')).toBe(false);
  });
});

describe('flodeLuckor', () => {
  const IDAG = '2026-09-22';

  it('tar aldsta luckan forst och hogst max stycken', () => {
    const luckor = flodeLuckor([], IDAG);
    expect(luckor).toHaveLength(ATERFYLL_FLODE_MAX);
    expect(luckor[0]).toBe('2026-08-23');
  });

  it('raknar inte dagens dag som lucka', () => {
    const alla = flodeLuckor([], IDAG, 100);
    expect(alla).not.toContain(IDAG);
    expect(alla.at(-1)).toBe('2026-09-21');
  });

  it('ser en dag med markorrad som fylld', () => {
    const utan = flodeLuckor([{ dag: '2026-09-21' }, { dag: '2026-09-20' }], IDAG, 100);
    expect(utan).not.toContain('2026-09-21');
    expect(utan).not.toContain('2026-09-20');
    expect(utan).toContain('2026-09-19');
  });
});
