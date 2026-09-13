'use client'

import { useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import LinkedInProfileMockup, {
  type ProfileMockupData,
  type MockupSection,
} from '../LinkedInProfileMockup'
import CompareToggle, { type CompareSide } from '../CompareToggle'
import ScoreHero from '../ScoreHero'
import SectionDetail from '../SectionDetail'
import type { LinkedInSections } from './Step2Profile'
import { formatSkillsForCopy } from '../../lib/formatSkillsForCopy'

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
  language?: 'sv' | 'en'
}

const SECTION_META: Array<{ key: MockupSection; title: string }> = [
  { key: 'headline', title: 'Rubrik' },
  { key: 'about', title: 'Om mig' },
  { key: 'experience', title: 'Erfarenhet' },
  { key: 'education', title: 'Utbildning' },
  { key: 'skills', title: 'Kompetenser' },
]

/**
 * Steg 3: poängen, före och efter sida vid sida, och den valda sektionens
 * detaljer. Klicket i mockupen väljer sektion. Fortsätt ligger i foten.
 */
export default function Step3Results({
  originalSections,
  results,
  fullName,
  language = 'sv',
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
    experience: results.sections.experience?.optimized || originalSections.experience,
    education: results.sections.education?.optimized || originalSections.education,
    skills: results.sections.skills?.optimized || originalSections.skills,
  }

  const availableSections = useMemo(
    () =>
      SECTION_META.filter(
        (s) => !!results.sections[s.key as keyof typeof results.sections]
      ),
    [results.sections]
  )

  const handleCopyAll = async () => {
    try {
      let text = ''
      availableSections.forEach((s) => {
        const r = results.sections[s.key as keyof typeof results.sections]
        if (!r) return
        text += `=== ${s.title.toUpperCase()} ===\n\n`
        // Skills returneras som JSON-objekt, formatera till läsbar text
        text +=
          (s.key === 'skills' ? formatSkillsForCopy(r.optimized, language) : r.optimized) +
          '\n\n'
      })
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2500)
      toast.success('Alla sektioner kopierade', {
        position: 'bottom-center',
        autoClose: 2000,
        hideProgressBar: true,
        theme: 'light',
      })
    } catch {
      toast.error('Kunde inte kopiera', { position: 'bottom-center' })
    }
  }

  const activeMeta = SECTION_META.find((s) => s.key === activeSection) ?? SECTION_META[0]!
  const activeResult = results.sections[
    activeSection as keyof typeof results.sections
  ] as SectionResult | undefined

  return (
    <div className="space-y-6">
      <div>
        <p className="text-steg uppercase text-ink-3">Steg 3 av 4</p>
        <h2 className="text-fraga text-ink-1">Din profil är starkare</h2>
        <p className="mt-2 text-sm text-ink-2">
          Välj en sektion nedan eller i profilen för att se exakt vad vi ändrade.
        </p>
      </div>

      <ScoreHero
        scoreBefore={results.overall_score_before}
        scoreAfter={results.overall_score_after}
      />

      <button
        type="button"
        onClick={handleCopyAll}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken"
      >
        {copiedAll ? 'Alla sektioner kopierade' : 'Kopiera alla sektioner'}
      </button>

      {/* Mobil: en profil i taget */}
      <div className="md:hidden">
        <CompareToggle value={compareSide} onChange={setCompareSide} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className={compareSide === 'before' ? 'block' : 'hidden md:block'}>
          <LinkedInProfileMockup
            data={beforeData}
            variant="live"
            badge="Före"
            onSectionClick={setActiveSection}
            activeSection={activeSection}
          />
        </div>
        <div className={compareSide === 'after' ? 'block' : 'hidden md:block'}>
          <LinkedInProfileMockup
            data={afterData}
            variant="optimized"
            badge="Efter"
            onSectionClick={setActiveSection}
            activeSection={activeSection}
          />
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Välj sektion att granska"
      >
        {availableSections.map((s) => {
          const active = activeSection === s.key
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setActiveSection(s.key)}
              className={`inline-flex h-11 items-center rounded-md border bg-panel px-3 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken ${
                active ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
              }`}
            >
              {s.title}
            </button>
          )
        })}
      </div>

      {activeResult && (
        <SectionDetail
          sectionKey={activeSection}
          title={activeMeta.title}
          optimizedText={activeResult.optimized}
          scoreBefore={activeResult.score_before}
          scoreAfter={activeResult.score_after}
          improvements={activeResult.improvements}
        />
      )}
    </div>
  )
}
