/**
 * Analysens potential: hur högt läsbarhetspoängen kan nå med alla förslag.
 *
 * Uträkningen är analysöversiktens ("Så beräknar vi din potential"), flyttad
 * hit oförändrad ur CVAnalysisWizard så att Ditt CV och analysen visar samma
 * tal: profilens atsImpact, snittet av de fem tyngsta rollerna gånger fyra,
 * kompetenserna efter relevans (hög 1, medel 0,5, annars 0,3) och de
 * allmänna förslagen efter kategori (Nyckelord 2, Innehåll 1, annars 0,5).
 * Summan avrundas, potentialen är poängen plus summan, högst 100.
 *
 * Klientsäker, ren funktion.
 */

export interface PotentialUnderlag {
  profileSummary?: { atsImpact?: unknown } | null
  roleBasedImprovements?: ReadonlyArray<{ atsImpact?: unknown }> | null
  skillSuggestions?: ReadonlyArray<{ relevance?: unknown }> | null
  generalImprovements?: ReadonlyArray<{ category?: unknown }> | null
}

export interface Potential {
  profile: number
  roles: number
  skills: number
  general: number
  total: number
}

const tal = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : 0
}

export function raknaPotential(r: PotentialUnderlag | null | undefined): Potential {
  const ut: Potential = { profile: 0, roles: 0, skills: 0, general: 0, total: 0 }
  if (!r) return ut
  let summa = 0

  if (tal(r.profileSummary?.atsImpact)) {
    ut.profile = tal(r.profileSummary?.atsImpact)
    summa += ut.profile
  }

  const roller = r.roleBasedImprovements ?? []
  if (roller.length > 0) {
    const tyngsta = [...roller].sort((a, b) => tal(b.atsImpact) - tal(a.atsImpact)).slice(0, Math.min(5, roller.length))
    const snitt = tyngsta.reduce((s, x) => s + tal(x.atsImpact), 0) / tyngsta.length
    ut.roles = Math.round(snitt * 4)
    summa += ut.roles
  }

  if (r.skillSuggestions) {
    ut.skills = r.skillSuggestions.reduce((s, k) => s + (k.relevance === 'high' ? 1 : k.relevance === 'medium' ? 0.5 : 0.3), 0)
    summa += ut.skills
  }

  if (r.generalImprovements) {
    ut.general = r.generalImprovements.reduce((s, g) => s + (g.category === 'Nyckelord' ? 2 : g.category === 'Innehåll' ? 1 : 0.5), 0)
    summa += ut.general
  }

  ut.total = Math.round(summa)
  return ut
}

/** Poängen med alla förslag, högst 100. */
export function potentialPoang(poang: number, r: PotentialUnderlag | null | undefined): number {
  return Math.min(100, poang + raknaPotential(r).total)
}
