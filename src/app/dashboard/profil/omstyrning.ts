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

/**
 * Samma omstyrning före första målningen: ett inline-skript först i
 * dashboard-layoutens markup, som körs innan skalet eller profilen hunnit
 * ritas när adressen laddas från början (länk i mejl, ny flik, bokmärke).
 * location.replace, så att bakåtknappen inte leder tillbaka hit. Vid
 * klientnavigering körs inga inline-skript; där tar ProfilClient över.
 */
export const OMSTYRNING_SKRIPT = `try{var l=location,h=l.hash.slice(1);if((l.pathname==='/dashboard/profil'||l.pathname==='/dashboard/profil/')&&${JSON.stringify(
  [...FLYTTADE],
)}.indexOf(h)>-1)l.replace('${INSTALLNINGAR_HREF}#'+h)}catch(e){}`
