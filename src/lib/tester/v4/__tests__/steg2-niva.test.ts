// Nivån ur nivåtestet för talserier, spatial och ordförråd (A7), med
// verkliga uppgifts-id och utfall ur prod (2026-11-19, inga kontouppgifter).
import { describe, expect, it } from 'vitest';
import { nivaUrNivatest, pSteg2, steg2NivatestTyp } from '../steg2-niva.server';
import { byggPunkter } from '../punkter';
import { nivaLage } from '../niva-lage';

const svar = (ids: string, ratt: string) => ids.split(' ').map((q_id, i) => ({ q_id, correct: ratt[i] === '1' }));

const TALSERIE_13 = {
  test_type: 'talserier-grund',
  score: 13,
  meta: { antal: 15 },
  answers: svar('ts-g-arit-03 ts-g-arit-17 ts-g-arit-08 ts-g-arit-09 ts-g-andra-01 ts-g-andra-17 ts-g-andra-16 ts-g-vaxel-03 ts-g-arit-12 ts-g-andra-10 ts-g-vaxel-02 ts-g-vaxel-21 ts-g-andra-02 ts-g-geom-03 ts-g-geom-01', '111101111111110'),
};
const SPATIAL_10 = {
  test_type: 'spatial-grund',
  score: 10,
  meta: { antal: 15 },
  answers: svar('sp-g-a-22 sp-g-c-12 sp-g-d-11 sp-g-b-04 sp-g-d-24 sp-g-c-22 sp-g-a-16 sp-g-b-22 sp-g-c-08 sp-g-b-18 sp-g-d-01 sp-g-a-05 sp-g-c-05 sp-g-d-08 sp-g-a-21', '010101011111011'),
};
const ORD_17 = {
  test_type: 'ordforrad-grund',
  score: 17,
  meta: { antal: 20 },
  answers: svar('of-g-s-38 of-g-s-45 of-g-s-03 of-g-s-36 of-g-s-18 of-g-m-16 of-g-m-14 of-g-m-26 of-g-m-18 of-g-m-09 of-g-s-46 of-g-s-33 of-g-s-34 of-g-s-41 of-g-s-47 of-g-m-41 of-g-m-11 of-g-m-22 of-g-m-37 of-g-m-27', '11110111111111110101'),
};

describe('nivån ur nivåtestet', () => {
  it('känner igen nivåtesten', () => {
    expect(steg2NivatestTyp('talserier-avancerad')).toEqual({ typ: 'talserie', niva: 'avancerad' });
    expect(steg2NivatestTyp('ordforrad-grund')).toEqual({ typ: 'ordforrad', niva: 'grund' });
    expect(steg2NivatestTyp('talserie-pass')).toBeNull();
  });

  it('bankernas p används när de finns', () => {
    const p = pSteg2('talserie', 'ts-g-arit-03');
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });

  it('verkliga rader ger en nivå på skalan, fler rätt ger högre nivå', () => {
    for (const r of [TALSERIE_13, SPATIAL_10, ORD_17]) {
      const n = nivaUrNivatest(r)!;
      expect(n, r.test_type).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(7.5);
    }
    const lag = nivaUrNivatest({ ...SPATIAL_10, answers: SPATIAL_10.answers.map((a, i) => ({ ...a, correct: i < 3 })) })!;
    expect(lag).toBeLessThan(nivaUrNivatest(SPATIAL_10)!);
  });

  it('obesvarade räknas som fel, och poäng utan svar räcker', () => {
    const halv = nivaUrNivatest({ ...TALSERIE_13, answers: TALSERIE_13.answers.slice(0, 8) })!;
    expect(halv).toBeLessThan(nivaUrNivatest(TALSERIE_13)!);
    expect(nivaUrNivatest({ test_type: 'talserier-grund', score: 10, answers: [], meta: {} })).not.toBeNull();
  });

  it('blir punkter märkta nivåtest, och typen är inte omätt', () => {
    const p = byggPunkter({
      nivapunkter: [],
      sessioner: [{ id: 's1', test_type: 'talserier-grund', created_at: '2026-11-10T08:00:00Z', completed_at: '2026-11-10T08:10:00Z', score: 13, meta: { antal: 15 } }],
      nivatest: (s) => (steg2NivatestTyp(s.test_type) ? { typ: 'talserie', niva: nivaUrNivatest({ ...TALSERIE_13, ...s, answers: TALSERIE_13.answers }), zon: 'grund' } : null),
    });
    expect(p).toHaveLength(1);
    expect(p[0]).toMatchObject({ typ: 'talserie', slag: 'nivakoll', kalla: 'nivatest', provNamn: 'Nivåtest, grundnivå' });
    expect(nivaLage(p).status).toBe('matt');
  });

  it('Nivåkoll och träning går före nivåtestets skattning', () => {
    const pkt = (dag: string, niva: number, kalla?: 'nivatest') => ({ id: dag, typ: 'talserie' as const, dag, slag: 'nivakoll' as const, niva, raknas: true, resultat: null, overTid: null, href: null, ...(kalla ? { kalla } : {}) });
    expect(nivaLage([pkt('2026-11-01', 4.2), pkt('2026-11-05', 6, 'nivatest')]).niva).toBe(4.2);
  });
});

describe('nivåtestets punkter i modellen', () => {
  it('räknas inte som Nivåkoll i kortet, men ger nivå och syns i senaste resultat med kalla', async () => {
    const { fixturUnderlag } = await import('../fixturer');
    const { byggTesterV4 } = await import('../modell');
    const inp = fixturUnderlag('a', 'premium');
    inp.typer.spatial = {
      ...inp.typer.spatial,
      provad: true,
      nivakollFinns: false,
      punkter: [{ id: 'nt', typ: 'spatial', dag: '2026-11-10', slag: 'nivakoll', niva: 4.4, raknas: true, resultat: { ratt: 10, antal: 15 }, overTid: null, provNamn: 'Nivåtest, grundnivå', kalla: 'nivatest', href: null }],
    };
    const d = byggTesterV4(inp);
    const kort = d.typer.find((t) => t.id === 'spatial')!;
    expect(kort.niva).toMatchObject({ status: 'matt', niva: 4.4 });
    expect(kort.senasteNivakoll).toBeNull();
    expect(d.menyer.spatial.nivakoll.senaste).toBeNull();
    expect(d.menyer.spatial.senaste.nivakoller[0].kalla).toBe('nivatest');
  });
});
