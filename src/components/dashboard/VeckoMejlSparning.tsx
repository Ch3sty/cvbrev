'use client'

/**
 * Öppnad från ett veckomejl (docs/plan-paket-och-onboarding.md, Fas 2B
 * avsnitt 7).
 *
 * Dagsmejlets knapp länkar till dagens sida med ?source=email&vecka=n. Den
 * här komponenten läser paret och skjuter week_day_opened med source 'email',
 * så att mejlens andel av öppningarna går att skilja från appens.
 *
 * Renderar ingenting. Ligger i dashboardskalet därför att dagarna pekar på
 * sex olika sidor, och en händelse ska inte behöva kopieras in i var och en.
 */

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { useDashboardData } from '@/contexts/DashboardDataContext'

export default function VeckoMejlSparning() {
  const searchParams = useSearchParams()
  const { summary } = useDashboardData()
  const skjutet = useRef(false)

  const source = searchParams.get('source')
  const vecka = searchParams.get('vecka')

  useEffect(() => {
    if (skjutet.current) return
    if (source !== 'email') return
    const dag = Number(vecka)
    if (!Number.isInteger(dag) || dag < 1 || dag > 7) return
    const track = summary?.week?.track ?? summary?.week?.scope
    if (!track) return

    skjutet.current = true
    capture('week_day_opened', { track, day: dag, source: 'email' })
  }, [source, vecka, summary])

  return null
}
