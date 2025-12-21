'use client'

import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Settings, Linkedin, FileEdit, Loader2, BarChart3, Download } from 'lucide-react'
import Link from 'next/link'
import LinkedInProgressBar from './LinkedInProgressBar'
import { createClient } from '@/lib/supabase/client'

// Lazy load steps - ta bort WelcomeStep (går direkt till OptimizationMode)
const OptimizationModeStep = lazy(() => import('./steps/OptimizationModeStep'))
const SectionInputStep = lazy(() => import('./steps/SectionInputStep'))
const AnalysisProgressStep = lazy(() => import('./steps/AnalysisProgressStep'))
const ResultsStep = lazy(() => import('./steps/ResultsStep'))
const ExportStep = lazy(() => import('./steps/ExportStep'))

// Uppdaterade steg - utan Welcome, nu 5 steg istället för 6
const STEPS = [
  { id: 0, title: 'Välj läge', icon: Settings },
  { id: 1, title: 'LinkedIn', icon: Linkedin },
  { id: 2, title: 'Analys', icon: Loader2 },
  { id: 3, title: 'Resultat', icon: BarChart3 },
  { id: 4, title: 'Exportera', icon: Download }
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
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
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep])
      }
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or previous steps
    if (completedSteps.includes(stepIndex) || stepIndex < currentStep) {
      setCurrentStep(stepIndex)
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
    // Mark step 1 as completed
    if (!completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1])
    }
    setCurrentStep(2) // Move to Analysis step

    try {
      // Get Supabase client and user
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Du måste vara inloggad för att använda denna funktion')
      }

      // Call edge function instead of API route
      const { data, error } = await supabase.functions.invoke('optimize-linkedin', {
        body: {
          sections,
          mode,
          target_role: mode === 'target_role' ? targetRole : undefined,
          language,
          user_id: user.id
        }
      })

      if (error) {
        throw new Error(error.message || 'Något gick fel')
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setResults(data)
      setIsAnalyzing(false)
      // Mark step 2 as completed
      if (!completedSteps.includes(2)) {
        setCompletedSteps(prev => [...prev, 2])
      }
      setCurrentStep(3) // Move to Results step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel. Försök igen.')
      setIsAnalyzing(false)
      setCurrentStep(1) // Go back to input step
    }
  }

  const handleStartOver = () => {
    setCurrentStep(0)
    setCompletedSteps([])
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
            isFirstStep={true}
          />
        )
      case 1:
        return (
          <SectionInputStep
            sections={sections}
            onSectionChange={handleSectionChange}
            onNext={handleStartAnalysis}
            onBack={handleBack}
            error={error}
          />
        )
      case 2:
        return <AnalysisProgressStep isAnalyzing={isAnalyzing} />
      case 3:
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
      case 4:
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
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      {/* Header with Progress Bar - matchar Skapa CV */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tillbaka till Dashboard</span>
              <span className="sm:hidden">Tillbaka</span>
            </Link>

            {/* LinkedIn badge - behåller LinkedIn-blå här för kontext */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
              <Linkedin className="w-4 h-4 text-[#0A66C2]" />
              <span className="text-sm font-medium text-[#0A66C2]">LinkedIn Optimering</span>
            </div>
          </div>

          {/* Progress Bar */}
          <LinkedInProgressBar
            currentStep={currentStep}
            steps={STEPS}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </div>
      </div>

      {/* Main Content - matchar Skapa CV */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
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
