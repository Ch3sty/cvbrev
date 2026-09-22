'use client'

/**
 * TestResultBridge (docs/plan-konvertering.md, B6).
 *
 * Testsegmentet är 40 procent av nya konton och möter idag aldrig CV, brev
 * eller pris. Bryggan renderas under PercentileCard på resultatsidorna och
 * pekar vidare till nästa steg i jobbsökandet.
 *
 * Bryggan får aldrig blockera resultatet. Saknas sessionsToday visas variant 1.
 *
 * Bryggan är resultatvyns framhävda element och bär därför vyns enda
 * marginalplatta. Handlingen är en kant-knapp: vyns primära ink-knapp
 * ("Gör om testet") sitter redan i sidhuvudet.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import PaywallCard from '@/components/paywall/PaywallCard'
import MarginPlate from '@/components/shell/MarginPlate'
import { IlluPlattaAnsokan, IlluPlattaCvPoang } from '@/components/illustrations/TradenScener'
import { logUserActivity } from '@/lib/activity-logger'

export interface TestResultBridgeProps {
  /** Antal testsessioner idag. Okänt antal behandlas som första sessionen. */
  sessionsToday?: number
  hasCv: boolean
  isPremium: boolean
  testSlug: string
  /** Inloggad användare, för aktivitetsloggning (B7). */
  userId?: string
  /** Datum då trial-perioden slutar. Visas som en rad under bryggan. */
  trialEndsAt?: string | null
  /** Kvotnyckel för variant 2b. */
  quota?: { feature: string; nextResetAt: string }
}

type Variant = '1' | '2' | '2b' | '3'

export default function TestResultBridge({
  sessionsToday,
  hasCv,
  isPremium,
  testSlug,
  userId,
  trialEndsAt,
  quota,
}: TestResultBridgeProps) {
  const sessions = typeof sessionsToday === 'number' ? sessionsToday : 1

  const variant: Variant = hasCv
    ? '3'
    : sessions >= 3
      ? isPremium
        ? '2'
        : '2b'
      : '1'

  // B7: resultatsidan räknas som ett slutfört test när den visas.
  const logged = useRef(false)
  useEffect(() => {
    if (!userId || logged.current) return
    logged.current = true
    void logUserActivity(userId, 'test_completed', 'Testresultat visades', {
      slug: testSlug,
      sessionsToday: sessions,
    })
  }, [userId, testSlug, sessions])

  const trackClick = (target: string) => {
    if (!userId) return
    void logUserActivity(userId, 'bridge_clicked', 'Klick i testbryggan', {
      variant,
      target,
    })
  }

  const trialLine =
    isPremium && trialEndsAt ? (
      <p className="mt-3 text-meta text-ink-3">
        Alla testnivåer ingår till {formatDate(trialEndsAt)}.
      </p>
    ) : null

  // Variant 2b: gratisanvändare som kört tre omgångar möter taket i stället.
  if (variant === '2b') {
    return (
      <PaywallCard variant="test-tak" quota={quota} planOrder="daypass-first" />
    )
  }

  const copy = {
    '1': {
      title: 'Du klarar testet. Nu gäller det att komma till testet.',
      body: 'Testerna kommer sent i processen. Först ska ditt CV ta dig förbi granskningen. Ladda upp det så visar vi på 30 sekunder vad en rekryterare ser.',
      primaryLabel: 'Ladda upp mitt CV',
      primaryHref: '/dashboard/profil/cv',
      secondary: null as { label: string; href: string } | null,
    },
    '2': {
      title: 'Tre test idag. Imponerande uthållighet.',
      body: 'Du är uppenbarligen seriös med jobbsökandet. Då är det värt att lägga tio minuter på CV:t också, det är det som avgör om du ens blir kallad till testet.',
      primaryLabel: 'Ladda upp mitt CV',
      primaryHref: '/dashboard/profil/cv',
      secondary: { label: 'Fler testnivåer', href: '/dashboard/tester' },
    },
    '3': {
      title: 'Nästa steg: brevet.',
      body: 'Ditt CV ligger inne. Klistra in en annons så skriver vi brevet utifrån det.',
      primaryLabel: 'Skapa personligt brev',
      primaryHref: '/dashboard/skapa-brev',
      secondary: null,
    },
  }[variant]

  const Illu = variant === '3' ? IlluPlattaAnsokan : IlluPlattaCvPoang

  return (
    <section
      className="rounded-xl border border-kant bg-panel p-4 sm:p-5"
      aria-label={copy.title}
    >
      <div className="flex items-start gap-3">
        <MarginPlate>
          <Illu size={48} />
        </MarginPlate>
        <div className="min-w-0 flex-1">
          <h3 className="text-kort text-ink-1">{copy.title}</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-2">{copy.body}</p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link
              href={copy.primaryHref}
              onClick={() => trackClick(copy.primaryHref)}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant bg-panel px-4 text-sm font-medium text-ink-1 hover:border-kant-stark sm:w-auto"
            >
              {copy.primaryLabel}
            </Link>
            {copy.secondary && (
              <Link
                href={copy.secondary.href}
                onClick={() => trackClick(copy.secondary!.href)}
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink-2 underline decoration-kant-stark underline-offset-4 hover:text-ink-1"
              >
                {copy.secondary.label}
              </Link>
            )}
          </div>

          {trialLine}
        </div>
      </div>
    </section>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
}
