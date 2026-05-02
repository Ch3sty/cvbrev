'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Files,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'react-toastify'
import LinkedInProfileMockup, {
  type ProfileMockupData,
  type MockupSection,
} from '../LinkedInProfileMockup'
import CompareToggle, { type CompareSide } from '../CompareToggle'
import ScoreHero from '../ScoreHero'
import SectionDetail from '../SectionDetail'
import type { LinkedInSections } from './Step2Profile'

interface SectionResult {
  optimized: string
  score_before: number
  score_after: number
  improvements: string[]
}

export interface OptimizationResults {
  sections: {
    headline: SectionResult
    about: SectionResult
    experience: SectionResult
    education?: SectionResult
    skills?: SectionResult
  }
  overall_score_before: number
  overall_score_after: number
}

interface Props {
  originalSections: LinkedInSections
  results: OptimizationResults
  fullName?: string
  onBack: () => void
  onNext: () => void
}

const SECTION_META: Array<{
  key: MockupSection
  title: string
  icon: LucideIcon
  optional?: boolean
}> = [
  { key: 'headline', title: 'Rubrik', icon: Sparkles },
  { key: 'about', title: 'Om mig', icon: User },
  { key: 'experience', title: 'Erfarenhet', icon: Briefcase },
  { key: 'education', title: 'Utbildning', icon: GraduationCap, optional: true },
  { key: 'skills', title: 'Kompetenser', icon: Wrench, optional: true },
]

export default function Step3Results({
  originalSections,
  results,
  fullName,
  onBack,
  onNext,
}: Props) {
  const [activeSection, setActiveSection] = useState<MockupSection>('about')
  const [compareSide, setCompareSide] = useState<CompareSide>('after')
  const [copiedAll, setCopiedAll] = useState(false)

  const beforeData: ProfileMockupData = {
    fullName,
    headline: originalSections.headline,
    about: originalSections.about,
    experience: originalSections.experience,
    education: originalSections.education,
    skills: originalSections.skills,
  }

  const afterData: ProfileMockupData = {
    fullName,
    headline: results.sections.headline?.optimized || originalSections.headline,
    about: results.sections.about?.optimized || originalSections.about,
    experience:
      results.sections.experience?.optimized || originalSections.experience,
    education:
      results.sections.education?.optimized || originalSections.education,
    skills: results.sections.skills?.optimized || originalSections.skills,
  }

  const availableSections = useMemo(() => {
    return SECTION_META.filter((s) => {
      const r = results.sections[s.key as keyof typeof results.sections]
      return !!r
    })
  }, [results.sections])

  const handleCopyAll = async () => {
    try {
      let text = ''
      availableSections.forEach((s) => {
        const r = results.sections[s.key as keyof typeof results.sections]
        if (r) {
          text += `=== ${s.title.toUpperCase()} ===\n\n`
          text += r.optimized + '\n\n'
        }
      })
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2500)
      toast.success('Alla sektioner kopierade!', {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
        theme: 'light',
      })
    } catch {
      toast.error('Kunde inte kopiera', { position: 'bottom-center' })
    }
  }

  const activeMeta =
    SECTION_META.find((s) => s.key === activeSection) ?? SECTION_META[0]!
  const activeResult = results.sections[
    activeSection as keyof typeof results.sections
  ] as SectionResult | undefined

  return (
    <div>
      {/* Hero med score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mb-3">
          <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={2.6} />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Klart
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight mb-1.5">
          Din profil är mycket starkare
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
          Klicka på en sektion i mockupen för att se exakt vad vi ändrade.
        </p>
        <ScoreHero
          scoreBefore={results.overall_score_before}
          scoreAfter={results.overall_score_after}
        />
      </motion.div>

      {/* Kopiera allt */}
      <div className="flex justify-center mb-6">
        <button
          type="button"
          onClick={handleCopyAll}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.99]"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
          }}
        >
          {copiedAll ? (
            <>
              <Check className="w-4 h-4" strokeWidth={2.6} />
              Alla sektioner kopierade
            </>
          ) : (
            <>
              <Files className="w-4 h-4" strokeWidth={2.4} />
              Kopiera alla sektioner
            </>
          )}
        </button>
      </div>

      {/* Mobil: compare toggle */}
      <div className="md:hidden flex justify-center mb-4">
        <CompareToggle value={compareSide} onChange={setCompareSide} />
      </div>

      {/* Mockups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Före */}
        <div
          className={`${
            compareSide === 'before' ? 'block' : 'hidden md:block'
          }`}
        >
          <LinkedInProfileMockup
            data={beforeData}
            variant="live"
            badge="Före"
            showGlow={false}
            onSectionClick={setActiveSection}
            activeSection={activeSection}
          />
        </div>

        {/* Efter */}
        <div
          className={`${
            compareSide === 'after' ? 'block' : 'hidden md:block'
          }`}
        >
          <LinkedInProfileMockup
            data={afterData}
            variant="optimized"
            badge="Efter"
            onSectionClick={setActiveSection}
            activeSection={activeSection}
          />
        </div>
      </div>

      {/* Sektionsnavigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableSections.map((s) => {
          const Icon = s.icon
          const active = activeSection === s.key
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSection(s.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active
                  ? 'text-white'
                  : 'text-slate-600 bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50/40'
              }`}
              style={
                active
                  ? {
                      background:
                        'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                      boxShadow:
                        '0 4px 10px -3px rgba(220, 38, 38, 0.4)',
                    }
                  : undefined
              }
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
              {s.title}
            </button>
          )
        })}
      </div>

      {/* Section detail */}
      <AnimatePresence mode="wait">
        {activeResult && (
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <SectionDetail
              sectionKey={activeSection}
              title={activeMeta.title}
              icon={activeMeta.icon}
              optimizedText={activeResult.optimized}
              scoreBefore={activeResult.score_before}
              scoreAfter={activeResult.score_after}
              improvements={activeResult.improvements}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-slate-600 hover:text-orange-700 hover:bg-orange-50/60 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.4} />
          Tillbaka
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span>Fortsätt till export</span>
          <ArrowRight className="w-5 h-5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  )
}
