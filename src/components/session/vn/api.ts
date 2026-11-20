// src/components/session/vn/api.ts
// =============================================================================
// Ramens väg till nivåtestens rutter i Ord och text och Siffror och tabeller
// (plan-testflode-2026-11-20 etapp 2). Inga rutter, tabellformat eller
// POST-kroppar ändras: kropparna byggs här av rena funktioner som
// kontrakttestet (__tests__/kontrakt.test.ts) låser mot det
// de raderade VerbalTestSession, VerbalExpertSession och NumericalTestSession skickade.
// =============================================================================

import type { VnNivatestInnehall, VnVisadUppgift } from '@/lib/tester/vn-nivatest'

/** POST-kropparna, ordagrant som de gamla vyerna. */
export const VN_KROPP = {
  /** Verbalt grund och avancerad: {sessionId, passageId, statementIndex, answer, timeSpent}. */
  verbalSvar: (sessionId: string, passageId: string, statementIndex: number, answer: string, timeSpent: number) => ({
    sessionId,
    passageId,
    statementIndex,
    answer,
    timeSpent,
  }),
  /** Verbalt expert och numeriskt: {sessionId, passageId, questionId, selectedAnswerId, timeSpent}. */
  fragaSvar: (sessionId: string, passageId: string, questionId: string, selectedAnswerId: string, timeSpent: number) => ({
    sessionId,
    passageId,
    questionId,
    selectedAnswerId,
    timeSpent,
  }),
  klar: (sessionId: string) => ({ sessionId }),
} as const

/** Kroppen för en uppgift och ett svarsvärde. */
export function vnSvarKropp(sessionId: string, u: Pick<VnVisadUppgift, 'del' | 'punkt' | 'form'>, varde: string, timeSpent: number) {
  return u.form === 'tre'
    ? VN_KROPP.verbalSvar(sessionId, u.del, Number(u.punkt), varde, timeSpent)
    : VN_KROPP.fragaSvar(sessionId, u.del, u.punkt, varde, timeSpent)
}

async function postJson(url: string, kropp: unknown): Promise<Response | null> {
  try {
    return await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kropp) })
  } catch {
    return null
  }
}

export type VnSvarsform = 'verbal' | 'expert' | 'numerisk'

/** Svarsformen per slug: hur complete-routen säger ja (som de gamla vyerna läste svaret). */
export function vnSvarsform(slug: string): VnSvarsform {
  if (slug === 'verbal-resonemang-expert') return 'expert'
  return slug.startsWith('verbal') ? 'verbal' : 'numerisk'
}

export function vnNivatestApi(p: { sessionId: string; answerEndpoint: string; completeEndpoint: string; sessionEndpoint: string; form: VnSvarsform }) {
  return {
    /** Reservvägen när servern inte kunde läsa raden: session-routen bär uppgifterna. */
    async hamta(): Promise<{ innehall: VnNivatestInnehall | null; sparade: unknown; startad: string | null; avslutad: boolean } | null> {
      try {
        const res = await fetch(`${p.sessionEndpoint}?id=${p.sessionId}`)
        if (!res.ok) return null
        const data = await res.json()
        const s = data?.session
        if (!s) return null
        const innehall = (data?.vn ?? null) as VnNivatestInnehall | null
        if (!s.completed_at && !innehall?.uppgifter?.length) return null
        return {
          innehall,
          sparade: s.answers,
          startad: typeof s.started_at === 'string' ? s.started_at : null,
          avslutad: Boolean(s.completed_at),
        }
      } catch {
        return null
      }
    },
    /** Sant när svaret sparades (eller inte går att spara om). */
    async svara(u: Pick<VnVisadUppgift, 'del' | 'punkt' | 'form'>, varde: string, timeSpent: number): Promise<boolean> {
      const res = await postJson(p.answerEndpoint, vnSvarKropp(p.sessionId, u, varde, timeSpent))
      if (!res) return false
      return res.ok || res.status === 400 || res.status === 404
    },
    async lamnaIn(): Promise<boolean> {
      const res = await postJson(p.completeEndpoint, VN_KROPP.klar(p.sessionId))
      if (!res || !res.ok) return false
      const data = await res.json().catch(() => null)
      if (!data) return false
      if (p.form === 'verbal') return Boolean(data.success || data.message)
      if (p.form === 'expert') return data.score !== undefined
      return !data.error
    },
  }
}
