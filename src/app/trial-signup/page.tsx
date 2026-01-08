'use client'

// src/app/trial-signup/page.tsx
// ==================================
// Moz-stil trial signup med tre steg på samma sida
// Steg 1: Email + lösenord
// Steg 2: Stripe embedded checkout
// Steg 3: Payment processing & auto-login

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

import SignupForm from '@/components/trial/SignupForm'
import PremiumFeatures from '@/components/trial/PremiumFeatures'
import EmbeddedCheckout from '@/components/trial/EmbeddedCheckout'
import PaymentProcessing from '@/components/trial/PaymentProcessing'

type Step = 'signup' | 'billing' | 'processing'

interface SignupData {
  userId: string
  email: string
  stripeCustomerId: string
  password: string
}

function TrialSignupContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>('signup')
  const [signupData, setSignupData] = useState<SignupData | null>(null)

  // Check if returning from Stripe checkout
  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const token = searchParams.get('token')

    if (sessionId && token) {
      console.log('[TRIAL SIGNUP PAGE] Returning from Stripe checkout, showing processing step')
      setCurrentStep('processing')
    }
  }, [searchParams])

  const handleSignupSuccess = (data: SignupData) => {
    console.log('[TRIAL SIGNUP PAGE] Step 1 completed, moving to billing')
    setSignupData(data)
    setCurrentStep('billing')
  }

  const handleBackToSignup = () => {
    setCurrentStep('signup')
  }

  const token = searchParams.get('token')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {currentStep !== 'processing' ? (
              <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Tillbaka</span>
              </Link>
            ) : (
              <div className="w-24" />
            )}

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 'signup'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'bg-green-100 text-green-700'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'signup'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}>
                  {currentStep === 'signup' ? '1' : '✓'}
                </div>
                <span className="text-sm hidden sm:inline">Skapa konto</span>
              </div>

              <div className="h-0.5 w-8 sm:w-12 bg-slate-200" />

              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 'billing'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : currentStep === 'processing'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'billing'
                    ? 'bg-blue-600 text-white'
                    : currentStep === 'processing'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-300 text-white'
                }`}>
                  {currentStep === 'processing' ? '✓' : '2'}
                </div>
                <span className="text-sm hidden sm:inline">Betalning</span>
              </div>

              <div className="h-0.5 w-8 sm:w-12 bg-slate-200" />

              <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                currentStep === 'processing'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === 'processing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-300 text-white'
                }`}>
                  3
                </div>
                <span className="text-sm hidden sm:inline">Aktiverar</span>
              </div>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left column - Forms */}
          <div className="order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {currentStep === 'signup' && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SignupForm onSuccess={handleSignupSuccess} />
                </motion.div>
              )}

              {currentStep === 'billing' && signupData && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <EmbeddedCheckout
                    signupData={signupData}
                    onBack={handleBackToSignup}
                  />
                </motion.div>
              )}

              {currentStep === 'processing' && token && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <PaymentProcessing token={token} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column - Premium features (hide during processing) */}
          {currentStep !== 'processing' && (
            <div className="order-1 lg:order-2">
              <PremiumFeatures />
            </div>
          )}

          {/* Full width during processing */}
          {currentStep === 'processing' && (
            <div className="order-1 lg:order-2 flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Betalning genomförd!
                  </h2>
                  <p className="text-slate-600">
                    Vi aktiverar nu ditt Premium-konto med alla funktioner.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Din 7-dagars gratisperiod har startat!</strong><br />
                    Du debiteras 0 kr idag. Efter trial: 149 kr/månad.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      {currentStep !== 'processing' && (
        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
              <p>© 2026 Jobbcoach.ai. Alla rättigheter förbehållna.</p>
              <div className="flex items-center gap-4">
                <Link href="/integritetspolicy" className="hover:text-slate-700 transition-colors">
                  Integritetspolicy
                </Link>
                <Link href="/kontakt" className="hover:text-slate-700 transition-colors">
                  Kontakt
                </Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function TrialSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <TrialSignupContent />
    </Suspense>
  )
}
