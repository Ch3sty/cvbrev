/**
 * Matchade jobb (F7): sista ansökningsdag ur annonsen och kompetenserna en
 * och en, med den som saknas i CV:t utmärkt. Klientsäker och ren.
 *
 * Vad datan faktiskt innehåller (lästa i koden 2026-11-21):
 *   - Annonsen kommer från Arbetsförmedlingen via edge-funktionen match-jobs.
 *     `application_deadline` är en tid utan tidszon i svensk lokal tid
 *     ("2026-11-30T23:59:59"); `dagFor` läser den som svensk tid, aldrig med
 *     `new Date()` (rättat efter klicktestet 2026-11-21: servern i UTC skrev
 *     en dag för sent). `id` är annons-id:t, `employer.name`,
 *     `headline`, `workplace_address.municipality` och
 *     `application_details.url` / `application_url` / `webpage_url`.
 *   - Kravprofilen är `must_have.skills` och `must_have.work_experiences`,
 *     önskemålen `nice_to_have.*` plus `enrichedSkills`. Bara en liten del av
 *     annonserna har en utskriven kravprofil (match-score.ts: 8 av 600).
 *   - CV:t är `active_cv_for_matching`: `extracted_skills` (strängar) och
 *     `extracted_occupations`.
 * Saknar annonsen kravprofil går det inte att säga vad som saknas. Då listas
 * bara CV:ts kompetenser som nämns i annonstexten, och ingen markeras som
 * saknad (vi påstår aldrig att annonsen krävt något den inte skrivit).
 */
import { jobSkillBuckets, norm, skillsInJobText } from '@/app/dashboard/jobbmatchning/data/match-score'
import { dagFor, dagarMellan, idagSv } from './datum'
import { sistaDagText } from './bana'
import type { Dag } from './typer'

type Annons = Record<string, any>

export interface SistaAnsokningsdag {
  dag: Dag
  dagarKvar: number
  passerad: boolean
  /** "Sista dag tors 26 nov, 5 dagar kvar". */
  text: string
}

/** Sista ansökningsdag ur annonsen, eller null när annonsen inte har någon. */
export function sistaAnsokningsdag(annons: Annons | null | undefined, nu: Date = new Date()): SistaAnsokningsdag | null {
  const dag = dagFor(typeof annons?.application_deadline === 'string' ? annons.application_deadline : null)
  if (!dag) return null
  const idag = idagSv(nu)
  const dagarKvar = dagarMellan(idag, dag)
  return { dag, dagarKvar, passerad: dagarKvar < 0, text: sistaDagText(dag, idag) as string }
}

export interface KompetensRad {
  namn: string
  /** Finns i CV:t. */
  iCv: boolean
  /** 'krav' ur kravprofilen, 'meriterande' ur önskemålen, 'annonstext' när kravprofil saknas. */
  kalla: 'krav' | 'meriterande' | 'annonstext'
}

export interface Kompetenser {
  /** 'kravprofil': annonsens egen lista. 'annonstext': CV:ts kompetenser funna i texten. 'ingen': inget att visa. */
  grund: 'kravprofil' | 'annonstext' | 'ingen'
  rader: KompetensRad[]
  traffar: number
  totalt: number
}

/** Samma jämförelse som match-score.ts (skillHit): delsträng åt båda håll, korta ord exakt. */
function finnsICv(annonsKompetens: string, cvNorm: readonly string[]): boolean {
  const a = norm(annonsKompetens)
  if (a === '') return false
  return cvNorm.some((c) => {
    if (c === '') return false
    if (c === a) return true
    if (c.length <= 3 || a.length <= 3) return false
    return a.includes(c) || c.includes(a)
  })
}

/**
 * Kompetenserna en och en. Med kravprofil: kravlistan (annars önskemålen,
 * samma val som matchgraden gör) med träff eller saknas; de som finns i CV:t
 * först. Utan kravprofil: CV:ts kompetenser som nämns i annonsen, alla träffar.
 */
export function kompetenserEnOchEn(
  annons: Annons | null | undefined,
  cv: { extracted_skills?: string[] | null } | null | undefined
): Kompetenser {
  if (!annons) return { grund: 'ingen', rader: [], traffar: 0, totalt: 0 }
  const cvSkills = (cv?.extracted_skills ?? []).filter((s): s is string => typeof s === 'string')
  const cvNorm = cvSkills.map(norm).filter((s) => s !== '')
  const { must, nice } = jobSkillBuckets(annons)
  const lista = must.length > 0 ? must : nice
  if (lista.length > 0) {
    const kalla: KompetensRad['kalla'] = must.length > 0 ? 'krav' : 'meriterande'
    const rader = lista.map((namn) => ({ namn, iCv: finnsICv(namn, cvNorm), kalla }))
    rader.sort((a, b) => Number(b.iCv) - Number(a.iCv))
    const traffar = rader.filter((r) => r.iCv).length
    return { grund: 'kravprofil', rader, traffar, totalt: rader.length }
  }
  const namnda = skillsInJobText(annons, cvSkills)
  if (namnda.length === 0) return { grund: 'ingen', rader: [], traffar: 0, totalt: 0 }
  return {
    grund: 'annonstext',
    rader: namnda.map((namn) => ({ namn, iCv: true, kalla: 'annonstext' as const })),
    traffar: namnda.length,
    totalt: namnda.length,
  }
}

/** Fälten Ska sökas sparar ur en träff (POST /api/jobbsok/ska-sokas). */
export function sparadFranAnnons(annons: Annons, matchScore?: number | null): {
  job_title: string
  company: string
  location: string | null
  job_ad_url: string | null
  last_application_date: Dag | null
  source: 'match'
  af_ad_id: string | null
  match_score: number | null
} {
  const url = annons.application_details?.url || annons.application_url || annons.webpage_url || null
  return {
    job_title: String(annons.headline ?? '').trim().slice(0, 200) || 'Okänd tjänst',
    company: String(annons.employer?.name ?? '').trim().slice(0, 200) || 'Okänd arbetsgivare',
    location: annons.workplace_address?.municipality ? String(annons.workplace_address.municipality).slice(0, 200) : null,
    job_ad_url: typeof url === 'string' ? url.slice(0, 2048) : null,
    last_application_date: dagFor(typeof annons.application_deadline === 'string' ? annons.application_deadline : null),
    source: 'match',
    af_ad_id: annons.id !== undefined && annons.id !== null ? String(annons.id).slice(0, 100) : null,
    match_score: typeof matchScore === 'number' && Number.isFinite(matchScore) ? Math.max(0, Math.min(100, Math.round(matchScore))) : null,
  }
}
