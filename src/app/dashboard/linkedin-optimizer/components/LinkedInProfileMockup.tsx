'use client'

import { useMemo } from 'react'

export type MockupVariant = 'skeleton' | 'live' | 'optimized'
export type MockupSection = 'headline' | 'about' | 'experience' | 'education' | 'skills'

export interface ProfileMockupData {
  fullName?: string
  location?: string
  headline?: string
  about?: string
  experience?: string
  education?: string
  /** Skills kan vara komma-separerad sträng eller JSON-objekt från optimizern */
  skills?: string
}

interface Props {
  data: ProfileMockupData
  variant?: MockupVariant
  /** Visas som etikett ovanför mockupen (t.ex. "Före" / "Efter") */
  badge?: string
  /** Om satt: gör sektioner klickbara */
  onSectionClick?: (section: MockupSection) => void
  /** Markera en sektion som aktiv (kant i ink-1) */
  activeSection?: MockupSection
  className?: string
}

const PLACEHOLDER_NAME = 'Förnamn Efternamn'
const PLACEHOLDER_LOCATION = 'Stockholm, Sverige'
const PLACEHOLDER_HEADLINE = 'Din rubrik kommer synas här'
const PLACEHOLDER_ABOUT =
  'Din presentationstext dyker upp här när du klistrar in din "Om mig"-sektion.'

/**
 * Säker konvertering till string. Edge function kan ibland returnera objekt
 * istället för string för vissa fält (t.ex. skills som JSON-objekt).
 */
function safeStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return String(value)
}

/**
 * Strippa markdown-syntax så texten visas rent i mockupen.
 * Edge functionens optimerade output använder ofta **bold**, *italic*,
 * `- bullet`, `### heading` etc. som ser fult ut i en visuell mockup.
 */
function stripMarkdown(text: string): string {
  return text
    // Tre-stjärnig bold-italic
    .replace(/\*\*\*([^*]+?)\*\*\*/g, '$1')
    // Bold **text**
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    // Italic *text*  (men inte * i mitten av ord)
    .replace(/(^|\s)\*([^*\n]+?)\*(?=\s|$|[.,;:!?])/g, '$1$2')
    // Underline-bold __text__
    .replace(/__([^_]+?)__/g, '$1')
    // Inline code `text`
    .replace(/`([^`]+?)`/g, '$1')
    // Heading-markörer i början på rad: ###, ##, #
    .replace(/^#{1,6}\s+/gm, '')
    // Bullet-markörer i början på rad: -, *, +
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Numrerade listor: 1.  2.  etc
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Markdown-länkar [text](url) blir text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Blockquote >
    .replace(/^>\s+/gm, '')
    // Trim efter ändringar
    .replace(/[ \t]+\n/g, '\n')
}

function getInitials(name?: unknown): string {
  const safe = safeStr(name)
  if (!safe.trim()) return '?'
  const parts = safe.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}

/**
 * Parsa erfarenhet-text till entries.
 * Vi gör en pragmatisk split: dubbel-radbrytning = ny roll. Första raden = titel, andra = företag/datum.
 */
function parseExperience(text?: unknown): Array<{ title: string; meta: string; body: string }> {
  const safe = stripMarkdown(safeStr(text))
  if (!safe.trim()) return []
  const blocks = safe
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 3)
  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    const title = lines[0] ?? ''
    const meta = lines[1] ?? ''
    const body = lines.slice(2).join(' ')
    return { title, meta, body }
  })
}

function parseEducation(text?: unknown): Array<{ school: string; meta: string }> {
  const safe = stripMarkdown(safeStr(text))
  if (!safe.trim()) return []
  const blocks = safe
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 2)
  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    return {
      school: lines[0] ?? '',
      meta: lines.slice(1).join(' · '),
    }
  })
}

function parseSkills(raw?: unknown): string[] {
  // Hantera direkt objekt-input (edge function kan returnera struktur)
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const strong = Array.isArray(obj.strong_skills)
      ? (obj.strong_skills as unknown[]).filter(
          (s): s is string => typeof s === 'string'
        )
      : []
    const suggested = Array.isArray(obj.suggested_skills)
      ? (obj.suggested_skills as unknown[])
          .map((s) =>
            typeof s === 'string'
              ? s
              : s && typeof s === 'object' && 'skill' in s
              ? safeStr((s as { skill: unknown }).skill)
              : ''
          )
          .filter(Boolean)
      : []
    const combined = [...strong, ...suggested]
    if (combined.length > 0) return combined.slice(0, 8)
    return []
  }

  const safe = safeStr(raw)
  if (!safe.trim()) return []

  // Försök först JSON-parse (för optimerad output som string-JSON)
  try {
    const parsed = JSON.parse(safe)
    if (parsed && typeof parsed === 'object') {
      const strong = Array.isArray(parsed.strong_skills) ? parsed.strong_skills : []
      const suggested = Array.isArray(parsed.suggested_skills)
        ? parsed.suggested_skills.map((s: any) => (typeof s === 'string' ? s : s?.skill)).filter(Boolean)
        : []
      const combined = [...strong, ...suggested]
      if (combined.length > 0) return combined.slice(0, 8)
    }
  } catch {
    // ignore
  }

  // Fall: komma-separerat
  return safe
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8)
}

/**
 * En sektion i mockupen. Klickbar när onSectionClick finns. Den aktiva
 * sektionen får vänsterkant i ink-1 och panelbakgrund: val, inte tråd.
 */
function SectionWrapper({
  section,
  children,
  onSectionClick,
  activeSection,
}: {
  section: MockupSection
  children: React.ReactNode
  onSectionClick?: (section: MockupSection) => void
  activeSection?: MockupSection
}) {
  const isClickable = !!onSectionClick
  const isActive = activeSection === section
  const Component = isClickable ? 'button' : 'div'
  return (
    <Component
      onClick={isClickable ? () => onSectionClick(section) : undefined}
      type={isClickable ? 'button' : undefined}
      aria-pressed={isClickable ? isActive : undefined}
      className={`-mx-2 w-[calc(100%+16px)] rounded-lg border-l-2 px-2 py-1.5 text-left transition-[border-color,background-color] duration-[120ms] ${
        isClickable ? 'cursor-pointer hover:bg-panel' : ''
      } ${isActive ? 'border-ink-1 bg-panel' : 'border-transparent'}`}
    >
      {children}
    </Component>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-meta font-medium text-ink-3">{children}</p>
}

export default function LinkedInProfileMockup({
  data,
  variant = 'live',
  badge,
  onSectionClick,
  activeSection,
  className = '',
}: Props) {
  const isSkeleton = variant === 'skeleton'

  const initials = useMemo(() => getInitials(data.fullName), [data.fullName])
  const experiences = useMemo(() => parseExperience(data.experience), [data.experience])
  const educations = useMemo(() => parseEducation(data.education), [data.education])
  const skills = useMemo(() => parseSkills(data.skills), [data.skills])

  const fullNameStr = stripMarkdown(safeStr(data.fullName)).trim()
  const locationStr = stripMarkdown(safeStr(data.location)).trim()
  const headlineStr = stripMarkdown(safeStr(data.headline)).trim()
  const aboutStr = stripMarkdown(safeStr(data.about)).trim()

  const displayName = fullNameStr || PLACEHOLDER_NAME
  const displayLocation = locationStr || PLACEHOLDER_LOCATION
  const displayHeadline = headlineStr || PLACEHOLDER_HEADLINE
  const displayAbout = aboutStr || PLACEHOLDER_ABOUT

  const hasName = !!fullNameStr
  const hasHeadline = !!headlineStr
  const hasAbout = !!aboutStr

  return (
    <div className={`w-full ${className}`}>
      {badge && <p className="mb-2 text-sm font-medium text-ink-3">{badge}</p>}

      <div
        className={`overflow-hidden rounded-xl border border-kant bg-insunken ${
          isSkeleton ? 'opacity-80' : ''
        }`}
      >
        {/* Huvud: en tunn ink-linje i stället för LinkedIn-banderollen */}
        <div className="h-0.5 w-full bg-ink-1" aria-hidden="true" />

        {/* Namn-block */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-4">
          <span
            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-kant bg-panel text-base font-semibold ${
              hasName ? 'text-ink-1' : 'text-ink-3'
            }`}
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className={`truncate text-kort ${hasName ? 'text-ink-1' : 'text-ink-3'}`}>
              {displayName}
            </p>
            <p className="truncate text-meta text-ink-3">
              {displayLocation} · 500+ kontakter
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="px-4 pb-4">
          <SectionWrapper
            section="headline"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            <p
              className={`text-sm font-medium leading-5 ${
                hasHeadline ? 'text-ink-1' : 'text-ink-3'
              }`}
            >
              {displayHeadline}
            </p>
          </SectionWrapper>
        </div>

        {/* About */}
        <div className="border-t border-kant px-4 pb-4 pt-4">
          <SectionLabel>Om mig</SectionLabel>
          <SectionWrapper
            section="about"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            <p
              className={`line-clamp-4 whitespace-pre-line text-meta ${
                hasAbout ? 'text-ink-2' : 'text-ink-3'
              }`}
            >
              {displayAbout}
            </p>
          </SectionWrapper>
        </div>

        {/* Erfarenhet */}
        <div className="border-t border-kant px-4 pb-4 pt-4">
          <SectionLabel>Erfarenhet</SectionLabel>
          <SectionWrapper
            section="experience"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {experiences.length > 0 ? (
              <div className="space-y-3">
                {experiences.map((exp, i) => (
                  <div key={i} className="flex gap-3">
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-kant bg-panel text-meta font-medium text-ink-2"
                      aria-hidden="true"
                    >
                      {(exp.meta || exp.title).slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-meta font-medium text-ink-1">{exp.title}</p>
                      {exp.meta && <p className="truncate text-meta text-ink-3">{exp.meta}</p>}
                      {exp.body && (
                        <p className="mt-0.5 line-clamp-2 text-meta text-ink-2">{exp.body}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3" aria-hidden="true">
                    <div className="h-8 w-8 shrink-0 rounded-lg border border-kant bg-panel" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-2 w-2/3 rounded bg-kant" />
                      <div className="h-2 w-1/2 rounded bg-kant" />
                    </div>
                  </div>
                ))}
                <p className="mt-1.5 text-meta text-ink-3">Din erfarenhet dyker upp här</p>
              </div>
            )}
          </SectionWrapper>
        </div>

        {/* Utbildning */}
        <div className="border-t border-kant px-4 pb-4 pt-4">
          <SectionLabel>Utbildning</SectionLabel>
          <SectionWrapper
            section="education"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {educations.length > 0 ? (
              <div className="space-y-2">
                {educations.map((edu, i) => (
                  <div key={i}>
                    <p className="text-meta font-medium text-ink-1">{edu.school}</p>
                    {edu.meta && <p className="text-meta text-ink-3">{edu.meta}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-meta text-ink-3">
                Lägg till din utbildning för en starkare profil
              </p>
            )}
          </SectionWrapper>
        </div>

        {/* Kompetenser */}
        <div className="border-t border-kant px-4 pb-4 pt-4">
          <SectionLabel>Kompetenser</SectionLabel>
          <SectionWrapper
            section="skills"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="inline-flex min-h-7 items-center rounded-lg border border-kant bg-panel px-2 text-meta text-ink-2"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2" aria-hidden="true">
                {[1, 2, 3].map((i) => (
                  <span key={i} className="inline-flex h-7 w-16 rounded-lg border border-kant bg-panel" />
                ))}
              </div>
            )}
          </SectionWrapper>
        </div>
      </div>
    </div>
  )
}
