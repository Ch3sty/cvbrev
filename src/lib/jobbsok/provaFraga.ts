/**
 * Frågan besökaren skriver till Jobbcoachen på /verktyg/jobbcoachen före
 * kontot (publikt omgång 3, "inga genvägar"). Samma mönster som den sökta
 * tjänsten (provaSokt.ts): frågan ligger bara i hennes webbläsare, i
 * localStorage under jc_coach_fraga i 24 timmar. Ingen servertabell.
 *
 * Frågan står aldrig i en adress: PostHog skickar hela adressen med varje
 * sidvisning, också på /register och /dashboard/jobbcoachen. Redirecten bär
 * bara en flagga (?fraga=1). I kontot läser Jobbcoachens vy frågan ur
 * webbläsaren, ställer den i fältet och tar bort den här. Den skickas först
 * när hon själv trycker.
 *
 * Alla läsningar och skrivningar i try/catch: privat läge och blockerad
 * lagring ska ge en sida som fungerar, med tomt fält.
 */

export const FRAGA_UTKAST_NYCKEL = 'jc_coach_fraga'
export const FRAGA_MAX = 500
const LIVSLANGD_MS = 24 * 60 * 60 * 1000

export const COACH_KONTO = '/dashboard/jobbcoachen'
/** Flaggan i adressen: säger bara att en fråga väntar i webbläsaren. */
export const COACH_KONTO_MED_FRAGA = `${COACH_KONTO}?fraga=1`

interface FragaUtkast {
  fraga: string
  sparad: number
}

export function renFraga(fraga: string | null | undefined): string {
  return (fraga ?? '').replace(/\s+/g, ' ').trim().slice(0, FRAGA_MAX)
}

/**
 * Vägen in i kontot: registreringen med Jobbcoachen som mål. Med en fråga
 * som väntar i webbläsaren bär adressen flaggan, aldrig frågan.
 */
export function coachHref(medFraga = false): string {
  return `/register?redirect=${encodeURIComponent(medFraga ? COACH_KONTO_MED_FRAGA : COACH_KONTO)}`
}

/** Sparar frågan. Ger true när det finns en fråga och den gick att spara. */
export function sparaCoachFraga(fraga: string | null | undefined): boolean {
  const f = renFraga(fraga)
  if (!f) {
    rensaCoachFraga()
    return false
  }
  try {
    window.localStorage.setItem(FRAGA_UTKAST_NYCKEL, JSON.stringify({ fraga: f, sparad: Date.now() } satisfies FragaUtkast))
    return true
  } catch {
    // Lagringen är avstängd: Jobbcoachen öppnas ändå i kontot, med tomt fält.
    return false
  }
}

export function lasCoachFraga(nu: number = Date.now()): string | null {
  try {
    const raw = window.localStorage.getItem(FRAGA_UTKAST_NYCKEL)
    if (!raw) return null
    const u = JSON.parse(raw) as FragaUtkast
    if (!u || typeof u !== 'object' || typeof u.sparad !== 'number' || typeof u.fraga !== 'string') return null
    if (nu - u.sparad > LIVSLANGD_MS) {
      window.localStorage.removeItem(FRAGA_UTKAST_NYCKEL)
      return null
    }
    return renFraga(u.fraga) || null
  } catch {
    return null
  }
}

export function rensaCoachFraga(): void {
  try {
    window.localStorage.removeItem(FRAGA_UTKAST_NYCKEL)
  } catch {
    // Se ovan.
  }
}

/** Läser frågan en gång och tar bort den: kontots vy ställer den i fältet. */
export function hamtaCoachFraga(nu: number = Date.now()): string | null {
  const f = lasCoachFraga(nu)
  if (f) rensaCoachFraga()
  return f
}
