'use client'

/**
 * TestResultBridge (docs/plan-konvertering.md, B6).
 *
 * Testsegmentet är 40 procent av nya konton och möter idag aldrig CV, brev
 * eller pris. Bryggan renderas under PercentileCard på resultatsidorna och
 * pekar vidare till nästa steg i jobbsökandet.
 *
 * Bryggan får aldrig blockera resultatet. Saknas sessionsToday visas variant 1.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PaywallCard from '@/components/paywall/PaywallCard'
import { IlluTestTillCv } from '@/components/illustrations/TestIllustrations'
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
      <p className="text-sm text-neutral-600 mt-3">
        Alla testnivåer är upplåsta till {formatDate(trialEndsAt)}.
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5"
      aria-label={copy.title}
    >
      <div className="flex items-start gap-4">
        <span className="hidden sm:block shrink-0 text-neutral-900" aria-hidden="true">
          <IlluTestTillCv size={96} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
            {copy.title}
          </h3>
          <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{copy.body}</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <Link
              href={copy.primaryHref}
              onClick={() => trackClick(copy.primaryHref)}
              className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
            >
              {copy.primaryLabel}
            </Link>
            {copy.secondary && (
              <Link
                href={copy.secondary.href}
                onClick={() => trackClick(copy.secondary!.href)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
              >
                {copy.secondary.label}
              </Link>
            )}
          </div>

          {trialLine}
        </div>
      </div>
    </motion.section>
  )
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
}
