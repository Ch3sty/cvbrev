/**
 * Fil: src/app/dashboard/kontakt/page.tsx
 *
 * Beskrivning:
 * Dashboard-variant av kontaktsidan. Kompaktare layout utan hero-sektion.
 * Visas som en del av dashboard-upplevelsen.
 */
'use client'

import KontaktForm from '@/components/kontakt/KontaktForm'
import KontaktInfo from '@/components/kontakt/KontaktInfo'

export default function DashboardKontaktPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Rubrik */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Kontakta oss
        </h1>
        <p className="text-slate-600">
          Välj rätt e-postadress nedan eller skicka ett meddelande via formuläret.
        </p>
      </div>

      {/* Grid med formulär och kontaktinfo */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulär */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Skicka ett meddelande
          </h2>
          <KontaktForm variant="dashboard" />
        </div>

        {/* Kontaktinformation */}
        <div>
          <KontaktInfo variant="dashboard" />
        </div>
      </div>
    </div>
  )
}
