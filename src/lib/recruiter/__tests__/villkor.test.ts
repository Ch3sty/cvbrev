import { beforeEach, describe, expect, it, vi } from 'vitest';

// Villkoren för rekryterare (ägarbeslut 2026-11-22): poolens rutter kräver
// godkända villkor, och tidpunkten sätts av servern.

let rad: Record<string, unknown> | null = null;
const uppdateringar: Record<string, unknown>[] = [];

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => undefined }) }));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'rek-1' } }, error: null }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: rad, error: null }) }) }),
    }),
  }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({
      update: (p: Record<string, unknown>) => ({
        eq: async () => {
          uppdateringar.push(p);
          return { error: null };
        },
      }),
    }),
  }),
}));

import { requireApprovedRecruiter } from '../auth';
import { VILLKOR_VERSION } from '../villkor';

beforeEach(() => {
  uppdateringar.length = 0;
});

describe('requireApprovedRecruiter', () => {
  it('godkänt konto utan villkor stoppas med villkor_saknas', async () => {
    rad = { user_id: 'rek-1', status: 'approved', villkor_godkanda_at: null, villkor_version: null };
    const gate = await requireApprovedRecruiter();
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.response.status).toBe(403);
      expect(await gate.response.json()).toEqual({ code: 'villkor_saknas', status: 'approved' });
    }
  });

  it('godkänt konto med villkor släpps in', async () => {
    rad = { user_id: 'rek-1', status: 'approved', villkor_godkanda_at: '2026-11-22T20:00:00Z', villkor_version: VILLKOR_VERSION };
    expect((await requireApprovedRecruiter()).ok).toBe(true);
  });

  it('väntande konto stoppas som förut', async () => {
    rad = { user_id: 'rek-1', status: 'pending', villkor_godkanda_at: '2026-11-22T20:00:00Z', villkor_version: VILLKOR_VERSION };
    const gate = await requireApprovedRecruiter();
    expect(gate.ok).toBe(false);
    if (!gate.ok) expect((await gate.response.json()).code).toBe('not_approved');
  });
});

describe('POST /api/recruiter/villkor', () => {
  async function godkann(version: unknown) {
    const { POST } = await import('@/app/api/recruiter/villkor/route');
    return POST(new Request('http://localhost/api/recruiter/villkor', { method: 'POST', body: JSON.stringify({ version }) }));
  }

  it('sparar tidpunkt och version på servern', async () => {
    rad = { user_id: 'rek-1', status: 'approved', villkor_godkanda_at: null, villkor_version: null };
    const res = await godkann(VILLKOR_VERSION);
    expect(res.status).toBe(200);
    expect(uppdateringar).toHaveLength(1);
    expect(uppdateringar[0]).toMatchObject({ villkor_version: VILLKOR_VERSION, villkor_godkanda_at: expect.any(String) });
  });

  it('fel version ger 409 och sparar inget', async () => {
    rad = { user_id: 'rek-1', status: 'approved', villkor_godkanda_at: null, villkor_version: null };
    expect((await godkann('2020-01-01')).status).toBe(409);
    expect(uppdateringar).toHaveLength(0);
  });

  it('ett redan gjort godkännande skrivs inte över', async () => {
    rad = { user_id: 'rek-1', status: 'approved', villkor_godkanda_at: '2026-11-22T20:00:00Z', villkor_version: VILLKOR_VERSION };
    expect((await godkann(VILLKOR_VERSION)).status).toBe(200);
    expect(uppdateringar).toHaveLength(0);
  });

  it('utan rekryterarrad: 404', async () => {
    rad = null;
    expect((await godkann(VILLKOR_VERSION)).status).toBe(404);
  });
});
