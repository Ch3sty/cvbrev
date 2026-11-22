/**
 * Jobbcoach.ai:s sociala konton, en adress per konto.
 *
 * Foten och schemat (Organization sameAs på startsidan) läser härifrån, så att
 * länken och schemat aldrig pekar på olika sidor. Ägarens besked 2026-11-22:
 * Facebook-sidan är facebook.com/jobbcoachai.
 */

export const FACEBOOK_URL = 'https://www.facebook.com/jobbcoachai'
export const INSTAGRAM_URL = 'https://www.instagram.com/jobbcoach.ai'

/**
 * Kontona som finns, för sameAs i schemat (startsidan, artiklarnas utgivare
 * och författarnas arbetsgivare). Ägarens besked 2026-11-22: något konto på
 * LinkedIn eller X finns inte, så de adresserna står inte här.
 */
export const SOCIALA_KONTON: string[] = [FACEBOOK_URL, INSTAGRAM_URL]
