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

  if (prefersReducedMotion) return null

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
      initial={{ x: startX, y: -20, rotate: 0, opacity: 1 }}
      animate={{ x: endX, y: 400, rotate: rotation, opacity: [1, 1, 0.8, 0] }}
      transition={{ duration: 2.5 + Math.random() * 1, delay, ease: [0.32, 0, 0.67, 0] }}
    />
  )
}

// ALT 3: HEXAGON/POLYGON SHAPE
export default function MascotNotificationAlt3({
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
    if (isVisible) setImageError(false)
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
          gradient: 'from-green-400 via-emerald-500 to-teal-500',
          shadow: 'shadow-green-500/25',
          glow: 'rgba(16, 185, 129, 0.4)',
          accentText: 'text-green-700'
        }
      case 'error':
        return {
          gradient: 'from-red-400 via-rose-500 to-pink-500',
          shadow: 'shadow-red-500/25',
          glow: 'rgba(239, 68, 68, 0.4)',
          accentText: 'text-red-700'
        }
      case 'info':
        return {
          gradient: 'from-blue-400 via-indigo-500 to-purple-500',
          shadow: 'shadow-blue-500/25',
          glow: 'rgba(59, 130, 246, 0.4)',
          accentText: 'text-blue-700'
        }
      case 'loading':
      default:
        return {
          gradient: 'from-pink-400 via-purple-500 to-fuchsia-500',
          shadow: 'shadow-pink-500/25',
          glow: 'rgba(236, 72, 153, 0.4)',
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
        {showConfetti && type === 'success' && !prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {[...Array(12)].map((_, i) => (
              <ConfettiPiece key={i} delay={i * 0.05} index={i} prefersReducedMotion={prefersReducedMotion} />
            ))}
          </div>
        )}

        <div className={`bg-white/98 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl ${colors.shadow} overflow-hidden`}>
          <div className="p-4">
            <div className="flex items-center gap-5">
              {/* ALT 3: Hexagon shape with gradient border */}
              <div className="flex-shrink-0 relative w-32 h-32">
                {/* Hexagon container */}
                <motion.div
                  className="relative w-full h-full"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {/* Gradient border (hexagon) */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} p-[3px]`}
                    style={{
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                    }}
                  >
                    {/* White background */}
                    <div
                      className="w-full h-full bg-white"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                      }}
                    />
                  </div>

                  {/* Glow effect */}
                  {!prefersReducedMotion && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                        boxShadow: `0 0 40px 10px ${colors.glow}`
                      }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  {/* Mascot image */}
                  {mascotImage && !imageError ? (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0.8, rotate: -5 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                      }}
                    >
                      <Image
                        src={mascotImage}
                        alt="Success mascot"
                        width={100}
                        height={100}
                        unoptimized
                        className="object-contain drop-shadow-lg"
                        onError={() => setImageError(true)}
                      />
                    </motion.div>
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-slate-50"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
                      }}
                    >
                      <CheckCircle className={`w-12 h-12 ${colors.accentText}`} />
                    </div>
                  )}
                </motion.div>
              </div>

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
