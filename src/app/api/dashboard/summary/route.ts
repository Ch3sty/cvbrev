/**
 * GET /api/dashboard/summary
 *
 * Samlar allt hemskärmen behöver i en enda rundtur: profil, brev, CV och
 * sammanfattningen av Sökta tjänster. Tidigare gjorde klienten tio separata
 * anrop, varav flera först efter att ett annat svar hade landat.
 *
 * Själva aggregeringen bor numera i src/lib/dashboard/getSummary.ts, så att
 * dashboard-layouten kan köra exakt samma logik direkt på servern utan att gå
 * omvägen via den här routen. Routen behåller sin auth-kontroll, sin svarsform
 * och sin felhantering, och delegerar resten.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getDashboardSummary } from '@/lib/dashboard/getSummary'

export type { DashboardSummaryPipelineItem } from '@/lib/dashboard/getSummary'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Ej autentiserad' }, { status: 401 })
    }

    const data = await getDashboardSummary(supabase, user.id)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Fel vid hämtning av dashboard-summary:', error)
    return NextResponse.json(
      { success: false, error: 'Serverfel vid hämtning av dashboard-data' },
      { status: 500 }
    )
  }
}
