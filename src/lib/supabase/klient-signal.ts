/**
 * Signalen mellan Supabase-klienten och rot-layoutens AuthProvider.
 *
 * AuthProvider ligger på varje sida, också de publika. Importerade den
 * klienten statiskt följde hela supabase-js med i varje publik sidas
 * JavaScript. Nu laddar AuthProvider klienten först när det finns en
 * session att läsa, eller när någon annan del av sidan (inloggningen,
 * registreringen) skapar klienten. Den här filen är det enda båda sidor
 * delar, och den får därför inte importera något från Supabase.
 */

/** Skickas på window när webbläsarklienten skapats första gången. */
export const KLIENT_SKAPAD = 'jc:supabase-klient-skapad'

/**
 * Finns en Supabase-session i cookies? @supabase/ssr sparar den som
 * sb-<projekt>-auth-token, eller i delar som .0, .1 när den är stor.
 * PKCE-cookien (-auth-token-code-verifier) är ingen session och räknas inte.
 */
export function harSessionscookie(cookie: string): boolean {
  return /(?:^|;\s*)sb-[^=;]+-auth-token(?:\.\d+)?=/.test(cookie)
}

/** Meddela AuthProvider att klienten finns. Asynkront, aldrig mitt i en rendering. */
export function signaleraKlientSkapad(): void {
  if (typeof window === 'undefined') return
  queueMicrotask(() => window.dispatchEvent(new Event(KLIENT_SKAPAD)))
}
