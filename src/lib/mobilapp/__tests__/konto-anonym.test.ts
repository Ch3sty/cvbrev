// Appens kontoskapande (components/mobilapp/inloggning/konto.ts) med och
// utan anonym session. Den anonyma användaren blir själv kontot med e-post
// (/api/konto/byt-epost, sedan updateUser med lösenordet); utan anonym session
// signUp som webben.
// Vid inloggning på ett befintligt konto flyttas Nivåkollen med den anonyma
// sessionens token.
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Session = { access_token: string; user: { id: string; is_anonymous: boolean } } | null;
let session: Session;
let anonymTillaten: boolean;
const anrop: string[] = [];
const fetchar: Array<{ url: string; kropp: unknown }> = [];

const auth = {
  getSession: async () => ({ data: { session } }),
  signInAnonymously: async () => {
    anrop.push('signInAnonymously');
    if (!anonymTillaten) return { data: { session: null }, error: { message: 'Anonymous sign-ins are disabled' } };
    session = { access_token: 'anon-token', user: { id: 'anon-1', is_anonymous: true } };
    return { data: { session }, error: null };
  },
  updateUser: async (a: { email?: string; password?: string }) => {
    anrop.push(a.email ? 'updateUser:email' : 'updateUser:password');
    return { data: { user: { id: 'anon-1' } }, error: null };
  },
  signUp: async () => (anrop.push('signUp'), { data: { user: { id: 'nytt-1', identities: [{ provider: 'email' }] } }, error: null }),
  signInWithPassword: async () => {
    anrop.push('signInWithPassword');
    session = { access_token: 'konto-token', user: { id: 'konto-1', is_anonymous: false } };
    return { data: { user: { id: 'konto-1' } }, error: null };
  },
};

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth }) }));
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: async () => {} }));
vi.mock('@/lib/analytics/events', () => ({ capture: () => {}, identifyUser: () => {} }));
vi.mock('@/components/mobilapp/skal-inloggning', () => ({ loggaInMedGoogle: async () => ({ ok: false, avbrutet: true, fel: '' }) }));

import { loggaInEpost, skapaKontoEpost, startaAnonym } from '@/components/mobilapp/inloggning/konto';

beforeEach(() => {
  session = null;
  anonymTillaten = true;
  anrop.length = 0;
  fetchar.length = 0;
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    fetchar.push({ url, kropp: init?.body ? JSON.parse(String(init.body)) : null });
    return new Response('{}', { status: 200 });
  });
});

describe('Nivåkollen före kontot', () => {
  it('startar en anonym session när ingen finns', async () => {
    expect(await startaAnonym()).toBe(true);
    expect(session?.user.is_anonymous).toBe(true);
  });

  it('ger falskt när anonym inloggning är avstängd (reserven: kontot först)', async () => {
    anonymTillaten = false;
    expect(await startaAnonym()).toBe(false);
  });

  it('en anonym session blir själv kontot: e-post via rutten, sedan lösenord, ingen signUp', async () => {
    await startaAnonym();
    anrop.length = 0;
    const r = await skapaKontoEpost('ny@exempel.se', 'langtlosen');
    expect(r).toEqual({ ok: true, nytt: true });
    // E-posten via rutten (Supabase skickar inga mejl), före lösenordet.
    expect(anrop).toEqual(['updateUser:password']);
    expect(fetchar[0]).toEqual({ url: '/api/konto/byt-epost', kropp: { email: 'ny@exempel.se' } });
    expect(fetchar.map((f) => f.url)).toContain('/api/app/anonym/nytt-konto');
    expect(fetchar.some((f) => f.url === '/api/app/anonym/overfor')).toBe(false);
  });

  it('en upptagen adress ger samma fel som förut och inget lösenord sätts', async () => {
    await startaAnonym();
    anrop.length = 0;
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: 'email_exists' }), { status: 409 }));
    const r = await skapaKontoEpost('finns@exempel.se', 'langtlosen');
    expect(r).toMatchObject({ ok: false, falt: 'epost', finns: true });
    expect(anrop).toEqual([]);
  });

  it('utan anonym session skapas kontot med signUp som på webben', async () => {
    const r = await skapaKontoEpost('ny@exempel.se', 'langtlosen');
    expect(r.ok).toBe(true);
    expect(anrop).toEqual(['signUp']);
  });

  it('inloggning på ett befintligt konto flyttar den anonyma Nivåkollen med dess token', async () => {
    await startaAnonym();
    const r = await loggaInEpost('finns@exempel.se', 'hemligt');
    expect(r).toEqual({ ok: true, nytt: false });
    expect(fetchar).toContainEqual({ url: '/api/app/anonym/overfor', kropp: { anonymToken: 'anon-token' } });
  });

  it('inloggning utan anonym session flyttar ingenting', async () => {
    await loggaInEpost('finns@exempel.se', 'hemligt');
    expect(fetchar.some((f) => f.url === '/api/app/anonym/overfor')).toBe(false);
  });

  it('för kort lösenord stoppas före Supabase', async () => {
    const r = await skapaKontoEpost('ny@exempel.se', 'kort');
    expect(r).toMatchObject({ ok: false, falt: 'losen' });
    expect(anrop).toEqual([]);
  });
});
