// A9 (docs/plan-konvertering.md): gratisnivån ser poäng, sammanfattning och
// de tre viktigaste fynden. Resten skickas aldrig till klienten, bara som
// { id, category, severity, locked: true }.
//
// Filtreringen är serverside och deterministisk. Att blurra riktig text med
// CSS vore ingen spärr alls: den syns i DOM:en.

/** Ett låst fynd. Ingen text, bara tillräckligt för att rita en suddad rad. */
export interface LockedFinding {
  id: string
  category: string
  severity: 'high' | 'medium' | 'low'
  locked: true
}

export interface GatedAnalysisMeta {
  /** Antal fynd totalt, före filtrering. Driver "Vi hittade N saker". */
  findingsTotal: number
  /** De låsta raderna, i samma ordning som de skulle ha visats. */
  lockedFindings: LockedFinding[]
}

/** Hur många fynd gratisnivån ser i klartext. */
export const FREE_VISIBLE_FINDINGS = 3

/**
 * atsImpact är den enda severity-liknande signalen analysen producerar.
 * 4 och uppåt är hög, 2 till 3 mellan, resten låg.
 */
function severityFromImpact(impact: unknown): 'high' | 'medium' | 'low' {
  const n = typeof impact === 'number' ? impact : 0
  if (n >= 4) return 'high'
  if (n >= 2) return 'medium'
  return 'low'
}

/** Kategoriordning vid lika severity, enligt planen. */
const CATEGORY_RANK: Record<string, number> = {
  'ats-formatering': 0,
  formatering: 0,
  nyckelord: 1,
  struktur: 2,
  innehåll: 3,
  språk: 4,
}

function categoryRank(category: string): number {
  return CATEGORY_RANK[category.toLowerCase()] ?? 9
}

interface Candidate {
  id: string
  category: string
  severity: 'high' | 'medium' | 'low'
  impact: number
  /** Vilken lista fyndet kom ur, och var i listan */
  list: 'roles' | 'skills' | 'general'
  index: number
}

const SEVERITY_ORDER: Record<'high' | 'medium' | 'low', number> = { high: 0, medium: 1, low: 2 }

/**
 * Filtrerar ett analysresultat för ett konto utan premium.
 *
 * Vi tar bort element ur arrayerna i stället för att nolla fält: klientens
 * val och poängsummering indexerar in i samma arrayer, så borttagning är det
 * enda som håller ihop. Fynden som blir kvar är de tre högst prioriterade.
 *
 * Premium får resultatet orört, och under reverse trial räknas kontot som
 * premium, så allt visas.
 */
export function gateAnalysisResult(
  result: unknown,
  isPremium: boolean
): unknown {
  if (isPremium || !result || typeof result !== 'object') return result

  const r = result as Record<string, unknown>
  const roles = Array.isArray(r.roleBasedImprovements) ? r.roleBasedImprovements : []
  const skills = Array.isArray(r.skillSuggestions) ? r.skillSuggestions : []
  const general = Array.isArray(r.generalImprovements) ? r.generalImprovements : []

  const candidates: Candidate[] = []

  roles.forEach((item, index) => {
    const o = (item ?? {}) as Record<string, unknown>
    const impact = typeof o.atsImpact === 'number' ? o.atsImpact : 0
    candidates.push({
      id: `role-${index}`,
      category: 'Struktur',
      severity: severityFromImpact(impact),
      impact,
      list: 'roles',
      index,
    })
  })

  skills.forEach((item, index) => {
    const o = (item ?? {}) as Record<string, unknown>
    const impact = typeof o.atsImpact === 'number' ? o.atsImpact : 0
    candidates.push({
      id: `skill-${index}`,
      category: 'Nyckelord',
      severity: severityFromImpact(impact),
      impact,
      list: 'skills',
      index,
    })
  })

  general.forEach((item, index) => {
    const o = (item ?? {}) as Record<string, unknown>
    const impact = typeof o.atsImpact === 'number' ? o.atsImpact : 0
    candidates.push({
      id: `general-${index}`,
      category: typeof o.category === 'string' && o.category ? o.category : 'Innehåll',
      severity: severityFromImpact(impact),
      impact,
      list: 'general',
      index,
    })
  })

  // Severity fallande, sedan kategori, sedan ursprunglig ordning. Helt
  // deterministiskt, samma resultat vid varje anrop.
  candidates.sort((a, b) => {
    const bySeverity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (bySeverity !== 0) return bySeverity
    const byImpact = b.impact - a.impact
    if (byImpact !== 0) return byImpact
    const byCategory = categoryRank(a.category) - categoryRank(b.category)
    if (byCategory !== 0) return byCategory
    return a.id.localeCompare(b.id)
  })

  const visible = candidates.slice(0, FREE_VISIBLE_FINDINGS)
  const locked = candidates.slice(FREE_VISIBLE_FINDINGS)

  const keep = (list: Candidate['list']) =>
    new Set(visible.filter((c) => c.list === list).map((c) => c.index))

  const keepRoles = keep('roles')
  const keepSkills = keep('skills')
  const keepGeneral = keep('general')

  const meta: GatedAnalysisMeta = {
    findingsTotal: candidates.length,
    lockedFindings: locked.map((c) => ({
      id: c.id,
      category: c.category,
      severity: c.severity,
      locked: true as const,
    })),
  }

  return {
    ...r,
    roleBasedImprovements: roles.filter((_, i) => keepRoles.has(i)),
    skillSuggestions: skills.filter((_, i) => keepSkills.has(i)),
    generalImprovements: general.filter((_, i) => keepGeneral.has(i)),
    // Profilsammanfattningen är gratis enligt planen, den rörs inte.
    gated: meta,
  }
}
