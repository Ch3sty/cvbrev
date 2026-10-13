/**
 * Jobbkartans data på servern: översikten, geometrin och platsannonserna. Servern ritar
 * sidan av dem; webbläsaren hämtar översikten och geometrin från /jobbkartan/data/karta.json
 * och får bara platsannonserna med sidan. Översikten byggs av scripts/jobbkartan/hamta-data.mjs.
 * Yrkena och kommunerna ligger som statiska filer under /jobbkartan/data och hämtas av
 * webbläsaren först när de behövs.
 */
import oversiktJson from './data/oversikt.json'
import geoJson from './sverige-lan.json'
import type { Lan } from './karta'
import { fmt, kortLan } from './karta'

export interface Matchning {
  arbetslosa: (number | null)[]
  lediga: (number | null)[]
  lediga_osak: (number | null)[]
}
export interface KommunRang {
  kod: string
  namn: string
  v: number
}
export interface Oversikt {
  hamtad: string
  lanKoder: string[]
  nuts: Record<string, string[]>
  kvartal: string[]
  lanNamn: Record<string, string>
  matchning: Record<string, Matchning>
  manader: string[]
  lanBas: Record<string, [(number | null)[], (number | null)[]]>
  kommunLagst: KommunRang[]
  kommunHogst: KommunRang[]
  antalKommuner: number
  antalYrken: number
  utvaldaYrken: [string, string][]
  ar: string[]
  totLan: number[][]
  lonAr: string[]
  lonRegioner: string[]
  riksomraden: Record<string, string>
}
export interface Annonser {
  datum: string
  totalt: number
  perLan: Record<string, number>
}
/** Det som /jobbkartan/data/karta.json skickar: översikten och geometrin. */
export interface JobbkartanKartdata extends Oversikt {
  geo: Lan[]
  fjall: number[][]
}
/** Allt som kartan behöver: kartdatan plus dagens platsannonser. */
export interface JobbkartanData extends JobbkartanKartdata {
  annonser: Annonser | null
}

export const OVERSIKT = oversiktJson as unknown as Oversikt
export const GEO = (geoJson as { lan: Lan[] }).lan
export const FJALL = (geoJson as { fjall: number[][] }).fjall

/** Arbetslösa per ledigt jobb. */
export function kon(o: Oversikt, kod: string, q: number) {
  const m = o.matchning[kod]
  const l = m?.lediga[q]
  const a = m?.arbetslosa[q]
  return l && a != null ? a / l : null
}

export function extrem(o: Oversikt, q: number) {
  let min: { kod: string; v: number } | null = null
  let max: { kod: string; v: number } | null = null
  for (const k of o.lanKoder) {
    const v = kon(o, k, q)
    if (v == null) continue
    if (!min || v < min.v) min = { kod: k, v }
    if (!max || v > max.v) max = { kod: k, v }
  }
  return { min, max }
}

/** Rubriken: sann och räknad ur senaste kvartalet. */
export function rubrik(o: Oversikt) {
  const ex = extrem(o, o.kvartal.length - 1)
  if (!ex.min || !ex.max) return 'Konkurrensen om jobben, län för län'
  const n = (k: string) => kortLan(o.lanNamn[k])
  return `I ${n(ex.min.kod)} går det ${fmt(ex.min.v, 1)} arbetslösa på varje ledigt jobb. I ${n(ex.max.kod)} ${fmt(ex.max.v, 1)}.`
}

/**
 * Platsannonserna per län just nu, från Arbetsförmedlingens öppna JobSearch-API (samma källa som
 * jobbmatchningen). Cachas ett dygn som resten av den publika sidan. Svarar API:t inte står
 * kartan utan annonskorten i stället för att visa gamla tal.
 */
export async function hamtaAnnonser(): Promise<Annonser | null> {
  try {
    const r = await fetch('https://jobsearch.api.jobtechdev.se/search?limit=0&stats=region&stats.limit=25', {
      headers: { accept: 'application/json' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return null
    const j = (await r.json()) as {
      total?: { value?: number }
      stats?: { type: string; values: { code: string; count: number }[] }[]
    }
    const region = j.stats?.find((s) => s.type === 'region')
    const totalt = j.total?.value
    if (!region || !totalt) return null
    const perLan: Record<string, number> = {}
    for (const v of region.values) if (/^\d\d$/.test(v.code)) perLan[v.code] = v.count
    return { datum: new Date().toISOString().slice(0, 10), totalt, perLan }
  } catch {
    return null
  }
}
