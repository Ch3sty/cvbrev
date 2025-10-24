'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, AlertCircle, Check, Linkedin } from 'lucide-react'

interface LinkedInSections {
  about: string
  experience: string
  education: string
  skills: string
}

interface SectionInputStepProps {
  sections: LinkedInSections
  onSectionChange: (section: keyof LinkedInSections, value: string) => void
  onNext: () => void
  onBack: () => void
  error: string | null
}

const SECTION_CONFIG = [
  {
    key: 'about' as keyof LinkedInSections,
    title: 'Om mig',
    icon: '📝',
    placeholder: 'Exempel: Med passion och engagemang leder jag...',
    rows: 8,
    required: true,
    tip: 'Summera din professionella bakgrund och vad du kan erbjuda'
  },
  {
    key: 'experience' as keyof LinkedInSections,
    title: 'Erfarenhet',
    icon: '💼',
    placeholder: 'Inkludera företag, titlar, datum och beskrivningar',
    rows: 12,
    required: true,
    tip: 'Kopiera all din arbetserfarenhet från LinkedIn'
  },
  {
    key: 'education' as keyof LinkedInSections,
    title: 'Utbildning',
    icon: '🎓',
    placeholder: 'Inkludera skolor, program och datum',
    rows: 6,
    required: false,
    tip: 'Valfritt men rekommenderas för bättre resultat'
  },
  {
    key: 'skills' as keyof LinkedInSections,
    title: 'Kompetenser',
    icon: '🔧',
    placeholder: 'Exempel: "SEO, WordPress, Marknadsföring..."',
    rows: 5,
    required: false,
    tip: 'Lista dina nyckelkompetenser separerade med komma'
  }
]

export default function SectionInputStep({
  sections,
  onSectionChange,
  onNext,
  onBack,
  error
}: SectionInputStepProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)

  const section = SECTION_CONFIG[currentSection]
  const isLastSection = currentSection === SECTION_CONFIG.length - 1
  const canGoNext = section.required ? sections[section.key].trim().length > 0 : true

  const handleSectionNext = () => {
    if (isLastSection) {
      onNext()
    } else {
      setCurrentSection(currentSection + 1)
    }
  }

  const handleSectionBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    } else {
      onBack()
    }
  }

  const completedSections = SECTION_CONFIG.filter(s => sections[s.key].trim().length > 0).length
  const totalSections = SECTION_CONFIG.length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
          <span className="text-sm font-medium text-[#0A66C2]">
            Steg {currentSection + 1} av {SECTION_CONFIG.length}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Kopiera från LinkedIn
        </h1>
        <p className="text-gray-600">
          Klistra in dina LinkedIn-sektioner nedan. Vi börjar med {section.title}.
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {SECTION_CONFIG.map((s, index) => (
            <button
              key={s.key}
              onClick={() => setCurrentSection(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSection
                  ? 'w-8 bg-[#0A66C2]'
                  : index < currentSection
                  ? 'w-2 bg-[#83941f]'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Instructions Toggle */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              Så kopierar du från LinkedIn
            </h3>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dölj
            </button>
          </div>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Öppna din LinkedIn-profil i en ny flik</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>Scrolla till sektionen "{section.title}"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>Markera all text och kopiera (Ctrl+C / Cmd+C)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold">4.</span>
              <span>Klistra in här (Ctrl+V / Cmd+V)</span>
            </li>
          </ol>
        </motion.div>
      )}

      {/* Main Input Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section.key}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">{section.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {section.title}
                {section.required && (
                  <span className="text-sm font-normal text-red-500">*</span>
                )}
              </h2>
              <p className="text-sm text-gray-500">{section.tip}</p>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={sections[section.key]}
              onChange={(e) => onSectionChange(section.key, e.target.value)}
              rows={section.rows}
              placeholder={section.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none transition-all text-gray-900 placeholder-gray-400"
            />

            {/* Character Count */}
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {sections[section.key].length} tecken
            </div>
          </div>

          {/* Completion Indicator */}
          {sections[section.key].trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-[#83941f]"
            >
              <Check className="w-4 h-4" />
              <span>Sektion ifylld!</span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {/* Quick Fill Indicator */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          {completedSections} av {totalSections} sektioner ifyllda
        </div>
        {!showInstructions && (
          <button
            onClick={() => setShowInstructions(true)}
            className="text-[#0A66C2] hover:underline"
          >
            Visa instruktioner
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handleSectionBack}
          className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Tillbaka</span>
        </button>

        <div className="flex items-center gap-3">
          {!isLastSection && !section.required && (
            <button
              onClick={handleSectionNext}
              className="px-6 py-3 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-all"
            >
              Hoppa över
            </button>
          )}

          <button
            onClick={handleSectionNext}
            disabled={!canGoNext}
            className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              canGoNext
                ? 'bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{isLastSection ? 'Starta analys' : 'Nästa sektion'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
