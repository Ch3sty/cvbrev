'use client'

/**
 * Köpknappen på prissidan. Det enda på kortet som behöver JavaScript.
 *
 * Utloggad går till registreringen med Premium i adressen, inloggad direkt
 * till köpsteget med platsen "priser", så att köpet kan räknas per yta i
 * subscription_paid. Inloggningen läses i klienten och aldrig på servern,
 * eftersom sidan är CDN-cachad i 24 timmar (reference_vercel_env_saknas).
 * Knappen ser likadan ut i båda lägena, bara destinationen skiljer, så
 * ingenting flyttar sig (CLS 0).
 *
 * Publikt v2: kopparknappen med mörk text (pub-knapp). Hjältens knapp bär
 * data-primar för mätskriptet; samma knapp står i sista stationen, under
 * frågorna och i den fasta knappraden.
 */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { PAKET_KORT } from '@/components/pricing/paket-copy'
import { capture } from '@/lib/analytics/events'
import { useAuth } from '@/contexts/AuthContext'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'

export default function PriserKopKnapp({ primar = false, cta = 'primary' }: { primar?: boolean; cta?: 'primary' | 'secondary' } = {}) {
  const router = useRouter()
  // Ur AuthContext, som bara laddar Supabase-klienten när det finns en
  // sessionscookie. Prissidan betalade annars klienten för varje besökare.
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  const kop = useCallback(() => {
    capture('paywall_cta_clicked', {
      variant: 'onboarding_paket',
      surface: 'public_pricing',
      plan: SALD_PLAN,
      cta,
    })
    setBusy(true)
    // Ångerrättssamtycket lämnas på köpsteget, som bär både kryssrutan och
    // knappen. Prissidan öppnar därför aldrig kassan själv.
    router.push(user ? kopstegHref(SALD_PLAN, 'priser') : `/register?paket=${SALD_PLAN}`)
  }, [user, router, cta])

  return (
    <button
      type="button"
      onClick={kop}
      disabled={busy}
      data-primar={primar ? '' : undefined}
      className="pub-knapp"
    >
      {PAKET_KORT.allt.knapp}
    </button>
  )
}
