/**
 * Fil: src/app/dashboard/kontakt/page.tsx
 *
 * Dashboard-varianten av kontaktsidan. Rubriken på kontots vägg (Rummen
 * våg 1b), sedan formuläret och kontaktvägarna i var sin kolumn från lg.
 */
'use client'

import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import KontaktForm from '@/components/kontakt/KontaktForm'
import KontaktInfo from '@/components/kontakt/KontaktInfo'

export default function DashboardKontaktPage() {
  return (
    <>
      <RumHuvud
        title="Kontakta oss"
        description="Skriv till oss här, eller välj den adress som passar ditt ärende."
      />
      <Golv>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
          <KontaktForm variant="dashboard" />
          <KontaktInfo variant="dashboard" />
        </div>
      </Golv>
    </>
  )
}
