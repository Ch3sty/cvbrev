'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Linkedin } from 'lucide-react'
import type { CVDraft } from './CVCreatorWizard'

export type PreviewSection =
  | 'kontakt'
  | 'om-dig'
  | 'erfarenhet'
  | 'utbildning'
  | 'kompetenser'
  | 'sprak'

interface Props {
  data: CVDraft
  /** Vilken sektion som är "aktiv" (highlightad) — baserat på currentStep */
  activeSection?: PreviewSection
  /** Visa glow bakom papperet (default: true) */
  showGlow?: boolean
  className?: string
}

const PLACEHOLDER_NAME = 'Ditt namn'
const PLACEHOLDER_TITLE = 'Din titel kommer synas här'
const PLACEHOLDER_SUMMARY =
  'En kort sammanfattning om dig själv som hjälper rekryteraren förstå vem du är.'

function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

function SectionWrapper({
  isActive,
  children,
}: {
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative transition-all rounded-lg ${
        isActive ? 'bg-orange-50/60 -mx-2 px-2 py-1.5' : ''
      }`}
    >
      {isActive && (
        <span
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className="w-1 h-3 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
        }}
        aria-hidden="true"
      />
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
        {children}
      </span>
    </div>
  )
}

export default function SkapaCvPreview({
  data,
  activeSection,
  showGlow = true,
  className = '',
}: Props) {
  const fullName = data.personalInfo.fullName?.trim() || ''
  const email = data.personalInfo.email?.trim() || ''
  const phone = data.personalInfo.phone?.trim() || ''
  const address = data.personalInfo.address?.trim() || ''
  const linkedIn = data.personalInfo.linkedIn?.trim() || ''
  const summary = data.summary?.trim() || ''

  const hasName = !!fullName
  const initials = getInitials(fullName)

  // Filter rensade poster
  const experiences = data.experience.filter(
    (e) => (e.position?.trim() || e.company?.trim() || '').length > 0
  )
  const educations = data.education.filter(
    (e) => (e.degree?.trim() || e.institution?.trim() || '').length > 0
  )
  const skills = data.skills.filter(
    (s) => (s.skills?.length ?? 0) > 0 || (s.category?.trim() ?? '').length > 0
  )
  const languages = data.languages.filter((l) => l.language?.trim().length > 0)

  return (
    <div className={`relative w-full ${className}`}>
      {/* Glow bakom (desktop) */}
      {showGlow && (
        <div
          className="hidden lg:block absolute -inset-3 rounded-3xl opacity-20 blur-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
          aria-hidden="true"
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative bg-white rounded-2xl lg:rounded-3xl border border-orange-100 overflow-hidden"
        style={{
          boxShadow: showGlow
            ? '0 20px 40px -16px rgba(249, 115, 22, 0.18)'
            : '0 8px 20px -10px rgba(249, 115, 22, 0.15)',
        }}
      >
        {/* Orange topplist */}
        <div
          className="h-2"
          style={{
            background:
              'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
          aria-hidden="true"
        />

        <div className="px-5 sm:px-6 py-5 sm:py-6">
          {/* HEADER: Avatar + namn + kontakt */}
          <SectionWrapper isActive={activeSection === 'kontakt'}>
            <div className="flex items-start gap-4 mb-3">
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-lg"
                style={{
                  background: hasName
                    ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                    : '#F1F5F9',
                  boxShadow: hasName
                    ? '0 6px 14px -4px rgba(220, 38, 38, 0.35)'
                    : undefined,
                }}
              >
                <span className={hasName ? 'text-white' : 'text-slate-300'}>
                  {initials}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-lg font-black leading-tight tracking-tight ${
                    hasName ? 'text-slate-900' : 'text-slate-300'
                  }`}
                >
                  {fullName || PLACEHOLDER_NAME}
                </p>
                {data.personalInfo.title?.trim() ? (
                  <p className="text-sm font-semibold text-slate-700 leading-snug mt-0.5">
                    {data.personalInfo.title}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Kontaktrad */}
            {(email || phone || address || linkedIn) && (
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-600 mb-1">
                {email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" strokeWidth={2.2} />
                    <span className="truncate max-w-[160px]">{email}</span>
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" strokeWidth={2.2} />
                    <span>{phone}</span>
                  </span>
                )}
                {address && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" strokeWidth={2.2} />
                    <span>{address}</span>
                  </span>
                )}
                {linkedIn && (
                  <span className="inline-flex items-center gap-1">
                    <Linkedin className="w-3 h-3" strokeWidth={2.2} />
                    <span className="truncate max-w-[140px]">{linkedIn}</span>
                  </span>
                )}
              </div>
            )}
          </SectionWrapper>

          {/* OM DIG / SUMMARY */}
          <div className="mt-5 pt-5 border-t border-orange-50">
            <SectionLabel>{PLACEHOLDER_TITLE.includes('Om dig') ? 'Om dig' : 'Om mig'}</SectionLabel>
            <SectionWrapper isActive={activeSection === 'om-dig'}>
              <p
                className={`text-xs leading-relaxed line-clamp-5 whitespace-pre-line ${
                  summary ? 'text-slate-700' : 'text-slate-300 italic'
                }`}
              >
                {summary || PLACEHOLDER_SUMMARY}
              </p>
            </SectionWrapper>
          </div>

          {/* ERFARENHET */}
          <div className="mt-5 pt-5 border-t border-orange-50">
            <SectionLabel>Erfarenhet</SectionLabel>
            <SectionWrapper isActive={activeSection === 'erfarenhet'}>
              {experiences.length > 0 ? (
                <div className="space-y-3">
                  {experiences.slice(0, 4).map((exp, i) => {
                    const period = [exp.startDate, exp.endDate || 'Nu']
                      .filter(Boolean)
                      .join(' – ')
                    return (
                      <div key={i} className="flex gap-3">
                        <div
                          className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-black text-white"
                          style={{
                            background:
                              i % 2 === 0
                                ? 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)'
                                : 'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
                          }}
                        >
                          {(exp.company ?? exp.position ?? 'XX')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {exp.position || 'Roll'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {[exp.company, period].filter(Boolean).join(' · ')}
                          </p>
                          {exp.description &&
                            exp.description.length > 0 &&
                            exp.description[0] && (
                              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mt-0.5">
                                {exp.description[0]}
                              </p>
                            )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3 opacity-50">
                      <div className="flex-shrink-0 w-9 h-9 rounded-md bg-slate-100" />
                      <div className="flex-1 space-y-1.5 pt-1">
                        <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                        <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-300 italic mt-1.5">
                    Din erfarenhet visas här
                  </p>
                </div>
              )}
            </SectionWrapper>
          </div>

          {/* UTBILDNING */}
          <div className="mt-5 pt-5 border-t border-orange-50">
            <SectionLabel>Utbildning</SectionLabel>
            <SectionWrapper isActive={activeSection === 'utbildning'}>
              {educations.length > 0 ? (
                <div className="space-y-2">
                  {educations.slice(0, 3).map((edu, i) => (
                    <div key={i}>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {edu.degree || 'Examen'}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {[edu.institution, edu.graduationYear ?? edu.endDate]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-300 italic">
                  Din utbildning visas här
                </p>
              )}
            </SectionWrapper>
          </div>

          {/* KOMPETENSER */}
          <div className="mt-5 pt-5 border-t border-orange-50">
            <SectionLabel>Kompetenser</SectionLabel>
            <SectionWrapper isActive={activeSection === 'kompetenser'}>
              {skills.length > 0 ? (
                <div className="space-y-2">
                  {skills.slice(0, 4).map((skill, i) => (
                    <div key={i}>
                      {skill.category && (
                        <p className="text-[10px] font-bold text-slate-700 mb-1">
                          {skill.category}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {(skill.skills ?? []).slice(0, 8).map((s, j) => (
                          <span
                            key={`${i}-${j}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-orange-200 text-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="inline-flex h-6 w-16 rounded-full bg-slate-100 opacity-50"
                    />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </div>

          {/* SPRÅK */}
          <div className="mt-5 pt-5 border-t border-orange-50">
            <SectionLabel>Språk</SectionLabel>
            <SectionWrapper isActive={activeSection === 'sprak'}>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {languages.map((lang, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {lang.language}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-300 italic">
                  Dina språk visas här
                </p>
              )}
            </SectionWrapper>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
