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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      {/* Namn */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          Ditt namn
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="För- och efternamn"
        />
      </div>

      {/* E-post */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Din e-post
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="namn@exempel.se"
        />
      </div>

      {/* Ämne */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
          Vad gäller ditt ärende?
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          value={formData.subject}
          onChange={handleInputChange}
          className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="T.ex. 'Fråga om Premium'"
        />
      </div>

      {/* Meddelande */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
          Ditt meddelande
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          required
          value={formData.message}
          onChange={handleInputChange}
          className="w-full px-4 py-3 sm:py-3.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          placeholder="Berätta hur vi kan hjälpa dig..."
        />
      </div>

      {/* Skicka-knapp */}
      <div>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-6 py-4 text-base font-semibold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center touch-manipulation ${
            isSubmitting
              ? 'bg-slate-300 cursor-not-allowed text-slate-500'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-blue-500/25'
          }`}
          whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Skickar...
            </span>
          ) : (
            <>
              Skicka
              <Send className="w-4 h-4 ml-2" />
            </>
          )}
        </motion.button>

        {/* Success meddelande */}
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 mr-3 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 text-sm">Tack för ditt meddelande!</p>
              <p className="text-green-700 text-sm mt-1">Vi svarar inom 24 timmar.</p>
            </div>
          </motion.div>
        )}

        {/* Error meddelande */}
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 text-sm">Något gick fel</p>
              <p className="text-red-700 text-sm mt-1">
                {errorMessage || 'Försök igen eller maila oss direkt.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </form>
  )
}
