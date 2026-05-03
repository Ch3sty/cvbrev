import type { ParsedCV } from '@/lib/cv/cv-parser'

export interface LinkedInSectionsFromCV {
  headline: string
  about: string
  experience: string
  education: string
  skills: string
}

/**
 * Säker konvertering till string. Parsade CV:er kan ibland innehålla
 * non-string-värden där typen säger string (gammal AI-parsning, JSON-objekt
 * från LLM som inte följt schema, null/undefined).
 */
function safeStr(value: unknown): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    return value
      .map((v) => safeStr(v))
      .filter(Boolean)
      .join(' ')
  }
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
 * Mappar parsad CV-data till LinkedIn-sektioner som autofyll.
 *
 * - headline lämnas tom (CV har ingen LinkedIn-headline — låter LLM föreslå)
 * - about hämtas från profile-sammanfattningen om den finns
 * - experience formateras som blocks: titel / företag · period / beskrivning / bullets
 * - education formateras som examen · institution · period
 * - skills komma-separeras
 *
 * Pure function — inga side-effects, lätt att unit-testa.
 * Defensiv mot non-string-fält i parsed CV (vanligt i äldre AI-output).
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

  const roles = Array.isArray(parsed.roles) ? parsed.roles : []
  const experience = roles
    .map((r) => {
      if (!r || typeof r !== 'object') return ''
      const titleLine = safeStr(r.title).trim()
      const metaLine = [r.company, r.period]
        .map((s) => safeStr(s).trim())
        .filter(Boolean)
        .join(' · ')
      const descLine = safeStr(r.description).trim()
      const responsibilities = Array.isArray(r.responsibilities)
        ? r.responsibilities
        : []
      const bulletLines = responsibilities
        .map((b) => safeStr(b).trim())
        .filter(Boolean)
        .map((b) => `• ${b}`)
        .join('\n')

      return [titleLine, metaLine, descLine, bulletLines]
        .filter(Boolean)
        .join('\n')
    })
    .filter(Boolean)
    .join('\n\n')

  const educationList = Array.isArray(parsed.education) ? parsed.education : []
  const education = educationList
    .map((e) => {
      if (!e || typeof e !== 'object') return ''
      return [e.degree, e.institution, e.period]
        .map((s) => safeStr(s).trim())
        .filter(Boolean)
        .join(' · ')
    })
    .filter(Boolean)
    .join('\n\n')

  const skillsList = Array.isArray(parsed.skills) ? parsed.skills : []
  const skills = skillsList
    .map((s) => safeStr(s).trim())
    .filter(Boolean)
    .join(', ')

  return {
    headline: '',
    about: safeStr(parsed.profile).trim(),
    experience: experience.trim(),
    education: education.trim(),
    skills: skills.trim(),
  }
}
