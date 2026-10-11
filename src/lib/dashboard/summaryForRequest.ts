/**
 * Dashboard-summeringen en gång per request. Layouten, sidan /dashboard
 * (landningen i det senaste rummet, spec-rummen avsnitt 5 och våg 4) och
 * sidor som behöver samma tal (Rekryteringstesters rad om Jobbsöket, paketet
 * för betalväggen) delar svaret via React cache(), så ingen vy kostar en
 * andra omgång mot databasen.
 *
 * `hamtaSummaryForRequest` kastar vid läsfel; `hamtaSummering` ger null,
 * eftersom skalet och vyerna har egna reservvärden. Båda delar samma cache.
 */
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getDashboardSummary, type DashboardSummaryData } from './getSummary'
import type { DashboardSummary } from '@/contexts/DashboardDataContext'

export const hamtaSummaryForRequest = cache(async (userId: string): Promise<DashboardSummaryData> => {
  const supabase = createServerClient({ cookies: await cookies() })
  return getDashboardSummary(supabase, userId)
})

export const hamtaSummering = cache(async (userId: string): Promise<DashboardSummary | null> => {
  try {
    return (await hamtaSummaryForRequest(userId)) as DashboardSummary
  } catch (error) {
    console.error('Fel vid server-hämtning av dashboard-summary:', error)
    return null
  }
})
