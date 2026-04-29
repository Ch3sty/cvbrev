'use client'

// src/app/trial-signup/return/page.tsx
// =====================================
// Success page efter Stripe checkout
// Auto-loggar in användaren och omdirigerar till dashboard

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Toast from '@/components/ui/toast/Toast'
import Image from 'next/image'

type Status = 'verifying' | 'activating' | 'finalizing' | 'success' | 'error'

// Floating particle component
const Particle = ({ delay, color, prefersReducedMotion }: { delay: number; color: string; prefersReducedMotion: boolean }) => {
  const startX = Math.random() * 160 - 80
  const startY = Math.random() * 160 - 80
  const randomX = Math.random() * 200 - 100
  const randomY = Math.random() * 200 - 100
  const size = Math.random() * 8 + 4

  if (prefersReducedMotion) {
    return null
  }

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
        opacity: 0
      }}
      initial={{
        x: startX,
        y: startY,
        opacity: 0.4
      }}
      animate={{
        x: [startX, randomX, startX],
        y: [startY, randomY, startY],
        scale: [1, 1.5, 1],
        opacity: [0.4, 0.7, 0.4]
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  )
}

const mascotStages = [
  {
    image: '/images/maskot/payment-verifying.svg',
    text: 'Verifierar ditt betalkort',
    color: 'from-blue-500/20 to-indigo-500/20',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  {
    image: '/images/maskot/payment-activating.svg',
    text: 'Aktiverar ditt Premium-konto',
    color: 'from-purple-500/20 to-pink-500/20',
    glowColor: 'rgba(168, 85, 247, 0.5)'
  },
  {
    image: '/images/maskot/payment-finalizing.svg',
    text: 'Slutför aktivering',
    color: 'from-emerald-500/20 to-amber-500/20',
    glowColor: 'rgba(16, 185, 129, 0.6)'
  }
]

function ReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('verifying')
  const [currentStage, setCurrentStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const [showNotification, setShowNotification] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loginComplete, setLoginComplete] = useState(false)

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // Preload mascot images
  useEffect(() => {
    const imagePromises = mascotStages.map((stage) => {
      return new Promise<void>((resolve, reject) => {
        const img = new window.Image()
        img.src = stage.image
        img.onload = () => resolve()
        img.onerror = () => reject()
      })
    })

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true))
  }, [])

  // Simulate progress through stages
  useEffect(() => {
    if (status !== 'verifying' && status !== 'activating' && status !== 'finalizing') {
      return
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2

        // Update stage based on progress
        if (newProgress >= 66 && currentStage < 2) {
          setCurrentStage(2)
          setStatus('finalizing')
        } else if (newProgress >= 33 && currentStage < 1) {
          setCurrentStage(1)
          setStatus('activating')
        }

        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100)

    return () => clearInterval(progressInterval)
  }, [status, currentStage])

  // Handle login verification (only once)
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
        // Verify login token and get magic link hash
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

        // Use the hashed token to verify and create session
        const supabase = createClient()
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.tokenHash,
          type: 'magiclink'
        })

        if (verifyError) {
          console.error('[TRIAL RETURN] OTP verification failed:', verifyError)
          setStatus('error')
          setError('Kunde inte aktivera session. Försök logga in manuellt.')
          return
        }

        console.log('[TRIAL RETURN] Auto-login successful via magic link')
        setLoginComplete(true)

      } catch (error: any) {
        console.error('[TRIAL RETURN] Unexpected error:', error)
        setStatus('error')
        setError('Ett oväntat fel uppstod')
      }
    }

    handleReturn()
  }, [searchParams, router])

  // Handle success transition when both login and progress are complete
  useEffect(() => {
    if (loginComplete && progress >= 100) {
      setStatus('success')
      setShowNotification(true)

      // Redirect to dashboard after notification
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }, [loginComplete, progress, router])

  // Loading images state
  if (!imagesLoaded && status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  const stage = mascotStages[currentStage]

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* Verifying/Activating/Finalizing state */}
          {(status === 'verifying' || status === 'activating' || status === 'finalizing') && (
            <div className="text-center py-12">
              {/* Mascot container */}
              <div className="w-64 h-64 mx-auto mb-8 relative">
                {/* Animated gradient background */}
                <motion.div
                  key={`bg-${currentStage}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${stage.color} blur-3xl`}
                />

                {/* Pulsating glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 60px 20px ${stage.glowColor}`
                  }}
                  animate={prefersReducedMotion ? {} : {
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: prefersReducedMotion ? 0 : Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-visible pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <Particle
                      key={`${currentStage}-${i}`}
                      delay={i * 0.3}
                      color={stage.glowColor}
                      prefersReducedMotion={prefersReducedMotion}
                    />
                  ))}
                </div>

                {/* Circular progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="120"
                    stroke="rgba(229, 231, 235, 0.3)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="120"
                    stroke={stage.glowColor}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 120}`,
                      strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}`,
                      transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.7s ease-out'
                    }}
                  />
                </svg>

                {/* Animated Mascot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStage}
                      initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
                      animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: -20 }}
                      transition={{
                        duration: prefersReducedMotion ? 0.15 : 0.3,
                        ease: prefersReducedMotion ? "linear" : [0.34, 1.56, 0.64, 1]
                      }}
                    >
                      <Image
                        src={stage.image}
                        alt={stage.text}
                        width={192}
                        height={192}
                        unoptimized
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Stage text */}
              <AnimatePresence mode="wait">
                <motion.h3
                  key={currentStage}
                  initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                  transition={{ duration: prefersReducedMotion ? 0.15 : 0.3 }}
                  className="text-2xl font-semibold text-gray-900 mb-2"
                >
                  {stage.text}
                </motion.h3>
              </AnimatePresence>

              <p className="text-gray-600 mb-8">
                Vänligen vänta medan vi aktiverar ditt konto
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto mb-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 rounded-full relative transition-all duration-500"
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Progress Percentage */}
              <div className="flex items-center justify-center w-full max-w-md mx-auto text-sm mb-8">
                <span className="text-gray-600 font-medium">
                  {Math.round(progress)}% klart
                </span>
              </div>

              {/* Stage indicators */}
              <div className="flex gap-3 justify-center items-center">
                {mascotStages.map((stageItem, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={false}
                    animate={{
                      scale: (prefersReducedMotion || index !== currentStage) ? 1 : 1.2
                    }}
                    transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
                  >
                    <div
                      className={`h-3 w-3 rounded-full transition-all duration-300 ${
                        index === currentStage
                          ? 'ring-2 ring-offset-2'
                          : ''
                      }`}
                      style={{
                        backgroundColor: index <= currentStage ? stageItem.glowColor : 'rgb(229, 231, 235)',
                        ...(index === currentStage && {
                          '--tw-ring-color': stageItem.glowColor
                        } as React.CSSProperties)
                      }}
                    />

                    {index < mascotStages.length - 1 && (
                      <div
                        className="absolute top-1/2 -right-3 w-3 h-0.5 -translate-y-1/2 transition-all duration-500"
                        style={{
                          backgroundColor: index < currentStage ? stageItem.glowColor : 'rgb(229, 231, 235)',
                          opacity: index < currentStage ? 0.6 : 0.3
                        }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-48 h-48 mx-auto mb-6 relative">
                <Image
                  src="/images/maskot/error-payment-failed.svg"
                  alt="Fel uppstod"
                  width={192}
                  height={192}
                  unoptimized
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                Något gick fel
              </h1>
              <p className="text-slate-600 mb-6">
                {error || 'Vi kunde inte slutföra din registrering.'}
              </p>
              <div className="space-y-3">
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

      {/* Success Notification */}
      {status === 'success' && (
        <Toast
          isVisible={showNotification}
          message="Tack, betalningen är klar. Din 7-dagars gratisperiod har startat."
          type="success"
          scenario="payment-complete"
          onClose={() => setShowNotification(false)}
          duration={3000}
        />
      )}
    </>
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
