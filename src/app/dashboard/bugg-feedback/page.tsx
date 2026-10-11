/**
 * Fil: src/app/dashboard/bugg-feedback/page.tsx
 *
 * Dashboard-sida för att rapportera buggar och skicka feedback. Rubriken
 * på kontots vägg (Rummen våg 1b), formuläret på golvet.
 */
'use client'

import RumHuvud from '@/components/rum/RumHuvud'
import Golv from '@/components/rum/Golv'
import BuggFeedbackForm from '@/components/dashboard/bugg-feedback/BuggFeedbackForm'

export default function BuggFeedbackPage() {
  return (
    <>
      <RumHuvud
        title="Buggar och feedback"
        description="Berätta vad som gick fel eller vad vi borde göra bättre. Vi läser allt."
      />
      <Golv>
        <div className="w-full max-w-3xl">
          <BuggFeedbackForm />
        </div>
      </Golv>
    </>
  )
}
