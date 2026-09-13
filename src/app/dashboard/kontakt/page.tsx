/**
 * Fil: src/app/dashboard/kontakt/page.tsx
 *
 * Dashboard-varianten av kontaktsidan. Sidhuvud enligt sidmallen, sedan
 * formuläret och kontaktvägarna i var sin kolumn från lg.
 */
'use client'

import PageHeader from '@/components/shell/PageHeader'
import KontaktForm from '@/components/kontakt/KontaktForm'
import KontaktInfo from '@/components/kontakt/KontaktInfo'

export default function DashboardKontaktPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        title="Kontakta oss"
        description="Skriv till oss här, eller välj den adress som passar ditt ärende."
      />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
        <KontaktForm variant="dashboard" />
        <KontaktInfo variant="dashboard" />
      </div>
    </div>
  )
}
