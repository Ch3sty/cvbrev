'use client'

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
  /** Vilken sektion som är aktiv, baserat på currentStep. Får tråden. */
  activeSection?: PreviewSection
  /** Behålls för bakåtkompatibilitet, ingen glow finns längre. */
  showGlow?: boolean
  className?: string
}

const PLACEHOLDER_NAME = 'Ditt namn'
const PLACEHOLDER_SUMMARY =
  'En kort sammanfattning om dig själv som hjälper rekryteraren förstå vem du är.'

function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

/**
 * Sektionen som hör till det aktiva steget får tråden: 3 px längs
 * vänsterkanten. Det betyder position, här är du, inte val.
 */
function SectionWrapper({
  isActive,
  children,
}: {
  isActive: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {isActive && (
        <span
          className="absolute -left-4 top-0 bottom-0 w-[3px] rounded-r bg-accent sm:-left-5"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-ink-3">{children}</p>
}

const CHIP =
  'inline-flex items-center rounded-lg border border-kant bg-insunken px-2 py-0.5 text-meta text-ink-2'

export default function SkapaCvPreview({ data, activeSection, className = '' }: Props) {
  const fullName = data.personalInfo.fullName?.trim() || ''
  const email = data.personalInfo.email?.trim() || ''
  const phone = data.personalInfo.phone?.trim() || ''
  const address = data.personalInfo.address?.trim() || ''
  const linkedIn = data.personalInfo.linkedIn?.trim() || ''
  const summary = data.summary?.trim() || ''

  const hasName = !!fullName
  const initials = getInitials(fullName)

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
      <div
        className="overflow-hidden rounded-xl border border-kant bg-panel"
        role="img"
        aria-label="Förhandsvisning av ditt CV"
      >
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {/* Namn och kontakt */}
          <SectionWrapper isActive={activeSection === 'kontakt'}>
            <div className="mb-3 flex items-start gap-3">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-base font-semibold ${
                  hasName ? 'bg-insunken text-ink-1' : 'bg-insunken text-ink-3'
                }`}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-kort ${hasName ? 'text-ink-1' : 'text-ink-3'}`}
                >
                  {fullName || PLACEHOLDER_NAME}
                </p>
                {data.personalInfo.title?.trim() ? (
                  <p className="mt-0.5 text-sm text-ink-2">{data.personalInfo.title}</p>
                ) : null}
              </div>
            </div>

            {(email || phone || address || linkedIn) && (
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-meta text-ink-3">
                {email && <span className="max-w-[180px] truncate">{email}</span>}
                {phone && <span>{phone}</span>}
                {address && <span>{address}</span>}
                {linkedIn && <span className="max-w-[160px] truncate">{linkedIn}</span>}
              </p>
            )}
          </SectionWrapper>

          {/* Om dig */}
          <div className="mt-4 border-t border-kant pt-4">
            <SectionWrapper isActive={activeSection === 'om-dig'}>
              <SectionLabel>Om mig</SectionLabel>
              <p
                className={`line-clamp-5 whitespace-pre-line text-meta ${
                  summary ? 'text-ink-2' : 'italic text-ink-3'
                }`}
              >
                {summary || PLACEHOLDER_SUMMARY}
              </p>
            </SectionWrapper>
          </div>

          {/* Erfarenhet */}
          <div className="mt-4 border-t border-kant pt-4">
            <SectionWrapper isActive={activeSection === 'erfarenhet'}>
              <SectionLabel>Erfarenhet</SectionLabel>
              {experiences.length > 0 ? (
                <div className="space-y-3">
                  {experiences.slice(0, 4).map((exp, i) => {
                    const period = [exp.startDate, exp.endDate || 'Nu']
                      .filter(Boolean)
                      .join(' till ')
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-insunken text-meta font-medium text-ink-2">
                          {(exp.company ?? exp.position ?? 'XX').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-1">
                            {exp.position || 'Roll'}
                          </p>
                          <p className="truncate text-meta text-ink-3">
                            {[exp.company, period].filter(Boolean).join(' · ')}
                          </p>
                          {exp.description &&
                            exp.description.length > 0 &&
                            exp.description[0] && (
                              <p className="mt-0.5 line-clamp-2 text-meta text-ink-2">
                                {exp.description[0]}
                              </p>
                            )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2" aria-hidden="true">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-insunken" />
                      <div className="flex-1 space-y-1.5 pt-1">
                        <div className="h-2.5 w-2/3 rounded bg-insunken" />
                        <div className="h-2 w-1/2 rounded bg-insunken" />
                      </div>
                    </div>
                  ))}
                  <p className="text-meta italic text-ink-3">Din erfarenhet visas här</p>
                </div>
              )}
            </SectionWrapper>
          </div>

          {/* Utbildning */}
          <div className="mt-4 border-t border-kant pt-4">
            <SectionWrapper isActive={activeSection === 'utbildning'}>
              <SectionLabel>Utbildning</SectionLabel>
              {educations.length > 0 ? (
                <div className="space-y-2">
                  {educations.slice(0, 3).map((edu, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-ink-1">{edu.degree || 'Examen'}</p>
                      <p className="text-meta text-ink-3">
                        {[edu.institution, edu.graduationYear ?? edu.endDate]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-meta italic text-ink-3">Din utbildning visas här</p>
              )}
            </SectionWrapper>
          </div>

          {/* Kompetenser */}
          <div className="mt-4 border-t border-kant pt-4">
            <SectionWrapper isActive={activeSection === 'kompetenser'}>
              <SectionLabel>Kompetenser</SectionLabel>
              {skills.length > 0 ? (
                <div className="space-y-2">
                  {skills.slice(0, 4).map((skill, i) => (
                    <div key={i}>
                      {skill.category && (
                        <p className="mb-1 text-meta font-medium text-ink-2">{skill.category}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {(skill.skills ?? []).slice(0, 8).map((s, j) => (
                          <span key={`${i}-${j}`} className={CHIP}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span key={i} className="inline-flex h-6 w-16 rounded-lg bg-insunken" />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </div>

          {/* Språk */}
          <div className="mt-4 border-t border-kant pt-4">
            <SectionWrapper isActive={activeSection === 'sprak'}>
              <SectionLabel>Språk</SectionLabel>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {languages.map((lang, i) => (
                    <p key={i} className="text-meta">
                      <span className="font-medium text-ink-1">{lang.language}</span>{' '}
                      <span className="text-ink-3">{lang.proficiency}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-meta italic text-ink-3">Dina språk visas här</p>
              )}
            </SectionWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}
