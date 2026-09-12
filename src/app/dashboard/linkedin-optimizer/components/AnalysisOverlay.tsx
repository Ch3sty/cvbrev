'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIPS = [
  'Läser igenom din profil...',
  'Analyserar språk och ton...',
  'Hittar unika styrkor att lyfta fram...',
  'Letar efter buzzwords att rensa...',
  'Identifierar saknade nyckelord...',
  'Skriver om för maximal genomslagskraft...',
  'Strukturerar erfarenheter med STAR-metoden...',
  'Optimerar för rekryterares ögon och ATS-system...',
  'Lägger sista handen vid resultatet...',
]

interface AnalysisOverlayProps {
  /** Avbryter optimeringen. Utan väg ut är en fullskärmsoverlay en fälla. */
  onCancel?: () => void
}

export default function AnalysisOverlay({ onCancel }: AnalysisOverlayProps) {
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'rgba(255, 247, 237, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative max-w-md w-full"
      >
        <div className="relative bg-white rounded-xl border border-orange-100 px-6 py-8 sm:px-8 sm:py-10 shadow-xl">
          {/* Animerad cirkel */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              {/* Pulserande ring */}
              <motion.div
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-orange-600"
                aria-hidden="true"
              />
              {/* Solid mittenboll */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-orange-600">
                <svg
                  className="w-8 h-8 text-white animate-spin"
                  style={{ animationDuration: '1.6s' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-95"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Eyebrow */}
          <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
            AI optimerar
          </div>

          {/* Rubrik */}
          <h2 className="text-center text-2xl sm:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            Vi förbättrar din profil
          </h2>

          {/* Roterande tips */}
          <div className="h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-sm text-neutral-600 text-center leading-relaxed"
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Estimat */}
          <p className="text-center text-sm text-neutral-500 mt-4">
            Tar oftast 15 till 30 sekunder. Stäng inte fliken.
          </p>

          {onCancel && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-neutral-600 underline-offset-4 transition-colors hover:text-neutral-900 hover:underline"
              >
                Avbryt
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
