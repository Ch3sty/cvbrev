'use client'

/**
 * /kassa?plan=<planKey>
 *
 * Gammal ingång efter registrering och inloggning från prissidan. Bär köpet
 * vidare till köpsteget, så att det inte tappas bort på vägen. Bara
 * Jobbcoach Premium säljs (spec-rummen 17.3): ett osålt paket i en gammal
 * länk leder till Premium (kopstegHref normaliserar med saljbarPlan).
 */

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { isPlanKey, paketMedPris, saljbarPlan } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'

function KassaInner() {
  const params = useSearchParams()
  const router = useRouter()
  const planParam = params.get('plan')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isPlanKey(planParam)) {
      router.replace('/priser')
      return
    }
    // Ångerrättssamtycket (avsnitt 8) kräver en kryssruta på samma skärm som
    // köpknappen. Den här sidan har ingen skärm alls, den postar direkt vid
    // montering, så den kan inte längre öppna kassan själv. Den bär i stället
    // paketet till köpsteget, som har både rutan och knappen. Utloggade
    // skickas dit via inloggningen av sidan själv.
    router.replace(kopstegHref(planParam, 'priser'))
  }, [planParam, router, attempt])

  // Det som säljs, inte det som stod i länken: "Jobbcoach Premium, 149 kr i månaden".
  const plan = isPlanKey(planParam) ? paketMedPris(saljbarPlan(planParam)) : null

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-neutral-200 p-6 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">Kassan gick inte att öppna</h1>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setError(null)
                  setAttempt((n) => n + 1)
                }}
                className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700"
              >
                Försök igen
              </button>
              <Link
                href="/priser"
                className="inline-flex items-center justify-center h-11 px-4 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-neutral-400"
              >
                Till priserna
              </Link>
            </div>
          </>
        ) : (
          <>
            <span
              className="mx-auto block h-8 w-8 rounded-full border-2 border-neutral-200 border-t-orange-600 animate-spin"
              aria-hidden="true"
            />
            <h1 className="text-lg font-semibold text-neutral-900 tracking-tight mt-4">Öppnar kassan</h1>
            <p className="text-sm text-neutral-600 mt-1">
              {plan ? `${plan}.` : ''} Du skickas till Stripe om ett ögonblick.
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default function KassaPage() {
  return (
    <Suspense fallback={null}>
      <KassaInner />
    </Suspense>
  )
}
