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

// Confetti piece component
const ConfettiPiece = ({ delay, index, prefersReducedMotion }: {
  delay: number
  index: number
  prefersReducedMotion: boolean
}) => {
  const colors = ['#3B82F6', '#8B5CF6', '#D946EF', '#FB923C', '#10B981', '#F59E0B', '#EC4899']
  const color = colors[index % colors.length]
  const startX = (Math.random() - 0.5) * 100
  const endX = startX + (Math.random() - 0.5) * 300
  const rotation = Math.random() * 720 - 360
  const size = Math.random() * 8 + 6

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

// ALT 1: INGEN CROP - Ren SVG med subtil skugga
export default function MascotNotificationAlt1({
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

  useEffect(() => {
    setVisible(isVisible)
    if (isVisible) {
      setImageError(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (!visible || !duration) return
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onClose])

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
          glow: 'rgba(16, 185, 129, 0.5)',
          glowRGB: 'rgba(16, 185, 129, 0.2)',
          shadow: 'shadow-green-500/15',
          accentText: 'text-green-700'
        }
      case 'error':
        return {
          glow: 'rgba(239, 68, 68, 0.5)',
          glowRGB: 'rgba(239, 68, 68, 0.2)',
          shadow: 'shadow-red-500/15',
          accentText: 'text-red-700'
        }
      case 'info':
        return {
          glow: 'rgba(59, 130, 246, 0.5)',
          glowRGB: 'rgba(59, 130, 246, 0.2)',
          shadow: 'shadow-blue-500/15',
          accentText: 'text-blue-700'
        }
      case 'loading':
      default:
        return {
          glow: 'rgba(236, 72, 153, 0.5)',
          glowRGB: 'rgba(236, 72, 153, 0.2)',
          shadow: 'shadow-pink-500/15',
          accentText: 'text-pink-700'
        }
    }
  }

  const colors = getTypeColors()

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-5 right-5 z-[100] max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0, x: 100 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ scale: 0.95, opacity: 0, x: 50 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : 0.4,
          ease: prefersReducedMotion ? 'linear' : [0.16, 1, 0.3, 1]
        }}
        role="alert"
        aria-live="polite"
      >
        {/* Confetti */}
        {showConfetti && type === 'success' && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(12)].map((_, i) => (
              <ConfettiPiece
                key={i}
                delay={i * 0.05}
                index={i}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        )}

        <div className={`bg-white/98 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl ${colors.shadow} overflow-hidden`}>
          <div className="p-3">
            <div className="flex items-center gap-4">
              {/* ALT 1: Stor SVG med multi-layer drop-shadow */}
              <div className="flex-shrink-0 relative w-40 h-40">
                {/* Animated glow ring */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {mascotImage && !imageError ? (
                  <motion.div
                    className="relative w-full h-full"
                    initial={{ scale: 0.8, rotate: -5 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  >
                    <Image
                      src={mascotImage}
                      alt="Success mascot"
                      width={160}
                      height={160}
                      unoptimized
                      className="w-full h-full object-contain relative z-10"
                      style={{
                        filter: `
                          drop-shadow(0 6px 10px rgba(0,0,0,0.1))
                          drop-shadow(0 12px 20px rgba(0,0,0,0.08))
                          drop-shadow(0 0 40px ${colors.glowRGB})
                        `,
                        transform: 'scale(1.15)'
                      }}
                      onError={() => setImageError(true)}
                    />
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CheckCircle className={`w-20 h-20 ${colors.accentText}`} />
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                  {message.split('!')[0]}!
                </h3>
                {message.split('!')[1] && (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {message.split('!')[1].trim()}
                  </p>
                )}
              </div>

              {/* Close Button */}
              {onClose && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setVisible(false)
                    onClose()
                  }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 inline-flex rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
                  aria-label="Stäng notifikation"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
