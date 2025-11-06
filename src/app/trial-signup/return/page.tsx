'use client'

// src/app/trial-signup/return/page.tsx
// =====================================
// Success page efter Stripe checkout
// Auto-loggar in användaren och omdirigerar till dashboard

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Status = 'verifying' | 'success' | 'error'

function ReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('verifying')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleReturn = async () => {
      const sessionId = searchParams.get('session_id')
      const token = searchParams.get('token')

      if (!sessionId) {
        setStatus('error')
        setError('Ingen session-ID hittades')
        return
      }

      if (!token) {
        setStatus('error')
        setError('Ingen login-token hittades. Försök logga in manuellt.')
        return
      }

      console.log('[TRIAL RETURN] Processing session:', sessionId)

      try {
        // Verify and use login token for auto-login
        const response = await fetch('/api/auth/verify-login-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          console.error('[TRIAL RETURN] Token verification failed:', data.error)
          setStatus('error')
          setError(data.error || 'Kunde inte verifiera login-token. Försök logga in manuellt.')
          return
        }

        console.log('[TRIAL RETURN] Auto-login successful via token')

        // Show success briefly before redirect
        setStatus('success')

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)

      } catch (error: any) {
        console.error('[TRIAL RETURN] Unexpected error:', error)
        setStatus('error')
        setError('Ett oväntat fel uppstod')
      }
    }

    handleReturn()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full">

        {/* Verifying state */}
        {status === 'verifying' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bekräftar din registrering...
            </h1>
            <p className="text-slate-600">
              Vänligen vänta medan vi aktiverar ditt Premium-konto
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse" />
                <CheckCircle className="relative w-16 h-16 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Välkommen till Premium!
            </h1>
            <p className="text-slate-600">
              Din 7-dagars gratisperiod har startat. Du omdirigeras till instrumentpanelen...
            </p>
            <div className="flex justify-center gap-1 pt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Något gick fel
            </h1>
            <p className="text-slate-600">
              {error || 'Vi kunde inte slutföra din registrering.'}
            </p>
            <div className="space-y-3 pt-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gå till inloggning
              </button>
              <button
                onClick={() => router.push('/kontakt')}
                className="w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Kontakta support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <ReturnContent />
    </Suspense>
  )
}
