/**
 * Analysen av ett CV, för Ditt CV och Analys-sidan (CV-rummet omgång 1).
 *
 * Ersätter steg 1:s potential.ts, som summerade AI:ns påhittade plus. Här
 * kommer varje tal ur poängmodellen (src/lib/cv/poang): poängen i dag ur
 * det CV som visas, varje fynds verkliga plus och "med våra förslag".
 *
 * Vilken analys som hör till ett CV:
 *  - den senaste slutförda analysraden med CV:ts id (också raden som skrivs
 *    när ett förbättrat CV sparas eller ersätter det gamla),
 *  - annars, för ett förbättrat CV sparat som nytt (filväg "-improved"),
 *    originalets analys.
 * Poängen räknas alltid på det CV:t som det ser ut nu, så förslag som redan
 * är införda ger noll och visas inte som kvar att göra.
 */
import { poangsattAnalys, poangMedVal, type CvRad, type PoangSammanfattning } from '@/lib/cv/poang'
import type { AnalysUnderlag } from '@/lib/rum/cvRum'

/** Fälten Ditt CV läser ur analysraden. */
export const ANALYS_FALT =
  'id, cv_id, completed_at, display_name, struktur:result->structuredCV, profil:result->profileSummary, roller:result->roleBasedImprovements, kompetenser:result->skillSuggestions, allmant:result->generalImprovements'

export interface AnalysRad {
  id: string
  cv_id: string | null
  completed_at: string | null
  /** result.forbattradSparad: { at, satt } när ett förbättrat CV sparats. */
  forbattrad?: unknown
  /** result.selectedImprovements: finns bara på rader för sparade förbättrade CV. */
  valda?: unknown
}

export interface CvRadMedFil extends CvRad {
  id: string
  original_file_path?: string | null
  created_at?: string | null
  file_name?: string | null
}

/** Senaste analysraden per CV (raderna sorterade, senaste först). */
export function analysPerCv(rader: ReadonlyArray<AnalysRad>): Record<string, string> {
  const ut: Record<string, string> = {}
  for (const r of rader) {
    if (r.cv_id && !(r.cv_id in ut)) ut[r.cv_id] = r.id
  }
  return ut
}

const arForbattrad = (r: AnalysRad) =>
  Boolean(r.forbattrad && typeof r.forbattrad === 'object') || Boolean(r.valda && typeof r.valda === 'object')

/**
 * När CV:t åtgärdades (dokumentets väg), eller null. Sant när
 *  - ett förbättrat CV ersatt det på plats (analysraden för CV:t bär
 *    forbattradSparad, eller selectedImprovements från äldre sparningar),
 *  - det är ett förbättrat CV sparat som nytt (filväg "-improved"),
 *  - eller dess förbättrade version finns sparad som eget CV.
 */
export function atgardadAtFor(cv: CvRadMedFil, cvs: ReadonlyArray<CvRadMedFil>, rader: ReadonlyArray<AnalysRad>): string | null {
  const egen = rader.find((r) => r.cv_id === cv.id && arForbattrad(r))
  if (egen) {
    const at = (egen.forbattrad as { at?: unknown } | null)?.at
    return typeof at === 'string' ? at : egen.completed_at
  }
  const fil = cv.original_file_path ?? ''
  if (fil.endsWith('-improved')) return cv.created_at ?? null
  return cvs.find((c) => c.original_file_path === `${fil}-improved`)?.created_at ?? null
}

/** Analysen som hör till CV:t: egen rad, annars originalets för ett "-improved". */
export function analysIdFor(cv: CvRadMedFil, cvs: ReadonlyArray<CvRadMedFil>, jobbPerCv: Record<string, string>): string | null {
  if (jobbPerCv[cv.id]) return jobbPerCv[cv.id]
  const fil = cv.original_file_path ?? ''
  if (!fil.endsWith('-improved')) return null
  const original = cvs.find((c) => c.original_file_path === fil.replace(/-improved$/, ''))
  return original && jobbPerCv[original.id] ? jobbPerCv[original.id] : null
}

/**
 * Ditt CV:s underlag ur en analysrad (ANALYS_FALT), poängsatt på CV:t som
 * visas. Bara rubrik och plus följer med till klienten. Gratisnivån får inga
 * åtgärdstexter (rådens beskrivningar tas bort); poängen och plusen är tal,
 * inte åtgärder, och visas för alla.
 */
export function underlagUrRad(
  rad: Record<string, unknown>,
  cv: CvRadMedFil,
  harFull: boolean
): AnalysUnderlag {
  const analys = poangsattAnalys(
    {
      structuredCV: rad.struktur,
      profileSummary: rad.profil,
      roleBasedImprovements: rad.roller,
      skillSuggestions: rad.kompetenser,
      generalImprovements: rad.allmant,
    },
    cv
  )
  const s = analys.poang as PoangSammanfattning | null
  const kompetenser = Array.isArray(analys.skillSuggestions) ? (analys.skillSuggestions as Array<Record<string, unknown>>) : null
  const forvalda = (kompetenser ?? []).flatMap((k, i) => (k.forvald === true ? [i] : []))
  const medKomp = s && forvalda.length > 0 ? poangMedVal(analys, { profil: false, roller: [], kompetenser: forvalda }) : null
  return {
    jobbId: (rad.id as string) ?? null,
    cvId: (rad.cv_id as string) ?? null,
    klar: (rad.completed_at as string) ?? null,
    namn: (rad.display_name as string) || cv.file_name || null,
    poang: s ? s.idag : null,
    profil: analys.profileSummary ? { atsImpact: (analys.profileSummary as { atsImpact?: unknown }).atsImpact } : null,
    roller: Array.isArray(analys.roleBasedImprovements)
      ? (analys.roleBasedImprovements as Array<Record<string, unknown>>).map((r) => ({
          roleTitle: r.roleTitle,
          company: r.company,
          atsImpact: r.atsImpact,
        }))
      : null,
    kompetenser: kompetenser ? kompetenser.map((k) => ({ skill: k.skill, atsImpact: k.atsImpact })) : null,
    allmant: Array.isArray(analys.generalImprovements)
      ? (analys.generalImprovements as Array<Record<string, unknown>>).map((g) => ({
          title: g.title,
          description: harFull ? g.description : '',
          atsImpact: g.atsImpact,
        }))
      : null,
    kompetenserPlus: s && medKomp ? medKomp.total - s.idag : null,
    medForslag: s ? s.medAlla : null,
  }
}

/**
 * Underlaget för CV:t som visas. Läser analysraden (senaste raden återanvänds
 * om den är rätt) och poängsätter den på CV:t.
 */
export async function underlagForCv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  cv: CvRadMedFil,
  cvs: ReadonlyArray<CvRadMedFil>,
  jobbPerCv: Record<string, string>,
  senaste: Record<string, unknown> | null,
  opts: { harFull: boolean }
): Promise<AnalysUnderlag | null> {
  const jobbId = analysIdFor(cv, cvs, jobbPerCv)
  if (!jobbId) return null
  let rad = senaste && senaste.id === jobbId ? senaste : null
  if (!rad) {
    const { data } = await supabase.from('cv_analysis_jobs').select(ANALYS_FALT).eq('id', jobbId).eq('user_id', userId).maybeSingle()
    rad = (data as Record<string, unknown> | null) ?? null
  }
  return rad ? underlagUrRad(rad, cv, opts.harFull) : null
}
