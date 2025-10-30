/**
 * Fil: src/components/kontakt/KontaktInfo.tsx
 *
 * Beskrivning:
 * Återanvändbar komponent som visar kontaktinformation (email-adresser och FAQ-länk).
 * Kan användas både på offentlig sida och i dashboard.
 */
'use client'

import Link from 'next/link'
import { Mail, Info, HelpCircle } from 'lucide-react'

interface KontaktInfoProps {
  variant?: 'public' | 'dashboard'
}

export default function KontaktInfo({ variant = 'public' }: KontaktInfoProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
        Specifika ärenden
      </h3>

      {/* Info-mail */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-white" />
          </div>
          <h4 className="ml-4 text-lg font-semibold text-slate-900">Allmänna frågor</h4>
        </div>
        <p className="text-slate-600 mb-3 text-sm leading-relaxed">
          Frågor om funktioner, samarbeten eller feedback? Maila:
        </p>
        <a
          href="mailto:info@jobbcoach.ai"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors break-all"
        >
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          info@jobbcoach.ai
        </a>
      </div>

      {/* Support-mail */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/5 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <h4 className="ml-4 text-lg font-semibold text-slate-900">Konto och support</h4>
        </div>
        <p className="text-slate-600 mb-3 text-sm leading-relaxed">
          Problem med inloggning, betalning eller ditt Premium-konto? Kontakta:
        </p>
        <a
          href="mailto:support@jobbcoach.ai"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors break-all"
        >
          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
          support@jobbcoach.ai
        </a>
        <p className="text-xs text-slate-500 mt-3">
          Premium-användare har prioriterad hantering.
        </p>
      </div>

      {/* FAQ-länk */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h4 className="ml-3 text-lg font-semibold text-slate-900">Vanliga frågor</h4>
        </div>
        <p className="text-slate-700 mb-4 text-sm leading-relaxed">
          Hitta svar direkt i vår FAQ om funktioner, priser och användning.
        </p>
        <Link
          href="/#faq"
          className="inline-flex items-center font-medium text-blue-600 hover:text-blue-700 group transition-colors"
        >
          Gå till FAQ
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
