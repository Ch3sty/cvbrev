/**
 * Spårvalet, flöde 1 (docs/plan-paket-och-onboarding.md, Fas 2A skärm 1.1
 * och 1.2, justerad av Fas 2D del 1).
 *
 * Serverkomponenten läser bara sessionen, ett eventuellt tidigare spår och om
 * kontot redan har en löpande prenumeration, så att steget kan renderas
 * färdigt utan ett klientanrop först. Själva flödet är ett läge, inte en
 * sida, och bor därför i FlowShell på klienten.
 *
 * `?paket=<planKey>` förväljer spåret och längden. Prissidan och
 * registreringen skickar med den, så att den som redan valt paket inte får
 * frågan en gång till.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { isTrack, type Track } from '@/lib/onboarding/program'
import { isPlanKey, PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans'
import ValjSparClient from './ValjSparClient'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export const metadata = { title: 'Välj spår' }

export default async function ValjSparPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })

  const user = await hamtaVerifieradAnvandare()

  if (!user) redirect('/login')

  let initialTrack: Track | null = null
  let harLopandePrenumeration = false

  try {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_track, subscription_status')
      .eq('id', user.id)
      .maybeSingle()
    const row = data as Record<string, unknown> | null
    if (isTrack(row?.onboarding_track)) initialTrack = row!.onboarding_track as Track

    // Dirigentens beslut D48b: dagläget är inaktivt i längdvalet för kunder
    // med löpande prenumeration. Bytet nedåt vore en uppsägning plus ett
    // engångsköp, inte ett längdbyte.
    harLopandePrenumeration = ['active', 'trialing'].includes(
      (row?.subscription_status as string | null) ?? ''
    )
  } catch {
    /* ett läsfel får aldrig stoppa frågan, den fungerar utan tidigare svar */
  }

  // Paketet ur länken. Kommer hon från prissidan eller från en registrering
  // med ?paket har hon redan valt, och då ska spåret och längden stå rätt.
  const paketParam = typeof params.paket === 'string' ? params.paket : null
  const forvaltPaket: PlanKey | null = isPlanKey(paketParam) ? paketParam : null
  const forvaltSpar: Track | null = forvaltPaket ? PLAN_BY_KEY[forvaltPaket].scope : null

  return (
    <ValjSparClient
      initialTrack={forvaltSpar ?? initialTrack}
      initialPlanKey={forvaltPaket}
      harLopandePrenumeration={harLopandePrenumeration}
    />
  )
}
