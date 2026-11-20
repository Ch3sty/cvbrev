// src/components/session/figurserie/api.ts
// =============================================================================
// Ramens väg till figurseriernas rutter. Inga rutter, tabellformat eller
// POST-kroppar ändras i etapp 1 (plan-testflode-2026-11-20 avsnitt 1,
// Sparande): kropparna byggs här av rena funktioner som kontrakttestet
// (__tests__/kontrakt.test.ts) låser mot det de gamla vyerna skickade.
// Nivåkollen och Träna går genom pass-klient.ts som förut.
// =============================================================================

import type { SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData'
import type { VisadSerie } from '@/lib/figurserierV1/types'

/** POST-kropparna, ordagrant som FigurserieTestSession, OvningsprovFlode och Startark. */
export const KROPP = {
  nivatestSvar: (sessionId: string, questionId: string, selectedIndex: number, timeSpent: number) => ({
    sessionId,
    questionId,
    selectedIndex,
    timeSpent,
  }),
  nivatestKlar: (sessionId: string) => ({ sessionId }),
  ovningsprovStart: (typ: string) => ({ typ, fran: 'hubb' }),
  ovningsprovSvar: (sessionId: string, nyckel: string, svar: string, tid: number) => ({ sessionId, nyckel, svar, tid }),
  ovningsprovKlar: (sessionId: string) => ({ sessionId }),
} as const

async function postJson(url: string, kropp: unknown): Promise<Response | null> {
  try {
    return await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kropp) })
  } catch {
    return null
  }
}

export function figurserieNivatestApi(p: { sessionId: string; answerEndpoint: string; completeEndpoint: string; sessionEndpoint: string }) {
  return {
    /** Reservvägen när servern inte kunde läsa raden (som förut). */
    async hamta(): Promise<{ fragor: VisadSerie[]; sparade: SavedAnswer[]; startad: string | null; avslutad: boolean } | null> {
      try {
        const res = await fetch(`${p.sessionEndpoint}?id=${p.sessionId}`)
        if (!res.ok) return null
        const data = await res.json()
        const s = data?.session
        if (!s) return null
        const fragor: VisadSerie[] = Array.isArray(data?.fragor) ? data.fragor : []
        if (!s.completed_at && fragor.length === 0) return null
        return {
          fragor,
          sparade: Array.isArray(s.answers) ? s.answers : [],
          startad: typeof s.started_at === 'string' ? s.started_at : null,
          avslutad: Boolean(s.completed_at),
        }
      } catch {
        return null
      }
    },
    /** Sant när svaret sparades (eller inte går att spara om: sessionen är redan rättad). */
    async svara(questionId: string, selectedIndex: number, timeSpent: number): Promise<boolean> {
      const res = await postJson(p.answerEndpoint, KROPP.nivatestSvar(p.sessionId, questionId, selectedIndex, timeSpent))
      if (!res) return false
      return res.ok || res.status === 400 || res.status === 404
    },
    async lamnaIn(): Promise<boolean> {
      const res = await postJson(p.completeEndpoint, KROPP.nivatestKlar(p.sessionId))
      if (!res || !res.ok) return false
      const data = await res.json().catch(() => null)
      return Boolean(data && (data.success || data.message))
    },
  }
}

export const ovningsprovApi = {
  async starta(typ: string): Promise<{ ok: true; id: string } | { ok: false; status: number }> {
    const res = await postJson('/api/traning/ovningsprov/session', KROPP.ovningsprovStart(typ))
    if (!res) return { ok: false, status: 0 }
    const data = await res.json().catch(() => null)
    if (res.ok && data?.session?.id) return { ok: true, id: String(data.session.id) }
    return { ok: false, status: res.status }
  },
  /** Sant när servern tog emot svaret; 409 och 410 räknas som tagna (som förut). */
  async svara(sessionId: string, nyckel: string, svar: string, tid: number): Promise<boolean> {
    const res = await postJson('/api/traning/ovningsprov/svar', KROPP.ovningsprovSvar(sessionId, nyckel, svar, tid))
    if (!res) return false
    return res.ok || res.status === 410 || res.status === 409
  },
  async lamnaIn<T>(sessionId: string): Promise<T | null> {
    const res = await postJson('/api/traning/ovningsprov/slutfor', KROPP.ovningsprovKlar(sessionId))
    if (!res) return null
    const data = await res.json().catch(() => null)
    return res.ok && data?.session ? (data.session as T) : null
  },
}
