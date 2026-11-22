/**
 * Förifyllningen av arket Logga sökt tjänst i kontot, när arket öppnas från
 * en annan vy (i dag testernas Hem, TjanstFraga). Beslut-agarpunkter D-13
 * (2026-11-22): tjänst och arbetsgivare står aldrig i adressen, eftersom
 * PostHog skickar hela adressen med varje sidvisning. Uppgifterna bärs i
 * webbläsaren, på samma sätt som det publika utkastet (provaSokt.ts), under
 * en egen nyckel i 24 timmar. Adressen öppnar bara arket (?logga=1 eller
 * ?logga=ska-soka). Ingen servertabell.
 *
 * SoktaVy läser förifyllningen när arket öppnas och tar bort den när arket
 * stängs. Alla läsningar och skrivningar i try/catch: privat läge och
 * blockerad lagring ger ett tomt ark, aldrig ett fel.
 */

export const FORIFYLLNING_NYCKEL = 'jc_sokt_forifyllt'
const LIVSLANGD_MS = 24 * 60 * 60 * 1000

/** Samma fält som arkets LoggaForifyllt, utan lage och sparadId. */
export interface SoktForifyllning {
  job_title?: string
  company?: string
  location?: string | null
  job_ad_url?: string | null
  last_application_date?: string | null
  af_ad_id?: string | null
  match_score?: number | null
  /** Varifrån arket öppnades, högst 40 tecken (test-hem, test-hem-plan). */
  fran?: string
}

const text = (v: unknown, max: number): string | undefined => {
  if (typeof v !== 'string') return undefined
  const t = v.replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : undefined
}

/** Samma kontroller som sidan gjorde på adressens värden före D-13. */
export function renForifyllning(f: Record<string, unknown>): SoktForifyllning | null {
  const job_title = text(f.job_title, 200)
  const company = text(f.company, 200)
  if (!job_title && !company) return null
  const lank = text(f.job_ad_url, 2048)
  const sista = text(f.last_application_date, 10)
  const match = typeof f.match_score === 'number' ? f.match_score : NaN
  return {
    job_title,
    company,
    location: text(f.location, 200) ?? null,
    job_ad_url: lank && /^https?:\/\//.test(lank) ? lank : null,
    last_application_date: sista && /^\d{4}-\d{2}-\d{2}$/.test(sista) ? sista : null,
    af_ad_id: text(f.af_ad_id, 100) ?? null,
    match_score: Number.isFinite(match) && match >= 0 && match <= 100 ? Math.round(match) : null,
    fran: text(f.fran, 40),
  }
}

export function sparaForifyllning(f: SoktForifyllning): void {
  try {
    window.localStorage.setItem(FORIFYLLNING_NYCKEL, JSON.stringify({ ...f, sparad: Date.now() }))
  } catch {
    // Lagringen är avstängd: arket öppnas ändå, tomt.
  }
}

export function lasForifyllning(nu: number = Date.now()): SoktForifyllning | null {
  try {
    const raw = window.localStorage.getItem(FORIFYLLNING_NYCKEL)
    if (!raw) return null
    const f = JSON.parse(raw) as Record<string, unknown> | null
    if (!f || typeof f !== 'object' || typeof f.sparad !== 'number' || nu - f.sparad > LIVSLANGD_MS) {
      window.localStorage.removeItem(FORIFYLLNING_NYCKEL)
      return null
    }
    return renForifyllning(f)
  } catch {
    return null
  }
}

export function rensaForifyllning(): void {
  try {
    window.localStorage.removeItem(FORIFYLLNING_NYCKEL)
  } catch {
    // Se ovan.
  }
}
