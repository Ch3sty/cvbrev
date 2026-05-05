'use client'

// src/components/trial/EmbeddedCheckout.tsx
// Steg 2: Stripe embedded checkout for betalning.
// Stil: orange/rod-DNA wrapper. Sjalva Stripe-formuleret styls via
// Dashboard branding (Settings > Branding) - andra primary color till
// #DC2626 dar.

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Lock, CreditCard } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from '@stripe/react-stripe-js'

interface EmbeddedCheckoutProps {
  signupData: {
    userId: string
    email: string
    stripeCustomerId: string
    password: string
  }
  onBack: () => void
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function EmbeddedCheckout({ signupData, onBack }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        const response = await fetch('/api/stripe/create-trial-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stripeCustomerId: signupData.stripeCustomerId,
            userId: signupData.userId,
            email: signupData.email,
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Kunde inte skapa checkout-session')
        }
        setClientSecret(data.clientSecret)
        setIsLoading(false)
      } catch (err: any) {
        console.error('[EMBEDDED CHECKOUT] Error:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    createCheckoutSession()
  }, [signupData])

  return (
    <div
      className="rounded-3xl bg-white border border-orange-100 p-6 sm:p-8"
      style={{
        boxShadow: '0 12px 40px -16px rgba(249, 115, 22, 0.22)',
      }}
    >
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-orange-700 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        Tillbaka till kontouppgifter
      </button>

      <div className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
          Steg 2 av 2
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5 tracking-tight">
          Lägg till betalningsmetod
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Du debiteras{' '}
          <strong className="text-slate-900">0 kr idag</strong>. Efter sju dagar:{' '}
          149 kr per månad. Avsluta innan dess och du betalar inget.
        </p>
      </div>

      {/* Trust-rad */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 rounded-xl bg-orange-50/60 border border-orange-100 mb-5 text-xs text-slate-700">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <Lock className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          SSL-krypterad
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          Stripe-säker
        </span>
        <span className="inline-flex items-center gap-1.5 font-bold">
          <CreditCard className="w-3.5 h-3.5 text-orange-600" strokeWidth={2.5} />
          PCI-DSS kompatibel
        </span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" strokeWidth={2.2} />
          <p className="text-sm text-slate-600">Laddar betalningsformulär...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-700 underline mt-1"
            >
              Försök igen
            </button>
          </div>
        </motion.div>
      )}

      {/* Stripe Embedded Checkout */}
      {clientSecret && !error && (
        <div className="rounded-2xl overflow-hidden border border-orange-100 bg-white">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <StripeEmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      )}

      {/* Vad du far veta */}
      <div className="mt-6 rounded-xl bg-orange-50/40 border border-orange-100 p-4">
        <h3 className="text-sm font-black text-slate-900 mb-2">Det här gäller:</h3>
        <ul className="space-y-1.5 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <span>Sju dagar gratis Premium med full tillgång till allt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <span>0 kr debiteras idag. Inga avgifter under trialen.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <span>Efter dag åtta: 149 kr per månad. Avsluta när du vill.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
            <span>Vill du inte fortsätta? Avsluta innan dag åtta så betalar du aldrig något.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
