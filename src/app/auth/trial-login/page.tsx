'use client'

// src/app/auth/trial-login/page.tsx
// ==================================
// Frontend page for one-time login token authentication
// Validates token and redirects to dashboard with active session

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

type LoginState = 'validating' | 'success' | 'error' | 'expired' | 'used'

function TrialLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<LoginState>('validating')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setState('error')
      setErrorMessage('Ingen token hittades i länken')
      return
    }

    // Validate token and create session
    const validateToken = async () => {
      try {
        // Step 1: Validate our custom token
        const response = await fetch('/api/auth/trial-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle specific error codes
          if (data.code === 'TOKEN_USED') {
            setState('used')
          } else if (data.code === 'TOKEN_EXPIRED') {
            setState('expired')
          } else {
            setState('error')
            setErrorMessage(data.error || 'Kunde inte validera token')
          }
          return
        }

        // Step 2: Use the token hash to create a Supabase session
        if (!data.tokenHash) {
          setState('error')
          setErrorMessage('Kunde inte skapa session')
          return
        }

        // Create Supabase client and verify the OTP hash
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: data.type as any
        })

        if (verifyError) {
          console.error('[TRIAL LOGIN] Session verification error:', verifyError)
          setState('error')
          setErrorMessage('Kunde inte skapa session. Försök igen.')
          return
        }

        // Success! User is now logged in
        setState('success')

        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)

      } catch (error: any) {
        console.error('[TRIAL LOGIN] Error:', error)
        setState('error')
        setErrorMessage('Ett oväntat fel uppstod. Försök igen.')
      }
    }

    validateToken()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

        {/* Validating state */}
        {state === 'validating' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-pink-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Loggar in...
            </h1>
            <p className="text-gray-600">
              Vänligen vänta medan vi verifierar din inloggningslänk
            </p>
          </div>
        )}

        {/* Success state */}
        {state === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inloggning lyckades!
            </h1>
            <p className="text-gray-600">
              Du omdirigeras till din instrumentpanel...
            </p>
          </div>
        )}

        {/* Token already used */}
        {state === 'used' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Länk redan använd
            </h1>
            <p className="text-gray-600 mb-6">
              Denna inloggningslänk har redan använts. Varje länk kan endast användas en gång av säkerhetsskäl.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
            >
              Gå till inloggning
            </button>
          </div>
        )}

        {/* Token expired */}
        {state === 'expired' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Länken har gått ut
            </h1>
            <p className="text-gray-600 mb-6">
              Denna inloggningslänk har gått ut. Inloggningslänkar är giltiga i 1 timme av säkerhetsskäl.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
            >
              Begär ny inloggningslänk
            </button>
          </div>
        )}

        {/* Generic error state */}
        {state === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Något gick fel
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'Vi kunde inte verifiera din inloggningslänk. Försök igen eller kontakta support.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all"
              >
                Försök igen
              </button>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all"
              >
                Gå till inloggning
              </button>
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Behöver du hjälp?{' '}
            <a href="mailto:support@jobbcoach.ai" className="text-pink-600 hover:text-pink-700 font-medium">
              Kontakta support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TrialLoginPage() {
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
      <TrialLoginContent />
    </Suspense>
  )
}
