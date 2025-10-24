'use client'

import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LinkedInProgressBar from './LinkedInProgressBar'

// Lazy load steps
const WelcomeStep = lazy(() => import('./steps/WelcomeStep'))
const OptimizationModeStep = lazy(() => import('./steps/OptimizationModeStep'))
const SectionInputStep = lazy(() => import('./steps/SectionInputStep'))
const AnalysisProgressStep = lazy(() => import('./steps/AnalysisProgressStep'))
const ResultsStep = lazy(() => import('./steps/ResultsStep'))
const ExportStep = lazy(() => import('./steps/ExportStep'))

const STEPS = [
  { id: 0, title: 'Välkommen', subtitle: 'Kom igång' },
  { id: 1, title: 'Välj läge', subtitle: 'Optimering' },
  { id: 2, title: 'LinkedIn', subtitle: 'Kopiera' },
  { id: 3, title: 'Analys', subtitle: 'AI arbetar' },
  { id: 4, title: 'Resultat', subtitle: 'Jämför' },
  { id: 5, title: 'Exportera', subtitle: 'Spara' }
]

type OptimizationMode = 'stand_out' | 'target_role'
type Language = 'sv' | 'en'

interface LinkedInSections {
  headline: string
  about: string
  experience: string
  education: string
  skills: string
}

interface OptimizationResults {
  sections: {
    headline: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    about: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    experience: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    education?: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
    skills?: {
      optimized: string
      score_before: number
      score_after: number
      improvements: string[]
    }
  }
  overall_score_before: number
  overall_score_after: number
}

const StepSkeleton = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-full"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    <div className="h-64 bg-gray-200 rounded mt-8"></div>
  </div>
)

export default function LinkedInWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<OptimizationMode>('stand_out')
  const [targetRole, setTargetRole] = useState('')
  const [language, setLanguage] = useState<Language>('sv')
  const [sections, setSections] = useState<LinkedInSections>({
    headline: '',
    about: '',
    experience: '',
    education: '',
    skills: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSectionChange = (section: keyof LinkedInSections, value: string) => {
    setSections(prev => ({ ...prev, [section]: value }))
    setError(null)
  }

  const handleStartAnalysis = async () => {
    setError(null)

    // Validation
    if (!sections.about.trim()) {
      setError('Du måste fylla i "Om mig"-sektionen')
      return
    }
    if (!sections.experience.trim()) {
      setError('Du måste fylla i "Erfarenhet"-sektionen')
      return
    }
    if (mode === 'target_role' && !targetRole.trim()) {
      setError('Du måste ange vilken roll du vill optimera för')
      return
    }

    setIsAnalyzing(true)
    setCurrentStep(3) // Move to Analysis step

    try {
      const response = await fetch('/api/linkedin/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          mode,
          target_role: mode === 'target_role' ? targetRole : undefined,
          language
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Något gick fel')
      }

      setResults(data)
      setIsAnalyzing(false)
      setCurrentStep(4) // Move to Results step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.')
      setIsAnalyzing(false)
      setCurrentStep(2) // Go back to input step
    }
  }

  const handleStartOver = () => {
    setCurrentStep(0)
    setMode('stand_out')
    setTargetRole('')
    setLanguage('sv')
    setSections({ headline: '', about: '', experience: '', education: '', skills: '' })
    setResults(null)
    setError(null)
    setIsAnalyzing(false)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />
      case 1:
        return (
          <OptimizationModeStep
            mode={mode}
            targetRole={targetRole}
            language={language}
            onModeChange={setMode}
            onTargetRoleChange={setTargetRole}
            onLanguageChange={setLanguage}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <SectionInputStep
            sections={sections}
            onSectionChange={handleSectionChange}
            onNext={handleStartAnalysis}
            onBack={handleBack}
            error={error}
          />
        )
      case 3:
        return <AnalysisProgressStep isAnalyzing={isAnalyzing} />
      case 4:
        return results ? (
          <ResultsStep
            originalSections={sections}
            optimizedSections={results.sections}
            overall_score_before={results.overall_score_before}
            overall_score_after={results.overall_score_after}
            onNext={handleNext}
            onBack={handleBack}
          />
        ) : null
      case 5:
        return results ? (
          <ExportStep
            optimizedSections={results.sections}
            onStartOver={handleStartOver}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Progress Bar */}
      <LinkedInProgressBar currentStep={currentStep} steps={STEPS} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<StepSkeleton />}>
                {renderStep()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
