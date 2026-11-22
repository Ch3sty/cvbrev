/**
 * Den sökta tjänsten som besökaren loggar på /verktyg/sokta-tjanster före
 * kontot (publikt omgång 3, "inga genvägar"). Samma mönster som CV-mallarnas
 * provsida (lib/cv/mallval/utkast.ts): det besökaren fyller i ligger bara i
 * hennes webbläsare, i localStorage under jc_sokt_prova i 24 timmar. Ingen
 * servertabell. Efter kontot hämtar valkommen-sidan hem det (hamtkedjan) och
 * skapar den sökta tjänsten, eller sparar annonsen under Ska sökas, genom
 * kontots egna rutter. Sedan tas utkastet bort här.
 *
 * Loggar hon in i stället för att skapa konto bär redirecten samma uppgifter
 * i adressen (soktaHref med logga, tjanst och arbetsgivare), så att arket
 * Logga sökt tjänst öppnas förifyllt i kontot.
 *
 * Alla läsningar och skrivningar i try/catch: privat läge och blockerad
 * lagring ska ge en sida som fungerar utan utkast.
 */
import { SOKTA_HREF, soktaHref } from './adress'
import { arDag, idagSv } from './datum'

export const SOKT_UTKAST_NYCKEL = 'jc_sokt_prova'
const LIVSLANGD_MS = 24 * 60 * 60 * 1000

export type SoktKanal = 'ad' | 'unsolicited' | 'network'

export interface SoktUtkast {
  /** Jag har sökt (sokt) eller Jag ska söka (ska-soka). */
  lage: 'sokt' | 'ska-soka'
  tjanst: string
  arbetsgivare: string
  /** Datum sökt (sokt) eller sista ansökningsdag (ska-soka), YYYY-MM-DD. Tomt går för ska-soka. */
  datum: string
  kanal: SoktKanal
  sparad: number
}

export type SoktFalt = 'tjanst' | 'arbetsgivare' | 'datum'

const ren = (s: string, max = 200) => s.replace(/\s+/g, ' ').trim().slice(0, max)

/** Samma krav som kontots rutter: tjänst och arbetsgivare, ett riktigt datum, sökt aldrig i framtiden. */
export function kontrolleraSokt(u: Omit<SoktUtkast, 'sparad'>, idag: string = idagSv()): SoktFalt | null {
  if (!ren(u.tjanst)) return 'tjanst'
  if (!ren(u.arbetsgivare)) return 'arbetsgivare'
  if (u.lage === 'sokt') {
    if (!arDag(u.datum) || u.datum > idag) return 'datum'
  } else if (u.datum && !arDag(u.datum)) {
    return 'datum'
  }
  return null
}

/** Kroppen till kontots rutt: POST /api/applications (sökt) eller /api/jobbsok/ska-sokas. */
export function soktTillRutt(u: Omit<SoktUtkast, 'sparad'>): { url: string; body: Record<string, unknown> } {
  if (u.lage === 'sokt') {
    return {
      url: '/api/applications',
      body: { job_title: ren(u.tjanst), company: ren(u.arbetsgivare), applied_at: u.datum, application_channel: u.kanal },
    }
  }
  return {
    url: '/api/jobbsok/ska-sokas',
    body: { job_title: ren(u.tjanst), company: ren(u.arbetsgivare), last_application_date: u.datum || null, source: 'egen' },
  }
}

/** Dit registreringen ska skicka henne: arket förifyllt, om hämtningen inte redan har gjort jobbet. */
export function soktRedirect(u: Omit<SoktUtkast, 'sparad'>): string {
  const href = soktaHref({ logga: u.lage, tjanst: ren(u.tjanst), arbetsgivare: ren(u.arbetsgivare), fran: 'publikt-sokta' })
  // Sista ansökningsdag läses av sidans forifylltUr (?sista=), soktaHref har ingen parameter för den.
  return u.lage === 'ska-soka' && arDag(u.datum) ? `${href}&sista=${u.datum}` : href
}

export function lasSoktUtkast(nu: number = Date.now()): SoktUtkast | null {
  try {
    const raw = window.localStorage.getItem(SOKT_UTKAST_NYCKEL)
    if (!raw) return null
    const u = JSON.parse(raw) as SoktUtkast
    if (!u || typeof u !== 'object' || typeof u.sparad !== 'number' || typeof u.tjanst !== 'string') return null
    if (nu - u.sparad > LIVSLANGD_MS) {
      window.localStorage.removeItem(SOKT_UTKAST_NYCKEL)
      return null
    }
    return u
  } catch {
    return null
  }
}

export function sparaSoktUtkast(u: Omit<SoktUtkast, 'sparad'>): void {
  try {
    window.localStorage.setItem(SOKT_UTKAST_NYCKEL, JSON.stringify({ ...u, sparad: Date.now() }))
  } catch {
    // Lagringen är avstängd: redirecten bär ändå uppgifterna till arket.
  }
}

export function rensaSoktUtkast(): void {
  try {
    window.localStorage.removeItem(SOKT_UTKAST_NYCKEL)
  } catch {
    // Se ovan.
  }
}

/**
 * Hämtar hem utkastet efter kontot (valkommen-sidans hämtkedja). Ger Sökta
 * tjänster när tjänsten är skapad, annars null. Kastar aldrig: en misslyckad
 * hämtning får inte stoppa en registrering som redan har gått igenom.
 */
export async function claimPendingSokt(): Promise<string | null> {
  const u = lasSoktUtkast()
  if (!u) return null
  if (kontrolleraSokt(u)) {
    rensaSoktUtkast()
    return null
  }
  try {
    const { url, body } = soktTillRutt(u)
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    // 409 redan_sokt räknas som klart: tjänsten finns redan i kontot.
    if (res.ok || res.status === 409) {
      rensaSoktUtkast()
      return u.lage === 'ska-soka' ? soktaHref({ filter: 'ska-sokas', fran: 'publikt-sokta' }) : soktaHref({ fran: 'publikt-sokta' })
    }
    // Fel i fälten: släpp utkastet och låt arket öppnas förifyllt i stället.
    if (res.status === 400) {
      rensaSoktUtkast()
      return soktRedirect(u)
    }
    return null
  } catch {
    return null
  }
}

export { SOKTA_HREF }
