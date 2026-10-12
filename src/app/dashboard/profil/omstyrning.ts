/**
 * Profilens gamla ankare som flyttade till Inställningar 2026-10-13
 * (skiss-installningar-2026-10-12). Ankaret når aldrig servern, så
 * omstyrningen görs i ProfilClient direkt vid montering: /dashboard/profil#konto
 * blir /dashboard/installningar#konto, med samma ankare.
 */

export const INSTALLNINGAR_HREF = '/dashboard/installningar'

const FLYTTADE = ['konto', 'utseende', 'hjalp'] as const

/** Adressen på Inställningar för ett flyttat ankare, annars null. */
export function installningarForAnkare(hash: string | null | undefined): string | null {
  const id = (hash ?? '').replace(/^#/, '')
  return (FLYTTADE as readonly string[]).includes(id) ? `${INSTALLNINGAR_HREF}#${id}` : null
}
