type SkillSuggestion = {
  skill?: string
  reason?: string
  replace_with?: string
}

/**
 * Tar skills-output från optimize-linkedin edge functionen (objekt eller string)
 * och formaterar till svensk eller engelsk läsbar text.
 *
 * Edge functionen returnerar ett objekt med strong_skills/weak_skills/suggested_skills.
 * Naiv string-konkatenering ger "[object Object]" — denna helper formaterar det
 * till en läsbar lista istället.
 */
export function formatSkillsForCopy(
  raw: unknown,
  language: 'sv' | 'en' = 'sv'
): string {
  // Försök parsa string som JSON; om det inte är JSON, returnera bara strängen
  let data: any = raw
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    try {
      data = JSON.parse(trimmed)
    } catch {
      // Inte JSON — använd strängen som den är
      return trimmed
    }
  }

  if (!data || typeof data !== 'object') return ''

  const labels =
    language === 'sv'
      ? { keep: 'Behåll', swap: 'Byt ut', add: 'Lägg till' }
      : { keep: 'Keep', swap: 'Replace', add: 'Add' }

  const lines: string[] = []

  // Behåll
  if (Array.isArray(data.strong_skills) && data.strong_skills.length > 0) {
    const strongs = data.strong_skills
      .map((s: unknown) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean)
    if (strongs.length > 0) {
      lines.push(`${labels.keep}: ${strongs.join(', ')}`)
    }
  }

  // Byt ut
  if (Array.isArray(data.weak_skills) && data.weak_skills.length > 0) {
    const swaps = data.weak_skills
      .map((s: SkillSuggestion | string) => {
        if (typeof s === 'string') return s.trim()
        if (s && typeof s === 'object') {
          const skill = (s.skill ?? '').trim()
          const replace = (s.replace_with ?? '').trim()
          if (!skill) return ''
          return replace ? `${skill} → ${replace}` : skill
        }
        return ''
      })
      .filter(Boolean)
    if (swaps.length > 0) {
      lines.push(`${labels.swap}: ${swaps.join(', ')}`)
    }
  }

  // Lägg till
  if (Array.isArray(data.suggested_skills) && data.suggested_skills.length > 0) {
    const adds = data.suggested_skills
      .map((s: SkillSuggestion | string) => {
        if (typeof s === 'string') return s.trim()
        if (s && typeof s === 'object') return (s.skill ?? '').trim()
        return ''
      })
      .filter(Boolean)
    if (adds.length > 0) {
      lines.push(`${labels.add}: ${adds.join(', ')}`)
    }
  }

  return lines.join('\n')
}
