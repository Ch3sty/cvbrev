'use client'

/**
 * OnboardingDag2
 * --------------
 * Visas efter att rewardClaimed === true. Tre nya kort som introducerar
 * de funktioner som inte var med i grund-onboarding (jobbmatchning,
 * LinkedIn-optimering, rekryteringstester).
 *
 * Forklarar VAD och VARFOR for varje funktion sa anvandaren forstar
 * varfor de borde testa dem.
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import {
  OnboardingJobbmatch,
  OnboardingLinkedin,
  OnboardingTester,
} from './illustrations/OnboardingIcons'

const STORAGE_KEY = 'onboarding_dag2_dismissed'

const NEXT_STEPS = [
  {
    Icon: OnboardingJobbmatch,
    title: 'Hitta jobb som passar dig',
    description:
      'Vi söker bland tusentals lediga tjänster och visar matchnings-procent per annons. Du ser direkt vilka jobb du har bäst chans till.',
    why: 'En undersköterska matchar t.ex. mot stödassistent, vårdbiträde och boendestödjare. Vi öppnar dörrar du kanske inte sökt på.',
    ctaLabel: 'Aktivera jobbmatchning',
    ctaHref: '/dashboard/jobbmatchning',
  },
  {
    Icon: OnboardingLinkedin,
    title: 'Optimera din LinkedIn',
    description:
      'Vi förbättrar fem profilsektioner samtidigt så rekryterare faktiskt hittar dig i sina sökningar.',
    why: 'Vi loggar aldrig in på din LinkedIn. Du copy-pastar in din text, vi optimerar, du copy-pastar tillbaka.',
    ctaLabel: 'Optimera profil',
    ctaHref: '/dashboard/linkedin-optimizer',
  },
  {
    Icon: OnboardingTester,
    title: 'Träna på rekryteringstester',
    description:
      'Matrislogik, verbalt och numeriskt resonemang i samma format som SHL och Cut-e använder. Tre tester gratis.',
    why: 'Många jobbansökningar slutar med ett urvalstest. Träningen ger ett tydligt försprång eftersom du redan kan formatet.',
    ctaLabel: 'Starta första testet',
    ctaHref: '/dashboard/tester',
  },
]

export default function OnboardingDag2() {
  const { rewardClaimed, isLoading } = useOnboarding()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })

  const handleDismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  // Visas BARA efter att anvandaren hamtat sin onboarding-belogning.
  // Annars syns det direkt for nya anvandare innan de gjort nagot.
  if (isLoading || !rewardClaimed) return null
  if (dismissed) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative bg-white border border-orange-100 rounded-3xl p-5 sm:p-6 lg:p-7"
      style={{
        boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Stang-knapp */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 hover:bg-orange-50 rounded-lg transition-colors text-slate-400 hover:text-orange-700"
        aria-label="Stäng"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {/* Header */}
      <div className="mb-5 sm:mb-6 pr-8">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-orange-700 mb-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
            }}
            aria-hidden="true"
          />
          Du är igång — utforska resten
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          Tre verktyg som tar dig{' '}
          <span
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ett steg till
          </span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Du har grunderna. Det här är vad vi rekommenderar att utforska härnäst.
        </p>
      </div>

      {/* Tre kort */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {NEXT_STEPS.map(({ Icon, title, description, why, ctaLabel, ctaHref }, idx) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 sm:p-5 flex flex-col"
          >
            <Icon className="w-14 h-14 sm:w-16 sm:h-16 mb-3" />

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-2">
              {title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed mb-3 flex-1">
              {description}
            </p>

            <div className="text-[11px] text-orange-800 leading-relaxed mb-4 italic border-l-2 border-orange-300 pl-2.5">
              {why}
            </div>

            <Link
              href={ctaHref}
              className="group inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl text-white font-bold text-sm min-h-[44px]"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.35)',
              }}
            >
              {ctaLabel}
              <ArrowRight
                className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
          </motion.article>
        ))}
      </div>
    </motion.section>
  )
}
