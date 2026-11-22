/**
 * Fyller i CV:ts ort på det aktiva CV:t när tolkningen lämnade den tom
 * (cvOrt.ts). Orten sparas på raden i active_cv_for_matching, så att
 * matchningen (match-jobs läser raden) och de andra vyerna utgår från den
 * också. Sökprofilens orter går alltid före: den här orten används bara när
 * profilen saknar ort, precis som en ort som tolkningen själv hittat.
 *
 * Tyst vid fel: utan ort fungerar Matchade jobb som förut.
 *
 * Bara server.
 */
import 'server-only'
import type { ActiveCVData } from '@/app/dashboard/jobbmatchning/getJobbmatchningData'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ortUrCv } from './cvOrt'

export async function fyllCvOrt(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  activeCV: ActiveCVData | null
): Promise<ActiveCVData | null> {
  if (!activeCV || (activeCV.extracted_location ?? '').trim()) return activeCV
  try {
    const { data } = await supabase
      .from('cv_texts')
      .select('structured_data, cv_text')
      .eq('id', activeCV.cv_id)
      .eq('user_id', userId)
      .maybeSingle()
    const rad = data as { structured_data?: unknown; cv_text?: string | null } | null
    const ort = rad ? ortUrCv(rad.structured_data, rad.cv_text) : null
    if (!ort) return activeCV
    // Raden är kontots egen (user_id ur den verifierade sessionen); skrivs
    // med service role eftersom tabellens skrivregler inte är kända här.
    const admin = getSupabaseAdmin() as any
    const { error } = await admin
      .from('active_cv_for_matching')
      .update({ extracted_location: ort })
      .eq('user_id', userId)
      .eq('cv_id', activeCV.cv_id)
    if (error) console.error('[cvOrt] kunde inte spara orten:', error.message)
    return { ...activeCV, extracted_location: ort }
  } catch (error: any) {
    console.error('[cvOrt] kastade:', error?.message)
    return activeCV
  }
}
