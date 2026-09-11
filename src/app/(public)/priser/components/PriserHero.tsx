'use client'

/**
 * Prissidans hero (A7 i docs/plan-konvertering.md). Copy ordagrant enligt
 * planen. Ingen gradientrubrik, ingen radial blob: orange är accent här,
 * inte yta.
 */

import { motion } from 'framer-motion'
import { PRISER_HERO_TITLE, PRISER_HERO_INGRESS } from './priser-data'

const TRUST = ['Ingen bindningstid', 'Fem dagar Premium när du skapar konto', 'Avsluta när du vill']

export default function PriserHero() {
  return (
    <section className="relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-16 sm:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-neutral-900 leading-tight tracking-tight mb-4">
            {PRISER_HERO_TITLE}
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            {PRISER_HERO_INGRESS}
          </p>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 text-sm text-neutral-600">
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  className="text-orange-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3.5 8.5l3 3 6-6" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
