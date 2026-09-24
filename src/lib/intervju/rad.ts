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
  /** Null när raden är hämtad till ett konto: då är den permanent (beslut 2, 2026-09-24). */
  expires_at: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function arToken(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v)
}

type Tillgangsrad = Pick<IntervjuRad, 'user_id' | 'claimed_by' | 'expires_at' | 'full'>

/**
 * Får den här användaren se raden (eller göra anspråk på den)? Ren funktion,
 * delas av sidan och proxyns 404-kontroll så att båda säger samma sak.
 */
export function arTillganglig(rad: Tillgangsrad, userId: string, nu: number = Date.now()): boolean {
  if (rad.expires_at !== null && new Date(rad.expires_at).getTime() <= nu) return false
  if (rad.full?.irrelevant) return false
  if (rad.claimed_by) return rad.claimed_by === userId
  // Ett svar skrivet inloggat får bara hämtas av samma konto.
  return !rad.user_id || rad.user_id === userId
}

/**
 * Proxyns kontroll för /dashboard/intervju/[token]: finns ett svar som den
 * här användaren får se? Dashboarden strömmar (dashboard/loading.tsx), så
 * notFound() i sidan kommer efter att status 200 redan skickats. Proxyn
 * svarar därför 404 innan renderingen börjar.
 */
export async function intervjuSvarFinns(
  admin: SupabaseClient<any>,
  token: string,
  userId: string
): Promise<boolean> {
  if (!arToken(token)) return false
  const { data, error } = await admin
    .from('anon_interview_samples')
    .select('user_id, claimed_by, expires_at, full')
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return false
  return arTillganglig(data as unknown as Tillgangsrad, userId)
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

  if (!arTillganglig(rad, userId)) return null
  if (rad.claimed_by === userId) return rad

  // Villkorad uppdatering: två samtidiga anspråk kan inte båda vinna. En
  // hämtad rad är permanent (beslut 2, 2026-09-24): expires_at blir null.
  const { data: uppdaterad, error: uppdateringsFel } = await admin
    .from('anon_interview_samples')
    .update({ claimed_by: userId, expires_at: null })
    .eq('token', token)
    .is('claimed_by', null)
    .select('token')
    .maybeSingle()

  if (uppdateringsFel || !uppdaterad) return null
  return { ...rad, claimed_by: userId, expires_at: null }
}

/**
 * Tar bort ohämtade svar vars sju dygn gått ut. Hämtade rader har
 * expires_at null och rörs aldrig (beslut 2, 2026-09-24). Körs i cronens
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
