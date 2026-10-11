// src/lib/traning/klient.ts
// =============================================================================
// Klientens väg till testmotorn (våg 3b): typerna motorn skickar och ett
// litet API-lager över /api/traning. Passflödet tar API:t som prop, så att
// förhandsvisningen för utvecklare kan köra samma komponent mot fixturer
// utan databas (spec-rummen 6 våg 3b, migreringarna är inte körda i prod).
//
// Bara typer importeras från motor.server.ts: ingen bank och inget facit
// följer med till klienten.
// =============================================================================

import type { Aterkoppling, Avslut, BesvaradFraga, Sessionsvy, Traningsstatus } from './motor.server';
import type { VisadFraga } from '@/lib/logicTestV7/layered.v7';
import type { Begard } from './tillgang';

export type { Aterkoppling, Avslut, BesvaradFraga, Sessionsvy, Traningsstatus, VisadFraga, Begard };

export type Fel = { ok: false; status: number; fel: string; feature?: string | null };

export type SkapaSvar = { ok: true; session: Sessionsvy } | Fel;

export interface SvarIn {
  sessionId: string;
  questionId: string;
  /** Visat index. Null tillsammans med vetInte eller tidenUte. */
  selectedIndex: number | null;
  vetInte?: boolean;
  tidenUte?: boolean;
  timeSpent: number;
}

export type SvarSvar =
  | {
      ok: true;
      aterkoppling: Aterkoppling | null;
      nasta: VisadFraga | null;
      besvarade: number;
      antal: number;
      klar: boolean;
    }
  | Fel;

export type AvslutSvar = { ok: true; avslut: Avslut } | Fel;

export interface PassApi {
  skapa(begard: Begard, opt?: { family?: string | null; format?: string | null }): Promise<SkapaSvar>;
  svara(inp: SvarIn): Promise<SvarSvar>;
  slutfor(sessionId: string): Promise<AvslutSvar>;
  /** Sessionen i klientens form, med genomgången när den är avslutad. */
  session(sessionId: string): Promise<Sessionsvy | null>;
  /** Läget för resultatet: planen, serien, punkterna. Null när det inte gick. */
  status(): Promise<Traningsstatus | null>;
}

/** Status 0 betyder att anropet aldrig kom fram (nätverksfel). */
async function post<T>(url: string, kropp: unknown): Promise<{ ok: true; data: T } | Fel> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kropp),
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        fel: typeof data?.error === 'string' ? data.error : 'fel',
        feature: typeof data?.feature === 'string' ? data.feature : null,
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, fel: 'natverk' };
  }
}

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** API:t mot /api/traning, för produktionen. */
export const fetchPassApi: PassApi = {
  async skapa(begard, opt) {
    const r = await post<{ session: Sessionsvy }>('/api/traning/pass/session', {
      typ: begard,
      ...(opt?.family ? { family: opt.family } : {}),
      ...(opt?.format ? { format: opt.format } : {}),
    });
    return r.ok ? { ok: true, session: r.data.session } : r;
  },
  async svara(inp) {
    const r = await post<Omit<Extract<SvarSvar, { ok: true }>, 'ok'>>('/api/traning/pass/svar', inp);
    return r.ok ? { ok: true, ...r.data } : r;
  },
  async slutfor(sessionId) {
    const r = await post<Avslut>('/api/traning/pass/complete', { sessionId });
    return r.ok ? { ok: true, avslut: r.data } : r;
  },
  async session(sessionId) {
    const r = await get<{ session: Sessionsvy }>(`/api/traning/pass/session?id=${encodeURIComponent(sessionId)}`);
    return r?.session ?? null;
  },
  async status() {
    return get<Traningsstatus>('/api/traning/status');
  },
};

/** Adresserna bor i rutter.ts, en källa för hemvyn och passflödet. */
export { passHref, sessionHref, UPPVARMNING_HREF, kvittoHref, TRANING_HREF, KURVAN_HREF } from './rutter';
