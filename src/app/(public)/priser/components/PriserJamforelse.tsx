'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { COMPARISON } from './priser-data'

type Tab = 'free' | 'premium'

/**
 * Desktop: full tabell med tre kolumner (Feature, Free, Premium).
 * Mobile: tabs Free/Premium ovanst, en kolumn synlig at gangen.
 */
export default function PriserJamforelse() {
  const [tab, setTab] = useState<Tab>('premium')

  return (
    <section className="relative py-16 sm:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-4">
            Jämförelse
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Vad får du på{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              varje plan?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Alla funktioner sida vid sida. Ingen finstil, inga dolda
            begränsningar.
          </p>
        </motion.div>

        {/* Mobile tabs */}
        <div
          role="tablist"
          aria-label="Välj plan att visa"
          className="lg:hidden grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-orange-50/50 border border-orange-100 mb-5"
        >
          <button
            role="tab"
            aria-selected={tab === 'free'}
            onClick={() => setTab('free')}
            className={`min-h-[44px] rounded-xl text-sm font-bold transition-all ${
              tab === 'free'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Gratis
          </button>
          <button
            role="tab"
            aria-selected={tab === 'premium'}
            onClick={() => setTab('premium')}
            className={`min-h-[44px] rounded-xl text-sm font-bold transition-all ${
              tab === 'premium'
                ? 'text-white shadow-md'
                : 'text-slate-500'
            }`}
            style={
              tab === 'premium'
                ? {
                    background:
                      'linear-gradient(135deg, #F97316, #DC2626)',
                  }
                : undefined
            }
          >
            Premium
          </button>
        </div>

        {/* Tabell-container */}
        <div className="rounded-3xl bg-white border border-orange-100 overflow-hidden">
          {COMPARISON.map((group, gIdx) => (
            <div key={group.title}>
              {/* Group header */}
              <div
                className={`px-5 sm:px-7 py-3 bg-orange-50/40 border-y border-orange-100 ${
                  gIdx === 0 ? 'border-t-0' : ''
                }`}
              >
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] text-orange-700">
                  {group.title}
                </h3>
              </div>

              {/* Rows */}
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="
                    grid lg:grid-cols-[1.6fr_1fr_1fr] grid-cols-[1.4fr_1fr]
                    items-center px-5 sm:px-7 py-3.5 border-b border-orange-100/60 last:border-b-0
                    hover:bg-orange-50/30 transition-colors
                  "
                >
                  <div className="text-sm sm:text-[15px] font-medium text-slate-700">
                    {row.label}
                  </div>

                  {/* Free-kolumn (alltid pa desktop, conditionally pa mobile) */}
                  <div
                    className={`text-sm sm:text-[15px] text-slate-600 text-right lg:text-center ${
                      tab !== 'free' ? 'hidden lg:block' : ''
                    }`}
                  >
                    {row.free}
                  </div>

                  {/* Premium-kolumn */}
                  <div
                    className={`text-sm sm:text-[15px] font-bold text-right lg:text-center ${
                      tab !== 'premium' ? 'hidden lg:block' : ''
                    }`}
                    style={{
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {row.premium}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tabell-headers (desktop only, sticky-look efter container) */}
        <div className="hidden lg:grid lg:grid-cols-[1.6fr_1fr_1fr] gap-0 px-5 sm:px-7 mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div></div>
          <div className="text-center">Gratis</div>
          <div className="text-center text-orange-700">Premium</div>
        </div>
      </div>
    </section>
  )
}
