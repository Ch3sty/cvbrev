'use client'

/**
 * Raden "Kom igång" (docs/design/spec-onboarding-2026-09-22.html, sektion 2
 * och 5), i rummens material (spec-rummen 16.3.4).
 *
 * En rad på papper som visar nästa föreslagna steg och hur många av
 * paketets delar som är provade: papper, kant, radie 16, rubrik 15/600 och
 * raden 13 under. Framsteget är en ring, inte en kant: kantfärgat spår och
 * kopparfyllning efter andelen, talet i mitten. Den flytande varianten
 * flyter med skuggan lyft. Trycket öppnar arket. Två placeringar:
 *
 *   flytande   ovanför dörrnavet på mobil, 12 px från kanterna
 *   sidomeny   längst ned i sidomenyn på dator
 *
 * Den flytande radens höjd reserveras i globals.css (--komigang-h), via
 * attributet data-komigang-rad="flytande" på raden själv, så att sista
 * raden i listan alltid syns vid scrollbotten.
 *
 * Raden försvinner när allt är provat, och när användaren dolt den för
 * dagen. Talet i ringen är samma som i arkets rubrik, "3/8".
 */

import { useKomIgang } from './KomIgangContext'
import { komIgangRadText, komIgangRubrik } from '@/lib/onboarding/komigang'

export interface KomIgangRadProps {
  variant: 'flytande' | 'sidomeny'
  className?: string
}

/** Ringens omkrets, 2π · 17. */
const OMKRETS = 106.8

export default function KomIgangRad({ variant, className }: KomIgangRadProps) {
  const { lage, fakta, visaRad, oppna, arkOppet } = useKomIgang()
  const synlig = Boolean(lage && visaRad)

  if (!lage || !synlig) return null

  // Sidomenyn är 248 px: där står den korta formen ur specens sektion 5,
  // "Kom igång" och "2 av 8 provade". Den flytande raden bär hela meningen.
  const rubrik = variant === 'sidomeny' ? 'Kom igång' : komIgangRubrik(lage.paket, lage.dagspass)
  const rad =
    variant === 'sidomeny'
      ? `${lage.antalProvade} av ${lage.antalTotalt} provade`
      : komIgangRadText(lage, fakta)

  const andel = lage.antalTotalt > 0 ? Math.min(1, lage.antalProvade / lage.antalTotalt) : 0

  const placering = variant === 'flytande' ? 'fixed inset-x-3 z-30 shadow-lyft lg:hidden' : 'w-full'

  return (
    <button
      type="button"
      onClick={() => oppna('rad')}
      aria-haspopup="dialog"
      aria-expanded={arkOppet}
      aria-label={`${rubrik}. ${rad}`}
      data-komigang-rad={variant}
      style={variant === 'flytande' ? { bottom: 'calc(var(--bottom-nav-h) + 8px)' } : undefined}
      className={`flex items-center gap-3 rounded-2xl border border-kant bg-papper px-4 py-3 text-left hover:bg-papper-2 ${placering} ${className ?? ''}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-5 text-ink-1">{rubrik}</span>
        <span className="block truncate text-[13px] leading-[18px] text-ink-3">{rad}</span>
      </span>
      <span aria-hidden="true" className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center">
        <svg viewBox="0 0 40 40" width="40" height="40" className="absolute inset-0 -rotate-90">
          <circle cx="20" cy="20" r="17" fill="none" stroke="var(--kant)" strokeWidth="3" />
          {andel > 0 ? (
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="var(--koppar)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(andel * OMKRETS).toFixed(1)} ${OMKRETS}`}
            />
          ) : null}
        </svg>
        <span className="relative text-[11px] font-semibold leading-none tabular-nums text-ink-1">
          {lage.antalProvade}/{lage.antalTotalt}
        </span>
      </span>
    </button>
  )
}
