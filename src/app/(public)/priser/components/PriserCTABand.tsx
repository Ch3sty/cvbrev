'use client'

/**
 * Avslutande CTA på prissidan (A7 i docs/plan-konvertering.md).
 *
 * Designsystemet: ingen gradientyta, inga gradientcirklar, rounded-xl,
 * font-semibold som tyngst, border i stället för skugga. Sektionen har
 * exakt en fylld orange yta, och det är primärknappen.
 *
 * Inloggad öppnar produktvalet direkt (månad först här, till skillnad från
 * betalväggarna). Utloggad går till registreringen, där fem dagar Premium
 * ingår ändå, så vi skickar ingen till en betalning hon inte kan slutföra.
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import UpgradeSheet from '@/components/paywall/UpgradeSheet'
import { useProfile } from '@/hooks/use-profile'
import { IlluManad } from '@/components/illustrations/PriserIllustrations'
import { SIGNUP_TRIAL_DAYS } from './priser-data'

const TRUST = ['Ingen bindningstid', 'Avsluta när du vill', 'GDPR, data i EU']

export default function PriserCTABand() {
  const { profile, loading } = useProfile()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isLoggedIn = Boolean(profile)

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                Redo att börja?
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed mt-2 max-w-xl">
                {isLoggedIn
                  ? 'Välj hur länge du vill ha Premium. Engångsköpen tar slut av sig själva, prenumerationerna säger du upp med ett klick.'
                  : `Skapa konto så får du ${SIGNUP_TRIAL_DAYS} dagar Premium direkt, utan kort. Sedan går kontot över till gratisnivån av sig självt.`}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    disabled={loading}
                    className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-60 w-full sm:w-auto"
                  >
                    Välj Premium
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center h-11 px-4 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors w-full sm:w-auto"
                  >
                    Skapa konto gratis
                  </Link>
                )}

                <Link
                  href="/verktyg/personligt-brev"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 underline-offset-4 hover:underline"
                >
                  Se hur verktyget fungerar
                </Link>
              </div>

              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                {TRUST.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-1.5 text-xs text-neutral-500"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="13"
                      height="13"
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
            </div>

            {/* Kalenderarket säger vad produkten är. Ingen krona, ingen blob. */}
            <div
              className="hidden sm:flex shrink-0 items-center justify-center text-neutral-900"
              aria-hidden="true"
            >
              <IlluManad size={96} />
            </div>
          </div>
        </motion.div>
      </div>

      <UpgradeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        order="month-first"
        source="priser:cta-band"
      />
    </section>
  )
}
