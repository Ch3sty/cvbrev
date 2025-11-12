'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Gift, CheckCircle, ArrowRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface UpgradeModalProps {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Focus close button on mount
    closeButtonRef.current?.focus()

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus trap
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const modal = modalRef.current
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        aria-describedby="upgrade-modal-description"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Stäng modal (ESC)"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Heading */}
        <h2 id="upgrade-modal-title" className="text-2xl font-bold text-slate-900 text-center mb-3">
          Du har testat alla 5 gratis meddelanden
        </h2>

        <p id="upgrade-modal-description" className="text-slate-600 text-center mb-6">
          Skapa ett gratis konto för att fortsätta ställa frågor och få tillgång till professionell karriärvägledning.
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          {[
            'Obegränsade frågor till Jobbcoachen',
            'Spara tidigare konversationer',
            'Tillgång till alla CV- och brevverktyg',
            'Karriärguide baserad på svenska källor'
          ].map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex items-center gap-3 text-sm text-slate-700"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span>{benefit}</span>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/register"
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px]"
          >
            Skapa gratis konto (30 sek)
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/priser"
            className="w-full px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[48px]"
          >
            Läs mer om Premium
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Inget kreditkort krävs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>GDPR-säker</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>1 400+ användare</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
