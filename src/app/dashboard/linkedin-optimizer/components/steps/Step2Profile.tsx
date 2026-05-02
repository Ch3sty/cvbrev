'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import LinkedInProfileMockup, { type ProfileMockupData } from '../LinkedInProfileMockup'
import SectionInput from '../SectionInput'
import PasteHelper from '../PasteHelper'

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
  onBack: () => void
  onSubmit: () => void
  error: string | null
}

const SECTION_CONFIG = [
  {
    key: 'headline' as const,
    title: 'Rubrik',
    icon: Sparkles,
    placeholder: 'Exempel: "Senior Projektledare | CI/CD-expert | Bygger team som levererar"',
    rows: 2,
    required: false,
    hint: 'Visas under ditt namn på LinkedIn. Lämna tomt så skriver vi en åt dig.',
    optimalMin: 60,
    optimalMax: 220,
  },
  {
    key: 'about' as const,
    title: 'Om mig',
    icon: User,
    placeholder: 'Berätta vem du är, vad du gör och vad du brinner för. Klistra in din nuvarande About-sektion från LinkedIn.',
    rows: 6,
    required: true,
    hint: 'Optimalt: 250-350 ord. Inkludera vad du gör, för vem och med vilket resultat.',
    optimalMin: 200,
    optimalMax: 1500,
  },
  {
    key: 'experience' as const,
    title: 'Erfarenhet',
    icon: Briefcase,
    placeholder: 'Klistra in alla roller från LinkedIn. Inkludera företag, titlar, datum och beskrivningar.',
    rows: 10,
    required: true,
    hint: 'Skilj mellan roller med en tom rad. Vi tar hand om struktureringen.',
    optimalMin: 300,
    optimalMax: 4000,
  },
  {
    key: 'education' as const,
    title: 'Utbildning',
    icon: GraduationCap,
    placeholder: 'Skolor, program, år. T.ex.\n\nKungliga Tekniska Högskolan\nCivilingenjör Datateknik · 2014-2019',
    rows: 4,
    required: false,
    hint: 'Hjälper oss matcha din profil mot rätt nivå och bransch.',
    optimalMin: 30,
    optimalMax: 1000,
  },
  {
    key: 'skills' as const,
    title: 'Kompetenser',
    icon: Wrench,
    placeholder: 'JavaScript, React, Node.js, AWS, Kubernetes, Agile, ...',
    rows: 3,
    required: false,
    hint: 'Komma-separerat. Vi optimerar listan baserat på din profil.',
    optimalMin: 20,
    optimalMax: 600,
  },
]

export default function Step2Profile({
  sections,
  onSectionChange,
  onBack,
  onSubmit,
  error,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const previewData: ProfileMockupData = {
    headline: sections.headline,
    about: sections.about,
    experience: sections.experience,
    education: sections.education,
    skills: sections.skills,
  }

  const aboutOk = sections.about.trim().length > 0
  const experienceOk = sections.experience.trim().length > 0
  const canSubmit = aboutOk && experienceOk

  const completed = SECTION_CONFIG.filter(
    (s) => sections[s.key].trim().length > 0
  ).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
      {/* Vänster: input */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
            Steg 2 av 4
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.05] tracking-tight">
            Klistra in din nuvarande profil
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Kopiera direkt från LinkedIn. Du ser din profil byggas upp till
            höger medan du fyller i.
          </p>
        </div>

        {/* Mobil: dragspel för att se mockupen */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50/40 flex items-center justify-between gap-3 hover:bg-orange-50/60 transition-colors"
            aria-expanded={previewOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-1 h-3 rounded-sm flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
                {previewOpen ? 'Dölj förhandsvisning' : 'Visa förhandsvisning'}
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {completed}/{SECTION_CONFIG.length}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-orange-700 transition-transform ${
                previewOpen ? 'rotate-180' : ''
              }`}
              strokeWidth={2.4}
            />
          </button>
          <AnimatePresence>
            {previewOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-3"
              >
                <LinkedInProfileMockup
                  data={previewData}
                  variant="live"
                  showGlow={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-5">
          <PasteHelper />
        </div>

        {/* Inputs — alla synliga, scroll igenom */}
        <div className="space-y-5">
          {SECTION_CONFIG.map((cfg) => (
            <SectionInput
              key={cfg.key}
              id={cfg.key}
              label={cfg.title}
              icon={cfg.icon}
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

        {/* Validation-meddelanden */}
        {!canSubmit && (
          <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 flex items-start gap-2.5">
            <AlertCircle
              className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5"
              strokeWidth={2.4}
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-orange-700">"Om mig" och "Erfarenhet"</strong>{' '}
              behövs för att vi ska kunna optimera din profil. Resten är
              valfritt men ger bättre resultat.
            </div>
          </div>
        )}

        {error && (
          <div
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5"
            role="alert"
          >
            <AlertCircle
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
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
            onClick={onSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
            }}
          >
            <span>Starta optimering</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.4} />
          </button>
        </div>
      </motion.div>

      {/* Höger: live mockup (sticky desktop) */}
      <div className="hidden lg:block lg:sticky lg:top-32">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-1 h-3 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
              }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Live · uppdateras medan du skriver
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500">
            {completed}/{SECTION_CONFIG.length} sektioner
          </span>
        </div>
        <LinkedInProfileMockup data={previewData} variant="live" />
      </div>
    </div>
  )
}
