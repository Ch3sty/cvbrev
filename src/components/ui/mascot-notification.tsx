'use client'

import React, { useEffect, useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export interface MascotNotificationProps {
  isVisible: boolean
  message: string
  type?: 'loading' | 'success' | 'error' | 'info'
  mascotImage?: string
  onClose?: () => void
  duration?: number
  showConfetti?: boolean
}

// Confetti piece component (adapted from GenerationStep.tsx)
const ConfettiPiece = ({ delay, index, prefersReducedMotion }: {
  delay: number
  index: number
  prefersReducedMotion: boolean
}) => {
  const colors = ['#3B82F6', '#8B5CF6', '#D946EF', '#FB923C', '#10B981', '#F59E0B', '#EC4899']
  const color = colors[index % colors.length]
  const startX = (Math.random() - 0.5) * 100 // -50 to 50
  const endX = startX + (Math.random() - 0.5) * 300 // Random horizontal drift
  const rotation = Math.random() * 720 - 360 // -360 to 360 degrees
  const size = Math.random() * 8 + 6 // 6-14px

  // Don't render confetti if user prefers reduced motion
  if (prefersReducedMotion) {
    return null
  }

  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: -20,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }}
      initial={{
        x: startX,
        y: -20,
        rotate: 0,
        opacity: 1
      }}
      animate={{
        x: endX,
        y: 400,
        rotate: rotation,
        opacity: [1, 1, 0.8, 0]
      }}
      transition={{
        duration: 2.5 + Math.random() * 1,
        delay,
        ease: [0.32, 0, 0.67, 0]
      }}
    />
  )
}

export default function MascotNotification({
  isVisible,
  message,
  type = 'success',
  mascotImage,
  onClose,
  duration,
  showConfetti = true
}: MascotNotificationProps) {
  const [visible, setVisible] = useState(isVisible)
  const [imageError, setImageError] = useState(false)

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // Sync visibility
  useEffect(() => {
    setVisible(isVisible)
    if (isVisible) {
      setImageError(false) // Reset image error on new notification
    }
  }, [isVisible])

  // Auto-close
  useEffect(() => {
    if (!visible || !duration) return
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        setVisible(false)
        if (onClose) onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [visible, onClose])

  if (!visible) return null

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-500',
          glow: 'rgba(16, 185, 129, 0.6)',
          textColor: 'text-slate-900'
        }
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-500',
          glow: 'rgba(239, 68, 68, 0.6)',
          textColor: 'text-slate-900'
        }
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-500',
          glow: 'rgba(59, 130, 246, 0.6)',
          textColor: 'text-slate-900'
        }
      case 'loading':
      default:
        return {
          bg: 'bg-gradient-to-r from-pink-50 to-purple-50',
          border: 'border-pink-500',
          glow: 'rgba(236, 72, 153, 0.6)',
          textColor: 'text-slate-900'
        }
    }
  }

  const colors = getTypeColors()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-5 right-5 z-[100] max-w-sm w-full"
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -10 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.5,
          ease: prefersReducedMotion ? 'linear' : [0.34, 1.56, 0.64, 1]
        }}
        role="alert"
        aria-live="polite"
      >
        {/* Confetti */}
        {showConfetti && type === 'success' && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(25)].map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 0.03}
                index={i}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className={`px-4 py-4 ${colors.bg} border-l-4 ${colors.border}`}>
            <div className="flex items-start gap-4">
              {/* Mascot Image */}
              <div className="flex-shrink-0 relative w-32 h-32 overflow-hidden rounded-2xl">
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ boxShadow: `0 0 40px 10px ${colors.glow}` }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {mascotImage && !imageError ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={mascotImage}
                      alt="Success mascot"
                      fill
                      unoptimized
                      className="object-cover scale-150 drop-shadow-2xl"
                      style={{ objectPosition: 'center' }}
                      onError={() => setImageError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 pt-2">
                <p className={`text-base font-semibold ${colors.textColor} leading-relaxed`}>
                  {message}
                </p>
              </div>

              {/* Close Button */}
              {onClose && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false)
                    onClose()
                  }}
                  className="flex-shrink-0 inline-flex rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
                  aria-label="Stäng notifikation"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
