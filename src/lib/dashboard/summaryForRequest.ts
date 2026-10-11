/**
 * Dashboard-summeringen en gång per request. Layouten och sidor som
 * behöver samma tal (Rekryteringstesters rad om Jobbsöket, paketet för
 * betalväggen) delar svaret via React cache(), så hemvyn inte kostar en
 * andra omgång mot databasen.
 *
 * Ett läsfel ger null, aldrig ett kastat fel: skalet och vyerna har egna
 * reservvärden.
 */
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getDashboardSummary } from './getSummary'
import type { DashboardSummary } from '@/contexts/DashboardDataContext'

export const hamtaSummering = cache(async (userId: string): Promise<DashboardSummary | null> => {
  try {
    const supabase = createServerClient({ cookies: await cookies() })
    return (await getDashboardSummary(supabase, userId)) as DashboardSummary
  } catch (error) {
    console.error('Fel vid server-hämtning av dashboard-summary:', error)
    return null
  }
})
