import { describe, expect, it } from 'vitest';
import { createSupabaseMock, type ChainCall } from '@/lib/candidate/__tests__/supabaseMock';
import { createPercentileContext } from '../candidateData';

// Rekryterarvyns percentil följer samma underlag som percentile-routen och
// Bli upptäckt (spec-rummen 12.4, 15).
function kontext() {
  const kedjor: ChainCall[][] = [];
  const { client } = createSupabaseMock({
    logic_test_v4_sessions: (chain) => {
      kedjor.push(chain);
      return chain.some((c) => c.method === 'lt') ? { count: 150 } : { count: 200 };
    },
  });
  return { ctx: createPercentileContext(client), kedjor };
}

const harFilter = (chain: ChainCall[], method: string, kolumn: string, varde: unknown) =>
  chain.some((c) => c.method === method && c.args[0] === kolumn && c.args[1] === varde);

describe('rekryterarvyns percentilkontext', () => {
  it('oblandad matrissession: ingen percentil och ingen fråga mot databasen', async () => {
    const { ctx, kedjor } = kontext();
    expect(await ctx.getStats('matrislogik-expert', 93, null)).toEqual({ percentile: null, sampleSize: 0 });
    expect(kedjor).toHaveLength(0);
  });

  it('blandad matrissession jämförs per bankversion, med var sin cache', async () => {
    const { ctx, kedjor } = kontext();
    expect(await ctx.getStats('matrislogik', 90, { alternativ_blandade: true, bank_version: 2 })).toEqual({
      percentile: 75,
      sampleSize: 200,
    });
    expect(kedjor.every((k) => harFilter(k, 'eq', 'meta->>alternativ_blandade', 'true'))).toBe(true);
    expect(kedjor.every((k) => harFilter(k, 'eq', 'meta->>bank_version', '2'))).toBe(true);

    const fore = kedjor.length;
    await ctx.getStats('matrislogik', 90, { alternativ_blandade: true });
    const nya = kedjor.slice(fore);
    expect(nya).toHaveLength(2);
    expect(nya.every((k) => harFilter(k, 'is', 'meta->>bank_version', null))).toBe(true);
  });

  it('verbalt: underlaget utan meta-filter', async () => {
    const { ctx, kedjor } = kontext();
    expect((await ctx.getStats('verbal-resonemang', 80)).percentile).toBe(75);
    expect(kedjor.some((k) => k.some((c) => String(c.args[0]).startsWith('meta')))).toBe(false);
  });
});
