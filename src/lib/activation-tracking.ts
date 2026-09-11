// src/lib/activation-tracking.ts
// Serverside-instrumentering för aktiveringstratten (docs/plan-konvertering.md, B7).
// Skriver profiles.first_*-kolumnerna med service role och "först vinner"-semantik,
// samt loggar aktivitetsrader utan att någonsin kasta vidare till anroparen.

import { getSupabaseAdmin } from '@/lib/supabase/admin'

export type FirstMilestoneColumn =
  | 'first_cv_uploaded_at'
  | 'first_letter_created_at'
  | 'first_cv_analyzed_at'

/**
 * Sätter en first_*-tidsstämpel om den inte redan är satt (coalesce-semantik).
 * Tyst vid fel: instrumentering får aldrig fälla ett produktflöde.
 */
export async function markFirstMilestone(
  userId: string,
  column: FirstMilestoneColumn,
  at: Date = new Date()
): Promise<void> {
  if (!userId) return
  try {
    const admin = getSupabaseAdmin()
    await (admin as any)
      .from('profiles')
      .update({ [column]: at.toISOString() })
      .eq('id', userId)
      .is(column, null)
  } catch (error) {
    console.warn(`[activation-tracking] ${column} kunde inte sättas:`, error)
  }
}

/**
 * Serverside-motsvarighet till logUserActivity. Använder service role så att
 * RLS aldrig tystar loggningen i bakgrundsjobb och webhooks.
 */
export async function logActivityServer(
  userId: string,
  activityType: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!userId) return
  try {
    const admin = getSupabaseAdmin()
    await (admin as any).from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
    })
  } catch (error) {
    console.warn(`[activation-tracking] aktivitet ${activityType} kunde inte loggas:`, error)
  }
}
