'use client'

/**
 * Laddläget mellan två skärmar i sessionsramen (plan-testflode-2026-11-20
 * avsnitt 1, Fel och laddning, och 7.5): startskärm till uppgift, sista
 * uppgiften till resultat. Förut visades Hems skelett (tester/loading.tsx)
 * under navigeringen, med dashboardens huvud och bannrar tillbaka för en
 * stund, och sidan under ramen hoppade när ramen kom igen (CLS på
 * resultatet). Här står ramens golv kvar: samma lager, samma yta, och
 * data-flow-active sätts i samma commit som den förra ramen släpper det, så
 * att huvudet och bannrarna aldrig hinner ritas.
 *
 * Resultatsidor för typer som ännu inte står i ramen får Hems skelett som
 * förut (laddningen ritas annars som ram och sidan efter som vanlig sida).
 */

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import HemLaddar from '@/app/dashboard/tester/loading'
import { getTestConfig } from '@/app/dashboard/tester/testConfig'
import { useRamLage } from './useRamLage'

/** Resultatsidan står i ramen för de här typerna (etapp 1, 2 och 3). */
function resultatIRamen(slug: string): boolean {
  const c = getTestConfig(slug)
  if (!c || c.level === 'prov') return false
  return c.kind === 'figurserie' || c.kind === 'matris' || c.kind === 'deduktiv' || c.kind === 'verbal' || c.kind === 'numerisk'
}

function Golv({ resultat }: { resultat: boolean }) {
  const ref = useRef<HTMLElement | null>(null)
  useRamLage(ref, false)
  return (
    <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-golv" data-sessionsram="laddar" aria-busy="true" role="status" aria-label="Laddar">
      {resultat ? (
        <div className="vagg h-[260px] rounded-b-[28px]" />
      ) : (
        <>
          <div className="h-14 flex-shrink-0 bg-papper" />
          <div className="h-1.5 w-full flex-shrink-0 bg-kant" />
        </>
      )}
    </div>
  )
}

export default function RamLaddar() {
  const sokvag = usePathname() ?? ''
  const resultat = /\/test\/[^/]+\/results\/?$/.test(sokvag)
  if (resultat) {
    const slug = sokvag.match(/\/tester\/([^/]+)\/test\//)?.[1] ?? ''
    if (!resultatIRamen(slug)) return <HemLaddar />
  }
  return <Golv resultat={resultat} />
}
