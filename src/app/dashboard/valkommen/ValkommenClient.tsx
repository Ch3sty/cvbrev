'use client'

/**
 * Valkommen-sidans klient (Del B). Hämtkedjan först: brevutkast, CV-start,
 * testprov, intervjuprov och personlighetsprov. En träff skickar till
 * resultatet. Annars redirect, sedan paket (köpsteget), sedan valet (steg 3,
 * ForslagSteg), annars spårvalet utan förval.
 *
 * Kedjan kördes förut bara i lösenordsvägen (register-form). Här körs den
 * för båda, och token läses ur cookien jc_signup, så Google-vägen hämtar
 * också hem brevutkast, CV-start och testprov.
 */

import { useEffect, useRef, useState } from 'react'
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
import { rensaProvkalla, sparaKontokalla } from '@/lib/analytics/provkalla'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import type { MittTest } from '@/lib/traning/mittTest'
import ForslagSteg from './ForslagSteg'
import {
  landningsgren,
  rensaSignupCookie,
  type SignupCookie,
  type SignupIntent,
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

/** Källan och valet från artikeln (page.tsx, provkalla.ts). */
export interface ValkommenKalla {
  kalla: string | null
  mittTest: MittTest | null
  /** Valet sattes på planen nu. */
  satt: boolean
  surface: 'artikel' | 'hubb'
  /** Provdatumskärmen före landningen (I-prov och lokförare utan datum). */
  provdatumSkarm: boolean
}

/** Provdatumskärmen efter kontot, med landningen som nästa steg. */
export function provdatumHref(nasta: string): string {
  return `${TRANING_RUTT.provdatum}?nasta=${encodeURIComponent(nasta)}`
}

export interface ValkommenClientProps {
  signup: SignupCookie | null
  fornamn: string | null
  kalla?: ValkommenKalla | null
}

export default function ValkommenClient({ signup, fornamn, kalla = null }: ValkommenClientProps) {
  const router = useRouter()
  const kord = useRef(false)
  const [forslag, setForslag] = useState<SignupIntent | null>(null)

  useEffect(() => {
    if (kord.current) return
    kord.current = true
    void (async () => {
      const intent = signup?.intent ?? null
      const hamtat = await hamtkedjan(signup)
      rensaSignupCookie()
      if (kalla) {
        // Källan och valet följer kontot till betalväggens händelser.
        sparaKontokalla({ ...(kalla.kalla ? { kalla: kalla.kalla } : {}), ...(kalla.mittTest ? { mitt_test: kalla.mittTest } : {}) })
        rensaProvkalla()
        if (kalla.satt && kalla.mittTest) {
          capture('mitt_test_valt', { val: kalla.mittTest, variant: null, surface: kalla.surface, forsta: true, ...(kalla.kalla ? { kalla: kalla.kalla } : {}) })
        }
        // I-prov och lokförare: provdatumet först, sedan dit kontot var på väg.
        if (kalla.provdatumSkarm) {
          const gren = landningsgren(signup, TRACK_CHOICE_PATH)
          const nasta = hamtat ?? (gren.via === 'forslag' ? TRANING_RUTT.hem : gren.destination)
          capture('signup_landed', { destination: nasta, intent, claimed: !!hamtat, via: hamtat ? 'smakprov' : gren.via })
          router.replace(provdatumHref(nasta))
          return
        }
      }
      if (hamtat) {
        capture('signup_landed', { destination: hamtat, intent, claimed: true, via: 'smakprov' })
        router.replace(hamtat)
        // Planen fick valet på servern under den här sidan: sidomenyns övningsprov läser den.
        if (kalla?.satt) router.refresh()
        return
      }
      const gren = landningsgren(signup, TRACK_CHOICE_PATH)
      if (gren.via === 'forslag') {
        // Valet sparas direkt, så att Kom igång och hemskärmen följer det
        // även om hon lämnar steg 3 utan att trycka något.
        void fetch('/api/onboarding/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: gren.intent }),
        }).catch(() => {})
        setForslag(gren.intent)
        return
      }
      capture('signup_landed', { destination: gren.destination, intent, claimed: false, via: gren.via })
      router.replace(gren.destination)
      if (kalla?.satt) router.refresh()
    })()
  }, [signup, router, kalla])

  if (forslag) return <ForslagSteg intent={forslag} fornamn={fornamn} entry={signup?.entry} />

  return (
    <div className="fixed inset-0 z-50 bg-golv lg:left-[248px]" aria-busy="true" aria-label="Laddar">
      <div className="loading-thread h-0.5 w-full bg-kant" />
    </div>
  )
}
