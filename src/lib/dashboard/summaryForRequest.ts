/**
 * Summeringen en gång per request. Layouten och sidan /dashboard behöver
 * båda den (sidan för landningen i det senaste rummet, spec-rummen avsnitt
 * 5 och våg 4); cache() gör att de delar ett svar i stället för att fråga
 * två gånger.
 */
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getDashboardSummary, type DashboardSummaryData } from './getSummary'

export const hamtaSummaryForRequest = cache(async (userId: string): Promise<DashboardSummaryData> => {
  const supabase = createServerClient({ cookies: await cookies() })
  return getDashboardSummary(supabase, userId)
})
