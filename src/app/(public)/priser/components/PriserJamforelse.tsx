'use client'

/**
 * Jämförelsetabell Gratis | Premium (A7 i docs/plan-konvertering.md).
 *
 * Designsystemet: ingen gradient, font-semibold som tyngst, rounded-xl,
 * border i stället för skugga, ingen fylld orange yta. Tabellen är en tabell
 * och inget annat, så den går att läsa av snabbt.
 *
 * Mobil: hela tabellen scrollar i sidled i sin egen behållare, med första
 * kolumnen sticky så raden alltid går att identifiera.
 */

import { motion } from 'framer-motion'
import { COMPARISON, COMPARISON_INTRO } from './priser-data'

/** Ja och Nej får ikon i stället för ord, resten står som text. */
function Value({ value, emphasis }: { value: string; emphasis?: boolean }) {
  if (value === 'Ja') {
    return (
      <>
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          className="text-orange-600 inline-block align-[-2px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 8.5l3 3 6-6" />
        </svg>
        <span className="sr-only">Ja</span>
      </>
    )
  }

  if (value === 'Nej') {
    return (
      <>
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          className="text-neutral-400 inline-block align-[-2px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
        <span className="sr-only">Nej</span>
      </>
    )
  }

  return (
    <span
      className={
        emphasis
          ? 'text-sm font-medium text-neutral-900'
          : 'text-sm text-neutral-600'
      }
    >
      {value}
    </span>
  )
}

export default function PriserJamforelse() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mb-2">
            Gratis och Premium, sida vid sida
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            {COMPARISON_INTRO}
          </p>
        </motion.div>

        {/* Egen scrollbehållare: tabellen får aldrig skjuta ut body på mobil. */}
        <div className="rounded-xl border border-neutral-200 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <caption className="sr-only">
              Jämförelse mellan gratisnivån och Premium
            </caption>
            <thead>
              <tr className="border-b border-neutral-200">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500"
                >
                  Funktion
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500 whitespace-nowrap"
                >
                  Gratis
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-xs font-medium uppercase tracking-wide text-orange-700 whitespace-nowrap"
                >
                  Premium
                </th>
              </tr>
            </thead>

            {COMPARISON.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={3}
                    className="bg-neutral-50 border-y border-neutral-200 px-4 sm:px-5 py-2 text-xs font-semibold text-neutral-700"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-neutral-200 last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white px-4 sm:px-5 py-3 text-sm font-normal text-neutral-700 align-top"
                    >
                      {row.label}
                    </th>
                    <td className="px-4 sm:px-5 py-3 align-top">
                      <Value value={row.free} />
                    </td>
                    <td className="px-4 sm:px-5 py-3 align-top">
                      <Value value={row.premium} emphasis />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  )
}
