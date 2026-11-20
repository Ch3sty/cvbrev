'use client'

// src/components/session/handelser.ts
// =============================================================================
// Ramens händelser (plan-testflode-2026-11-20 avsnitt 8.2). Skjuts av ramen
// och lägesflödena en gång, aldrig av typerna. Går genom analytics-klientens
// kö (capture), så att inget faller bort före PostHog-init. De gamla
// namnen (pass_startat, nivamatning_startad, vet_inte_tryckt, betalvagg_visad
// och så vidare) skjuts oförändrade där de skjuts i dag.
// =============================================================================

import { capture, type SessionHandelseBas } from '@/lib/analytics/events'

export type { SessionHandelseBas }

export const sessionHandelser = {
  startVisad(bas: SessionHandelseBas, p: { fortsatt_tillganglig: boolean; sparrad: 'none' | 'quota' | 'premium' }) {
    capture('test_start_viewed', { ...bas, ...p })
  },
  startad(bas: SessionHandelseBas, p: { session_id: string; antal: number; tid_budget_s: number | null; resumed: boolean }) {
    capture('test_session_started', { ...bas, ...p })
  },
  besvarad(
    bas: SessionHandelseBas,
    p: { session_id: string; index: number; elapsed_ms: number; via: 'tap' | 'keyboard'; vet_inte: boolean; ratt?: boolean }
  ) {
    // Aldrig ratt i mätlägen: facit finns inte i klienten (avsnitt 8.2).
    const { ratt, ...rest } = p
    capture('test_question_answered', bas.lage === 'trana' && typeof ratt === 'boolean' ? { ...bas, ...rest, ratt } : { ...bas, ...rest })
  },
  avbruten(bas: SessionHandelseBas, p: { session_id: string; index: number; besvarade: number; elapsed_ms: number }) {
    capture('test_session_abandoned', { ...bas, ...p })
  },
  klar(bas: SessionHandelseBas, p: { session_id: string; besvarade: number; elapsed_ms: number; over_tid: boolean }) {
    capture('test_session_completed', { ...bas, ...p })
  },
  lamnaInSparrad(bas: SessionHandelseBas, p: { session_id: string; obesvarade: number }) {
    capture('test_submit_blocked', { ...bas, ...p })
  },
  installningAndrad(p: { forklaring_efter_svar: boolean }) {
    capture('traning_installning_andrad', p)
  },
}
