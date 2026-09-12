/**
 * Fil: src/app/dashboard/bugg-feedback/page.tsx
 *
 * Beskrivning:
 * Dashboard-sida för att rapportera buggar och skicka feedback.
 */
'use client'

import { motion } from 'framer-motion'
import { Bug, MessageSquare } from 'lucide-react'
import BuggFeedbackForm from '@/components/dashboard/bugg-feedback/BuggFeedbackForm'

export default function BuggFeedbackPage() {
  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0 flex items-center justify-center">
            <Bug className="w-5 h-5 text-neutral-700" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 truncate">
              Buggar & Feedback
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-1 font-medium">
              Hjälp oss att göra Jobbcoach.ai bättre
            </p>
          </div>
        </div>
      </motion.div>

      {/* Formulär */}
      <BuggFeedbackForm />
    </div>
  )
}
