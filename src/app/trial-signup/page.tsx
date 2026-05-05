'use client'

// src/app/trial-signup/page.tsx
// Tre-stegs trial-signup i orange/rod-DNA:
// 1. Skapa konto (email + losenord)
// 2. Betalning (Stripe Embedded Checkout)
// 3. Aktiverar (mascot-vy + auto-login)

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
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

const STEPS: { id: Step; label: string }[] = [
  { id: 'signup', label: 'Skapa konto' },
  { id: 'billing', label: 'Betalning' },
  { id: 'processing', label: 'Aktiverar' },
]

function TrialSignupContent() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>('signup')
  const [signupData, setSignupData] = useState<SignupData | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const token = searchParams.get('token')
    if (sessionId && token) {
      setCurrentStep('processing')
    }
  }, [searchParams])

  const handleSignupSuccess = (data: SignupData) => {
    setSignupData(data)
    setCurrentStep('billing')
  }

  const handleBackToSignup = () => {
    setCurrentStep('signup')
  }

  const token = searchParams.get('token')
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="min-h-screen bg-white">
      {/* Topp-glow */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 h-[400px] -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(249, 115, 22, 0.10) 0%, transparent 65%)',
        }}
      />

      {/* Header */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {currentStep !== 'processing' ? (
              <Link
                href="/priser"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-orange-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">Tillbaka</span>
              </Link>
            ) : (
              <div className="w-16 sm:w-20" />
            )}

            {/* Progress-prickar */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 max-w-md justify-center">
              {STEPS.map((step, i) => {
                const done = i < stepIndex
                const current = i === stepIndex
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                          done || current
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                        style={
                          done || current
                            ? {
                                background:
                                  'linear-gradient(135deg, #F97316, #DC2626)',
                              }
                            : undefined
                        }
                      >
                        {done ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${
                          done || current ? 'text-orange-700' : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 sm:mx-2 mt-[-14px] rounded-full transition-colors ${
                          done ? 'bg-orange-300' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="w-16 sm:w-20" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {currentStep === 'processing' && token ? (
          <ProcessingView token={token} />
        ) : (
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-start">
            {/* Vänster: form */}
            <div className="order-2 lg:order-1">
              <AnimatePresence mode="wait">
                {currentStep === 'signup' && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SignupForm onSuccess={handleSignupSuccess} />
                  </motion.div>
                )}

                {currentStep === 'billing' && signupData && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmbeddedCheckout
                      signupData={signupData}
                      onBack={handleBackToSignup}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Höger: premium-sidopanel */}
            <div className="order-1 lg:order-2">
              <PremiumFeatures />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {currentStep !== 'processing' && (
        <footer className="border-t border-orange-50 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
              <p>© 2026 Jobbcoach.ai. Alla rättigheter förbehållna.</p>
              <div className="flex items-center gap-4">
                <Link
                  href="/integritetspolicy"
                  className="hover:text-orange-700 transition-colors"
                >
                  Integritetspolicy
                </Link>
                <Link
                  href="/kontakt"
                  className="hover:text-orange-700 transition-colors"
                >
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

function ProcessingView({ token }: { token: string }) {
  return (
    <div className="grid lg:grid-cols-2 gap-10 items-start max-w-4xl mx-auto">
      <motion.div
        key="processing"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <PaymentProcessing token={token} />
      </motion.div>

      <div className="flex items-center justify-center">
        <div className="text-center space-y-6 max-w-sm">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #F97316, #DC2626)',
              boxShadow: '0 12px 32px -10px rgba(220, 38, 38, 0.45)',
            }}
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
              Betalning genomförd
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Vi aktiverar Premium-kontot just nu. Du loggas in automatiskt
              om några sekunder.
            </p>
          </div>
          <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-4 text-left">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">
                Sju dagars trial har startat.
              </strong>
              <br />0 kr debiterades idag. Efter trialen: 149 kr per månad,
              avsluta när som helst.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrialSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin" strokeWidth={2.2} />
        </div>
      }
    >
      <TrialSignupContent />
    </Suspense>
  )
}
