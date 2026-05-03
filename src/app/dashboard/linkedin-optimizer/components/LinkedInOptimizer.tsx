'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useCVStore } from '@/store/cv-store'
import LinkedInLayout from './LinkedInLayout'
import AnalysisOverlay from './AnalysisOverlay'
import Step1Mode, {
  type Language,
  type OptimizationMode,
  type SourceMode,
} from './steps/Step1Mode'
import Step2Profile, { type LinkedInSections } from './steps/Step2Profile'
import Step3Results, { type OptimizationResults } from './steps/Step3Results'
import Step4Done from './steps/Step4Done'
import { cvToLinkedIn } from '../lib/cvToLinkedIn'

const EMPTY_SECTIONS: LinkedInSections = {
  headline: '',
  about: '',
  experience: '',
  education: '',
  skills: '',
}

export default function LinkedInOptimizer() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const [mode, setMode] = useState<OptimizationMode>('stand_out')
  const [targetRole, setTargetRole] = useState('')
  const [language, setLanguage] = useState<Language>('sv')

  // Source-mode: bygg från CV eller manuell inmatning
  const [sourceMode, setSourceMode] = useState<SourceMode>('manual')
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)

  const [sections, setSections] = useState<LinkedInSections>(EMPTY_SECTIONS)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState<string | undefined>(undefined)

  // Hämta CV-listan via store
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore()

  // Initial fetch + sätt default sourceMode baserat på om användaren har CV
  useEffect(() => {
    fetchCVs()
  }, [fetchCVs])

  useEffect(() => {
    if (!cvsLoading && cvs.length > 0 && sourceMode === 'manual' && currentStep === 0 && !selectedCvId) {
      // Default till 'cv' om användaren har CV och vi är på Step 1 utan val ännu
      setSourceMode('cv')
    }
  }, [cvsLoading, cvs.length, sourceMode, currentStep, selectedCvId])

  // Hämta användarens namn för mockup
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.full_name as string | undefined
      if (name) setFullName(name)
    })
  }, [])

  const selectedCv = useMemo(
    () => cvs.find((c) => c.id === selectedCvId) ?? null,
    [cvs, selectedCvId]
  )

  const markCompleted = (step: number) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]))
  }

  const handleSectionChange = (key: keyof LinkedInSections, value: string) => {
    setSections((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  const handleSourceModeChange = (next: SourceMode) => {
    setSourceMode(next)
    if (next === 'manual') {
      // Rensa CV-val och tomma fält när användaren byter till manuell
      setSelectedCvId(null)
      setSections(EMPTY_SECTIONS)
    }
  }

  const handleCvSelect = (cvId: string) => {
    setSelectedCvId(cvId)
    const cv = cvs.find((c) => c.id === cvId)
    if (cv?.structured_data) {
      const mapped = cvToLinkedIn(cv.structured_data)
      setSections(mapped)
    } else {
      // CV utan strukturerad data — lämna fälten tomma så användaren kan skriva själv
      setSections(EMPTY_SECTIONS)
    }
  }

  const handleStep1Next = () => {
    markCompleted(0)
    setCurrentStep(1)
  }

  const handleStartAnalysis = async () => {
    setError(null)

    if (!sections.about.trim()) {
      setError('Du måste fylla i "Om mig"-sektionen.')
      return
    }
    if (!sections.experience.trim()) {
      setError('Du måste fylla i "Erfarenhet"-sektionen.')
      return
    }
    if (mode === 'target_role' && targetRole.trim().length < 3) {
      setError('Ange vilken roll du siktar på (minst 3 tecken).')
      return
    }

    setIsAnalyzing(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error('Du måste vara inloggad för att använda denna funktion.')
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        'optimize-linkedin',
        {
          body: {
            sections,
            mode,
            target_role: mode === 'target_role' ? targetRole : undefined,
            language,
            user_id: user.id,
          },
        }
      )

      if (fnError) {
        throw new Error(fnError.message || 'Något gick fel.')
      }
      if (data?.error) {
        if (data.quota_exceeded) {
          throw new Error(
            'Du har använt din veckokvot. Uppgradera till Premium för obegränsad optimering.'
          )
        }
        throw new Error(data.error)
      }

      setResults(data as OptimizationResults)
      markCompleted(1)
      setCurrentStep(2)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Något gick fel. Försök igen.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStep3Next = () => {
    markCompleted(2)
    setCurrentStep(3)
  }

  const handleStartOver = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setMode('stand_out')
    setTargetRole('')
    setLanguage('sv')
    setSections(EMPTY_SECTIONS)
    setResults(null)
    setError(null)
    setIsAnalyzing(false)
    setSelectedCvId(null)
    setSourceMode(cvs.length > 0 ? 'cv' : 'manual')
  }

  const handleStepClick = (step: number) => {
    // Tillåt att gå tillbaka till tidigare steg
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step)
    }
  }

  return (
    <LinkedInLayout
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={handleStepClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep === 0 && (
            <Step1Mode
              mode={mode}
              targetRole={targetRole}
              language={language}
              sourceMode={sourceMode}
              selectedCvId={selectedCvId}
              hasCvs={cvs.length > 0}
              onModeChange={setMode}
              onTargetRoleChange={setTargetRole}
              onLanguageChange={setLanguage}
              onSourceModeChange={handleSourceModeChange}
              onCvSelect={handleCvSelect}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 1 && (
            <Step2Profile
              sections={sections}
              onSectionChange={handleSectionChange}
              onBack={() => setCurrentStep(0)}
              onSubmit={handleStartAnalysis}
              error={error}
              sourceMode={sourceMode}
              cvFileName={selectedCv?.file_name}
            />
          )}

          {currentStep === 2 && results && (
            <Step3Results
              originalSections={sections}
              results={results}
              fullName={fullName}
              language={language}
              onBack={() => setCurrentStep(1)}
              onNext={handleStep3Next}
            />
          )}

          {currentStep === 3 && results && (
            <Step4Done
              originalSections={sections}
              results={results}
              fullName={fullName}
              onStartOver={handleStartOver}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Analys-overlay */}
      <AnimatePresence>{isAnalyzing && <AnalysisOverlay />}</AnimatePresence>
    </LinkedInLayout>
  )
}
