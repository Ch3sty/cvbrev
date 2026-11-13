// /api/app/anonym/overfor: bara en anonym användares Nivåkoll flyttas, och
// bara till ett riktigt konto som är inloggat.
import { beforeEach, describe, expect, it, vi } from 'vitest';

let inloggad: { id: string; is_anonymous?: boolean } | null;
let franToken: { id: string; is_anonymous?: boolean } | null;
const flyttar: Array<[string, string]> = [];

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [], set: () => {} }) }));
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: inloggad } }) } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => ({
    auth: { getUser: async () => (franToken ? { data: { user: franToken }, error: null } : { data: { user: null }, error: { message: 'ogiltig' } }) },
  }),
}));
vi.mock('@/lib/mobilapp/onboarding-overforing.server', () => ({
  overforAnonym: async (_a: unknown, anon: string, konto: string) => (flyttar.push([anon, konto]), { ok: true, flyttat: true }),
}));

import { POST } from '../overfor/route';

const TOKEN = 'x'.repeat(40);
const anrop = (kropp: unknown) =>
  POST(new Request('http://localhost/api/app/anonym/overfor', { method: 'POST', body: JSON.stringify(kropp), headers: { 'content-type': 'application/json' } }));

beforeEach(() => {
  inloggad = { id: 'konto-1', is_anonymous: false };
  franToken = { id: 'anon-1', is_anonymous: true };
  flyttar.length = 0;
});

describe('POST /api/app/anonym/overfor', () => {
  it('flyttar från den anonyma till kontot', async () => {
    const r = await anrop({ anonymToken: TOKEN });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ flyttat: true });
    expect(flyttar).toEqual([['anon-1', 'konto-1']]);
  });

  it('nekar en token som hör till ett riktigt konto', async () => {
    franToken = { id: 'annat-konto', is_anonymous: false };
    expect((await anrop({ anonymToken: TOKEN })).status).toBe(400);
    expect(flyttar).toEqual([]);
  });

  it('nekar en ogiltig eller saknad token', async () => {
    franToken = null;
    expect((await anrop({ anonymToken: TOKEN })).status).toBe(400);
    expect((await anrop({})).status).toBe(400);
    expect(flyttar).toEqual([]);
  });

  it('kräver inloggning och att anroparen inte själv är anonym', async () => {
    inloggad = null;
    expect((await anrop({ anonymToken: TOKEN })).status).toBe(401);
    inloggad = { id: 'anon-2', is_anonymous: true };
    expect((await anrop({ anonymToken: TOKEN })).status).toBe(403);
    expect(flyttar).toEqual([]);
  });
});
