'use client'

// src/components/trial/EmbeddedCheckout.tsx
// Steg 2: Stripe embedded checkout för betalning

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout as StripeEmbeddedCheckout } from '@stripe/react-stripe-js'

interface EmbeddedCheckoutProps {
  signupData: {
    userId: string
    email: string
    stripeCustomerId: string
    password: string
  }
  onBack: () => void
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function EmbeddedCheckout({ signupData, onBack }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create Stripe checkout session
    const createCheckoutSession = async () => {
      try {
        console.log('[EMBEDDED CHECKOUT] Creating session for:', signupData.email)

        const response = await fetch('/api/stripe/create-trial-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripeCustomerId: signupData.stripeCustomerId,
            userId: signupData.userId,
            email: signupData.email
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Kunde inte skapa checkout-session')
        }

        console.log('[EMBEDDED CHECKOUT] Session created successfully')
        setClientSecret(data.clientSecret)
        setIsLoading(false)

        // Auto-login is now handled via database token (not sessionStorage)

      } catch (error: any) {
        console.error('[EMBEDDED CHECKOUT] Error:', error)
        setError(error.message)
        setIsLoading(false)
      }
    }

    createCheckoutSession()
  }, [signupData])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Lägg till betalningsmetod
        </h2>
        <p className="text-slate-600">
          Du debiteras <strong>0 kr idag</strong>. Efter 7 dagar: 149 kr/månad.
        </p>
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Tillbaka till kontouppgifter</span>
      </button>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600">Laddar betalningsformulär...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm underline mt-1"
              >
                Försök igen
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stripe Embedded Checkout */}
      {clientSecret && !error && (
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <StripeEmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          🔒 SSL-krypterad
        </span>
        <span className="flex items-center gap-1">
          💳 Stripe-säker
        </span>
        <span className="flex items-center gap-1">
          ✓ PCI-DSS kompatibel
        </span>
      </div>

      {/* Important info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">Viktigt att veta:</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Ingen kostnad de första 7 dagarna</li>
          <li>• Efter trial: 149 kr/månad</li>
          <li>• Avsluta när som helst - ingen bindningstid</li>
          <li>• Direkt tillgång till alla premiumfunktioner</li>
        </ul>
      </div>
    </div>
  )
}
