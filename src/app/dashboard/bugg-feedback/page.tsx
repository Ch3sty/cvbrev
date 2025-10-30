/**
 * Fil: src/app/dashboard/bugg-feedback/page.tsx
 *
 * Beskrivning:
 * Dashboard-sida för att rapportera buggar och skicka feedback.
 */
'use client'

import BuggFeedbackForm from '@/components/dashboard/bugg-feedback/BuggFeedbackForm'
import { Bug, MessageSquare } from 'lucide-react'

export default function BuggFeedbackPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Rubrik */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Bug className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            Buggar & Feedback
          </h1>
        </div>
        <p className="text-slate-600 text-lg">
          Hjälp oss att göra Jobbcoach.ai bättre! Rapportera buggar eller dela dina idéer.
        </p>
      </div>

      {/* Info-kort */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Bug className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Rapportera bugg</h3>
              <p className="text-sm text-red-700">
                Hittat något som inte fungerar? Låt oss veta så fixar vi det så snart som möjligt.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Skicka feedback</h3>
              <p className="text-sm text-blue-700">
                Har du idéer eller förslag? Din feedback hjälper oss att prioritera rätt funktioner.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulär */}
      <BuggFeedbackForm />
    </div>
  )
}
