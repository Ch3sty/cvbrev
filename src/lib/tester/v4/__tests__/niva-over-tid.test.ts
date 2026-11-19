import { describe, expect, it } from 'vitest';
import { byggPunkter, klassa } from '../punkter';
import { nivaEfterTraning, nivaLage, senasteNiva } from '../niva-lage';
import { svagasteMonster, tempoAndel, tappadeUrMeta } from '../monster';
import { TEST_TYP_ORDNING } from '../typer';

const sess = (id: string, test_type: string, completed_at: string | null, meta: unknown = {}) => ({ id, test_type, created_at: completed_at ?? '2026-11-01T08:00:00Z', completed_at, meta });

describe('punkterna per testtyp', () => {
  it('alla åtta typer har nivåkoll och träning i klassningen', () => {
    for (const t of TEST_TYP_ORDNING) {
      const typer = ['matrislogik-matning', 'matrislogik-pass', `${t}-nivakoll`, `${t}-pass`].map(klassa).filter((k) => k?.typ === t);
      expect(typer.map((k) => k!.slag).sort(), t).toEqual(['nivakoll', 'trana']);
    }
  });

  it('nivåkoll med nivå, träning med nivåpunkten typ pass, prov utan nivå', () => {
    const p = byggPunkter({
      nivapunkter: [
        { test_kind: 'deduktiv', dag: '2026-11-02', typ: 'matning', niva: '5.0', session_id: 'a' },
        { test_kind: 'deduktiv', dag: '2026-11-04', typ: 'pass', niva: 5.2, session_id: 'b' },
      ],
      sessioner: [
        sess('a', 'deduktiv-nivakoll', '2026-11-02T10:00:00Z', { resultat: { ratt: 7, antal: 12 } }),
        sess('b', 'deduktiv-pass', '2026-11-04T10:00:00Z', { ratt: 5, antal: 8 }),
        sess('c', 'deduktiv-pass', '2026-11-05T10:00:00Z', { ratt: 6, antal: 8 }),
        sess('d', 'deduktiv-prov', '2026-11-06T10:00:00Z', { resultat: { ratt: 9, antal: 12 } }),
        sess('e', 'deduktiv-pass', null),
      ],
    });
    expect(p.map((x) => [x.id, x.slag, x.niva])).toEqual([
      ['a', 'nivakoll', 5],
      ['b', 'trana', 5.2],
      ['c', 'trana', null],
      ['d', 'ovningsprov', null],
    ]);
    expect(p[0].resultat).toEqual({ ratt: 7, antal: 12 });
    expect(p[3].resultat).toEqual({ ratt: 9, antal: 12 });
  });

  it('andra nivåkollen samma dag räknas inte', () => {
    const p = byggPunkter({
      nivapunkter: [{ test_kind: 'verbal', dag: '2026-11-02', typ: 'matning', niva: 5 }],
      sessioner: [sess('a', 'verbal-nivakoll', '2026-11-02T08:00:00Z'), sess('b', 'verbal-nivakoll', '2026-11-02T12:00:00Z')],
    });
    expect(p.map((x) => [x.raknas, x.niva])).toEqual([
      [true, 5],
      [false, null],
    ]);
  });

  it('nivåpunkt utan session_id hör till dagens sista träning', () => {
    const p = byggPunkter({
      nivapunkter: [{ test_kind: 'matris', dag: '2026-11-03', typ: 'pass', niva: 6.1 }],
      sessioner: [sess('a', 'matrislogik-pass', '2026-11-03T08:00:00Z'), sess('b', 'matrislogik-riktat', '2026-11-03T12:00:00Z')],
    });
    expect(p.map((x) => x.niva)).toEqual([null, 6.1]);
  });

  it('gratis: bara senaste punkten per typ', () => {
    const p = byggPunkter({
      historikLast: true,
      nivapunkter: [],
      sessioner: [sess('a', 'verbal-pass', '2026-11-02T08:00:00Z'), sess('b', 'verbal-pass', '2026-11-03T08:00:00Z'), sess('c', 'talserie-pass', '2026-11-01T08:00:00Z')],
    });
    expect(p.map((x) => x.id).sort()).toEqual(['b', 'c']);
  });
});

describe('nivåbandets läge', () => {
  const pkt = (dag: string, slag: 'nivakoll' | 'trana' | 'ovningsprov', niva: number | null, raknas = true) => ({ id: dag + slag, typ: 'matris' as const, dag, slag, niva, raknas, resultat: null, overTid: null, href: null });

  it('omätt, påbörjad och mätt', () => {
    expect(nivaLage([]).status).toBe('omatt');
    expect(nivaLage([], { besvarade: 8, antal: 12 })).toMatchObject({ status: 'paborjad', svar: { besvarade: 8, antal: 12 } });
    expect(nivaLage([pkt('2026-11-01', 'nivakoll', 5.3)])).toMatchObject({ status: 'matt', niva: 5.3, osakerhet: 0.6, tak: 7.5 });
  });

  it('senaste nivån som räknas, aldrig provet, taket 7,5', () => {
    expect(senasteNiva([pkt('2026-11-01', 'nivakoll', 5), pkt('2026-11-02', 'trana', 5.4), pkt('2026-11-03', 'ovningsprov', null), pkt('2026-11-04', 'nivakoll', 9, false)])).toBe(5.4);
    expect(nivaLage([pkt('2026-11-01', 'nivakoll', 9)]).niva).toBe(7.5);
  });
});

describe('nivån efter träning', () => {
  const svar = (n: number, correct: boolean, raknas = true) => Array.from({ length: n }, () => ({ p: 0.55, correct, raknas }));

  it('ingen nivå före: ingen punkt (träningen sätter aldrig en första nivå)', () => {
    expect(nivaEfterTraning({ fore: null, svar: svar(6, true) })).toBeNull();
  });

  it('bara uppgifter som räknas flyttar nivån', () => {
    expect(nivaEfterTraning({ fore: 5, svar: svar(6, true, false) })).toBeNull();
    const upp = nivaEfterTraning({ fore: 5, svar: svar(8, true) })!;
    expect(upp.niva).toBeGreaterThan(5);
    const ned = nivaEfterTraning({ fore: 5, svar: svar(8, false) })!;
    expect(ned.niva).toBeLessThan(5);
  });

  it('dagstak 0,5 mot nivån vid dagens första träning', () => {
    const ut = nivaEfterTraning({ fore: 5.4, dagensStart: 5, svar: svar(10, true) })!;
    expect(ut.niva).toBeLessThanOrEqual(5.5);
  });
});

describe('mönster och tempo för övriga typer', () => {
  it('läser tappade familjer i båda formerna', () => {
    expect(tappadeUrMeta({ resultat: { tappade: [{ family: 'a', ratt: 1, antal: 3 }] } })).toEqual([{ family: 'a', ratt: 1, antal: 3 }]);
    expect(tappadeUrMeta({ tappade: { b: { ratt: 2, antal: 4 } } })).toEqual([{ family: 'b', ratt: 2, antal: 4 }]);
  });

  it('svagaste kräver minst sex svar och under 60 procent', () => {
    const s = [{ meta: { resultat: { tappade: [{ family: 'x', ratt: 2, antal: 3 }, { family: 'y', ratt: 4, antal: 5 }] } } }, { meta: { resultat: { tappade: [{ family: 'x', ratt: 1, antal: 3 }] } } }];
    expect(svagasteMonster(s)).toMatchObject({ family: 'x', ratt: 3, antal: 6 });
    expect(svagasteMonster(s.slice(0, 1))).toBeNull();
  });

  it('tempot är andelen svar över provets tid', () => {
    expect(tempoAndel([{ time_spent: 30 }, { time_spent: 50 }, { time_spent: 80 }, {}], 45)).toBeCloseTo(2 / 3);
    expect(tempoAndel([], 45)).toBeNull();
  });
});
