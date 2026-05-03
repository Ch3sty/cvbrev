import type { ParsedCV } from '@/lib/cv/cv-parser'

export interface LinkedInSectionsFromCV {
  headline: string
  about: string
  experience: string
  education: string
  skills: string
}

/**
 * Mappar parsad CV-data till LinkedIn-sektioner som autofyll.
 *
 * - headline lämnas tom (CV har ingen LinkedIn-headline — låter LLM föreslå)
 * - about hämtas från profile-sammanfattningen om den finns
 * - experience formateras som blocks: titel / företag · period / beskrivning / bullets
 * - education formateras som examen · institution · period
 * - skills komma-separeras
 *
 * Pure function — inga side-effects, lätt att unit-testa.
 */
export function cvToLinkedIn(
  parsed: ParsedCV | null | undefined
): LinkedInSectionsFromCV {
  if (!parsed) {
    return {
      headline: '',
      about: '',
      experience: '',
      education: '',
      skills: '',
    }
  }

  const experience = (parsed.roles ?? [])
    .map((r) => {
      const titleLine = (r.title ?? '').trim()
      const metaLine = [r.company, r.period]
        .map((s) => (s ?? '').trim())
        .filter(Boolean)
        .join(' · ')
      const descLine = (r.description ?? '').trim()
      const bulletLines = (r.responsibilities ?? [])
        .map((b) => (b ?? '').trim())
        .filter(Boolean)
        .map((b) => `• ${b}`)
        .join('\n')

      return [titleLine, metaLine, descLine, bulletLines]
        .filter(Boolean)
        .join('\n')
    })
    .filter(Boolean)
    .join('\n\n')

  const education = (parsed.education ?? [])
    .map((e) =>
      [e.degree, e.institution, e.period]
        .map((s) => (s ?? '').trim())
        .filter(Boolean)
        .join(' · ')
    )
    .filter(Boolean)
    .join('\n\n')

  const skills = (parsed.skills ?? [])
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
    .join(', ')

  return {
    headline: '',
    about: (parsed.profile ?? '').trim(),
    experience: experience.trim(),
    education: education.trim(),
    skills: skills.trim(),
  }
}
