/**
 * Anonym testsession för /verktyg/rekryteringstester/prova
 * (docs/plan-konvertering.md, C9).
 *
 * Återanvänder det befintliga V7-urvalet, så frågorna är exakt samma som i
 * det inloggade grundtestet. Vi lagrar aldrig facit eller förklaringar i
 * klienten: rättningen sker på servern och de låsta delarna lämnar den inte
 * förrän någon registrerat sig.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { selectQuestionsForSession } from '@/lib/logicTestV7/selectQuestions.v7'
import type { LayeredCell, LayeredQuestion } from '@/lib/logicTestV7/layered.v7'

/** Fem frågor i provet, enligt planen. */
export const ANON_QUESTION_COUNT = 5

/** Frågan så som den får se ut i klienten: utan correctAnswer. */
export interface PublicQuestion {
  id: string
  title: string
  rule: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

/** Plockar bort facit innan frågan skickas till webbläsaren. */
export function toPublicQuestion(q: LayeredQuestion): PublicQuestion {
  return {
    id: q.id,
    title: q.title,
    rule: q.rule,
    grid: q.grid,
    options: q.options,
  }
}

/** Fem frågor ur grundpoolen, seedade på sessionstoken. */
export function questionsForToken(token: string): LayeredQuestion[] {
  return selectQuestionsForSession(token, ANON_QUESTION_COUNT)
}

/**
 * Grov percentil utifrån antal rätt av fem. Medvetet trubbig: det är en
 * indikation, inte en normerad poäng. Den riktiga normjämförelsen ligger
 * bakom registreringen.
 */
export function roughPercentile(score: number, total: number): number {
  const ratio = total > 0 ? score / total : 0
  if (ratio >= 1) return 90
  if (ratio >= 0.8) return 75
  if (ratio >= 0.6) return 55
  if (ratio >= 0.4) return 35
  if (ratio >= 0.2) return 20
  return 10
}

export interface AnonSessionRow {
  token: string
  questions: unknown
  answers: number[] | null
  score: number | null
  expires_at: string
}

/** Hämtar en session om den finns och inte gått ut. */
export async function getAnonSession(
  admin: SupabaseClient<any>,
  token: string
): Promise<AnonSessionRow | null> {
  const { data, error } = await admin
    .from('anon_test_sessions')
    .select('token, questions, answers, score, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (error || !data) return null

  const row = data as unknown as AnonSessionRow
  if (new Date(row.expires_at).getTime() < Date.now()) return null

  return row
}

/** Städar bort utgångna sessioner. Spår D kan haka in den i cronen. */
export async function cleanupExpiredAnonSessions(
  admin: SupabaseClient<any>
): Promise<number> {
  try {
    const { data, error } = await admin
      .from('anon_test_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('token')

    if (error) {
      console.error('[anon-session] Kunde inte rensa utgångna sessioner:', error)
      return 0
    }
    return (data as unknown[] | null)?.length ?? 0
  } catch (err) {
    console.error('[anon-session] Rensning kraschade:', err)
    return 0
  }
}
