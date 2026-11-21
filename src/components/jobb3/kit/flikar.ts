/**
 * Jobbsökets fyra flikar (BYGGSPEC F1), i den ordning man söker jobb, och
 * vilken flik en sökväg hör till. Ren data och rena funktioner, klientsäker.
 *
 * Jobbcoachen, Bli upptäckt, Meddelanden och Arbetsstil har ingen flik: de
 * får väggen med tillbakalänken "Jobbsöket" (TILLBAKA_JOBBSOKET).
 */

export type JobbFlik = 'oversikt' | 'jobb' | 'sokta' | 'intervju'

export interface JobbFlikData {
  id: JobbFlik
  href: string
  /** Namnet på dator. */
  namn: string
  /** Den korta etiketten på telefon. */
  kort: string
  /** Raden under namnet på dator. */
  rad: string
}

export const JOBB_FLIKAR: readonly JobbFlikData[] = [
  { id: 'oversikt', href: '/dashboard', namn: 'Översikt', kort: 'Översikt', rad: 'Läget och nästa steg' },
  { id: 'jobb', href: '/dashboard/jobbmatchning', namn: 'Matchade jobb', kort: 'Jobb', rad: 'Annonser som passar ditt CV' },
  { id: 'sokta', href: '/dashboard/sokta-tjanster', namn: 'Sökta tjänster', kort: 'Sökta', rad: 'Svar, uppföljning och rapport' },
  { id: 'intervju', href: '/dashboard/intervju', namn: 'Inför intervjun', kort: 'Intervju', rad: 'Öva på frågorna' },
]

/** Tillbakalänken på Jobbsökets sidor utan flik. */
export const TILLBAKA_JOBBSOKET = { href: '/dashboard', text: 'Jobbsöket' } as const

function under(p: string, prefix: string): boolean {
  return p === prefix || p.startsWith(prefix + '/')
}

/**
 * Fliken för en sökväg, eller null på sidor utan flik. Översikt är bara
 * exakt /dashboard; de andra gäller också undersidorna (en sökt tjänst,
 * ett intervjuprov). Frågetecken och avslutande snedstreck tas bort.
 */
export function jobbFlikForPath(pathname: string | null | undefined): JobbFlik | null {
  const p = (pathname ?? '').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
  if (p === '/dashboard') return 'oversikt'
  if (under(p, '/dashboard/jobbmatchning')) return 'jobb'
  if (under(p, '/dashboard/sokta-tjanster')) return 'sokta'
  if (under(p, '/dashboard/intervju')) return 'intervju'
  return null
}
