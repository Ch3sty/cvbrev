// src/app/api/premium/usage-summary/route.ts
// ==========================================
// Vad användaren faktiskt hunnit använda av Premium (punkt 11 i
// docs/plan-inloggat-saljflode.md).
//
// UpgradeSheet läser detta på dag 4 till 5 och sorterar "det här förlorar du"
// efter verklig användning. Har hon laddat ner tre brev står nedladdningen
// först. Har hon inte laddat ner något står brevkvoten först.

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import type { PremiumFeature } from '@/lib/premium/logPremiumUsage'

export interface PremiumLossItem {
  /** Vad gratisnivån ger, ordagrant ur COMPARISON där det går. */
  label: string
  free: string
  premium: string
}

export interface PremiumUsageSummary {
  /** Antal gånger per funktion sedan premium började gälla. */
  counts: Partial<Record<PremiumFeature, number>>
  /** Tre rader, viktigast först. */
  losses: PremiumLossItem[]
}

/** Raderna vi kan visa, i fallande prioritet när inget använts. */
const DEFAULT_ORDER: Array<{ feature: PremiumFeature; item: PremiumLossItem }> = [
  {
    feature: 'letter_download',
    item: {
      label: 'Ladda ner brev som PDF och Word',
      free: 'Nej',
      premium: 'Ja',
    },
  },
  {
    feature: 'cv_export',
    item: { label: 'Export PDF och Word', free: 'Ett CV, sedan Premium', premium: 'Obegränsat' },
  },
  {
    feature: 'cv_analysis_full',
    item: {
      label: 'CV-analys, alla förbättringsförslag',
      free: 'De tre största',
      premium: 'Alla',
    },
  },
  {
    feature: 'test_session',
    item: { label: 'Rekryteringstester', free: '1 per dag och nivå', premium: 'Obegränsat' },
  },
  {
    feature: 'chat_message',
    item: { label: 'Jobbcoachen', free: '10 meddelanden per dag', premium: 'Obegränsat' },
  },
]

/** Brevkvoten står först när användaren inte hunnit använda något alls. */
const LETTER_QUOTA_ITEM: PremiumLossItem = {
  label: 'Brev per dag',
  free: '1 brev',
  premium: 'Obegränsat',
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    }

    // Vi tittar på de senaste 30 dagarna: längre tillbaka än så säger
    // ingenting om den pågående perioden.
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data } = await supabase
      .from('user_activities')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('activity_type', 'premium_feature_used')
      .gte('created_at', since)
      .limit(500)

    const counts: Partial<Record<PremiumFeature, number>> = {}
    for (const row of (data ?? []) as Array<{ metadata?: { feature?: string } | null }>) {
      const feature = row.metadata?.feature as PremiumFeature | undefined
      if (!feature) continue
      counts[feature] = (counts[feature] ?? 0) + 1
    }

    const used = DEFAULT_ORDER.filter((entry) => (counts[entry.feature] ?? 0) > 0).sort(
      (a, b) => (counts[b.feature] ?? 0) - (counts[a.feature] ?? 0)
    )
    const unused = DEFAULT_ORDER.filter((entry) => (counts[entry.feature] ?? 0) === 0)

    // Har hon inte använt något alls leder brevkvoten: den märks först.
    const ordered =
      used.length > 0
        ? [...used, ...unused].map((e) => e.item)
        : [LETTER_QUOTA_ITEM, ...unused.map((e) => e.item)]

    const summary: PremiumUsageSummary = { counts, losses: ordered.slice(0, 3) }
    return NextResponse.json(summary)
  } catch (error) {
    console.error('[premium/usage-summary] Error:', error)
    return NextResponse.json({ error: 'Kunde inte hämta användning' }, { status: 500 })
  }
}
