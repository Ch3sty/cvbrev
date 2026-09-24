/**
 * Serverläsningar för tråden kring proven
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5).
 *
 * anon_interview_samples och anon_personality_samples har RLS utan
 * policies, så de läses med admin-klienten. Varje fråga filtrerar själv på
 * användarens claimed_by eller user_id: det är den enda kontrollen.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { arFragaId } from '@/components/artiklar/intervjuprov/fragor'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import type { ProvSammanfattning } from './nasta'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Användarens intervjuprov, nyast först. Irrelevanta försök (som bara finns
 * för att räkna kvoten) tas bort. Hämtade anonyma prov och prov skrivna
 * inloggad räknas båda.
 */
export async function hamtaProv(
  admin: SupabaseClient<any>,
  userId: string,
  antal = 20
): Promise<ProvSammanfattning[]> {
  if (!UUID.test(userId)) return []
  const { data, error } = await admin
    .from('anon_interview_samples')
    .select('token, question, level, missing_kind, created_at, irrelevant:full->>irrelevant')
    .or(`claimed_by.eq.${userId},user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(antal + 10)
  if (error || !data) {
    if (error) console.error('[intervju] Kunde inte läsa proven:', error.message)
    return []
  }
  return (data as Array<Record<string, unknown>>)
    .filter((r) => r.irrelevant !== 'true' && arFragaId(r.question))
    .slice(0, antal)
    .map((r) => ({
      token: String(r.token),
      question: r.question as ProvSammanfattning['question'],
      level: Number(r.level) || 1,
      missingKind: String(r.missing_kind ?? ''),
      createdAt: String(r.created_at),
    }))
}

export interface SmakprovSammanfattning {
  token: string
  scores: BigFiveScores
  createdAt: string
}

/** Det senaste hämtade personlighetsprovet, eller null. */
export async function hamtaSenasteSmakprov(
  admin: SupabaseClient<any>,
  userId: string
): Promise<SmakprovSammanfattning | null> {
  if (!UUID.test(userId)) return null
  const { data, error } = await admin
    .from('anon_personality_samples')
    .select('token, scores, created_at')
    .eq('claimed_by', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  const r = data as { token: string; scores: BigFiveScores; created_at: string }
  return { token: r.token, scores: r.scores, createdAt: r.created_at }
}

