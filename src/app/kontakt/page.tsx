/**
 * Fil: src/app/kontakt/page.tsx
 *
 * Beskrivning:
 * Offentlig kontaktsida för Jobbcoach.ai. Mobilanpassad och med ljust tema.
 * Innehåller hero-sektion, kontaktinformation och formulär för meddelanden.
 */
'use client'

import { motion } from 'framer-motion'
import KontaktHero from '@/components/kontakt/KontaktHero'
import KontaktForm from '@/components/kontakt/KontaktForm'
import KontaktInfo from '@/components/kontakt/KontaktInfo'

export default function KontaktPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Hero Section */}
      <KontaktHero />

      {/* Kontaktformulär & Info Section */}
      <section id="kontakt-form" aria-labelledby="contact-form-heading" className="py-12 sm:py-16 lg:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16">
              {/* Kolumn 1: Formulär */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:col-span-1"
              >
                <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-900/5">
                  <h2 id="contact-form-heading" className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                    Skicka ett meddelande
                  </h2>
                  <KontaktForm variant="public" />
                </div>
              </motion.div>

              {/* Kolumn 2: Kontaktinfo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="md:col-span-1 mt-8 md:mt-0"
              >
                <KontaktInfo variant="public" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
