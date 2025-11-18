// src/components/subscription/EmbeddedSubscribeButton.tsx
// ==========================================================
// Embedded checkout button för uppgradering till Premium
// Använder Stripe Embedded Checkout så användare stannar på sidan

'use client'

import { useState } from 'react'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface EmbeddedSubscribeButtonProps {
  priceId: string
  planName: string
  className?: string
  disabled?: boolean
}

export function EmbeddedSubscribeButton({
  priceId,
  planName,
  className = '',
  disabled = false
}: EmbeddedSubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const handleUpgrade = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-upgrade-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || 'Kunde inte skapa checkout-session')
      }

      setClientSecret(data.clientSecret)
      setShowCheckout(true)
    } catch (err: any) {
      console.error('Upgrade error:', err)
      setError(err.message || 'Ett oväntat fel uppstod')
      setLoading(false)
    }
  }

  if (showCheckout && clientSecret) {
    return (
      <div className="w-full">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading || disabled}
        className={
          className ||
          `flex items-center justify-center w-full px-6 py-3
          text-base font-medium rounded-md shadow-sm
          text-white bg-pink-600 hover:bg-pink-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500
          transition-colors duration-150 ease-in-out
          disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed`
        }
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Bearbetar...
          </>
        ) : (
          "Uppgradera till Premium"
        )}
      </button>

      {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}
