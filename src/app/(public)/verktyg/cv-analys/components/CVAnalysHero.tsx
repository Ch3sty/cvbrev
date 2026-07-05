'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CheckPriser } from '@/app/(public)/priser/components/illustrations/PriserIcons'
import CVAnalysLiveDemo from './CVAnalysLiveDemo'

const TRUST = ['1 analys gratis var tredje dag', 'ATS-säkrad', 'Klar på 60 sekunder']

export default function CVAnalysHero() {
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Vänster: text */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #DC2626)',
                }}
              />
              CV-analys
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
              Få konkret feedback på ditt CV{' '}
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                på 60 sekunder
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Vi läser ditt CV och kontrollerar struktur, språk, nyckelord och
              kvantifiering. Du får ATS-poäng från 0 till 100, sex
              kategori-betyg och konkreta förslag du kan applicera direkt.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center">
              <Link
                href="/dashboard/cv-analys"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-base shadow-lg w-full sm:w-auto min-h-[52px] hover:shadow-xl active:scale-[0.98] transition-all"
                style={{
                  background:
                    'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                  boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
                }}
              >
                Analysera mitt CV
                <ArrowRight
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.5}
                />
              </Link>
              <Link
                href="#sa-funkar-det"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-orange-700 font-bold text-sm hover:text-orange-800 transition-colors"
              >
                Så funkar det
              </Link>
            </div>

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

          {/* Höger: live-demo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            <CVAnalysLiveDemo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
