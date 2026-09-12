'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
import FlowShell from '@/components/shell/FlowShell'
import FlowError from '@/components/shell/FlowError'
import FlowResumeBanner from '@/components/shell/FlowResumeBanner'
import { useFlowStep } from '@/lib/flow/useFlowStep'
import {
  loadDraft,
  saveDraft,
  clearDraft,
  purgeExpiredDrafts,
  type FlowDraft,
} from '@/lib/flow/draft'

const EMPTY_SECTIONS: LinkedInSections = {
  headline: '',
  about: '',
  experience: '',
  education: '',
  skills: '',
}

/** Steg 1 läge, 2 profil, 3 resultat, 4 klar. */
const LINKEDIN_TOTAL_STEPS = 4
const LINKEDIN_FLOW_NAME = 'linkedin-optimizer'
const LINKEDIN_FLOW_VERSION = 1

interface LinkedInDraftData {
  mode: OptimizationMode
  targetRole: string
  language: Language
  sourceMode: SourceMode
  selectedCvId: string | null
  sections: LinkedInSections
}

export default function LinkedInOptimizer() {
  const router = useRouter()

  /* Steget i URL:en (?steg=N, ettbaserat). Internt räknas 0-baserat. */
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const flow = useFlowStep({ totalSteps: LINKEDIN_TOTAL_STEPS })
  const currentStep = flow.step - 1
  const setCurrentStep = useCallback(
    (target: number) => flow.goToStep(target + 1),
    [flow]
  )

  const [mode, setMode] = useState<OptimizationMode>('stand_out')
  const [targetRole, setTargetRole] = useState('')
  const [language, setLanguage] = useState<Language>('sv')

  // Source-mode: bygg från CV eller manuell inmatning
  const [sourceMode, setSourceMode] = useState<SourceMode>('manual')
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  // Flagga som visar att användaren gjort ett aktivt val, vi auto-sätter
  // sourceMode bara EN gång, vid första gången CV-listan laddats.
  const [sourceModeInitialized, setSourceModeInitialized] = useState(false)

  const [sections, setSections] = useState<LinkedInSections>(EMPTY_SECTIONS)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<OptimizationResults | null>(null)
  const [error, setError] = useState<string | null>(null)
  /** Låter användaren avbryta ett pågående AI-anrop. */
  const analysisAbortRef = useRef<AbortController | null>(null)

  /* Utkast: profiltexterna är det dyraste användaren gör här, ofta klistrade
     från LinkedIn i flera omgångar, och de låg tidigare bara i minnet. */
  const [pendingDraft, setPendingDraft] =
    useState<FlowDraft<LinkedInDraftData> | null>(null)
  const draftChecked = useRef(false)

  const [fullName, setFullName] = useState<string | undefined>(undefined)

  // Hämta CV-listan via store
  const { cvs, fetchCVs, isLoading: cvsLoading } = useCVStore()

  // Initial fetch + sätt default sourceMode baserat på om användaren har CV
  useEffect(() => {
    fetchCVs()
  }, [fetchCVs])

  useEffect(() => {
    // Kör bara EN gång efter att CV-listan laddats första gången.
    // Sedan respekterar vi alltid användarens aktiva val.
    if (cvsLoading || sourceModeInitialized) return
    if (cvs.length > 0) {
      setSourceMode('cv')
    }
    setSourceModeInitialized(true)
  }, [cvsLoading, cvs.length, sourceModeInitialized])

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

  useEffect(() => {
    if (draftChecked.current) return
    draftChecked.current = true
    purgeExpiredDrafts()
    const found = loadDraft<LinkedInDraftData>(
      LINKEDIN_FLOW_NAME,
      LINKEDIN_FLOW_VERSION
    )
    if (found) setPendingDraft(found)
  }, [])

  const currentDraftData = useCallback(
    (): LinkedInDraftData => ({
      mode,
      targetRole,
      language,
      sourceMode,
      selectedCvId,
      sections,
    }),
    [mode, targetRole, language, sourceMode, selectedCvId, sections]
  )

  const hasDraftWorthSaving =
    sections.about.trim().length > 0 || sections.experience.trim().length > 0

  // Sparas vid stegbyte och när fliken göms, aldrig per tangenttryck.
  useEffect(() => {
    if (pendingDraft || results) return
    if (!hasDraftWorthSaving) return
    saveDraft(
      LINKEDIN_FLOW_NAME,
      LINKEDIN_FLOW_VERSION,
      currentStep + 1,
      currentDraftData()
    )
  }, [currentStep, pendingDraft, results, hasDraftWorthSaving, currentDraftData])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return
      if (results || !hasDraftWorthSaving) return
      saveDraft(
        LINKEDIN_FLOW_NAME,
        LINKEDIN_FLOW_VERSION,
        currentStep + 1,
        currentDraftData()
      )
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [currentStep, results, hasDraftWorthSaving, currentDraftData])

  const resumeDraft = useCallback(() => {
    if (!pendingDraft) return
    const d = pendingDraft.data
    setMode(d.mode)
    setTargetRole(d.targetRole)
    setLanguage(d.language)
    setSourceMode(d.sourceMode)
    setSelectedCvId(d.selectedCvId)
    setSections(d.sections)
    setSourceModeInitialized(true)
    setPendingDraft(null)
    setCurrentStep(pendingDraft.step - 1)
  }, [pendingDraft, setCurrentStep])

  const restartDraft = useCallback(() => {
    clearDraft(LINKEDIN_FLOW_NAME, LINKEDIN_FLOW_VERSION)
    setPendingDraft(null)
    setCurrentStep(0)
  }, [setCurrentStep])

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
      // CV utan strukturerad data, lämna fälten tomma så användaren kan skriva själv
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

    // Ett AI-anrop ska alltid gå att avbryta. Overlayen täckte tidigare hela
    // skärmen utan väg ut, och anropet har ingen timeout alls.
    const controller = new AbortController()
    analysisAbortRef.current = controller

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

      // Avbröt användaren medan svaret var på väg kastar vi det: hon står
      // redan tillbaka i formuläret med sin text kvar.
      if (controller.signal.aborted) return

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
      if (controller.signal.aborted) return
      setError(
        err instanceof Error ? err.message : 'Något gick fel. Försök igen.'
      )
    } finally {
      analysisAbortRef.current = null
      setIsAnalyzing(false)
    }
  }

  /** Avbryter optimeringen och lämnar kvar allt användaren skrivit. */
  const cancelAnalysis = useCallback(() => {
    analysisAbortRef.current?.abort()
    analysisAbortRef.current = null
    setIsAnalyzing(false)
  }, [])

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

  /* Återkomstvalet tar hela ytan: ett vägval, inte en banner. */
  if (pendingDraft) {
    return (
      <FlowShell
        title="LinkedIn-profil"
        step={pendingDraft.step}
        totalSteps={LINKEDIN_TOTAL_STEPS}
        onExit={() => router.push('/dashboard')}
        exitLabel="Tillbaka till översikten"
      >
        <FlowResumeBanner
          savedAt={pendingDraft.savedAt}
          step={pendingDraft.step}
          totalSteps={LINKEDIN_TOTAL_STEPS}
          onResume={resumeDraft}
          onRestart={restartDraft}
        />
      </FlowShell>
    )
  }

  return (
    <LinkedInLayout
      currentStep={currentStep}
      completedSteps={completedSteps}
      onStepClick={handleStepClick}
    >
      {error && (
        <div className="mb-4">
          <FlowError
            message={error}
            onRetry={
              currentStep === 1
                ? () => {
                    setError(null)
                    void handleStartAnalysis()
                  }
                : undefined
            }
          />
        </div>
      )}

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
      <AnimatePresence>
        {isAnalyzing && <AnalysisOverlay onCancel={cancelAnalysis} />}
      </AnimatePresence>
    </LinkedInLayout>
  )
}
