/**
 * Fil: src/app/dashboard/bugg-feedback/page.tsx
 *
 * Dashboard-sida för att rapportera buggar och skicka feedback. Sidhuvud
 * enligt sidmallen, formuläret nedanför.
 */
'use client'

import PageHeader from '@/components/shell/PageHeader'
import BuggFeedbackForm from '@/components/dashboard/bugg-feedback/BuggFeedbackForm'

export default function BuggFeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader
        title="Buggar och feedback"
        description="Berätta vad som gick fel eller vad vi borde göra bättre. Vi läser allt."
      />

      <BuggFeedbackForm />
    </div>
  )
}
