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

export default function AnalysisOverlay() {
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
        {/* Glow */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative bg-white rounded-3xl border border-orange-100 px-6 py-8 sm:px-8 sm:py-10"
          style={{
            boxShadow: '0 30px 60px -20px rgba(220, 38, 38, 0.35)',
          }}
        >
          {/* Animerad cirkel */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              {/* Pulserande ring 1 */}
              <motion.div
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316, #DC2626)',
                }}
                aria-hidden="true"
              />
              {/* Pulserande ring 2 (försenad) */}
              <motion.div
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.6,
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'linear-gradient(135deg, #DC2626, #BE185D)',
                }}
                aria-hidden="true"
              />
              {/* Solid mittenboll */}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 28px -8px rgba(220, 38, 38, 0.5)',
                }}
              >
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
          <div className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
            AI optimerar
          </div>

          {/* Rubrik */}
          <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-3">
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
                className="text-sm text-slate-600 text-center leading-relaxed"
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Estimat */}
          <p className="text-center text-[11px] text-slate-400 mt-4">
            Tar oftast 15-30 sekunder. Stäng inte fliken.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
