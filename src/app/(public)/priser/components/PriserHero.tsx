'use client'

import { motion } from 'framer-motion'
import { CheckPriser } from './illustrations/PriserIcons'

const TRUST = [
  'Ingen bindningstid',
  '7 dagar gratis',
  'Avsluta när som helst',
]

export default function PriserHero() {
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-16 sm:pb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-orange-50 text-orange-700 border border-orange-200 mb-5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
            />
            Priser
          </div>

          {/* Rubrik */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mb-5">
            En enda plan.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Allt du behöver.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-7 max-w-2xl mx-auto">
            149 kr per månad för obegränsad tillgång till hela plattformen.
            Sju dagar gratis och ingen bindningstid. Avsluta innan trialen
            är slut och du betalar aldrig något.
          </p>

          {/* Trust-pillar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-5 py-3 rounded-full bg-white border border-orange-100 shadow-sm">
            {TRUST.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700"
              >
                <CheckPriser className="w-4 h-4" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
