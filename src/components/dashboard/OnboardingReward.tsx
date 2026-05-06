'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useOnboarding } from '@/contexts/OnboardingContext'
import { OnboardingTrofe } from './illustrations/OnboardingIcons'

interface OnboardingRewardProps {
  /** Om true visas komponenten i kompakt format (kom-igang-sidan). Annars stort dashboard-format. */
  compact?: boolean
}

const REWARD_BENEFITS = [
  'Obegränsade personliga brev',
  'Obegränsade CV-analyser',
  'LinkedIn-optimering',
  'Alla rekryteringstester',
]

export default function OnboardingReward({ compact = false }: OnboardingRewardProps) {
  const { markRewardClaimed } = useOnboarding()
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleClaim = async () => {
    setClaiming(true)
    setError(null)

    try {
      const response = await fetch('/api/onboarding/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Kunde inte hämta belöning')
      }

      setSuccess(true)
      markRewardClaimed()

      // Refresh sa dashboard speglar nya premium-status
      setTimeout(() => {
        window.location.reload()
      }, 2400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
      setClaiming(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-7 lg:p-8"
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 24px 48px -16px rgba(220, 38, 38, 0.4)',
      }}
    >
      {/* Confetti-prickar (statisk dekoration) */}
      <ConfettiDecorations />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] mb-3">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            3/3 klara
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-2">
            Du klarade alla tre stegen!
          </h2>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed mb-5 max-w-xl">
            Hämta din belöning: <span className="font-black">1 dag Premium gratis</span>.
            Det betyder följande under 24 timmar:
          </p>

          {/* Vad du far - lista */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-6">
            {REWARD_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-center gap-2 text-sm sm:text-[15px] text-white/95 font-medium"
              >
                <Check className="w-4 h-4 flex-shrink-0" strokeWidth={3} />
                {benefit}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#DC2626] font-black text-base min-h-[52px]"
                style={{ boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.3)' }}
              >
                <Check className="w-5 h-5" strokeWidth={3} />
                Premium aktivt — laddar om...
              </motion.div>
            ) : (
              <motion.button
                key="claim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClaim}
                disabled={claiming}
                className="group inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-7 py-4 rounded-2xl bg-white font-black text-base sm:text-lg min-h-[56px] hover:bg-orange-50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                style={{
                  color: '#DC2626',
                  boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.3)',
                }}
              >
                {claiming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Hämtar...
                  </>
                ) : (
                  <>
                    Hämta din belöning
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                      strokeWidth={2.8}
                    />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-bold bg-white/15 px-3 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          {!compact && (
            <p className="text-[11px] text-white/75 mt-3">
              Vill du ha mer än 24 timmar? Provperioden på 7 dagar gör det enkelt att testa allt.
            </p>
          )}
        </div>

        {/* Trofe-illustration */}
        {!compact && (
          <div className="hidden lg:flex items-center justify-center flex-shrink-0">
            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-4 border border-white/30">
              <OnboardingTrofe className="w-32 h-32" />
            </div>
          </div>
        )}
      </div>
    </motion.section>
  )
}

function ConfettiDecorations() {
  const dots = [
    { top: '15%', left: '8%', size: 4, opacity: 0.5 },
    { top: '8%', left: '22%', size: 3, opacity: 0.4 },
    { top: '20%', left: '38%', size: 5, opacity: 0.6 },
    { top: '12%', left: '55%', size: 3, opacity: 0.5 },
    { top: '6%', left: '72%', size: 4, opacity: 0.5 },
    { top: '78%', left: '14%', size: 3, opacity: 0.4 },
    { top: '85%', left: '40%', size: 4, opacity: 0.5 },
    { top: '70%', left: '88%', size: 5, opacity: 0.5 },
    { top: '90%', left: '70%', size: 3, opacity: 0.4 },
  ]

  return (
    <div
      className="absolute inset-0 pointer-events-none hidden sm:block"
      aria-hidden="true"
    >
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: dot.top,
            left: dot.left,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            opacity: dot.opacity,
          }}
        />
      ))}
    </div>
  )
}
