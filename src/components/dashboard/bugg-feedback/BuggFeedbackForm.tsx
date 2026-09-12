/**
 * Fil: src/components/dashboard/bugg-feedback/BuggFeedbackForm.tsx
 *
 * Beskrivning:
 * Formulär för att rapportera buggar eller skicka feedback från dashboarden.
 * Skickar email via Resend till support@jobbcoach.ai.
 */
'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, MessageSquare, Send, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

type ReportType = 'bug' | 'feedback'

interface FormData {
  type: ReportType
  subject: string
  description: string
  urgency?: 'low' | 'medium' | 'high'
  url?: string
}

export default function BuggFeedbackForm() {
  const [reportType, setReportType] = useState<ReportType>('bug')
  const [formData, setFormData] = useState<FormData>({
    type: 'bug',
    subject: '',
    description: '',
    urgency: 'medium',
    url: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleTypeChange = (type: ReportType) => {
    setReportType(type)
    setFormData(prev => ({ ...prev, type }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Validering
      if (!formData.subject || !formData.description) {
        throw new Error('Vänligen fyll i alla obligatoriska fält.')
      }

      // Skicka till API
      const response = await fetch('/api/bugg-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Något gick fel vid skickandet.')
      }

      setSubmitStatus('success')
      // Rensa formulär
      setFormData({
        type: reportType,
        subject: '',
        description: '',
        urgency: 'medium',
        url: ''
      })

      // Återställ success-meddelande efter 5 sekunder
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)

    } catch (error: any) {
      console.error('Fel vid skickande:', error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Ett oväntat fel inträffade. Försök igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Typ-väljare - grid layout med gradient-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Bugg-knapp */}
        <motion.button
          type="button"
          onClick={() => handleTypeChange('bug')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-4 sm:p-5 rounded-xl sm:rounded-xl border-2 transition-all duration-200 min-h-[48px] touch-manipulation
            ${reportType === 'bug'
              ? 'border-red-500 bg-white'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
            }
          `}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <Bug className={`w-6 h-6 ${reportType === 'bug' ? 'text-red-600' : 'text-neutral-600'}`} />
            <span className={`text-sm sm:text-base font-semibold ${reportType === 'bug' ? 'text-red-700' : 'text-neutral-700'}`}>
              Rapportera bugg
            </span>
          </div>
        </motion.button>

        {/* Feedback-knapp */}
        <motion.button
          type="button"
          onClick={() => handleTypeChange('feedback')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-4 sm:p-5 rounded-xl sm:rounded-xl border-2 transition-all duration-200 min-h-[48px] touch-manipulation
            ${reportType === 'feedback'
              ? 'border-blue-500 bg-white'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
            }
          `}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <MessageSquare className={`w-6 h-6 ${reportType === 'feedback' ? 'text-blue-600' : 'text-neutral-600'}`} />
            <span className={`text-sm sm:text-base font-semibold ${reportType === 'feedback' ? 'text-blue-700' : 'text-neutral-700'}`}>
              Skicka feedback
            </span>
          </div>
        </motion.button>
      </div>

      {/* Formulär Card med gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`
          rounded-xl sm:rounded-xl border p-4 sm:p-6  relative overflow-hidden
          ${reportType === 'bug'
            ? 'bg-white border-red-200'
            : 'bg-white border-blue-200'
          }
        `}
      >
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 sm:space-y-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={reportType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Rubrik */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-neutral-700 mb-2">
                {reportType === 'bug' ? 'Kort beskrivning av buggen' : 'Vad gäller din feedback?'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-lg sm:rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                placeholder={reportType === 'bug' ? 'T.ex. "CV-generering fastnar vid 50%"' : 'T.ex. "Förslag på mörkt tema"'}
              />
            </div>

            {/* Prioritet/Brådskande (endast för buggar) */}
            {reportType === 'bug' && (
              <div>
                <label htmlFor="urgency" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Hur allvarlig är buggen?
                </label>
                <select
                  name="urgency"
                  id="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-lg sm:rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                >
                  <option value="low">Låg - Mindre problem, kan vänta</option>
                  <option value="medium">Medel - Påverkar användningen</option>
                  <option value="high">Hög - Kritisk, blockerar funktioner</option>
                </select>
              </div>
            )}

            {/* URL (valfritt) */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-neutral-700 mb-2">
                URL där problemet uppstod (valfritt)
              </label>
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-lg sm:rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                placeholder="https://www.jobbcoach.ai/dashboard/..."
              />
            </div>

            {/* Detaljerad beskrivning */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-neutral-700 mb-2">
                {reportType === 'bug' ? 'Detaljerad beskrivning' : 'Din feedback'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-lg sm:rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none touch-manipulation text-sm sm:text-base"
                placeholder={
                  reportType === 'bug'
                    ? 'Beskriv vad som hände, vilka steg du tog, och vad du förväntade dig skulle hända...'
                    : 'Berätta mer om ditt förslag eller din feedback...'
                }
              />
              <p className="text-xs sm:text-sm text-neutral-500 mt-2">
                {reportType === 'bug'
                  ? 'Tips: Inkludera steg för att återskapa buggen och eventuella felmeddelanden.'
                  : 'Vi uppskattar all feedback som hjälper oss att förbättra tjänsten!'}
              </p>
            </div>

            {/* Skicka-knapp */}
            <div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl sm:rounded-xl  hover: transition-all flex items-center justify-center min-h-[48px] touch-manipulation
                  ${isSubmitting
                    ? 'bg-neutral-200 cursor-not-allowed text-neutral-500'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                  }
                `}
                whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  <>
                    Skicka {reportType === 'bug' ? 'buggrapport' : 'feedback'}
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </motion.button>

              {/* Success meddelande */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start p-4 bg-white border border-emerald-200 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm sm:text-base">
                      {reportType === 'bug' ? 'Buggrapport skickad!' : 'Feedback skickad!'}
                    </p>
                    <p className="text-emerald-700 text-xs sm:text-sm mt-1">
                      Tack för att du hjälper oss förbättra Jobbcoach.ai!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Error meddelande */}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-start p-4 bg-white border border-red-200 rounded-xl"
                >
                  <AlertTriangle className="w-5 h-5 mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm sm:text-base">Något gick fel</p>
                    <p className="text-red-700 text-xs sm:text-sm mt-1">
                      {errorMessage || 'Försök igen eller kontakta oss direkt på support@jobbcoach.ai'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </form>
      </motion.div>
    </div>
  )
}
