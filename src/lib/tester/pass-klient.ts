// src/lib/tester/pass-klient.ts
// =============================================================================
// Klientens väg till text- och sifferpassen (/api/traning/vnpass). API:t är
// en prop i VnPassFlode, så att testerna kan köra flödet mot fixturer.
// =============================================================================

import type { VnAterkoppling, VnKind, VnPassVy } from './pass-typer';

export type VnFel = { ok: false; status: number; fel: string };

export interface VnPassApi {
  skapa(kind: VnKind, familj?: string | null): Promise<{ ok: true; session: VnPassVy } | VnFel>;
  svara(inp: { sessionId: string; nyckel: string; svar: string; tid: number }): Promise<
    { ok: true; nyckel: string; aterkoppling: VnAterkoppling; besvarade: number; antal: number; klar: boolean } | VnFel
  >;
  slutfor(sessionId: string): Promise<{ ok: true; session: VnPassVy } | VnFel>;
  session(sessionId: string): Promise<VnPassVy | null>;
}

async function post<T>(url: string, kropp: unknown): Promise<({ ok: true } & T) | VnFel> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kropp) });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) return { ok: false, status: res.status, fel: typeof data?.error === 'string' ? data.error : 'fel' };
    return { ok: true, ...(data as T) };
  } catch {
    return { ok: false, status: 0, fel: 'natverk' };
  }
}

export const fetchVnPassApi: VnPassApi = {
  skapa: (kind, familj) => post('/api/traning/vnpass/session', { kind, ...(familj ? { familj } : {}) }),
  svara: (inp) => post('/api/traning/vnpass/svar', inp),
  slutfor: (sessionId) => post('/api/traning/vnpass/slutfor', { sessionId }),
  async session(sessionId) {
    try {
      const res = await fetch(`/api/traning/vnpass/session?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return ((await res.json()) as { session: VnPassVy }).session ?? null;
    } catch {
      return null;
    }
  },
};

/* ------------------------------- Figurpasset ------------------------------- */
// Beställning omgång 3, A3: /api/traning/figurpass. Prop i FigurPassFlode.

import type { FigurAterkoppling, FigurPassVy } from './pass-figur';

export interface FigurPassApi {
  skapa(): Promise<{ ok: true; session: FigurPassVy } | VnFel>;
  svara(inp: { sessionId: string; nyckel: string; visat: number | null; tid: number }): Promise<
    { ok: true; nyckel: string; aterkoppling: FigurAterkoppling; besvarade: number; antal: number; klar: boolean } | VnFel
  >;
  slutfor(sessionId: string): Promise<{ ok: true; session: FigurPassVy } | VnFel>;
  session(sessionId: string): Promise<FigurPassVy | null>;
}

export const fetchFigurPassApi: FigurPassApi = {
  skapa: () => post('/api/traning/figurpass/session', {}),
  svara: (inp) => post('/api/traning/figurpass/svar', inp),
  slutfor: (sessionId) => post('/api/traning/figurpass/slutfor', { sessionId }),
  async session(sessionId) {
    try {
      const res = await fetch(`/api/traning/figurpass/session?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return ((await res.json()) as { session: FigurPassVy }).session ?? null;
    } catch {
      return null;
    }
  },
};

/* ------------------------------ Deduktivpasset ----------------------------- */
// Testplanen steg 1: /api/traning/deduktivpass. Prop i DeduktivPassFlode.

import type { DeduktivAterkoppling, DeduktivPassVy } from './pass-deduktiv';

export interface DeduktivPassApi {
  skapa(): Promise<{ ok: true; session: DeduktivPassVy } | VnFel>;
  svara(inp: { sessionId: string; nyckel: string; visat: number | null; tid: number }): Promise<
    { ok: true; nyckel: string; aterkoppling: DeduktivAterkoppling; besvarade: number; antal: number; klar: boolean } | VnFel
  >;
  slutfor(sessionId: string): Promise<{ ok: true; session: DeduktivPassVy } | VnFel>;
  session(sessionId: string): Promise<DeduktivPassVy | null>;
}

export const fetchDeduktivPassApi: DeduktivPassApi = {
  skapa: () => post('/api/traning/deduktivpass/session', {}),
  svara: (inp) => post('/api/traning/deduktivpass/svar', inp),
  slutfor: (sessionId) => post('/api/traning/deduktivpass/slutfor', { sessionId }),
  async session(sessionId) {
    try {
      const res = await fetch(`/api/traning/deduktivpass/session?id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return ((await res.json()) as { session: DeduktivPassVy }).session ?? null;
    } catch {
      return null;
    }
  },
};

/* -------------------------------- Nivåkollen ------------------------------- */
// Testplanen steg 1: /api/traning/nivakoll för figurserier, deduktivt,
// verbalt och numeriskt. Prop i NivakollFlode.

import type { NivakollVy } from '@/lib/nivakoll/typer';
import type { NivakollKind } from '@/lib/nivakoll/niva';

export interface NivakollApi {
  skapa(kind: NivakollKind): Promise<{ ok: true; session: NivakollVy } | VnFel>;
  svara(inp: { sessionId: string; nyckel: string; svar: string | null; tid: number }): Promise<{ ok: true; besvarade: number; antal: number; klar: boolean } | VnFel>;
  slutfor(sessionId: string): Promise<{ ok: true; session: NivakollVy } | VnFel>;
}

export const fetchNivakollApi: NivakollApi = {
  skapa: (kind) => post('/api/traning/nivakoll/session', { kind }),
  svara: (inp) => post('/api/traning/nivakoll/svar', inp),
  slutfor: (sessionId) => post('/api/traning/nivakoll/slutfor', { sessionId }),
};
