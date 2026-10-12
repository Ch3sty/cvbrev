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
