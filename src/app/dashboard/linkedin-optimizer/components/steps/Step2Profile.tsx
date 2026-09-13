'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import LinkedInProfileMockup, { type ProfileMockupData } from '../LinkedInProfileMockup'
import SectionInput from '../SectionInput'
import PasteHelper from '../PasteHelper'
import type { SourceMode } from './Step1Mode'

export interface LinkedInSections {
  headline: string
  about: string
  experience: string
  education: string
  skills: string
}

interface Props {
  sections: LinkedInSections
  onSectionChange: (key: keyof LinkedInSections, value: string) => void
  sourceMode?: SourceMode
  cvFileName?: string
}

const SECTION_CONFIG = [
  {
    key: 'headline' as const,
    title: 'Rubrik',
    placeholder: 'Senior Projektledare | CI/CD-expert | Bygger team som levererar',
    rows: 2,
    required: false,
    hint: 'Visas under ditt namn på LinkedIn. Lämna tomt så skriver vi en åt dig.',
    optimalMin: 60,
    optimalMax: 220,
  },
  {
    key: 'about' as const,
    title: 'Om mig',
    placeholder:
      'Berätta vem du är, vad du gör och vad du brinner för. Klistra in din nuvarande Om mig-sektion från LinkedIn.',
    rows: 6,
    required: true,
    hint: 'Optimalt 250 till 350 ord. Skriv vad du gör, för vem och med vilket resultat.',
    optimalMin: 200,
    optimalMax: 1500,
  },
  {
    key: 'experience' as const,
    title: 'Erfarenhet',
    placeholder:
      'Klistra in alla roller från LinkedIn. Ta med företag, titlar, datum och beskrivningar.',
    rows: 10,
    required: true,
    hint: 'Skilj roller åt med en tom rad. Vi tar hand om struktureringen.',
    optimalMin: 300,
    optimalMax: 4000,
  },
  {
    key: 'education' as const,
    title: 'Utbildning',
    placeholder:
      'Skolor, program, år. Till exempel:\n\nKungliga Tekniska Högskolan\nCivilingenjör Datateknik · 2014-2019',
    rows: 4,
    required: false,
    hint: 'Hjälper oss matcha din profil mot rätt nivå och bransch.',
    optimalMin: 30,
    optimalMax: 1000,
  },
  {
    key: 'skills' as const,
    title: 'Kompetenser',
    placeholder: 'JavaScript, React, Node.js, AWS, Kubernetes, Agile',
    rows: 3,
    required: false,
    hint: 'Komma-separerat. Vi optimerar listan utifrån resten av profilen.',
    optimalMin: 20,
    optimalMax: 600,
  },
]

/**
 * Steg 2: texten vi ska optimera. Fälten till vänster, profilen som byggs
 * upp till höger på desktop och bakom ett dragspel på mobil. Starta
 * optimeringen ligger i FlowShell-foten.
 */
export default function Step2Profile({
  sections,
  onSectionChange,
  sourceMode = 'manual',
  cvFileName,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const isFromCv = sourceMode === 'cv'

  const previewData: ProfileMockupData = {
    headline: sections.headline,
    about: sections.about,
    experience: sections.experience,
    education: sections.education,
    skills: sections.skills,
  }

  const completed = SECTION_CONFIG.filter((s) => sections[s.key].trim().length > 0).length

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      <div className="space-y-5">
        <div>
          <p className="text-steg uppercase text-ink-3">Steg 2 av 4</p>
          <h2 className="text-fraga text-ink-1">
            {isFromCv ? 'Granska och redigera' : 'Klistra in din nuvarande profil'}
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            {isFromCv
              ? 'Förslagen kommer från ditt CV. Det du ser här är exakt det vi optimerar.'
              : 'Kopiera direkt från LinkedIn. Profilen byggs upp medan du fyller i.'}
          </p>
        </div>

        {isFromCv && (
          <section className="rounded-xl border border-kant bg-panel p-4">
            <p className="text-kort text-ink-1">
              Förslag från ditt CV
              {cvFileName && <span className="font-normal text-ink-3">{' · '}{cvFileName}</span>}
            </p>
            <p className="mt-1 text-meta text-ink-3">
              Redigera fritt. Vi lägger inte till något utöver det som står i fälten.
            </p>
          </section>
        )}

        {/* Mobil: förhandsvisningen bakom ett dragspel */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-kant bg-panel px-4 text-left hover:bg-insunken"
            aria-expanded={previewOpen}
          >
            <span className="text-sm font-medium text-ink-1">
              {previewOpen ? 'Dölj förhandsvisning' : 'Visa förhandsvisning'}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-meta tabular-nums text-ink-3">
                {completed}/{SECTION_CONFIG.length}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ink-3 transition-transform duration-[120ms] ${
                  previewOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={1.75}
              />
            </span>
          </button>
          {previewOpen && (
            <div className="mt-3">
              <LinkedInProfileMockup data={previewData} variant="live" />
            </div>
          )}
        </div>

        {!isFromCv && <PasteHelper />}

        <div className="space-y-5">
          {SECTION_CONFIG.map((cfg) => (
            <SectionInput
              key={cfg.key}
              id={cfg.key}
              label={cfg.title}
              placeholder={cfg.placeholder}
              rows={cfg.rows}
              required={cfg.required}
              hint={cfg.hint}
              value={sections[cfg.key]}
              onChange={(v) => onSectionChange(cfg.key, v)}
              optimalMin={cfg.optimalMin}
              optimalMax={cfg.optimalMax}
            />
          ))}
        </div>
      </div>

      {/* Desktop: profilen byggs upp medan man skriver */}
      <div className="hidden lg:sticky lg:top-4 lg:block">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-ink-3">Uppdateras medan du skriver</h3>
          <span className="text-meta tabular-nums text-ink-3">
            {completed}/{SECTION_CONFIG.length} sektioner
          </span>
        </div>
        <LinkedInProfileMockup data={previewData} variant="live" />
      </div>
    </div>
  )
}
