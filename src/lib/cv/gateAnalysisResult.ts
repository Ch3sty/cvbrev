// Gratisnivån ser läsbarhetspoängen, sammanfattningen och det tyngsta fyndet
// i klartext med åtgärd (docs/plan-paket-och-onboarding.md, ägarens beslut 2,
// 2026-09-22). Övriga fynd skickas som rubrik utan åtgärdstext, alltså
// { id, category, severity, title, locked: true }.
//
// Filtreringen är serverside och deterministisk. Servern skickar aldrig full
// text som klienten sedan döljer: att blurra riktig text med CSS vore ingen
// spärr alls, den syns i DOM:en.

/**
 * Ett låst fynd: rubriken, men aldrig åtgärden.
 *
 * Efter ägarens beslut 2 (2026-09-22) visas övriga fynd som rubriker utan
 * åtgärdstext. Rubriken är en kort etikett som servern skriver, inte
 * modellens formulerade förslag, så åtgärden lämnar aldrig servern.
 */
export interface LockedFinding {
  id: string
  category: string
  severity: 'high' | 'medium' | 'low'
  /** Vad fyndet gäller, utan vad du ska göra åt det. */
  title: string
  locked: true
}

export interface GatedAnalysisMeta {
  /** Antal fynd totalt, före filtrering. Driver "Vi hittade N saker". */
  findingsTotal: number
  /** De låsta raderna, i samma ordning som de skulle ha visats. */
  lockedFindings: LockedFinding[]
}

/**
 * Rubriken till ett låst fynd.
 *
 * Bara det som redan står i CV:t eller i kategorin får synas: rolltiteln,
 * kompetensen, kategorinamnet. Modellens formulerade åtgärd stannar på
 * servern, och att korta ner den vore att skicka halva åtgärden.
 */
function lockedTitle(item: unknown, list: Candidate['list'], category: string): string {
  const o = (item ?? {}) as Record<string, unknown>

  if (list === 'roles') {
    const roll = typeof o.roleTitle === 'string' ? o.roleTitle.trim() : ''
    const bolag = typeof o.company === 'string' ? o.company.trim() : ''
    if (roll && bolag) return `${roll}, ${bolag}`
    if (roll) return roll
    return 'En roll i ditt CV'
  }

  if (list === 'skills') {
    const kompetens =
      typeof o.skill === 'string'
        ? o.skill.trim()
        : typeof o.keyword === 'string'
          ? o.keyword.trim()
          : ''
    return kompetens ? `Nyckelordet ${kompetens}` : 'Ett nyckelord som saknas'
  }

  return category
}

/**
 * Hur många fynd gratisnivån ser i klartext, med åtgärd.
 *
 * Ett, sedan ägarens beslut 2 (2026-09-22). Tre fulla fynd låg för nära den
 * färdiga rapporten: den som fått tre åtgärder har fått det hon kom för.
 * Poängen och det tyngsta fyndet upplevs fortfarande på riktigt, och det är
 * aktiveringsögonblicket vi inte rör.
 */
export const FREE_VISIBLE_FINDINGS = 1

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

  const kallaFor = (c: Candidate): unknown =>
    c.list === 'roles' ? roles[c.index] : c.list === 'skills' ? skills[c.index] : general[c.index]

  const meta: GatedAnalysisMeta = {
    findingsTotal: candidates.length,
    lockedFindings: locked.map((c) => ({
      id: c.id,
      category: c.category,
      severity: c.severity,
      title: lockedTitle(kallaFor(c), c.list, c.category),
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
