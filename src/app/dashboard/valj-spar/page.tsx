/**
 * Köpsteget (spec-rummen våg 5). Bara Jobbcoach Premium säljs, så sidan har
 * inget spårval och inget längdval: den visar Premium direkt.
 *
 * Serverkomponenten läser sessionen och ett eventuellt sparat spår, så att
 * steget kan renderas färdigt utan ett klientanrop först. Själva flödet är
 * ett läge, inte en sida, och bor därför i FlowShell på klienten.
 *
 * `?paket=` normaliseras med saljbarPlan: en gammal länk med
 * ?paket=cv_week eller ?paket=all_week landar på Premium, aldrig på ett
 * osålt paket. `?plats=` är betalväggen köpet startade i och följer med
 * till kassan som source. `?steg=kop` står kvar i länkarna och betyder
 * samma sak som utan.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { isTrack, type Track } from '@/lib/onboarding/program'
import { SALD_PLAN, paketNamn, saljbarPlan } from '@/lib/plans/plans'
import ValjSparClient from './ValjSparClient'
import { HOPPAT_PARAM } from '@/components/registrering/intent'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export const metadata = { title: paketNamn(SALD_PLAN) }

/** Platsen ur adressen, bara gemener, siffror, understreck och bindestreck. */
function lasPlats(v: unknown): string | null {
  return typeof v === 'string' && /^[a-z0-9_-]{1,40}$/.test(v) ? v : null
}

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

  try {
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_track')
      .eq('id', user.id)
      .maybeSingle()
    const row = data as Record<string, unknown> | null
    if (isTrack(row?.onboarding_track)) initialTrack = row!.onboarding_track as Track
  } catch {
    /* ett läsfel får aldrig stoppa köpet, steget fungerar utan tidigare svar */
  }

  return (
    <ValjSparClient
      initialTrack={initialTrack}
      plan={saljbarPlan(params.paket)}
      plats={lasPlats(params.plats)}
      // Frågan i steg 1 hoppades över: Börja gratis ställer den inte igen.
      utanGratisfraga={params[HOPPAT_PARAM] === '1'}
    />
  )
}
