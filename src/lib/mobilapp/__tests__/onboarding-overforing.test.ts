// Nivåkollen före kontot: flytten från den anonyma användaren till kontot
// (onboarding-overforing.server.ts) mot en liten databas i minnet.
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { overforAnonym } from '../onboarding-overforing.server';

type Rad = Record<string, unknown> & { user_id: string };
let db: Record<string, Rad[]>;
let raderade: string[];

/** Det urval av Supabase-klientens kedja som overforAnonym använder. */
function fakeKlient() {
  const fran = (tabell: string) => {
    const filter: ((r: Rad) => boolean)[] = [];
    let andring: Record<string, unknown> | null = null;
    const rader = () => (db[tabell] ?? []).filter((r) => filter.every((f) => f(r)));
    const kor = () => {
      if (andring) {
        for (const r of rader()) Object.assign(r, andring);
        return { data: null, error: null };
      }
      return { data: rader(), error: null };
    };
    const q = {
      select: () => q,
      update: (a: Record<string, unknown>) => ((andring = a), q),
      eq: (k: string, v: unknown) => (filter.push((r) => r[k] === v), q),
      in: (k: string, v: unknown[]) => (filter.push((r) => v.includes(r[k])), q),
      limit: () => q,
      maybeSingle: async () => ({ data: rader()[0] ?? null, error: null }),
      then: (ok: (v: unknown) => unknown, nej?: (e: unknown) => unknown) => Promise.resolve(kor()).then(ok, nej),
    };
    return q;
  };
  return {
    from: fran,
    auth: { admin: { deleteUser: async (id: string) => (raderade.push(id), { error: null }) } },
  } as never;
}

const ANON = 'anon-1';
const KONTO = 'konto-1';

beforeEach(() => {
  raderade = [];
  db = {
    logic_test_v4_sessions: [{ user_id: ANON, id: 's1' }],
    test_nivapunkter: [{ user_id: ANON, niva: 6 }],
    test_milstolpar: [
      { user_id: ANON, nyckel: 'forsta_matning' },
      { user_id: ANON, nyckel: 'dubbel' },
    ],
    test_planer: [{ user_id: ANON, mitt_test: 'iprov' }],
  };
});

describe('overforAnonym', () => {
  it('flyttar Nivåkollen, märkena och planen till ett nytt konto och raderar den anonyma', async () => {
    const r = await overforAnonym(fakeKlient(), ANON, KONTO);
    expect(r).toEqual({ ok: true, flyttat: true });
    expect(db.logic_test_v4_sessions[0].user_id).toBe(KONTO);
    expect(db.test_nivapunkter[0].user_id).toBe(KONTO);
    expect(db.test_milstolpar.every((m) => m.user_id === KONTO)).toBe(true);
    expect(db.test_planer[0].user_id).toBe(KONTO);
    expect(raderade).toEqual([ANON]);
  });

  it('ett konto med egen nivå och plan behåller dem; den anonyma Nivåkollen räknas inte in', async () => {
    db.test_nivapunkter.push({ user_id: KONTO, niva: 4 });
    db.test_planer.push({ user_id: KONTO, mitt_test: 'matrigma' });
    const r = await overforAnonym(fakeKlient(), ANON, KONTO);
    expect(r).toEqual({ ok: true, flyttat: false });
    expect(db.logic_test_v4_sessions[0].user_id).toBe(ANON);
    expect(db.test_nivapunkter.filter((p) => p.user_id === KONTO)).toHaveLength(1);
    expect(db.test_planer.find((p) => p.user_id === KONTO)?.mitt_test).toBe('matrigma');
    expect(raderade).toEqual([ANON]);
  });

  it('märken som kontot redan har följer inte med (nyckeln är unik per användare)', async () => {
    db.test_milstolpar.push({ user_id: KONTO, nyckel: 'dubbel' });
    await overforAnonym(fakeKlient(), ANON, KONTO);
    expect(db.test_milstolpar.filter((m) => m.user_id === KONTO).map((m) => m.nyckel).sort()).toEqual(['dubbel', 'forsta_matning']);
    expect(db.test_milstolpar.filter((m) => m.user_id === ANON).map((m) => m.nyckel)).toEqual(['dubbel']);
  });

  it('samma användare (anonym som blev kontot med e-post) gör ingenting', async () => {
    const r = await overforAnonym(fakeKlient(), ANON, ANON);
    expect(r).toEqual({ ok: true, flyttat: false });
    expect(raderade).toEqual([]);
    expect(db.test_planer[0].user_id).toBe(ANON);
  });
});
