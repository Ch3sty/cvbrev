// src/app/api/quota/summary/route.ts
// ===================================
// Alla fyra dygnskvoter i ett svar (punkt 1 och 7 i
// docs/plan-inloggat-saljflode.md).
//
// Dashboardens kvotrad och prenumerationssidans UsageStats läser samma
// siffror härifrån. Räknas de på två ställen glider de isär, och då är
// siffran värre än ingen siffra alls. Därför bor uträkningen i
// src/lib/quota/getQuotaSummary.ts, som både den här routen och
// prenumerationssidans server component anropar.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getQuotaSummary } from '@/lib/quota/getQuotaSummary'

export type { QuotaSummary, QuotaSummaryItem } from '@/lib/quota/getQuotaSummary'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    }

    const summary = await getQuotaSummary(supabase, user.id)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('[quota/summary] Error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta kvoter' }, { status: 500 })
  }
}
