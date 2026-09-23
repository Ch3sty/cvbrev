'use client'

/**
 * Hemskärmens huvud i tillstånd C (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 3): dagens datum som eyebrow, hälsningen som display-h1 och en rad
 * sammanhang ("Sedan i går: inget nytt svar. Intervjun med Din Vårdcentral
 * ligger kvar som nästa steg."). Raden visas bara när summeringen har något
 * att säga: ett nytt svar eller en bokad intervju. Annars ingen rad.
 */

const TZ = 'Europe/Stockholm'

export function halsning(nu: Date): string {
  const h = Number(new Intl.DateTimeFormat('sv-SE', { hour: 'numeric', hour12: false, timeZone: TZ }).format(nu))
  if (h < 5) return 'God natt'
  if (h < 10) return 'God morgon'
  if (h < 17) return 'Hej'
  if (h < 22) return 'God kväll'
  return 'God natt'
}

export function dagensDatum(nu: Date): string {
  const s = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(nu)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function sammanhangsrad(
  svar: number,
  intervju: { company: string; jobTitle: string } | null
): string | null {
  if (svar === 0 && !intervju) return null
  const forsta =
    svar === 0 ? 'Sedan i går: inget nytt svar.' : svar === 1 ? 'Sedan i går: ett nytt svar.' : `Sedan i går: ${svar} nya svar.`
  const andra = intervju ? ` Intervjun med ${intervju.company} ligger kvar som nästa steg.` : ''
  return forsta + andra
}

export default function HemHuvud({
  fornamn,
  rad,
}: {
  fornamn?: string
  rad: string | null
}) {
  const nu = new Date()
  return (
    <header>
      <p className="text-steg uppercase text-ink-3" suppressHydrationWarning>
        {dagensDatum(nu)}
      </p>
      <h1 className="mt-2 text-h1 text-ink-1" suppressHydrationWarning>
        {halsning(nu)}
        {fornamn ? `, ${fornamn}.` : '.'}
      </h1>
      {rad ? <p className="mt-2 max-w-[60ch] text-sm leading-[22px] text-ink-2 sm:text-base sm:leading-6">{rad}</p> : null}
    </header>
  )
}
