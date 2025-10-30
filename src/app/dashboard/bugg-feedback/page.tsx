/**
 * Fil: src/app/dashboard/bugg-feedback/page.tsx
 *
 * Beskrivning:
 * Dashboard-sida för att rapportera buggar och skicka feedback.
 */
'use client'

import BuggFeedbackForm from '@/components/dashboard/bugg-feedback/BuggFeedbackForm'

export default function BuggFeedbackPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Rubrik */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Buggar & Feedback
        </h1>
        <p className="text-slate-600">
          Hjälp oss att göra Jobbcoach.ai bättre genom att rapportera problem eller dela dina idéer.
        </p>
      </div>

      {/* Formulär */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <BuggFeedbackForm />
      </div>
    </div>
  )
}
