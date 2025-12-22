/**
 * Fil: src/components/kontakt/KontaktForm.tsx
 *
 * Beskrivning:
 * Återanvändbar kontaktformulär-komponent som kan användas både på offentlig sida
 * och i dashboard. Hanterar state, validering och submission.
 */
'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertTriangle } from 'lucide-react'

interface KontaktFormProps {
  variant?: 'public' | 'dashboard'
  onSubmitSuccess?: () => void
}

export default function KontaktForm({ variant = 'public', onSubmitSuccess }: KontaktFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      console.log("Skickar formulär:", formData)
      // Simulera API-anrop
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Enkel validering
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error("Alla fält måste fyllas i.")
      }

      // -- HÄR SKICKAS DATAN TILL DIN BACKEND --
      // const response = await fetch('/api/contact', { method: 'POST', ... });
      // if (!response.ok) throw new Error('Något gick fel.');

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      onSubmitSuccess?.()
    } catch (error: any) {
      console.error("Fel vid skickande:", error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Ett oväntat fel inträffade. Försök igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl sm:rounded-2xl border border-purple-200 p-4 sm:p-6 shadow-lg relative overflow-hidden"
    >
      {/* Bakgrundsdekor */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-8 translate-x-8" />

      <div className="relative z-10">
        {/* Header med gradient-ikon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Send className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Skicka ett meddelande</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Namn */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
              Ditt namn
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
              placeholder="För- och efternamn"
            />
          </div>

          {/* E-post */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Din e-post
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
              placeholder="namn@exempel.se"
            />
          </div>

          {/* Ämne */}
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
              Vad gäller ditt ärende?
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              required
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
              placeholder="T.ex. 'Fråga om Premium'"
            />
          </div>

          {/* Meddelande */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
              Ditt meddelande
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="message"
              id="message"
              rows={5}
              required
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none touch-manipulation text-sm sm:text-base"
              placeholder="Berätta hur vi kan hjälpa dig..."
            />
          </div>

          {/* Skicka-knapp */}
          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-h-[48px] touch-manipulation ${
                isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              }`}
              whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 h-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Skickar...
                </span>
              ) : (
                <>
                  Skicka
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </motion.button>

            {/* Success meddelande */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-md"
              >
                <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900 text-sm sm:text-base">Tack för ditt meddelande!</p>
                  <p className="text-emerald-700 text-xs sm:text-sm mt-1">Vi svarar inom 24 timmar.</p>
                </div>
              </motion.div>
            )}

            {/* Error meddelande */}
            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start p-4 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl shadow-md"
              >
                <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 text-sm sm:text-base">Något gick fel</p>
                  <p className="text-red-700 text-xs sm:text-sm mt-1">
                    {errorMessage || 'Försök igen eller maila oss direkt.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  )
}
