/**
 * Lösenordets längd, en gräns för hela sajten.
 *
 * Supabase Auth kräver minst 8 tecken sedan 2026-11-22. Varje ställe där ett
 * lösenord sätts eller byts läser gränsen, hjälptexten och felet härifrån:
 * registreringen, rekryterarnas registrering, kontoarket i CV-provet,
 * appens konto, återställningen och SetPasswordPrompt. Inloggningen har
 * ingen längdkontroll, eftersom äldre konton kan ha kortare lösenord.
 *
 * Klientsäker och ren.
 */

export const MIN_LOSENORD = 8

/** Hjälptexten vid fältet, synlig innan man skriver. */
export const LOSENORD_HJALP = `Minst ${MIN_LOSENORD} tecken`

/** Felet när lösenordet är för kort, vårt eller Supabases (weak_password). */
export const LOSENORD_FEL = `Lösenordet måste vara minst ${MIN_LOSENORD} tecken.`

/** Vårt fel för ett för kort lösenord, annars null. */
export function losenordForKort(losen: string): string | null {
  return losen.length < MIN_LOSENORD ? LOSENORD_FEL : null
}

/**
 * Är felet Supabases svar på ett svagt lösenord? Supabase svarar med koden
 * weak_password och ett engelskt meddelande ("Password should be at least
 * 8 characters." eller "Password should contain at least ..."). Det visas
 * aldrig rått; anroparen visar LOSENORD_FEL.
 */
export function arSvagtLosenord(err: unknown): boolean {
  if (!err || typeof err !== 'object') return typeof err === 'string' && /password should be at least|password should contain|weak_password/i.test(err)
  const e = err as { code?: unknown; message?: unknown; name?: unknown }
  if (e.code === 'weak_password' || e.name === 'AuthWeakPasswordError') return true
  const m = typeof e.message === 'string' ? e.message : ''
  return /password should be at least|password should contain|weak_password|weak password/i.test(m)
}
