'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import {
  CheckPriser,
  PremiumCrown,
} from './illustrations/PriserIcons'
import {
  FREE_HIGHLIGHTS,
  PREMIUM_HIGHLIGHTS,
  PREMIUM_PRICE,
  TRIAL_DAYS,
} from './priser-data'

export default function PriserKort() {
  return (
    <section className="relative py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7 items-stretch">
          {/* === FREE === */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            className="relative bg-white rounded-3xl border border-orange-100 p-7 sm:p-8 flex flex-col"
            style={{
              boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
            }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                Gratis
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
                För att testa
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2 mb-5 leading-relaxed">
              Räcker för aktiv jobbsökning. Många hittar jobb utan att
              någonsin behöva uppgradera.
            </p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl sm:text-7xl font-black text-slate-900 leading-none">
                0 kr
              </span>
              <span className="text-sm text-slate-500">/ för alltid</span>
            </div>

            <ul className="space-y-2.5 mb-7 flex-1">
              {FREE_HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckPriser className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-[15px] text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-900 font-bold text-base min-h-[52px] hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
            >
              Starta gratis
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* === PREMIUM === */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="relative rounded-3xl p-7 sm:p-8 text-white flex flex-col overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow:
                '0 24px 60px -20px rgba(220, 38, 38, 0.55)',
            }}
          >
            {/* Dekorativa cirklar */}
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none"
            />

            <div className="relative">
              {/* Mest populär-badge */}
              <div className="absolute -top-1 right-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-orange-700 text-[10px] font-black uppercase tracking-wider shadow-md">
                <PremiumCrown className="w-3.5 h-3.5" />
                Mest populär
              </div>

              <div className="flex items-baseline mb-1 mt-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                  Premium
                </span>
              </div>
              <p className="text-sm text-white/90 mt-2 mb-5 leading-relaxed">
                Allt vi har att erbjuda. För dig som söker många jobb
                samtidigt eller vill ha alla mallar och Smart-anpassad ton.
              </p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-6xl sm:text-7xl font-black leading-none">
                  {PREMIUM_PRICE} kr
                </span>
                <span className="text-sm text-white/80">/ månad</span>
              </div>
              <p className="text-xs text-white/80 mb-6">
                Mindre än en arbetslunch. Avsluta när som helst.
              </p>

              <ul className="space-y-2.5 mb-7">
                {PREMIUM_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                      <svg
                        viewBox="0 0 16 16"
                        className="w-3 h-3"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 8.5 L6.5 11.5 L12.5 5"
                          stroke="white"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-[15px] text-white/95">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/trial-signup"
                className="group inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-white font-black text-base min-h-[52px] hover:bg-orange-50 active:scale-[0.98] transition-all"
                style={{
                  color: '#DC2626',
                  boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.25)',
                }}
              >
                Prova Premium i {TRIAL_DAYS} dagar gratis
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  strokeWidth={2.8}
                />
              </Link>
              <p className="text-center text-xs text-white/85 mt-3">
                {TRIAL_DAYS} dagar gratis · Avsluta innan dag {TRIAL_DAYS + 1} och du betalar inget
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
