/**
 * Hjälprutornas läge (skiss Provbladet, avsnitt 4 och beslut 5):
 *
 * - Öppen första gången, hopfälld sedan. "Första gången" avgör sidan
 *   (profiles.traning_sedd_at saknas eller inget test är gjort) och skickar
 *   in det som `forsta`.
 * - "Dölj hjälpen" stänger av all hjälp tills den slås på igen i profilen.
 *   Valet sparas i profiles.hjalp_dold (migreringen
 *   20261011160000_hjalp_dold.sql) och i localStorage som snabb lokal kopia.
 *
 * Serverns värde vinner när det finns. Saknas kolumnen (migreringen inte
 * körd) läses null och den lokala kopian gäller.
 *
 * Ren logik utan React, så att den går att testa i vitest.
 */

export const HJALP_NYCKEL = 'hjalp_dold'
/** Fönsterhändelsen som håller alla hjälprutor på sidan i takt. */
export const HJALP_HANDELSE = 'jc:hjalp-dold'

export type HjalpLage = 'dold' | 'oppen' | 'hopfalld'

/** Den lokala kopian. null när inget val finns eller lagringen är spärrad. */
export function lasLokalt(): boolean | null {
  try {
    const v = window.localStorage.getItem(HJALP_NYCKEL)
    if (v === '1') return true
    if (v === '0') return false
    return null
  } catch {
    return null
  }
}

export function skrivLokalt(dold: boolean): void {
  try {
    window.localStorage.setItem(HJALP_NYCKEL, dold ? '1' : '0')
  } catch {
    // Privat läge eller spärrad lagring: valet gäller sidvisningen.
  }
}

/** Serverns värde vinner, sedan den lokala kopian, annars syns hjälpen. */
export function bestamDold(server: boolean | null | undefined, lokalt: boolean | null): boolean {
  if (typeof server === 'boolean') return server
  if (typeof lokalt === 'boolean') return lokalt
  return false
}

/**
 * Startläget för en ruta. `oppnasForsta` är false för rutor som ska vara
 * hopfällda även första gången (skissens "Aldrig gjort ett
 * rekryteringstest?" på mobil).
 */
export function startlage(dold: boolean, forsta: boolean, oppnasForsta = true): HjalpLage {
  if (dold) return 'dold'
  return forsta && oppnasForsta ? 'oppen' : 'hopfalld'
}

/** Läser profiles.hjalp_dold ur en profilrad. null när kolumnen saknas. */
export function hjalpDoldUrProfil(profil: unknown): boolean | null {
  if (!profil || typeof profil !== 'object') return null
  const v = (profil as { hjalp_dold?: unknown }).hjalp_dold
  return typeof v === 'boolean' ? v : null
}

/**
 * Sparar valet: lokalt direkt, meddelar sidans övriga rutor, och skickar
 * till servern. Kastar aldrig; returnerar false om servern inte tog emot.
 */
export async function sparaHjalpDold(dold: boolean, f: typeof fetch = fetch): Promise<boolean> {
  skrivLokalt(dold)
  try {
    window.dispatchEvent(new CustomEvent<boolean>(HJALP_HANDELSE, { detail: dold }))
  } catch {
    // Ingen window (test eller server): inget att meddela.
  }
  try {
    const res = await f('/api/profile/hjalp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dold }),
    })
    return res.ok
  } catch {
    return false
  }
}
