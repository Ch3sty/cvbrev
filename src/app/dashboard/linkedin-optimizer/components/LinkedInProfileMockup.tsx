'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Users, Briefcase, GraduationCap } from 'lucide-react'

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
  /** Visas som etikett ovanpå mockupen (t.ex. "Före" / "Efter") */
  badge?: string
  /** Om satt: gör sektioner klickbara */
  onSectionClick?: (section: MockupSection) => void
  /** Markera en sektion som "aktiv" (highlight border) */
  activeSection?: MockupSection
  /** Använd glow bakom mockupen (default: true på desktop) */
  showGlow?: boolean
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
    // Markdown-länkar [text](url) → text
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
      className={`group relative w-full text-left transition-all ${
        isClickable
          ? 'cursor-pointer hover:bg-orange-50/50 rounded-lg -mx-2 px-2 py-1.5'
          : ''
      } ${isActive ? 'bg-orange-50/70 rounded-lg -mx-2 px-2 py-1.5' : ''}`}
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
    </Component>
  )
}

export default function LinkedInProfileMockup({
  data,
  variant = 'live',
  badge,
  onSectionClick,
  activeSection,
  showGlow = true,
  className = '',
}: Props) {
  const isSkeleton = variant === 'skeleton'
  const isOptimized = variant === 'optimized'

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
        {/* Badge ovanpå (Före/Efter) */}
        {badge && (
          <div className="absolute top-3 right-3 z-10">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] text-white"
              style={{
                background: isOptimized
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'rgba(15, 23, 42, 0.85)',
                boxShadow: '0 4px 10px -3px rgba(0, 0, 0, 0.25)',
              }}
            >
              {badge}
            </span>
          </div>
        )}

        {/* Banner */}
        <div
          className="h-20 sm:h-24 relative overflow-hidden"
          style={{
            background: isSkeleton
              ? 'linear-gradient(135deg, #FED7AA 0%, #FCA5A5 50%, #F9A8D4 100%)'
              : 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
        >
          {!isSkeleton && (
            <svg
              className="absolute inset-0 w-full h-full opacity-25"
              aria-hidden="true"
            >
              <pattern
                id={`li-mockup-lines-${variant}-${badge ?? 'plain'}`}
                x="0"
                y="0"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="32"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
              <rect
                width="100%"
                height="100%"
                fill={`url(#li-mockup-lines-${variant}-${badge ?? 'plain'})`}
              />
            </svg>
          )}
        </div>

        {/* Avatar */}
        <div className="relative px-5 sm:px-6">
          <div
            className="absolute -top-9 left-5 sm:left-6 w-[68px] h-[68px] rounded-full bg-white border-4 border-white flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.22)',
            }}
          >
            <span
              className="absolute inset-1 rounded-full flex items-center justify-center"
              style={{
                background: hasName
                  ? 'linear-gradient(135deg, #FED7AA 0%, #FECACA 100%)'
                  : '#F1F5F9',
              }}
            >
              <span
                className={`font-black text-lg ${
                  hasName ? 'text-orange-700' : 'text-slate-300'
                }`}
              >
                {initials}
              </span>
            </span>
          </div>
        </div>

        {/* Namn-block */}
        <div className="px-5 sm:px-6 pt-12 pb-4">
          <p
            className={`text-base font-black leading-tight ${
              hasName ? 'text-slate-900' : 'text-slate-300'
            }`}
          >
            {displayName}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" strokeWidth={2.2} />
            <span className="truncate">{displayLocation}</span>
            <span className="text-slate-300">·</span>
            <Users className="w-3 h-3" strokeWidth={2.2} />
            <span>500+ kontakter</span>
          </div>
        </div>

        {/* Headline */}
        <div className="px-5 sm:px-6 pb-4">
          <SectionWrapper
            section="headline"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            <p
              className={`text-sm font-bold leading-snug ${
                hasHeadline ? 'text-slate-900' : 'text-slate-300 italic'
              }`}
            >
              {displayHeadline}
            </p>
          </SectionWrapper>
        </div>

        {/* About */}
        <div className="px-5 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-1 h-3 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
              }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Om mig
            </span>
          </div>
          <SectionWrapper
            section="about"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            <p
              className={`text-xs leading-relaxed line-clamp-4 whitespace-pre-line ${
                hasAbout ? 'text-slate-700' : 'text-slate-300 italic'
              }`}
            >
              {displayAbout}
            </p>
          </SectionWrapper>
        </div>

        {/* Erfarenhet */}
        <div className="px-5 sm:px-6 pb-4 border-t border-orange-50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-3.5 h-3.5 text-orange-700" strokeWidth={2.2} />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Erfarenhet
            </span>
          </div>
          <SectionWrapper
            section="experience"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {experiences.length > 0 ? (
              <div className="space-y-3">
                {experiences.map((exp, i) => (
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
                      {(exp.meta || exp.title).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {exp.title}
                      </p>
                      {exp.meta && (
                        <p className="text-[11px] text-slate-500 truncate">
                          {exp.meta}
                        </p>
                      )}
                      {exp.body && (
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mt-0.5">
                          {exp.body}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
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
                  Din erfarenhet dyker upp här
                </p>
              </div>
            )}
          </SectionWrapper>
        </div>

        {/* Utbildning */}
        <div className="px-5 sm:px-6 pb-4 border-t border-orange-50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap
              className="w-3.5 h-3.5 text-orange-700"
              strokeWidth={2.2}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Utbildning
            </span>
          </div>
          <SectionWrapper
            section="education"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {educations.length > 0 ? (
              <div className="space-y-2">
                {educations.map((edu, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {edu.school}
                    </p>
                    {edu.meta && (
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {edu.meta}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-300 italic">
                Lägg till din utbildning för en starkare profil
              </p>
            )}
          </SectionWrapper>
        </div>

        {/* Kompetenser */}
        <div className="px-5 sm:px-6 pb-5 border-t border-orange-50 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-1 h-3 rounded-sm"
              style={{
                background:
                  'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
              }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              Kompetenser
            </span>
          </div>
          <SectionWrapper
            section="skills"
            onSectionClick={onSectionClick}
            activeSection={activeSection}
          >
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-orange-200 text-slate-700"
                  >
                    {skill}
                  </span>
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
      </motion.div>
    </div>
  )
}
