'use client'

/**
 * Jämförelsetabellen (docs/plan-paket-och-onboarding.md, Fas 2D).
 *
 * Fyra kolumner: gratis, CV, Test, Allt. JSX-tabell, aldrig markdown
 * (reference_table_markup). Tabellen scrollar i sin egen behållare, sidans
 * body scrollar aldrig i sidled, och första kolumnen ligger kvar på mobil.
 *
 * Tal där tal finns, bock där det bara är på eller av. Skälet: "41" säger
 * mer än en bock, och en bock bredvid ett tal läses som två olika saker.
 *
 * pricing_comparison_viewed skjuts när halva tabellen är i bild, en gång.
 */

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

import { capture } from '@/lib/analytics/events'
import { COMPARISON, type ComparisonGroup } from '@/app/(public)/priser/components/priser-data'

export interface JamforelseTabellProps {
  grupper?: ComparisonGroup[]
  /** Skjut pricing_comparison_viewed när tabellen syns till hälften. */
  matSynlighet?: boolean
  className?: string
}

/** Punkt i ink-3 betyder "ingår inte". Aldrig ett kryss, aldrig rött. */
function Cell({ varde }: { varde: string }) {
  if (varde === '✓') {
    return (
      <>
        <Check
          className="mx-auto h-5 w-5 text-ink-2"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span className="sr-only">Ingår</span>
      </>
    )
  }
  if (varde === '·' || varde === '') {
    return (
      <>
        <span className="text-ink-3" aria-hidden="true">
          ·
        </span>
        <span className="sr-only">Ingår inte</span>
      </>
    )
  }
  return <span className="tabular-nums">{varde}</span>
}

const TH_KOL = 'px-3 py-2 text-center text-meta font-medium text-ink-3'
const TD_KOL = 'px-3 py-3 text-center text-sm text-ink-2'
const FORSTA =
  'sticky left-0 z-10 bg-panel px-3 py-3 text-left text-sm text-ink-1'

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
        <table className="w-full min-w-[540px] border-collapse">
          <caption className="sr-only">
            Vad som ingår i gratisnivån, CV-veckan, Testveckan och Allt
          </caption>
          <thead>
            <tr className="border-b border-kant">
              <th scope="col" className={`${FORSTA} text-meta font-medium text-ink-3`}>
                Funktion
              </th>
              <th scope="col" className={TH_KOL}>
                Gratis
              </th>
              <th scope="col" className={TH_KOL}>
                CV
              </th>
              <th scope="col" className={TH_KOL}>
                Test
              </th>
              <th scope="col" className={TH_KOL}>
                Allt
              </th>
            </tr>
          </thead>

          {grupper.map((grupp) => (
            <tbody key={grupp.title}>
              <tr className="border-b border-kant bg-insunken">
                <th
                  scope="colgroup"
                  colSpan={5}
                  className="px-3 py-2 text-left text-sm font-medium text-ink-3"
                >
                  {grupp.title}
                </th>
              </tr>
              {grupp.rows.map((rad) => (
                <tr key={rad.label} className="border-b border-kant last:border-0">
                  <th scope="row" className={`${FORSTA} font-normal`}>
                    {rad.label}
                  </th>
                  <td className={TD_KOL}>
                    <Cell varde={rad.free} />
                  </td>
                  <td className={TD_KOL}>
                    <Cell varde={rad.cv} />
                  </td>
                  <td className={TD_KOL}>
                    <Cell varde={rad.test} />
                  </td>
                  <td className={TD_KOL}>
                    <Cell varde={rad.allt} />
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
