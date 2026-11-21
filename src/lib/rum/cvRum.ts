// src/lib/rum/cvRum.ts
//
// CV-rummet (spec-rummen våg 4, konceptets C1): poängringen, vad som drar
// ner och dokumentets väg. Allt räknas ur den senaste slutförda analysens
// sparade resultat (cv_analysis_jobs.result). Plustalen per fynd är
// analysens egna atsImpact, samma tal som analysflödet visar som
// "+N läsbarhet" på varje förslag; de räknas aldrig om här och uppskattas
// aldrig. Klientsäker.

import type { VeckoCell } from '@/components/rum/Veckorad'
import { CV_RUM } from './copy'

/** Det ur analysresultatet som CV-rummet läser (JSON-fälten i result). */
export interface AnalysUnderlag {
  /**
   * Analysraden (cv_analysis_jobs.id). "Åtgärda i CV:t" öppnar den sparade
   * analysen med ?job=<id> (art-director 21.2 fråga 2); utan id lyfts inte
   * "Åtgärda först".
   */
  jobbId?: string | null
  cvId: string | null
  /** När analysen blev klar (ISO). */
  klar: string | null
  /** Analysens namn på CV:t (display_name), annars filnamnet. */
  namn: string | null
  /** result.atsFriendliness.score, 0 till 100. */
  poang: number | null
  profil: { atsImpact?: unknown } | null
  roller: Array<{ roleTitle?: unknown; company?: unknown; atsImpact?: unknown }> | null
  kompetenser: Array<{ skill?: unknown; atsImpact?: unknown; relevance?: unknown }> | null
  allmant: Array<{ title?: unknown; description?: unknown; atsImpact?: unknown; category?: unknown }> | null
}

/** Underlaget i den form analysens potentialuträkning läser (src/lib/cv/analys/potential.ts). */
export function potentialUnderlag(a: AnalysUnderlag | null) {
  if (!a) return null
  return {
    profileSummary: a.profil,
    roleBasedImprovements: a.roller,
    skillSuggestions: a.kompetenser,
    generalImprovements: a.allmant,
  }
}

export type AvsnittNyckel = 'profil' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'sprak'

export interface Innehall {
  /** Har CV:t struktur alls (structured_data går att läsa)? */
  strukturerat: boolean
  /** Avsnitten vi har letat efter, i ordning, med om de finns. Språk bara när vi läst in språken. */
  avsnitt: { nyckel: AvsnittNyckel; finns: boolean }[]
}

const fylld = (s: unknown) => typeof s === 'string' && s.trim().length > 0

/**
 * Innehållet i CV:t (Ditt CV, Tre mått, Innehållet): profil, erfarenhet,
 * utbildning och kompetenser ur structured_data i alla tre formaten, och
 * språk via sprakLage. Språk räknas bara när vi har letat ('finns' eller
 * 'saknas'); 'inte_inlast' ger fyra avsnitt och ingenting om språk.
 */
export function innehallUrCv(sd: unknown, sprak: 'finns' | 'saknas' | 'inte_inlast'): Innehall {
  if (!sd || typeof sd !== 'object' || Array.isArray(sd)) return { strukturerat: false, avsnitt: [] }
  const o = sd as Record<string, unknown>
  const lista = (v: unknown) => (Array.isArray(v) ? v : [])
  const profil = fylld(o.summary) || fylld(o.profile)
  const erfarenhet =
    lista(o.experience).some((e) => e && (fylld((e as Record<string, unknown>).position) || fylld((e as Record<string, unknown>).company))) ||
    lista(o.roles).some((r) => r && (fylld((r as Record<string, unknown>).title) || fylld((r as Record<string, unknown>).company)))
  const utbildning = lista(o.education).some(
    (u) => u && (fylld((u as Record<string, unknown>).degree) || fylld((u as Record<string, unknown>).institution))
  )
  const kompetenser = lista(o.skills).some((k) =>
    typeof k === 'string' ? fylld(k) : fylld((k as Record<string, unknown>)?.name) || lista((k as Record<string, unknown>)?.skills).some(fylld)
  )
  const strukturerat = Boolean(o.personalInfo || o.experience || o.roles || o.summary || o.profile || o.education || o.skills)
  if (!strukturerat) return { strukturerat: false, avsnitt: [] }
  const avsnitt: Innehall['avsnitt'] = [
    { nyckel: 'profil', finns: profil },
    { nyckel: 'erfarenhet', finns: erfarenhet },
    { nyckel: 'utbildning', finns: utbildning },
    { nyckel: 'kompetenser', finns: kompetenser },
  ]
  if (sprak !== 'inte_inlast') avsnitt.push({ nyckel: 'sprak', finns: sprak === 'finns' })
  return { strukturerat, avsnitt }
}

export interface Fynd {
  nyckel: string
  titel: string
  meta: string
  /** Analysens atsImpact, heltal över noll. */
  plus: number
}

function tal(v: unknown): number | null {
  const n = typeof v === 'string' ? Number(v) : v
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

function text(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Fynden i den ordning de drar ner mest. Kompetensförslagen räknas som ett
 * fynd med summan av sina atsImpact, så som analysflödet räknar dem när de
 * väljs tillsammans. Fynd utan positiv effekt visas inte.
 */
export function fyndUrAnalys(a: AnalysUnderlag | null): Fynd[] {
  if (!a) return []
  const ut: Fynd[] = []
  const p = tal(a.profil?.atsImpact)
  if (p !== null && p > 0) {
    ut.push({ nyckel: 'profil', titel: CV_RUM.fynd.sammanfattning, meta: CV_RUM.fynd.sammanfattningMeta, plus: Math.round(p) })
  }
  ;(a.roller ?? []).forEach((r, i) => {
    const n = tal(r?.atsImpact)
    const titel = text(r?.roleTitle)
    if (n !== null && n > 0 && titel) {
      ut.push({
        nyckel: `roll-${i}`,
        titel: CV_RUM.fynd.roll(titel, text(r?.company)),
        meta: CV_RUM.fynd.rollMeta,
        plus: Math.round(n),
      })
    }
  })
  const komp = (a.kompetenser ?? []).filter((k) => (tal(k?.atsImpact) ?? 0) > 0)
  const kompSumma = komp.reduce((s, k) => s + (tal(k?.atsImpact) ?? 0), 0)
  if (kompSumma > 0) {
    ut.push({
      nyckel: 'kompetenser',
      titel: CV_RUM.fynd.kompetenser,
      meta: CV_RUM.fynd.kompetenserMeta(komp.map((k) => text(k?.skill)).filter(Boolean)),
      plus: Math.round(kompSumma),
    })
  }
  ;(a.allmant ?? []).forEach((g, i) => {
    const n = tal(g?.atsImpact)
    const titel = text(g?.title)
    if (n !== null && n > 0 && titel) {
      ut.push({ nyckel: `allmant-${i}`, titel, meta: text(g?.description), plus: Math.round(n) })
    }
  })
  return ut.filter((f) => f.plus > 0).sort((x, y) => y.plus - x.plus)
}

export function poangUrAnalys(a: AnalysUnderlag | null): number | null {
  const p = tal(a?.poang)
  if (p === null) return null
  return Math.max(0, Math.min(100, Math.round(p)))
}

/**
 * Dokumentets väg (konceptets C1): utkast, analyserat, åtgärdat, nedladdat.
 * Utkast är klart när CV:t finns. Analyserat när en analys av just det CV:t
 * är klar. Åtgärdat när analysens förbättrade CV sparats (analysflödet
 * sparar det som ett nytt CV, /api/cv/save-improved). Nedladdat när en mall
 * laddats ner efter senaste steget. Nästa ej klara steg är "nu".
 */
export function dokumentVag(a: {
  harCv: boolean
  analyseradAt: string | null
  /** När det förbättrade CV:t sparades, null om det inte gjorts. */
  atgardadAt: string | null
  nedladdatAt: string | null
}): VeckoCell[] {
  const t = (s: string | null) => (s ? new Date(s).getTime() : NaN)
  const analyserad = a.harCv && Boolean(a.analyseradAt)
  const atgardad = analyserad && Boolean(a.atgardadAt)
  const senasteAndring = Math.max(t(a.analyseradAt) || 0, atgardad ? t(a.atgardadAt) || 0 : 0)
  const nedladdad = a.harCv && Number.isFinite(t(a.nedladdatAt)) && t(a.nedladdatAt) >= senasteAndring
  const klara = [a.harCv, analyserad, atgardad, nedladdad]
  const forstaEjKlar = klara.findIndex((k) => !k)
  return CV_RUM.vagen.map((etikett, i) => ({
    etikett,
    status: klara[i] ? 'gjord' : i === forstaEjKlar ? 'nu' : 'kvar',
  }))
}
