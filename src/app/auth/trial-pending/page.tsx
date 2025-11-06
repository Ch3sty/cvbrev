'use client'

// src/app/auth/trial-pending/page.tsx
// ====================================
// Page shown after successful Stripe checkout
// Instructs user to check email for login link

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, Sparkles, Clock, Shield, Loader2 } from 'lucide-react'
import Link from 'next/link'

function TrialPendingContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    // Try to get email from sessionStorage (set during checkout)
    const storedEmail = sessionStorage.getItem('trial_email')
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 rounded-full p-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Grattis! Din gratisperiod har startat
        </h1>

        <p className="text-center text-gray-600 text-lg mb-8">
          Du har nu tillgång till <strong>alla premiumfunktioner i 7 dagar</strong> – helt gratis!
        </p>

        {/* Email sent notification */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Mail className="w-6 h-6 text-pink-600 mt-1" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900 mb-2">
                Kolla din e-post för inloggningslänk
              </h2>
              {email && (
                <p className="text-sm text-gray-600 mb-2">
                  Vi har skickat ett mejl till <strong>{email}</strong>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Klicka på länken i mejlet för att logga in och komma igång direkt.
                Inloggningslänken är giltig i <strong>1 timme</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* What's included */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600" />
            Det här ingår i din Premium-period:
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Obegränsade CV:n</p>
                <p className="text-sm text-gray-600">Skapa så många du behöver</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">AI-personliga brev</p>
                <p className="text-sm text-gray-600">För varje ansökan</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">12 premiummallar</p>
                <p className="text-sm text-gray-600">Exklusiva designer</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">AI-optimering</p>
                <p className="text-sm text-gray-600">Smarta förbättringsförslag</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">ATS-anpassning</p>
                <p className="text-sm text-gray-600">Optimera för system</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Gamification</p>
                <p className="text-sm text-gray-600">XP, badges & achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important notes */}
        <div className="space-y-3 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              <strong>Kom ihåg:</strong> Efter 7 dagar fortsätter ditt Premium-konto automatiskt för endast 149 kr/månad. Du kan när som helst avbryta i dina kontoinställningar.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <strong>Inte fått mejlet?</strong> Kolla din skräppost-mapp. Mejlet skickas från noreply@jobbcoach.ai
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Behöver du hjälp? Kontakta oss på{' '}
            <a href="mailto:support@jobbcoach.ai" className="text-pink-600 hover:text-pink-700 font-medium">
              support@jobbcoach.ai
            </a>
          </p>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TrialPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-pink-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laddar...
            </h1>
          </div>
        </div>
      </div>
    }>
      <TrialPendingContent />
    </Suspense>
  )
}
