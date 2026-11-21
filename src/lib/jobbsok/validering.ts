/**
 * Validering av indata till Jobbsökets rutter. Klientsäker och ren, så att
 * arken kan visa samma fel som servern ger.
 */
import { arDag, franStockholm, langDag } from './datum'
import { tolkaVeckansMal } from './veckansMal'
import { INTERVJU_PLATS_MAX, type Dag, type SparadKalla } from './typer'

export type Fel<F extends string> = { fel: F }

const text = (v: unknown, max: number): string | null | undefined => {
  if (v === undefined) return undefined
  if (v === null) return null
  if (typeof v !== 'string') return undefined
  const t = v.replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : null
}

export interface SparadIndata {
  job_title: string
  company: string
  location: string | null
  job_ad_url: string | null
  last_application_date: Dag | null
  source: SparadKalla
  af_ad_id: string | null
  match_score: number | null
  note: string | null
}

const URL_RE = /^https?:\/\/\S+$/i

/** POST /api/jobbsok/ska-sokas. Tjänst och arbetsgivare krävs. */
export function valideraNySparad(raw: unknown): SparadIndata | Fel<'job_title' | 'company' | 'last_application_date' | 'job_ad_url' | 'match_score'> {
  const r = (raw ?? {}) as Record<string, unknown>
  const job_title = text(r.job_title, 200)
  const company = text(r.company, 200)
  if (!job_title) return { fel: 'job_title' }
  if (!company) return { fel: 'company' }
  const sista = r.last_application_date
  if (sista !== undefined && sista !== null && sista !== '' && !arDag(sista)) return { fel: 'last_application_date' }
  const url = text(r.job_ad_url, 2048)
  if (url && !URL_RE.test(url)) return { fel: 'job_ad_url' }
  let match_score: number | null = null
  if (r.match_score !== undefined && r.match_score !== null) {
    if (typeof r.match_score !== 'number' || !Number.isFinite(r.match_score) || r.match_score < 0 || r.match_score > 100) {
      return { fel: 'match_score' }
    }
    match_score = Math.round(r.match_score)
  }
  const af = text(r.af_ad_id === undefined || r.af_ad_id === null ? r.af_ad_id : String(r.af_ad_id), 100) ?? null
  return {
    job_title,
    company,
    location: text(r.location, 200) ?? null,
    job_ad_url: url ?? null,
    last_application_date: arDag(sista) ? sista : null,
    source: r.source === 'match' || (af && r.source !== 'egen') ? 'match' : 'egen',
    af_ad_id: af,
    match_score,
    note: text(r.note, 2000) ?? null,
  }
}

/** PUT /api/jobbsok/ska-sokas/[id]: bara fälten som skickas ändras. */
export function valideraAndradSparad(raw: unknown): Partial<SparadIndata> | Fel<'job_title' | 'company' | 'last_application_date' | 'job_ad_url' | 'tom'> {
  const r = (raw ?? {}) as Record<string, unknown>
  const ut: Partial<SparadIndata> = {}
  if (r.job_title !== undefined) {
    const v = text(r.job_title, 200)
    if (!v) return { fel: 'job_title' }
    ut.job_title = v
  }
  if (r.company !== undefined) {
    const v = text(r.company, 200)
    if (!v) return { fel: 'company' }
    ut.company = v
  }
  if (r.location !== undefined) ut.location = text(r.location, 200) ?? null
  if (r.job_ad_url !== undefined) {
    const v = text(r.job_ad_url, 2048) ?? null
    if (v && !URL_RE.test(v)) return { fel: 'job_ad_url' }
    ut.job_ad_url = v
  }
  if (r.last_application_date !== undefined) {
    const v = r.last_application_date
    if (v === null || v === '') ut.last_application_date = null
    else if (arDag(v)) ut.last_application_date = v
    else return { fel: 'last_application_date' }
  }
  if (r.note !== undefined) ut.note = text(r.note, 2000) ?? null
  if (Object.keys(ut).length === 0) return { fel: 'tom' }
  return ut
}

export interface Intervjutid {
  interview_at: string | null
  interview_place: string | null
}

/**
 * Intervjuns tid och plats: { datum: 'YYYY-MM-DD' | null, tid?: 'HH:mm', plats?: string | null }.
 * datum null tar bort tiden. Utan klockslag sparas 00:00 svensk tid (bara datum).
 * Fält som inte skickas returneras som undefined och lämnas orörda.
 */
export function valideraIntervjutid(raw: unknown): Partial<Intervjutid> | Fel<'datum' | 'tid' | 'plats'> {
  const r = (raw ?? {}) as { datum?: unknown; tid?: unknown; plats?: unknown }
  const ut: Partial<Intervjutid> = {}
  if (r.datum !== undefined) {
    if (r.datum === null || r.datum === '') ut.interview_at = null
    else {
      if (!arDag(r.datum)) return { fel: 'datum' }
      if (r.tid !== undefined && r.tid !== null && r.tid !== '' && typeof r.tid !== 'string') return { fel: 'tid' }
      const iso = franStockholm(r.datum, typeof r.tid === 'string' && r.tid ? r.tid : null)
      if (!iso) return { fel: 'tid' }
      ut.interview_at = iso
    }
  }
  if (r.plats !== undefined) {
    if (r.plats !== null && typeof r.plats !== 'string') return { fel: 'plats' }
    const p = typeof r.plats === 'string' ? r.plats.replace(/\s+/g, ' ').trim() : ''
    if (p.length > INTERVJU_PLATS_MAX) return { fel: 'plats' }
    ut.interview_place = p || null
  }
  return ut
}

export type IntervjuUtfall = 'genomford' | 'flyttad' | 'installd'

/** "Hur gick intervjun?": { svar, datum?, tid?, plats? } (datum och tid krävs för 'flyttad'). */
export function valideraUtfall(raw: unknown): { svar: IntervjuUtfall; ny?: Partial<Intervjutid> } | Fel<'svar' | 'datum' | 'tid' | 'plats'> {
  const r = (raw ?? {}) as Record<string, unknown>
  if (r.svar !== 'genomford' && r.svar !== 'flyttad' && r.svar !== 'installd') return { fel: 'svar' }
  if (r.svar !== 'flyttad') return { svar: r.svar }
  if (!arDag(r.datum)) return { fel: 'datum' }
  const ny = valideraIntervjutid({ datum: r.datum, tid: r.tid, plats: r.plats })
  if ('fel' in ny) return ny
  return { svar: 'flyttad', ny }
}

/** PUT /api/jobbsok/veckans-mal: { mal: 1..10 | null }. */
export function valideraVeckansMal(raw: unknown): { mal: number | null } | Fel<'mal'> {
  const r = (raw ?? {}) as { mal?: unknown }
  if (r.mal === null) return { mal: null }
  const mal = tolkaVeckansMal(r.mal)
  return mal === null ? { fel: 'mal' } : { mal }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function arUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v)
}

/* ------------------------------------------- händelsernas dag mot sökdagen */

/**
 * Statusen räknas av en databastrigger efter händelsernas datum. En händelse
 * före sökdagen räknas då bort, och en kallelse "syns inte" (klicktestet
 * 2026-11-21). Därför får ingen händelse utom "Sökt" ligga före dagen
 * tjänsten söktes. Samma text i arket och från rutterna.
 */
export function handelseForeSoktText(sokt: Dag): string {
  return `Dagen kan inte ligga före dagen du sökte tjänsten, ${langDag(sokt)}. Ändra sökdatumet först om det är fel.`
}

export function soktEfterHandelseText(handelse: Dag): string {
  return `Du har en händelse den ${langDag(handelse)}. Sökdatumet kan inte ligga efter den.`
}

/** Felet för en händelse vars dag ligger före sökdagen, annars null. "Sökt" själv kontrolleras inte. */
export function handelseForeSokt(typ: string, dag: string | null | undefined, sokt: string | null | undefined): string | null {
  if (typ === 'applied' || !arDag(dag) || !arDag(sokt)) return null
  return dag < sokt ? handelseForeSoktText(sokt) : null
}

/** Tidigaste dagen bland händelserna utom "Sökt", eller null. */
export function tidigasteHandelse(handelser: readonly { event_type: string; occurred_at: string | null }[]): Dag | null {
  let ut: Dag | null = null
  for (const h of handelser) {
    if (h.event_type === 'applied' || !arDag(h.occurred_at)) continue
    if (!ut || h.occurred_at < ut) ut = h.occurred_at
  }
  return ut
}

/** Felet när ett nytt sökdatum ligger efter en händelse, annars null. */
export function soktEfterHandelse(sokt: string | null | undefined, handelser: readonly { event_type: string; occurred_at: string | null }[]): string | null {
  if (!arDag(sokt)) return null
  const tidigast = tidigasteHandelse(handelser)
  return tidigast && sokt > tidigast ? soktEfterHandelseText(tidigast) : null
}
