/**
 * Fil: src/components/dashboard/bugg-feedback/BuggFeedbackForm.tsx
 *
 * Beskrivning:
 * FormulÃ¤r fÃ¶r att rapportera buggar eller skicka feedback frÃ¥n dashboarden.
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
        throw new Error('VÃ¤nligen fyll i alla obligatoriska fÃ¤lt.')
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
        throw new Error(error.message || 'NÃ¥got gick fel vid skickandet.')
      }

      setSubmitStatus('success')
      // Rensa formulÃ¤r
      setFormData({
        type: reportType,
        subject: '',
        description: '',
        urgency: 'medium',
        url: ''
      })

      // Ã…terstÃ¤ll success-meddelande efter 5 sekunder
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)

    } catch (error: any) {
      console.error('Fel vid skickande:', error)
      setSubmitStatus('error')
      setErrorMessage(error.message || 'Ett ovÃ¤ntat fel intrÃ¤ffade. FÃ¶rsÃ¶k igen senare.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Typ-vÃ¤ljare - grid layout med gradient-kort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Bugg-knapp */}
        <motion.button
          type="button"
          onClick={() => handleTypeChange('bug')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 min-h-[48px] touch-manipulation
            ${reportType === 'bug'
              ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md
              ${reportType === 'bug' ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-slate-100'}
            `}>
              <Bug className={`w-5 h-5 sm:w-6 sm:h-6 ${reportType === 'bug' ? 'text-white' : 'text-slate-600'}`} />
            </div>
            <span className={`text-sm sm:text-base font-semibold ${reportType === 'bug' ? 'text-red-700' : 'text-slate-700'}`}>
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
            relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 min-h-[48px] touch-manipulation
            ${reportType === 'feedback'
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
            }
          `}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md
              ${reportType === 'feedback' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-slate-100'}
            `}>
              <MessageSquare className={`w-5 h-5 sm:w-6 sm:h-6 ${reportType === 'feedback' ? 'text-white' : 'text-slate-600'}`} />
            </div>
            <span className={`text-sm sm:text-base font-semibold ${reportType === 'feedback' ? 'text-blue-700' : 'text-slate-700'}`}>
              Skicka feedback
            </span>
          </div>
        </motion.button>
      </div>

      {/* FormulÃ¤r Card med gradient */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`
          rounded-xl sm:rounded-2xl border p-4 sm:p-6 shadow-lg relative overflow-hidden
          ${reportType === 'bug'
            ? 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-red-200'
            : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-200'
          }
        `}
      >
        {/* Bakgrundsdekor */}
        <div className={`
          absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8
          ${reportType === 'bug'
            ? 'bg-gradient-to-br from-red-200/30 to-orange-200/30'
            : 'bg-gradient-to-br from-blue-200/30 to-cyan-200/30'
          }
        `} />

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
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                {reportType === 'bug' ? 'Kort beskrivning av buggen' : 'Vad gÃ¤ller din feedback?'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="subject"
                id="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                placeholder={reportType === 'bug' ? 'T.ex. "CV-generering fastnar vid 50%"' : 'T.ex. "FÃ¶rslag pÃ¥ mÃ¶rkt tema"'}
              />
            </div>

            {/* Prioritet/BrÃ¥dskande (endast fÃ¶r buggar) */}
            {reportType === 'bug' && (
              <div>
                <label htmlFor="urgency" className="block text-sm font-semibold text-slate-700 mb-2">
                  Hur allvarlig Ã¤r buggen?
                </label>
                <select
                  name="urgency"
                  id="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                >
                  <option value="low">LÃ¥g - Mindre problem, kan vÃ¤nta</option>
                  <option value="medium">Medel - PÃ¥verkar anvÃ¤ndningen</option>
                  <option value="high">HÃ¶g - Kritisk, blockerar funktioner</option>
                </select>
              </div>
            )}

            {/* URL (valfritt) */}
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-slate-700 mb-2">
                URL dÃ¤r problemet uppstod (valfritt)
              </label>
              <input
                type="url"
                name="url"
                id="url"
                value={formData.url}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[48px] touch-manipulation text-sm sm:text-base"
                placeholder="https://www.jobbcoach.ai/dashboard/..."
              />
            </div>

            {/* Detaljerad beskrivning */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
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
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none touch-manipulation text-sm sm:text-base"
                placeholder={
                  reportType === 'bug'
                    ? 'Beskriv vad som hÃ¤nde, vilka steg du tog, och vad du fÃ¶rvÃ¤ntade dig skulle hÃ¤nda...'
                    : 'BerÃ¤tta mer om ditt fÃ¶rslag eller din feedback...'
                }
              />
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                {reportType === 'bug'
                  ? 'Tips: Inkludera steg fÃ¶r att Ã¥terskapa buggen och eventuella felmeddelanden.'
                  : 'Vi uppskattar all feedback som hjÃ¤lper oss att fÃ¶rbÃ¤ttra tjÃ¤nsten!'}
              </p>
            </div>

            {/* Skicka-knapp */}
            <div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center min-h-[48px] touch-manipulation
                  ${isSubmitting
                    ? 'bg-slate-200 cursor-not-allowed text-slate-500'
                    : reportType === 'bug'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
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
                  className="mt-4 flex items-start p-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-md"
                >
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm sm:text-base">
                      {reportType === 'bug' ? 'Buggrapport skickad!' : 'Feedback skickad!'}
                    </p>
                    <p className="text-emerald-700 text-xs sm:text-sm mt-1">
                      Tack fÃ¶r att du hjÃ¤lper oss fÃ¶rbÃ¤ttra Jobbcoach.ai!
                    </p>
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
                    <p className="font-semibold text-red-900 text-sm sm:text-base">NÃ¥got gick fel</p>
                    <p className="text-red-700 text-xs sm:text-sm mt-1">
                      {errorMessage || 'FÃ¶rsÃ¶k igen eller kontakta oss direkt pÃ¥ support@jobbcoach.ai'}
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
