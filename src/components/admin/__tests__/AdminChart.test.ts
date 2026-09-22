import { describe, it, expect, vi } from 'vitest';

vi.mock('next/dynamic', () => ({ default: () => () => null }));

import {
  nollstallForeMatstart,
  antalPunkter,
  punkterSomText,
  type AdminSerie,
} from '../AdminChart';

/** Diagramregeln (spec-admin-tydlighet 2026-09-22, punkt 7). */

const MRR: AdminSerie[] = [{ nyckel: 'mrr', namn: 'MRR', typ: 'linje', roll: 'primar' }];

describe('diagramregeln', () => {
  const data = [
    { dag: '2026-09-13', mrr: 596 },
    { dag: '2026-09-14', mrr: 447 },
    { dag: '2026-09-15', mrr: 447 },
    { dag: '2026-09-16', mrr: null },
  ];

  it('ritar inte dagar före mätstart som värden', () => {
    const ut = nollstallForeMatstart(data, 'dag', MRR, '2026-09-15');
    expect(ut.map((r) => r.mrr)).toEqual([null, null, 447, null]);
  });

  it('räknar punkter med data, inte rader', () => {
    expect(antalPunkter(data, MRR)).toBe(3);
    expect(antalPunkter(nollstallForeMatstart(data, 'dag', MRR, '2026-09-15'), MRR)).toBe(1);
  });

  it('skriver värdena som en mening när punkterna är för få', () => {
    const text = punkterSomText(
      [
        { dag: '21 sep', mrr: 447 },
        { dag: '22 sep', mrr: 447 },
      ],
      'dag',
      MRR,
      undefined,
      undefined,
      'kr'
    );
    expect(text).toBe('21 sep: 447 kr. 22 sep: 447 kr.');
  });

  it('sätter seriens namn före värdet när serierna är flera', () => {
    const text = punkterSomText(
      [{ dag: 'd', a: 1, b: 2 }],
      'dag',
      [
        { nyckel: 'a', namn: 'Löpande', typ: 'stapel', roll: 'allt' },
        { nyckel: 'b', namn: 'Engångs', typ: 'stapel', roll: 'framhavd' },
      ],
      undefined,
      (v) => `${v} kr`
    );
    expect(text).toBe('d: Löpande 1 kr, Engångs 2 kr.');
  });
});
