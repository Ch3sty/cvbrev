'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, AlertCircle, Check, Linkedin, Sparkles, User, Briefcase, GraduationCap, Wrench, ExternalLink, MousePointerClick, Copy, ClipboardPaste, type LucideIcon } from 'lucide-react'

interface LinkedInSections {
  headline: string
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

const SECTION_CONFIG: Array<{
  key: keyof LinkedInSections
  title: string
  icon: LucideIcon
  placeholder: string
  rows: number
  required: boolean
  tip: string
}> = [
  {
    key: 'headline',
    title: 'Rubrik',
    icon: Sparkles,
    placeholder: 'Exempel: "Projektledare | Digital Expert | Driving Innovation"',
    rows: 2,
    required: false,
    tip: 'Din LinkedIn-rubrik (visas under ditt namn). Valfritt - vi skapar en om du inte fyller i.'
  },
  {
    key: 'about',
    title: 'Om mig',
    icon: User,
    placeholder: 'Exempel: Med passion och engagemang leder jag...',
    rows: 8,
    required: true,
    tip: 'Summera din professionella bakgrund och vad du kan erbjuda'
  },
  {
    key: 'experience',
    title: 'Erfarenhet',
    icon: Briefcase,
    placeholder: 'Inkludera företag, titlar, datum och beskrivningar',
    rows: 12,
    required: true,
    tip: 'Kopiera all din arbetserfarenhet från LinkedIn'
  },
  {
    key: 'education',
    title: 'Utbildning',
    icon: GraduationCap,
    placeholder: 'Inkludera skolor, program och datum',
    rows: 6,
    required: false,
    tip: 'Valfritt men rekommenderas för bättre resultat'
  },
  {
    key: 'skills',
    title: 'Kompetenser',
    icon: Wrench,
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
            <motion.button
              key={s.key}
              onClick={() => setCurrentSection(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-2 rounded-full transition-all ${
                index === currentSection
                  ? 'w-8 bg-gradient-to-r from-[#0A66C2] to-[#0A66C2]/80 shadow-lg shadow-blue-500/30'
                  : index < currentSection
                  ? 'w-2 bg-[#83941f] shadow-sm'
                  : 'w-2 bg-gray-300'
              }`}
            >
              {index === currentSection && (
                <motion.div
                  className="h-full bg-white/30 rounded-full"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Instructions Toggle - Visual Guide with Icons */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6 mb-8 overflow-hidden"
        >
          <div className="flex items-start justify-between mb-6">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              Så kopierar du från LinkedIn
            </h3>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Dölj
            </button>
          </div>

          {/* Visual Step-by-Step Guide */}
          <div className="grid grid-cols-4 gap-4">
            {/* Step 1: Open LinkedIn */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/80 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/30">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs font-semibold text-gray-900 mb-1">1. Öppna LinkedIn</div>
              <div className="text-xs text-gray-600">Din profilsida</div>
            </motion.div>

            {/* Step 2: Find Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
                <MousePointerClick className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs font-semibold text-gray-900 mb-1">2. Hitta sektion</div>
              <div className="text-xs text-gray-600">"{section.title}"</div>
            </motion.div>

            {/* Step 3: Copy Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center mb-3 shadow-lg shadow-green-500/30">
                <Copy className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs font-semibold text-gray-900 mb-1">3. Kopiera text</div>
              <div className="text-xs text-gray-600">Ctrl+C / ⌘+C</div>
            </motion.div>

            {/* Step 4: Paste Here */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
                <ClipboardPaste className="w-8 h-8 text-white" />
              </div>
              <div className="text-xs font-semibold text-gray-900 mb-1">4. Klistra in</div>
              <div className="text-xs text-gray-600">Ctrl+V / ⌘+V</div>
            </motion.div>
          </div>

          {/* Quick tip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-3 bg-white rounded-lg border border-blue-200"
          >
            <p className="text-xs text-gray-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span><strong>Tips:</strong> Du behöver inte formatera texten - kopiera precis som den ser ut på LinkedIn.</span>
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Main Input Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section.key}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-xl shadow-slate-900/5 relative overflow-hidden"
        >
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none" />
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/80 flex items-center justify-center"
            >
              <section.icon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-gray-900 flex items-center gap-2"
              >
                {section.title}
                {section.required && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-sm font-normal text-red-500"
                  >
                    *
                  </motion.span>
                )}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-500"
              >
                {section.tip}
              </motion.p>
            </div>
          </div>

          {/* Textarea */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative z-10"
          >
            <textarea
              value={sections[section.key]}
              onChange={(e) => onSectionChange(section.key, e.target.value)}
              rows={section.rows}
              placeholder={section.placeholder}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none transition-all text-gray-900 placeholder-gray-400 bg-white/80 backdrop-blur-sm hover:border-gray-400 focus:bg-white"
            />

            {/* Character Count with circular progress */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative w-8 h-8"
              >
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - Math.min(sections[section.key].length / 500, 1))}`}
                    className={`${
                      sections[section.key].length > 500
                        ? 'text-green-500'
                        : sections[section.key].length > 200
                        ? 'text-blue-500'
                        : 'text-gray-400'
                    }`}
                    strokeLinecap="round"
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 14 * (1 - Math.min(sections[section.key].length / 500, 1))
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-gray-600">
                    {Math.min(Math.round((sections[section.key].length / 500) * 100), 100)}
                  </span>
                </div>
              </motion.div>
              <span className="text-xs text-gray-400">{sections[section.key].length} tecken</span>
            </div>
          </motion.div>

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
