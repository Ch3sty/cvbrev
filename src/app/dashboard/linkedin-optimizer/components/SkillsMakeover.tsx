'use client'

import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'

interface SkillSuggestion {
  skill: string
  reason?: string
  replace_with?: string
}

interface SkillsAnalysis {
  strong_skills?: string[]
  weak_skills?: SkillSuggestion[]
  suggested_skills?: SkillSuggestion[]
}

interface Props {
  rawJson: string
}

function parseSkills(raw: string): SkillsAnalysis {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (parsed && typeof parsed === 'object') {
      return {
        strong_skills: Array.isArray(parsed.strong_skills)
          ? parsed.strong_skills.filter(
              (s: unknown): s is string => typeof s === 'string'
            )
          : [],
        weak_skills: Array.isArray(parsed.weak_skills)
          ? parsed.weak_skills
              .map((s: any) =>
                typeof s === 'string'
                  ? { skill: s }
                  : s && typeof s === 'object' && typeof s.skill === 'string'
                  ? s
                  : null
              )
              .filter(Boolean)
          : [],
        suggested_skills: Array.isArray(parsed.suggested_skills)
          ? parsed.suggested_skills
              .map((s: any) =>
                typeof s === 'string'
                  ? { skill: s }
                  : s && typeof s === 'object' && typeof s.skill === 'string'
                  ? s
                  : null
              )
              .filter(Boolean)
          : [],
      }
    }
  } catch {
    // ignore
  }
  return { strong_skills: [], weak_skills: [], suggested_skills: [] }
}

function GroupLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-ink-3">{label}</p>
      <span className="text-meta tabular-nums text-ink-3">{count}</span>
    </div>
  )
}

/**
 * Kompetensgenomgången: tre grupper (behåll, byt ut, lägg till) med
 * kant-ramade rader. Tonen sitter i texten, aldrig i ytan.
 */
export default function SkillsMakeover({ rawJson }: Props) {
  const data = useMemo(() => parseSkills(rawJson), [rawJson])

  const strong = data.strong_skills ?? []
  const weak = data.weak_skills ?? []
  const suggested = data.suggested_skills ?? []

  const hasAny = strong.length > 0 || weak.length > 0 || suggested.length > 0

  if (!hasAny) {
    return (
      <p className="text-sm leading-[22px] text-ink-2">
        Vi kunde inte tolka kompetenssvaret. Kopiera direkt från resultaten i stället.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Behåll */}
      <div>
        <GroupLabel label="Behåll" count={strong.length} />
        {strong.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {strong.map((skill) => (
              <li
                key={skill}
                className="inline-flex min-h-8 items-center rounded-lg border border-kant bg-panel px-2 text-sm text-ink-1"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-meta text-ink-3">Inga starka kompetenser hittade.</p>
        )}
      </div>

      {/* Byt ut */}
      <div>
        <GroupLabel label="Byt ut" count={weak.length} />
        {weak.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {weak.map((s) => (
              <li key={s.skill} className="rounded-lg border border-kant bg-panel px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-ink-3 line-through">{s.skill}</span>
                  {s.replace_with && (
                    <>
                      <ArrowRight
                        className="h-5 w-5 text-ink-3"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium text-ink-1">{s.replace_with}</span>
                    </>
                  )}
                </div>
                {s.reason && <p className="mt-1 text-meta text-ink-3">{s.reason}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-meta text-positiv">Inga svaga kompetenser hittade.</p>
        )}
      </div>

      {/* Lägg till */}
      <div>
        <GroupLabel label="Lägg till" count={suggested.length} />
        {suggested.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {suggested.map((s) => (
              <li key={s.skill} className="rounded-lg border border-kant bg-panel px-3 py-2">
                <p className="text-sm font-medium text-ink-1">{s.skill}</p>
                {s.reason && <p className="mt-1 text-meta text-ink-3">{s.reason}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-meta text-ink-3">Inga ytterligare förslag.</p>
        )}
      </div>
    </div>
  )
}
