// src/components/session/matris/api.ts
// =============================================================================
// Ramens väg till matrisens testmotor (/api/traning/pass), för Nivåkollen,
// Träna, det riktade träningspasset och logikens övningsprov
// (plan-testflode-2026-11-20 etapp 3). Inga rutter, tabellformat eller
// POST-kroppar ändras: allt går genom PassApi (src/lib/traning/klient.ts)
// som förut, och svarets kropp byggs här ordagrant som det raderade PassFlode byggde den.
// Kontrakttestet (__tests__/kontrakt.test.ts) låser kropparna.
// =============================================================================

import type { Avslut, PassApi, Sessionsvy, SvarIn, Traningsstatus } from '@/lib/traning/klient'

/** Matrisens session i ramen: motorns vy, och efter avslutet resultatet och statusen. */
export interface MatrisVy {
  vy: Sessionsvy
  avslut: Avslut | null
  status: Traningsstatus | null
}

/** Svarets kropp, ordagrant som det raderade PassFlode: vet inte och tiden ute alltid med. */
export function svarKropp(p: { sessionId: string; questionId: string; valt: number | null; vetInte?: boolean; tidenUte?: boolean; tid: number }): SvarIn {
  return {
    sessionId: p.sessionId,
    questionId: p.questionId,
    selectedIndex: p.valt,
    vetInte: p.vetInte === true,
    tidenUte: p.tidenUte === true,
    timeSpent: p.tid,
  }
}

/** Avslutar och läser vyn och statusen, som det raderade PassFlode (resultatets underlag). */
export async function slutforMatris(api: PassApi, sessionId: string, reserv: Sessionsvy | null): Promise<{ ok: true; vy: MatrisVy } | { ok: false; status: number }> {
  const r = await api.slutfor(sessionId)
  if (!r.ok) {
    if (r.status === 409) {
      // Redan avslutad (dubbeltryck, annan flik): genomgången.
      const ny = await api.session(sessionId)
      if (ny) return { ok: true, vy: { vy: ny, avslut: null, status: null } }
    }
    return { ok: false, status: r.status }
  }
  const [vyEfter, status] = await Promise.all([api.session(sessionId), api.status()])
  const vy = vyEfter ?? reserv
  if (!vy) return { ok: false, status: 0 }
  return { ok: true, vy: { vy: { ...vy, avslutad: true }, avslut: r.avslut, status } }
}

/** Startar en ny session eller öppnar den påbörjade (Fortsätt på startskärmen). */
export async function skapaMatris(
  api: PassApi,
  begard: 'matning' | 'pass' | 'riktat' | 'general',
  opt: { family?: string | null; format?: string | null; pagaende?: string | null }
): Promise<{ ok: true; vy: MatrisVy; ny: boolean } | { ok: false; status: number }> {
  if (opt.pagaende) {
    const s = await api.session(opt.pagaende)
    if (s && !s.avslutad) return { ok: true, vy: { vy: s, avslut: null, status: null }, ny: false }
  }
  const r = await api.skapa(begard, { family: opt.family ?? null, format: opt.format ?? null })
  if (!r.ok) return { ok: false, status: r.status }
  return { ok: true, vy: { vy: r.session, avslut: null, status: null }, ny: true }
}
