/**
 * Fil: src/app/dashboard/kontakt/page.tsx
 *
 * Beskrivning:
 * Dashboard-variant av kontaktsidan. Kompaktare layout utan hero-sektion.
 * Visas som en del av dashboard-upplevelsen.
 */
'use client'

import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import KontaktForm from '@/components/kontakt/KontaktForm'
import KontaktInfo from '@/components/kontakt/KontaktInfo'

export default function DashboardKontaktPage() {
  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <Mail className="w-8 h-8 sm:w-9 sm:h-9 text-neutral-700 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 truncate">
              Kontakta oss
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-1 font-medium">
              Välj rätt kanal eller skicka ett meddelande
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid med formulär och kontaktinfo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Formulär */}
        <KontaktForm variant="dashboard" />

        {/* Kontaktinformation */}
        <KontaktInfo variant="dashboard" />
      </div>
    </div>
  )
}
