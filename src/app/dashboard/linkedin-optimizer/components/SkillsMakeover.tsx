'use client'

import { Check, X, Plus, ArrowRight } from 'lucide-react'
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

export default function SkillsMakeover({ rawJson }: Props) {
  const data = useMemo(() => parseSkills(rawJson), [rawJson])

  const hasAny =
    (data.strong_skills && data.strong_skills.length > 0) ||
    (data.weak_skills && data.weak_skills.length > 0) ||
    (data.suggested_skills && data.suggested_skills.length > 0)

  if (!hasAny) {
    return (
      <p className="text-sm text-slate-500 italic">
        Vi kunde inte tolka skills-svaret. Kopiera direkt från resultaten istället.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Behåll */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Behåll
          </span>
          <span className="ml-auto text-[10px] font-bold text-emerald-700 tabular-nums">
            {data.strong_skills?.length ?? 0}
          </span>
        </div>
        {data.strong_skills && data.strong_skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {data.strong_skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-emerald-200 text-emerald-800"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic">Inga starka skills hittade.</p>
        )}
      </div>

      {/* Byt ut */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            }}
          >
            <X className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
            Byt ut
          </span>
          <span className="ml-auto text-[10px] font-bold text-orange-700 tabular-nums">
            {data.weak_skills?.length ?? 0}
          </span>
        </div>
        {data.weak_skills && data.weak_skills.length > 0 ? (
          <div className="space-y-2">
            {data.weak_skills.map((s) => (
              <div
                key={s.skill}
                className="rounded-lg bg-white border border-orange-100 px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-orange-900 line-through opacity-70">
                    {s.skill}
                  </span>
                  {s.replace_with && (
                    <>
                      <ArrowRight
                        className="w-3 h-3 text-orange-600"
                        strokeWidth={2.6}
                      />
                      <span className="text-[11px] font-bold text-orange-800">
                        {s.replace_with}
                      </span>
                    </>
                  )}
                </div>
                {s.reason && (
                  <p className="text-[10px] text-slate-500 leading-snug mt-1">
                    {s.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic">
            Inga svaga skills hittade. Bra jobbat!
          </p>
        )}
      </div>

      {/* Lägg till */}
      <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #DC2626 0%, #BE185D 100%)',
            }}
          >
            <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.8} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-700">
            Lägg till
          </span>
          <span className="ml-auto text-[10px] font-bold text-orange-700 tabular-nums">
            {data.suggested_skills?.length ?? 0}
          </span>
        </div>
        {data.suggested_skills && data.suggested_skills.length > 0 ? (
          <div className="space-y-2">
            {data.suggested_skills.map((s) => (
              <div
                key={s.skill}
                className="rounded-lg bg-white border border-orange-100 px-2.5 py-2"
              >
                <div className="flex items-center gap-1.5">
                  <Plus
                    className="w-3 h-3 text-orange-600 flex-shrink-0"
                    strokeWidth={2.8}
                  />
                  <span className="text-[11px] font-bold text-slate-900">
                    {s.skill}
                  </span>
                </div>
                {s.reason && (
                  <p className="text-[10px] text-slate-500 leading-snug mt-1 ml-4">
                    {s.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic">
            Inga ytterligare förslag.
          </p>
        )}
      </div>
    </div>
  )
}
