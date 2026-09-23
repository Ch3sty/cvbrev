/**
 * Hemskärmen (docs/design/analys-visuell-linje-2026-09-22.html, avsnitt 3).
 *
 * Serverdelen: den klientrenderade hemskärmen (DashboardHem) får sin
 * initiala data ur layoutens summering, och aktiviteten strömmas in som en
 * serverkomponent i en Suspense-gräns, så den aldrig väntar på eller
 * fördröjer första målningen.
 */

import { Suspense } from 'react'
import DashboardHem from './(oversikt)/DashboardHem'
import HemAktivitet from './(oversikt)/HemAktivitet'

export default function DashboardPage() {
  return (
    <DashboardHem
      aktivitet={
        <Suspense fallback={null}>
          <HemAktivitet />
        </Suspense>
      }
    />
  )
}
