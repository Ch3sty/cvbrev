'use client'

/**
 * Valkommen-sidans klient (Del B). Hämtkedjan först: brevutkast, CV-start,
 * testprov, intervjuprov och personlighetsprov. En träff skickar till
 * resultatet. Annars redirect, sedan paket (köpsteget), sedan spårvalet.
 *
 * Kedjan kördes förut bara i lösenordsvägen (register-form). Här körs den
 * för båda, och token läses ur cookien jc_signup, så Google-vägen hämtar
 * också hem brevutkast, CV-start och testprov.
 */

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  claimPendingCvStart,
  claimPendingDraft,
  claimPendingIntervju,
  claimPendingPersonlighet,
  claimPendingTestSession,
} from '@/lib/letters/claim-draft-client'
import { capture } from '@/lib/analytics/events'
import { TRACK_CHOICE_PATH } from '@/lib/onboarding/steps'
import {
  landningsgren,
  rensaSignupCookie,
  type SignupCookie,
} from '@/components/registrering/intent'

/** Hämtkedjan, i samma ordning som förut. Token ur cookien för rätt typ. */
export async function hamtkedjan(signup: SignupCookie | null): Promise<string | null> {
  const sp = signup?.smakprov ?? null
  const t = (typ: string) => (sp && sp.typ === typ ? sp.token : undefined)
  try {
    return (
      (await claimPendingDraft(t('draft'))) ||
      (await claimPendingCvStart(t('cv_start'))) ||
      (await claimPendingTestSession(t('test'))) ||
      (await claimPendingIntervju(t('intervju'))) ||
      (await claimPendingPersonlighet(t('personlighet')))
    )
  } catch (error) {
    console.error('[valkommen] Hämtkedjan misslyckades:', error)
    return null
  }
}

export interface ValkommenClientProps {
  signup: SignupCookie | null
  fornamn: string | null
}

export default function ValkommenClient({ signup }: ValkommenClientProps) {
  const router = useRouter()
  const kord = useRef(false)

  useEffect(() => {
    if (kord.current) return
    kord.current = true
    void (async () => {
      const intent = signup?.intent ?? null
      const hamtat = await hamtkedjan(signup)
      rensaSignupCookie()
      if (hamtat) {
        capture('signup_landed', { destination: hamtat, intent, claimed: true, via: 'smakprov' })
        router.replace(hamtat)
        return
      }
      const gren = landningsgren(signup, TRACK_CHOICE_PATH)
      const destination = gren.via === 'forslag' ? TRACK_CHOICE_PATH : gren.destination
      capture('signup_landed', {
        destination,
        intent,
        claimed: false,
        via: gren.via === 'forslag' ? 'sparval' : gren.via,
      })
      router.replace(destination)
    })()
  }, [signup, router])

  return (
    <div className="fixed inset-0 z-50 bg-mark lg:left-64" aria-busy="true" aria-label="Laddar">
      <div className="h-0.5 w-full overflow-hidden bg-kant">
        <div className="h-full w-1/3 animate-pulse bg-accent" />
      </div>
    </div>
  )
}
