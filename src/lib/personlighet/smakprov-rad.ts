/**
 * Läsning och anspråk på personlighetsprovets rader
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5 och 6).
 *
 * Samma mönster som src/lib/intervju/rad.ts: claim-rutten och
 * tolkningssidan gör samma anspråk, så Google-registreringen (som inte går
 * genom claim-kedjan i register-form) landar rätt ändå. En hämtad rad är
 * permanent (expires_at null, ägarens beslut 2).
 *
 * Server: tabellen har RLS utan policies och läses bara med admin-klienten.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import type { SkalVarde, SmakprovId } from './smakprov-pastaenden'
import { arUuid } from './smakprov-validering'

export interface SmakprovRad {
  token: string
  answers: Array<{ id: SmakprovId; value: SkalVarde }>
  scores: BigFiveScores
  source_slug: string | null
  user_id: string | null
  claimed_by: string | null
  created_at: string
  expires_at: string | null
}

type Tillgangsrad = Pick<SmakprovRad, 'user_id' | 'claimed_by' | 'expires_at'>

/** Får den här användaren se raden (eller göra anspråk på den)? */
export function arTillganglig(rad: Tillgangsrad, userId: string, nu: number = Date.now()): boolean {
  if (rad.expires_at !== null && new Date(rad.expires_at).getTime() <= nu) return false
  if (rad.claimed_by) return rad.claimed_by === userId
  return !rad.user_id || rad.user_id === userId
}

const KOLUMNER = 'token, answers, scores, source_slug, user_id, claimed_by, created_at, expires_at'

/** Proxyns kontroll för /dashboard/intervju/profil/[token], som intervjuSvarFinns. */
export async function smakprovFinns(admin: SupabaseClient<any>, token: string, userId: string): Promise<boolean> {
  if (!arUuid(token)) return false
  const { data, error } = await admin
    .from('anon_personality_samples')
    .select('user_id, claimed_by, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return false
  return arTillganglig(data as unknown as Tillgangsrad, userId)
}

/**
 * Raden för den här användaren, med anspråk om den är ohämtad. Null när den
 * inte finns, har gått ut eller tillhör någon annan.
 */
export async function hamtaEllerGorAnsprak(
  admin: SupabaseClient<any>,
  token: string,
  userId: string
): Promise<SmakprovRad | null> {
  if (!arUuid(token)) return null

  const { data, error } = await admin
    .from('anon_personality_samples')
    .select(KOLUMNER)
    .eq('token', token)
    .maybeSingle()
  if (error || !data) return null
  const rad = data as unknown as SmakprovRad

  if (!arTillganglig(rad, userId)) return null
  if (rad.claimed_by === userId) return rad

  // Villkorad uppdatering: två samtidiga anspråk kan inte båda vinna.
  const { data: uppdaterad, error: uppdateringsFel } = await admin
    .from('anon_personality_samples')
    .update({ claimed_by: userId, expires_at: null })
    .eq('token', token)
    .is('claimed_by', null)
    .select('token')
    .maybeSingle()

  if (uppdateringsFel || !uppdaterad) return null
  return { ...rad, claimed_by: userId, expires_at: null }
}

/**
 * Tar bort ohämtade prov vars sju dygn gått ut. Hämtade rader har
 * expires_at null och rörs aldrig. Körs i cronens midnattsslot bredvid
 * intervjuprovets rensning, aldrig i ett eget cron-jobb.
 */
export async function cleanupExpiredSmakprov(admin: SupabaseClient<any>): Promise<number> {
  try {
    const { data, error } = await admin
      .from('anon_personality_samples')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('token')
    if (error) {
      console.error('[personlighetsprov] Kunde inte rensa utgångna prov:', error)
      return 0
    }
    return (data as unknown[] | null)?.length ?? 0
  } catch (err) {
    console.error('[personlighetsprov] Rensningen kraschade:', err)
    return 0
  }
}
