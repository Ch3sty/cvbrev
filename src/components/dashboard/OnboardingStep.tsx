'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Lock } from 'lucide-react'

export type StepState = 'completed' | 'current' | 'locked'

interface OnboardingStepProps {
  number: number
  total: number
  state: StepState
  title: string
  description: string
  why: string
  timeEstimate: string
  ctaLabel: string
  ctaHref: string
  illustration: React.ReactNode
}

export default function OnboardingStep({
  number,
  total,
  state,
  title,
  description,
  why,
  timeEstimate,
  ctaLabel,
  ctaHref,
  illustration,
}: OnboardingStepProps) {
  if (state === 'completed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5 text-emerald-700" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 mb-0.5">
            Klart · Steg {number} av {total}
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {title}
          </div>
        </div>
      </motion.div>
    )
  }

  if (state === 'locked') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
          <Lock className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-0.5">
            Steg {number} av {total}
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-500 truncate">
            {title}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Låses upp efter steg {number - 1}
          </div>
        </div>
      </motion.div>
    )
  }

  // current state
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl text-white p-5 sm:p-6 lg:p-7"
      style={{
        background: 'linear-gradient(135deg, #F97316 0%, #DC2626 60%, #BE185D 100%)',
        boxShadow: '0 20px 40px -12px rgba(220, 38, 38, 0.35)',
      }}
    >
      {/* Bakgrunds-glow */}
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 lg:gap-8 items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-[0.14em]">
              Nuvarande · Steg {number} av {total}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold">
              {timeEstimate}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight mb-2">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-3">
            {description}
          </p>

          <div className="text-[11px] sm:text-xs text-white/85 leading-relaxed mb-5 sm:mb-6 italic border-l-2 border-white/30 pl-3">
            {why}
          </div>

          <Link
            href={ctaHref}
            className="group inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-[#DC2626] font-black text-sm sm:text-base min-h-[52px] hover:bg-orange-50 active:scale-[0.98] transition-all"
            style={{
              boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.3)',
            }}
          >
            {ctaLabel}
            <ArrowRight
              className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform"
              strokeWidth={2.8}
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/25">
            {illustration}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
