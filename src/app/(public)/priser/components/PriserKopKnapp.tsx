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
 * Trådens primärknapp: ink med vit text. Koppar finns bara i inloggat.
 */

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { PAKET_KORT } from '@/components/pricing/paket-copy'
import { capture } from '@/lib/analytics/events'
import { useAuth } from '@/contexts/AuthContext'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'

export default function PriserKopKnapp() {
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
      cta: 'primary',
    })
    setBusy(true)
    // Ångerrättssamtycket lämnas på köpsteget, som bär både kryssrutan och
    // knappen. Prissidan öppnar därför aldrig kassan själv.
    router.push(user ? kopstegHref(SALD_PLAN, 'priser') : `/register?paket=${SALD_PLAN}`)
  }, [user, router])

  return (
    <button
      type="button"
      onClick={kop}
      disabled={busy}
      className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg bg-ink-1 px-5 text-base font-semibold text-white transition-colors hover:bg-ink-hover disabled:opacity-60"
    >
      {PAKET_KORT.allt.knapp}
    </button>
  )
}
