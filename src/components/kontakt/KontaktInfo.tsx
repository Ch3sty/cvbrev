/**
 * Fil: src/components/kontakt/KontaktInfo.tsx
 *
 * Beskrivning:
 * Kontaktvägarna (två e-postadresser och FAQ-länken) för den publika sidan
 * och dashboarden.
 *
 * Varianten dashboard följer Tråden: en panel med tre rader, naken ikon 24
 * i ink-2, adressen som textlänk. Den publika varianten behåller sitt
 * utseende tills den publika omgången tas.
 */
'use client'

import Link from 'next/link'
import { Mail, Info, HelpCircle, ArrowRight } from 'lucide-react'
import { IkonMeddelanden, IkonHjalp, IkonSkold } from '@/components/illustrations/Ikoner'

interface KontaktInfoProps {
  variant?: 'public' | 'dashboard'
}

const LINK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:text-ink-2 break-all'

function DashboardInfo() {
  return (
    <section aria-label="Kontaktvägar">
      <h2 className="mb-2 text-sm font-medium text-ink-3">Andra vägar</h2>
      <div className="divide-y divide-kant rounded-xl border border-kant bg-panel">
        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonMeddelanden size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Allmänna frågor</p>
            <p className="mt-0.5 text-meta text-ink-3">Funktioner, samarbeten eller feedback.</p>
            <a href="mailto:info@jobbcoach.ai" className={LINK}>
              info@jobbcoach.ai
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonSkold size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Konto och support</p>
            <p className="mt-0.5 text-meta text-ink-3">
              Inloggning, betalning eller ditt Premium-konto. Premium har förtur.
            </p>
            <a href="mailto:support@jobbcoach.ai" className={LINK}>
              support@jobbcoach.ai
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4">
          <span className="mt-0.5 shrink-0 text-ink-2" aria-hidden="true">
            <IkonHjalp size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-1">Vanliga frågor</p>
            <p className="mt-0.5 text-meta text-ink-3">
              Svar om funktioner, priser och användning.
            </p>
            <Link href="/#faq" className={LINK}>
              Gå till FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function KontaktInfo({ variant = 'public' }: KontaktInfoProps) {
  if (variant === 'dashboard') return <DashboardInfo />

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Info-mail Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Allmänna frågor</h4>
          </div>

          <p className="text-slate-600 mb-3 text-xs sm:text-sm">
            Frågor om funktioner, samarbeten eller feedback? Maila:
          </p>

          <a
            href="mailto:info@jobbcoach.ai"
            className="inline-flex items-center text-emerald-700 hover:text-emerald-800 font-semibold transition-colors break-all text-sm sm:text-base"
          >
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            info@jobbcoach.ai
          </a>
        </div>
      </div>

      {/* Support-mail Card */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6 shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Konto och support</h4>
          </div>

          <p className="text-slate-600 mb-3 text-xs sm:text-sm">
            Problem med inloggning, betalning eller ditt Premium-konto? Kontakta:
          </p>

          <a
            href="mailto:support@jobbcoach.ai"
            className="inline-flex items-center text-blue-700 hover:text-blue-800 font-semibold transition-colors break-all text-sm sm:text-base mb-3"
          >
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            support@jobbcoach.ai
          </a>

          <div className="pt-3 border-t border-blue-200/50">
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Premium-användare har prioriterad hantering
            </p>
          </div>
        </div>
      </div>

      {/* FAQ-länk Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl border border-amber-200 p-4 sm:p-6 shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full -translate-y-8 translate-x-8" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Vanliga frågor</h4>
          </div>

          <p className="text-slate-700 mb-4 text-xs sm:text-sm">
            Hitta svar direkt i vår FAQ om funktioner, priser och användning.
          </p>

          <Link
            href="/#faq"
            className="inline-flex items-center font-semibold text-amber-700 hover:text-amber-800 group transition-colors text-sm sm:text-base"
          >
            Gå till FAQ
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
