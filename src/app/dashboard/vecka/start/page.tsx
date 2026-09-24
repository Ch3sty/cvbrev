/**
 * Välkomstskärmen direkt efter köpet
 * (docs/design/spec-onboarding-2026-09-22.html, sektion 1 och 4).
 *
 * Stripes success_url landar här (VECKA_START_PATH), aldrig på hemskärmen:
 * de första sekunderna efter köpet ska bekräfta vad man har och föreslå
 * första steget. En skärm per paket. Den som redan har ett CV får analysen
 * som första steg i stället.
 *
 * Serverrenderad med paket, CV och senaste poäng. Inget klientanrop behövs
 * för att veta vad som ska stå, vilket är kravet i LCP-budgeten (under
 * 1,5 s) och det som håller CLS på noll.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { isPlanKey, PLAN_BY_KEY } from '@/lib/plans/plans'
import type { Scope } from '@/lib/access/features'
import ValkommenClient from './VeckaStartClient'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export const metadata = { title: 'Välkommen' }

/** Datum i svensk tid, "14 september". */
function svensktDatum(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(d)
}

export default async function ValkommenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })

  const user = await hamtaVerifieradAnvandare()

  if (!user) redirect('/login')

  let scope: Scope | null = null
  let cvNamn: string | null = null
  let cvUppladdat: string | null = null
  let poang: number | null = null

  try {
    const [scopeRes, cvRes, analysRes] = await Promise.all([
      getUserScope(supabase as any, user.id),
      supabase
        .from('cv_texts')
        .select('file_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('cv_analysis_jobs')
        .select('result->atsFriendliness->>score')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
    ])
    scope = scopeRes
    const cv = cvRes.data as { file_name?: string | null; created_at?: string | null } | null
    cvNamn = cv?.file_name ?? null
    cvUppladdat = svensktDatum(cv?.created_at)
    const raw = (analysRes.data as Record<string, unknown> | null)?.score
    const n = raw === null || raw === undefined ? NaN : Number(raw)
    poang = Number.isFinite(n) ? Math.round(n) : null
  } catch {
    /* en saknad rad ska inte ge en vit sida efter ett lyckat köp */
  }

  // Paketet ur Stripes returadress. Webhooken kan ligga några sekunder efter
  // att köparen landar, så planen i adressen är sanningen om scopet ännu
  // inte hunnit skrivas. Utan båda: hemskärmen, aldrig en tom skärm.
  const planParam = typeof params.plan === 'string' ? params.plan : null
  const paket: Scope | null = scope ?? (isPlanKey(planParam) ? PLAN_BY_KEY[planParam].scope : null)
  if (!paket) redirect('/dashboard')

  // Dagspasset ger scopet allt men har sitt eget namn på skärmen.
  const dagspass = planParam === 'all_day' && paket === 'allt'

  return (
    <ValkommenClient
      paket={paket}
      dagspass={dagspass}
      cvNamn={cvNamn}
      cvUppladdat={cvUppladdat}
      poang={poang}
    />
  )
}
