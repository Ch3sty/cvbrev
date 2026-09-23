/**
 * Läsning och anspråk på intervjuprovets rader
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 5).
 *
 * Delas av claim-rutten och dashboardsidan. Sidan gör samma anspråk som
 * rutten när raden är ohämtad: Google-registreringen går inte genom
 * claim-kedjan i register-form och landar därför direkt på sidan.
 *
 * Säkerheten är densamma i båda vägarna: token är ett slumpat uuid som bara
 * den som skrev svaret har sett, och en rad som redan hämtats av någon annan
 * lämnas aldrig ut.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { FragaId } from '@/components/artiklar/intervjuprov/fragor'
import type { Punkt } from './validering'

export interface IntervjuRad {
  token: string
  question: FragaId
  answer: string
  level: number
  summary: string
  works: string
  missing: string
  missing_kind: string
  full: { points?: Punkt[]; irrelevant?: boolean } | null
  improved_answer: string
  improved_why: string | null
  user_id: string | null
  claimed_by: string | null
  created_at: string
  expires_at: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function arToken(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v)
}

const KOLUMNER =
  'token, question, answer, level, summary, works, missing, missing_kind, full, improved_answer, improved_why, user_id, claimed_by, created_at, expires_at'

/**
 * Raden för den här användaren, med anspråk om den är ohämtad. Null när den
 * inte finns, har gått ut, är ett irrelevant försök eller tillhör någon annan.
 */
export async function hamtaEllerGorAnsprak(
  admin: SupabaseClient<any>,
  token: string,
  userId: string
): Promise<IntervjuRad | null> {
  if (!arToken(token)) return null

  const { data, error } = await admin
    .from('anon_interview_samples')
    .select(KOLUMNER)
    .eq('token', token)
    .maybeSingle()

  if (error || !data) return null
  const rad = data as unknown as IntervjuRad

  if (new Date(rad.expires_at).getTime() <= Date.now()) return null
  if (rad.full?.irrelevant) return null

  if (rad.claimed_by === userId) return rad
  if (rad.claimed_by) return null
  // Ett svar skrivet inloggat får bara hämtas av samma konto.
  if (rad.user_id && rad.user_id !== userId) return null

  // Villkorad uppdatering: två samtidiga anspråk kan inte båda vinna.
  const { data: uppdaterad, error: uppdateringsFel } = await admin
    .from('anon_interview_samples')
    .update({ claimed_by: userId })
    .eq('token', token)
    .is('claimed_by', null)
    .select('token')
    .maybeSingle()

  if (uppdateringsFel || !uppdaterad) return null
  return { ...rad, claimed_by: userId }
}

/**
 * Tar bort svar vars sju dygn gått ut, också de som hämtats till ett konto
 * (ägarens beslut 7: svaret sparas i sju dagar). Körs i cronens
 * midnattsslot, aldrig i ett eget cron-jobb. Returnerar antal borttagna.
 */
export async function cleanupExpiredIntervjuprov(admin: SupabaseClient<any>): Promise<number> {
  try {
    const { data, error } = await admin
      .from('anon_interview_samples')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('token')

    if (error) {
      console.error('[intervjuprov] Kunde inte rensa utgångna svar:', error)
      return 0
    }
    return (data as unknown[] | null)?.length ?? 0
  } catch (err) {
    console.error('[intervjuprov] Rensningen kraschade:', err)
    return 0
  }
}
