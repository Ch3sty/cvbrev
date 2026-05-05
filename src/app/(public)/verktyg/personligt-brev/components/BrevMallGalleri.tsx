'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import {
  ThumbKlassisk,
  ThumbMinimalist,
  ThumbKompakt,
  ThumbModern,
  ThumbExecutive,
  ThumbKreativ,
  ThumbTraditionell,
} from './illustrations/BrevIcons'

/**
 * Mallgalleri-sektion med 7 mallar (3 gratis, 4 premium).
 * Mall-data speglar exakt produkten i src/lib/letters/letter-templates.ts.
 * Mobile: horisontell scroll med snap. Desktop: grid 3-4 kort per rad.
 */

const MALLAR = [
  {
    name: 'Klassisk',
    Thumb: ThumbKlassisk,
    description: 'Traditionell svensk standard',
    industries: 'Offentlig sektor · Vård · Utbildning',
    tier: 'free' as const,
  },
  {
    name: 'Minimalist',
    Thumb: ThumbMinimalist,
    description: 'Generösa marginaler, lugn känsla',
    industries: 'Tech · Design · Konsult',
    tier: 'free' as const,
  },
  {
    name: 'Kompakt',
    Thumb: ThumbKompakt,
    description: 'Inline kontaktinfo, tät text',
    industries: 'Tech · Fintech · Moderna bolag',
    tier: 'free' as const,
  },
  {
    name: 'Modern',
    Thumb: ThumbModern,
    description: 'Accentstreck och recipientblock',
    industries: 'Marknadsföring · Finans · Konsult',
    tier: 'premium' as const,
  },
  {
    name: 'Executive',
    Thumb: ThumbExecutive,
    description: 'Sidofält för kontaktinfo',
    industries: 'Bank · Juridik · Management',
    tier: 'premium' as const,
  },
  {
    name: 'Kreativ',
    Thumb: ThumbKreativ,
    description: 'Färgad header som syns',
    industries: 'Design · Reklam · Media',
    tier: 'premium' as const,
  },
  {
    name: 'Traditionell',
    Thumb: ThumbTraditionell,
    description: 'Konservativ, justerad text',
    industries: 'Bank · Juridik · Försäkring',
    tier: 'premium' as const,
  },
]

export default function BrevMallGalleri() {
  return (
    <section className="relative py-16 sm:py-24 bg-orange-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-white text-orange-700 border border-orange-200 mb-4">
            Mallar
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] tracking-tight mb-3">
            Sju mallar.{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              En för varje bransch.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Alla mallar är ATS-säkra och fungerar med svenska rekryterares
            system. Byt mall utan att behöva skriva om brevet.
          </p>
        </motion.div>

        {/* Mobile: horisontell scroll · Desktop: grid */}
        <div
          className="
            flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5
            overflow-x-auto sm:overflow-visible
            -mx-4 px-4 sm:mx-0 sm:px-0
            snap-x snap-mandatory sm:snap-none
            pb-4 sm:pb-0
          "
        >
          {MALLAR.map((mall, idx) => (
            <motion.article
              key={mall.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="
                relative flex-shrink-0 w-[260px] sm:w-auto
                bg-white rounded-3xl border border-orange-100
                p-5 sm:p-6 snap-start
                hover:border-orange-200 transition-colors
              "
              style={{
                boxShadow: '0 8px 28px -14px rgba(249, 115, 22, 0.18)',
              }}
            >
              {/* Premium-badge */}
              {mall.tier === 'premium' && (
                <div
                  className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #DC2626, #BE185D)',
                  }}
                >
                  <Crown className="w-3 h-3" strokeWidth={2.5} />
                  Premium
                </div>
              )}

              {/* Thumbnail */}
              <div className="bg-orange-50/50 rounded-2xl p-4 mb-4 flex items-center justify-center">
                <mall.Thumb className="w-24 h-32 drop-shadow-sm" />
              </div>

              {/* Info */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1">
                {mall.name}
              </h3>
              <p className="text-sm text-slate-600 mb-3 leading-snug">
                {mall.description}
              </p>
              <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700">
                {mall.industries}
              </div>
            </motion.article>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Premium-mallar ingår i Premium-abonnemanget. Gratis-mallarna räcker
          långt för de flesta ansökningar.
        </p>
      </div>
    </section>
  )
}
