'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Gift, CheckCircle, ArrowRight, X } from 'lucide-react'

interface UpgradeModalProps {
  onClose: () => void
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          aria-label="Stäng"
        >
          <X className="w-4 h-4 text-slate-600" />
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
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
          Du har testat alla 5 gratis meddelanden
        </h2>

        <p className="text-slate-600 text-center mb-6">
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
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            Skapa gratis konto (30 sek)
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/priser"
            className="w-full px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 text-center"
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
