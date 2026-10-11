'use client'

/**
 * Jämförelsetabellen (docs/design/spec-prissida-2026-09-22.html, .jamf).
 *
 * Tre kolumner: funktion, gratis och Premium (spec-rummen 17.3, bara
 * Jobbcoach Premium säljs). JSX-tabell, aldrig markdown
 * (reference_table_markup). Ord i stället för prickar: "Alla 41", "Hela
 * rapporten", "Ingår inte". Tabellen scrollar i sin egen behållare om den
 * inte ryms, sidans body scrollar aldrig i sidled, och första kolumnen
 * ligger kvar på mobil.
 *
 * Publik komponent i Trådens utseende: Premiumkolumnens huvud står i ink-1
 * med vit text, gruppraderna är sektionsetiketter på mark. Rubrikerna
 * kommer ur priser-data.ts.
 *
 * pricing_comparison_viewed skjuts när halva tabellen är i bild, en gång.
 */

import { useEffect, useRef } from 'react'

import { capture } from '@/lib/analytics/events'
import {
  COMPARISON,
  JAMFORELSE_KOLUMNER,
  type ComparisonCell,
  type ComparisonGroup,
} from '@/app/(public)/priser/components/priser-data'

export interface JamforelseTabellProps {
  grupper?: ComparisonGroup[]
  /** Skjut pricing_comparison_viewed när tabellen syns till hälften. */
  matSynlighet?: boolean
  className?: string
}

function Cell({ cell }: { cell: ComparisonCell }) {
  const ton = cell.ton === 'ja' ? 'font-semibold text-ink-1' : 'text-ink-3'
  return (
    <>
      <span className={ton}>{cell.text}</span>
      {cell.sub ? <span className="block text-xs text-ink-3">{cell.sub}</span> : null}
    </>
  )
}

const TH = 'px-3 py-3 text-center text-[13px] font-semibold leading-[19px] sm:px-5'
const TD = 'px-3 py-3 text-center text-sm leading-[19px] sm:px-5 sm:py-3.5'
const FORSTA = 'sticky left-0 z-10 bg-panel px-3 py-3 text-left text-sm leading-[19px] sm:px-5'

export default function JamforelseTabell({
  grupper = COMPARISON,
  matSynlighet,
  className,
}: JamforelseTabellProps) {
  const ref = useRef<HTMLDivElement>(null)
  const skjutet = useRef(false)

  useEffect(() => {
    if (!matSynlighet || !ref.current || skjutet.current) return
    if (typeof IntersectionObserver === 'undefined') return

    const el = ref.current
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !skjutet.current) {
            skjutet.current = true
            capture('pricing_comparison_viewed', {})
            obs.disconnect()
          }
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [matSynlighet])

  return (
    <div ref={ref} className={className}>
      <div className="overflow-x-auto rounded-xl border border-kant bg-panel">
        <table className="w-full min-w-[320px] border-collapse tabular-nums">
          <caption className="sr-only">{JAMFORELSE_KOLUMNER.caption}</caption>
          <thead>
            <tr className="border-b border-kant">
              <th scope="col" className={`${FORSTA} bg-insunken text-[13px] font-semibold text-ink-1`}>
                {JAMFORELSE_KOLUMNER.funktion}
              </th>
              <th scope="col" className={`${TH} w-[32%] bg-insunken text-ink-1`}>
                {JAMFORELSE_KOLUMNER.gratis}
              </th>
              <th scope="col" className={`${TH} w-[32%] bg-ink-1 text-white`}>
                {JAMFORELSE_KOLUMNER.premium}
              </th>
            </tr>
          </thead>

          {grupper.map((grupp) => (
            <tbody key={grupp.title}>
              <tr className="border-b border-kant">
                <th
                  scope="colgroup"
                  colSpan={3}
                  className="bg-mark px-3 py-2 text-left text-steg uppercase text-ink-3 sm:px-5"
                >
                  {grupp.title}
                </th>
              </tr>
              {grupp.rows.map((rad) => (
                <tr key={rad.label} className="border-b border-kant last:border-0">
                  <th scope="row" className={`${FORSTA} font-medium text-ink-1`}>
                    {rad.label}
                    {rad.sub ? (
                      <span className="block text-xs font-normal text-ink-3">{rad.sub}</span>
                    ) : null}
                  </th>
                  <td className={TD}>
                    <Cell cell={rad.free} />
                  </td>
                  <td className={TD}>
                    <Cell cell={rad.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  )
}
