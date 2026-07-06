'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck } from 'lucide-react'

/**
 * Avslutande CTA-band — full-bredd orange/röd gradient, samma mönster som
 * BrevCTABand på verktygssidorna.
 */
export default function RekryterareCTABand() {
  return (
    <section className="relative py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 lg:p-16 text-white"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        >
          {/* Dekorativa cirklar */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight mb-4">
                Var med från början.
                <br className="hidden sm:block" />{' '}
                Poolen växer varje dag.
              </h2>
              <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Skapa ett rekryterarkonto, så verifierar vi ert företag och
                släpper in er i betan. Gratis under tidig åtkomst, utan
                bindningstid.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start lg:justify-start justify-center">
                <Link
                  href="/rekryterare/registrera"
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white font-black text-base sm:text-lg w-full sm:w-auto min-h-[56px] hover:bg-orange-50 active:scale-[0.98] transition-all"
                  style={{
                    color: '#DC2626',
                    boxShadow: '0 12px 32px -10px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  Skapa rekryterarkonto
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={2.8}
                  />
                </Link>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 text-sm text-white/85">
                <span>Gratis under betan</span>
                <span className="hidden sm:inline text-white/40">·</span>
                <span>Bevakning ingår</span>
                <span className="hidden sm:inline text-white/40">·</span>
                <span>Ingen bindningstid</span>
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-8 border border-white/25">
                <BadgeCheck className="w-32 h-32 text-white" strokeWidth={1.4} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
