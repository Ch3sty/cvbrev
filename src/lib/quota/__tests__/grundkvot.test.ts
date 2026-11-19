/**
 * Gratisregeln (ägarens beslut 2026-11-19, omgång 7): ett grundnivåtest om
 * dagen över alla testtyper, dag 0-grundpasset inräknat, Premium obegränsat,
 * avancerad och expert når aldrig kvoten (de kräver Premium före kvoten).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const premium = { varde: false };
vi.mock('@/lib/supabase/premiumAccess', () => ({
  userHasAccess: vi.fn(async () => premium.varde),
}));

import { checkDailyTestQuota, checkGrundnivaQuota, GRUND_KVOT_TEST_TYPER, GRUND_TEST_TYPER, arGrundTestTyp } from '../quotaService';
import { beslutaTillgang } from '@/lib/traning/tillgang';
import { GRATISNIVA } from '@/lib/traning/gratisniva';
import { RESULTAT } from '@/lib/tester/copy';

interface Rad {
  test_type: string;
  completed_at: string | null;
}

/** En minimal Supabase-klient som räknar raderna som filtren släpper igenom. */
function klient(rader: Rad[]) {
  const anrop: { in?: string[]; eq?: string }[] = [];
  const from = () => {
    let urval = [...rader];
    const q = {
      select: () => q,
      eq: (k: string, v: string) => {
        if (k === 'test_type') {
          anrop.push({ eq: v });
          urval = urval.filter((r) => r.test_type === v);
        }
        return q;
      },
      in: (_k: string, v: string[]) => {
        anrop.push({ in: v });
        urval = urval.filter((r) => v.includes(r.test_type));
        return q;
      },
      not: () => {
        urval = urval.filter((r) => r.completed_at);
        return q;
      },
      gte: (_k: string, v: string) => {
        urval = urval.filter((r) => (r.completed_at ?? '') >= v);
        return Promise.resolve({ count: urval.length });
      },
    };
    return q;
  };
  return { klient: { from } as never, anrop };
}

const nu = new Date().toISOString();
const bas = { begard: 'pass' as const, harOvanGrund: false, harProvlage: false, matningarSlutforda: 1, passSlutfordaIdag: 0, forstaTraningsdag: '2026-11-19', idag: '2026-11-19' };

describe('grundnivåkvoten över alla testtyper', () => {
  beforeEach(() => {
    premium.varde = false;
  });

  it('resultatsidan säger regeln: ett gratis test om dagen, valfri typ', () => {
    expect(RESULTAT.status.rytm.gratisGrund).toBe('Ett gratis test om dagen, valfri typ. Nästa gratis test i morgon.');
  });

  it('en grundnivå per testtyp med nivå, och dag 0-grundpasset i kvoten', () => {
    expect(GRUND_TEST_TYPER).toHaveLength(8);
    expect(GRUND_KVOT_TEST_TYPER).toContain('matrislogik-pass');
    expect(GRATISNIVA.grundnivaTestPerDag).toBe(1);
    expect(GRATISNIVA.tranaGratis).toBe(false);
  });

  it('ett grundnivåtest i en typ spärrar grundnivån i alla typer samma dag', async () => {
    const { klient: k } = klient([{ test_type: 'figurserier-grund', completed_at: nu }]);
    for (const t of GRUND_TEST_TYPER) {
      const q = await checkDailyTestQuota(k, 'u', t);
      expect(q.allowed, t).toBe(false);
      expect(q.used).toBe(1);
    }
  });

  it('utan test i dag finns ett kvar; påbörjade räknas inte', async () => {
    const { klient: k } = klient([{ test_type: 'matrislogik', completed_at: null }]);
    const q = await checkGrundnivaQuota(k, 'u');
    expect(q.allowed).toBe(true);
    expect(q.used).toBe(0);
  });

  it('ett test i förrgår räknas inte', async () => {
    const forr = new Date(Date.now() - 2 * 86_400_000).toISOString();
    const { klient: k } = klient([{ test_type: 'talserier-grund', completed_at: forr }]);
    expect((await checkDailyTestQuota(k, 'u', 'spatial-grund')).allowed).toBe(true);
  });

  it('dag 0-grundpasset räknas in i dagens kvot', async () => {
    const { klient: k } = klient([{ test_type: 'matrislogik-pass', completed_at: nu }]);
    expect((await checkDailyTestQuota(k, 'u', 'deduktiv-grund')).allowed).toBe(false);
  });

  it('ett grundnivåtest i dag stoppar dag 0-grundpasset med kvot (429), inte betalvägg', () => {
    expect(beslutaTillgang({ ...bas, grundIdag: 1 })).toMatchObject({ tillatet: false, skal: 'kvot', anvant: 1, grans: 1 });
    expect(beslutaTillgang({ ...bas, grundIdag: 0 })).toMatchObject({ tillatet: true, variant: 'grund' });
  });

  it('utan grundIdag gäller passets egen regel som förut', () => {
    expect(beslutaTillgang(bas)).toMatchObject({ tillatet: true });
  });

  it('Premium är obegränsat', async () => {
    premium.varde = true;
    const { klient: k } = klient([
      { test_type: 'matrislogik', completed_at: nu },
      { test_type: 'spatial-grund', completed_at: nu },
    ]);
    expect((await checkDailyTestQuota(k, 'u', 'matrislogik')).allowed).toBe(true);
    expect((await checkGrundnivaQuota(k, 'u')).isPremium).toBe(true);
    expect(beslutaTillgang({ ...bas, harOvanGrund: true, grundIdag: 5 })).toMatchObject({ tillatet: true, variant: 'niva' });
  });

  it('avancerad, expert och proven räknas aldrig mot grundkvoten', async () => {
    expect(arGrundTestTyp('matrislogik-avancerad')).toBe(false);
    expect(arGrundTestTyp('spatial-expert')).toBe(false);
    const { klient: k, anrop } = klient([{ test_type: 'matrislogik', completed_at: nu }]);
    const q = await checkDailyTestQuota(k, 'u', 'matrislogik-prov');
    expect(q.allowed).toBe(true);
    expect(anrop).toEqual([{ eq: 'matrislogik-prov' }]);
  });
});
