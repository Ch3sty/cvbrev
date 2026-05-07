'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Mail } from 'lucide-react'
import { CheckPriser } from '@/app/(public)/priser/components/illustrations/PriserIcons'
import { ExempelHeroIcon } from './illustrations/ExempelIcons'
import { TOTAL_EXEMPEL, TOTAL_CV_YRKEN, TOTAL_BREV_YRKEN } from './exempel-data'

const TRUST = [
  'Helt gratis',
  'ATS-optimerade',
  'Uppdaterade 2026',
]

export default function ExempelHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249, 115, 22, 0.12) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-16 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              />
              Mall-bibliotek
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
              CV-mallar och brev-mallar:{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {TOTAL_EXEMPEL} färdiga exempel.
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0">
              {TOTAL_CV_YRKEN} CV-mallar och {TOTAL_BREV_YRKEN} mallar för
              personligt brev, fördelade över sex branscher. Hitta rätt mall
              för ditt yrke och använd den som utgångspunkt för din egen
              ansökan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
              <Link
                href="/cv-exempel"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg w-full sm:w-auto min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                }}
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} />
                Bläddra CV-mallar
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
              <Link
                href="/personligt-brev-exempel"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border-2 border-orange-200 text-slate-900 font-bold text-base w-full sm:w-auto min-h-[52px] hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
              >
                <Mail className="w-5 h-5 text-orange-600" strokeWidth={2.5} />
                Bläddra brev-mallar
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-6 inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 px-4 py-2.5 rounded-full bg-white/70 border border-orange-100">
              {TRUST.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700"
                >
                  <CheckPriser className="w-3.5 h-3.5" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Höger: illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="flex items-center justify-center"
          >
            <ExempelHeroIcon className="w-64 h-64 sm:w-80 sm:h-80" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
