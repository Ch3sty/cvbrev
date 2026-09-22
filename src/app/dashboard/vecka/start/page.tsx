/**
 * Köpreturen, flöde 2 (docs/plan-paket-och-onboarding.md, Fas 2A skärm 2.1).
 *
 * Stripes success_url landar här, aldrig på hemskärmen. Skälet är mätpunkt 2:
 * en tom hemskärm direkt efter köp är produktens sämsta sekund, och den här
 * vyn vänder de tio sekunderna till en riktning.
 *
 * Serverrenderad med paket, spår och dag ur profilen. Inget klientanrop
 * behövs för att veta vad som ska stå, vilket är kravet i LCP-budgeten
 * (under 1,5 s) och det som håller CLS på noll.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserScope } from '@/lib/supabase/premiumAccess'
import { isTrack, type Track, type WeekTrack } from '@/lib/onboarding/program'
import VeckaStartClient from './VeckaStartClient'

export const metadata = { title: 'Veckan är igång' }

export default async function VeckaStartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let track: Track | null = null
  let harCv = false
  let currentPeriodEnd: string | null = null
  let scope: Track | null = null
  let harAllaGrundnivaer = false

  try {
    const [profileRes, cvRes, scopeRes, testRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('onboarding_track, current_period_end')
        .eq('id', user.id)
        .maybeSingle(),
      supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      getUserScope(supabase as any, user.id),
      supabase
        .from('logic_test_v4_sessions')
        .select('test_type')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null),
    ])
    const row = profileRes.data as Record<string, unknown> | null
    if (isTrack(row?.onboarding_track)) track = row!.onboarding_track as Track
    currentPeriodEnd = (row?.current_period_end as string | null) ?? null
    harCv = (cvRes.count ?? 0) > 0
    if (isTrack(scopeRes)) scope = scopeRes as Track

    // Har hon redan kört grundnivån i varje testtyp hoppar dag 1 över
    // diagnosen. Vi ber aldrig någon göra om ett test hon gjort.
    const typer = new Set(
      ((testRes.data ?? []) as Array<{ test_type: string | null }>)
        .map((r) => r.test_type)
        .filter((t): t is string => Boolean(t))
    )
    harAllaGrundnivaer = typer.size >= 3
  } catch {
    /* saknad profil ska inte ge en vit sida efter ett lyckat köp */
  }

  // Spåret styr veckans innehåll. Har hon inte valt spår men betalat, följer
  // vi det betalda scopet, som alltid finns efter ett köp.
  if (!track) track = scope

  // planKey kommer ur Stripes success_url. Utan den läser vi spåret i stället,
  // som alltid finns eftersom kassan nås via spårvalet.
  const planParam = typeof params.plan === 'string' ? params.plan : null

  // Vilket spårs vecka Allt-köparen kör. Sparas inte förrän hon börjat, så
  // CV-veckan är utgångsläget precis som i ordningen på skärm 1.1.
  const weekTrack: WeekTrack = track === 'tester' ? 'tester' : 'cv'

  return (
    <VeckaStartClient
      track={track ?? 'cv'}
      weekTrack={weekTrack}
      planKey={planParam}
      harCv={harCv}
      harAllaGrundnivaer={harAllaGrundnivaer}
      currentPeriodEnd={currentPeriodEnd}
    />
  )
}
