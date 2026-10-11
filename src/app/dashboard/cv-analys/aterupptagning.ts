/**
 * Återupptagen CV-analys (art-director 21.2 fråga 2 och 21.3 punkt 2).
 *
 * "Åtgärda i CV:t" i CV-rummet lovar att åtgärda ett fynd ur en analys som
 * redan är sparad i cv_analysis_jobs.result. Knappen öppnar därför den
 * sparade analysen med ?job=<id> i granskningssteget, utan nytt AI-anrop,
 * utan kvot och utan ny rad i cv_analysis_jobs. Regeln för alla rum: ett
 * lyft kort som pekar på sparad data öppnar den datan.
 *
 * Klientsäker, inga beroenden.
 */

export interface AterupptagenAnalys {
  id: string
  cvId: string | null
  displayName: string | null
  /** cv_analysis_jobs.result, som analysen sparade den. */
  result: Record<string, unknown>
}

/** Det wizarden behöver ur den sparade analysen. */
export interface Aterupptagning {
  cvId: string | null
  /** Resultatet i samma form som pollningen ger det (id och display_name inräknade). */
  resultat: Record<string, unknown> & { id: string }
  harStrukturerad: boolean
  /** Förvalda förbättringar: de som valdes senast, annars alla analysens förslag. */
  val: { profil: boolean; roller: number[]; kompetenser: number[]; allmant: number[] }
  /** Steget att landa i, ettbaserat som ?steg=N: granskningen (5) eller resultatet (3). */
  steg: number
}

function index(lista: unknown, ok: (v: Record<string, unknown>) => boolean): number[] {
  if (!Array.isArray(lista)) return []
  return lista.flatMap((v, i) => (v && typeof v === 'object' && ok(v as Record<string, unknown>) ? [i] : []))
}

function talLista(v: unknown): number[] | null {
  return Array.isArray(v) && v.every((n) => typeof n === 'number') ? (v as number[]) : null
}

export function aterupptagning(a: AterupptagenAnalys): Aterupptagning {
  const r = a.result
  const profil = r.profileSummary as Record<string, unknown> | undefined
  const sparat = r.selectedImprovements as Record<string, unknown> | undefined
  const harProfil = typeof profil?.improvedText === 'string' && profil.improvedText.trim().length > 0
  const roller = index(r.roleBasedImprovements, (v) => typeof v.suggestedText === 'string' && v.suggestedText.trim().length > 0)
  const kompetenser = index(r.skillSuggestions, (v) => typeof v.skill === 'string' && v.skill.trim().length > 0)
  const val = sparat
    ? {
        profil: sparat.profile === true && harProfil,
        roller: (talLista(sparat.roles) ?? []).filter((i) => roller.includes(i)),
        kompetenser: (talLista(sparat.skills) ?? []).filter((i) => kompetenser.includes(i)),
        allmant: talLista(sparat.general) ?? [],
      }
    : { profil: harProfil, roller, kompetenser, allmant: [] as number[] }
  const harStrukturerad = Boolean(r.structuredCV && typeof r.structuredCV === 'object')
  return {
    cvId: a.cvId,
    resultat: { ...r, id: a.id, display_name: a.displayName },
    harStrukturerad,
    val,
    // Granskningen behöver det strukturerade CV:t för att visa före och efter.
    steg: harStrukturerad ? 5 : 3,
  }
}
