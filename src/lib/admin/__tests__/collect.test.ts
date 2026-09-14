import { describe, it, expect } from 'vitest';
import {
  manadsbeloppOre,
  mrrOreFranSubscriptions,
  veckansMandag,
  dagStr,
} from '../collect';

// MRR ar adminens viktigaste tal och det latt rakna fel pa: ett kvartalspris
// pa 299 kr ar 99,67 kr i manaden, inte 299. Ett ar pa 1 188 kr ar 99 kr i
// manaden. Rakna fel har och sidan sager att vi tjanar tre eller tolv ganger
// mer an vi gor.

describe('manadsbeloppOre', () => {
  it('later ett manadspris sta orort', () => {
    expect(manadsbeloppOre(9900, 'month', 1)).toBe(9900);
  });

  it('delar ett kvartalspris pa tre', () => {
    // 299 kr per kvartal blir 99,67 kr i manaden.
    expect(manadsbeloppOre(29900, 'month', 3)).toBe(9967);
  });

  it('delar ett arspris pa tolv', () => {
    expect(manadsbeloppOre(118800, 'year', 1)).toBe(9900);
  });

  it('raknar ett halvarspris som sex manader', () => {
    expect(manadsbeloppOre(59400, 'month', 6)).toBe(9900);
  });

  it('raknar veckor mot 52 veckor pa 12 manader', () => {
    // 100 kr i veckan blir 433,33 kr i manaden.
    expect(manadsbeloppOre(10000, 'week', 1)).toBe(43333);
  });

  it('multiplicerar med antalet platser', () => {
    expect(manadsbeloppOre(9900, 'month', 1, 3)).toBe(29700);
  });

  it('ger noll for ett engangskop utan intervall', () => {
    // Ett dagspass ar inte aterkommande intakt. Det syns i revenue_ore.
    expect(manadsbeloppOre(4900, null, null)).toBe(0);
    expect(manadsbeloppOre(4900, 'one_time' as never, 1)).toBe(0);
  });

  it('ger noll for saknat eller ogiltigt belopp', () => {
    expect(manadsbeloppOre(null, 'month', 1)).toBe(0);
    expect(manadsbeloppOre(undefined, 'month', 1)).toBe(0);
    expect(manadsbeloppOre(Number.NaN, 'month', 1)).toBe(0);
  });

  it('behandlar saknat intervalCount som ett', () => {
    expect(manadsbeloppOre(9900, 'month', null)).toBe(9900);
    expect(manadsbeloppOre(9900, 'month', 0)).toBe(9900);
  });
});

const pris = (belopp: number, interval: string, count = 1) =>
  ({ unit_amount: belopp, recurring: { interval, interval_count: count } }) as never;

describe('mrrOreFranSubscriptions', () => {
  it('raknar active och trialing men inte canceled', () => {
    const mrr = mrrOreFranSubscriptions([
      { status: 'active', items: { data: [{ quantity: 1, price: pris(9900, 'month') }] } },
      { status: 'trialing', items: { data: [{ quantity: 1, price: pris(9900, 'month') }] } },
      { status: 'canceled', items: { data: [{ quantity: 1, price: pris(9900, 'month') }] } },
      { status: 'incomplete_expired', items: { data: [{ quantity: 1, price: pris(9900, 'month') }] } },
    ]);
    expect(mrr).toBe(19800);
  });

  it('normaliserar en blandning av intervall till manad', () => {
    // 99 kr i manaden, 299 kr per kvartal, 1 188 kr per ar.
    const mrr = mrrOreFranSubscriptions([
      { status: 'active', items: { data: [{ quantity: 1, price: pris(9900, 'month') }] } },
      { status: 'active', items: { data: [{ quantity: 1, price: pris(29900, 'month', 3) }] } },
      { status: 'active', items: { data: [{ quantity: 1, price: pris(118800, 'year') }] } },
    ]);
    expect(mrr).toBe(9900 + 9967 + 9900);
  });

  it('summerar flera rader i samma prenumeration', () => {
    const mrr = mrrOreFranSubscriptions([
      {
        status: 'active',
        items: {
          data: [
            { quantity: 1, price: pris(9900, 'month') },
            { quantity: 2, price: pris(4900, 'month') },
          ],
        },
      },
    ]);
    expect(mrr).toBe(9900 + 9800);
  });

  it('hoppar over rader utan pris och prenumerationer utan rader', () => {
    const mrr = mrrOreFranSubscriptions([
      { status: 'active', items: { data: [{ quantity: 1, price: null }] } },
      { status: 'active', items: { data: [] } },
      { status: 'active' },
    ]);
    expect(mrr).toBe(0);
  });

  it('ger noll for en tom lista', () => {
    expect(mrrOreFranSubscriptions([])).toBe(0);
  });
});

describe('veckansMandag', () => {
  it('ger mandagen for en mandag', () => {
    // 2026-09-14 ar en mandag.
    expect(veckansMandag('2026-09-14')).toBe('2026-09-14');
  });

  it('ger foregaende mandag for en sondag', () => {
    expect(veckansMandag('2026-09-20')).toBe('2026-09-14');
  });

  it('ger samma mandag for alla dagar i veckan', () => {
    const dagar = [
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
      '2026-09-20',
    ];
    expect(new Set(dagar.map(veckansMandag))).toEqual(new Set(['2026-09-14']));
  });
});

describe('dagStr', () => {
  it('ger YYYY-MM-DD', () => {
    expect(dagStr(new Date('2026-09-14T10:00:00Z'))).toBe('2026-09-14');
  });

  it('raknar i svensk tid, inte UTC', () => {
    // 22:30 UTC den 14:e ar redan den 15:e i Sverige under sommartid.
    expect(dagStr(new Date('2026-09-14T22:30:00Z'))).toBe('2026-09-15');
  });
});
