// src/app/api/subscription/grants/route.ts
// =========================================
// Historiken över engångsköp på prenumerationssidan (A8 i
// docs/plan-konvertering.md). Läser bara den inloggades egna rader.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export interface PremiumGrantRow {
  id: string
  days: number
  source: string | null
  granted_at: string
  premium_until_after: string | null
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    }

    // RLS på premium_grants släpper bara igenom ägarens rader, men vi
    // filtrerar ändå explicit: två spärrar är bättre än en.
    const { data, error } = await supabase
      .from('premium_grants')
      .select('id, days, source, granted_at, premium_until_after')
      .eq('user_id', user.id)
      .order('granted_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[SUBSCRIPTION GRANTS]', error.message)
      return NextResponse.json({ error: 'Kunde inte hämta historiken' }, { status: 500 })
    }

    return NextResponse.json({ grants: (data ?? []) as PremiumGrantRow[] })
  } catch (error) {
    console.error('[SUBSCRIPTION GRANTS] Error:', error)
    return NextResponse.json({ error: 'Något gick fel' }, { status: 500 })
  }
}
