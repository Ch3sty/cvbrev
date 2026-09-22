'use client'

/**
 * Raden "Kom igång" (docs/design/spec-onboarding-2026-09-22.html, sektion 2
 * och 5).
 *
 * En mörk rad i ink-1 som visar nästa föreslagna steg och hur många av
 * paketets delar som är provade. Trycket öppnar arket. Två placeringar:
 *
 *   flytande   ovanför bottennavigeringen på mobil, 12 px från kanterna
 *   sidomeny   längst ned i sidomenyn på desktop
 *
 * Raden försvinner när allt är provat, och när användaren dolt den för
 * dagen. Talet i ringen är samma som i arkets rubrik, "3/8".
 */

import { useEffect } from 'react'
import { useKomIgang } from './KomIgangContext'
import { komIgangRadText, komIgangRubrik } from '@/lib/onboarding/komigang'

export interface KomIgangRadProps {
  variant: 'flytande' | 'sidomeny'
  className?: string
}

export default function KomIgangRad({ variant, className }: KomIgangRadProps) {
  const { lage, fakta, visaRad, oppna, arkOppet } = useKomIgang()
  const synlig = Boolean(lage && visaRad)

  // Den flytande raden tar plats ovanför navet. Innehållet får extra
  // bottenpadding via attributet (globals.css), så sista kortet på
  // hemskärmen aldrig hamnar bakom raden.
  useEffect(() => {
    if (variant !== 'flytande' || !synlig) return
    const root = document.documentElement
    root.setAttribute('data-komigang-rad', 'true')
    return () => root.removeAttribute('data-komigang-rad')
  }, [variant, synlig])

  if (!lage || !synlig) return null

  // Sidomenyn är 256 px: där står den korta formen ur specens sektion 5,
  // "Kom igång" och "2 av 8 provade". Den flytande raden bär hela meningen.
  const rubrik = variant === 'sidomeny' ? 'Kom igång' : komIgangRubrik(lage.paket)
  const rad =
    variant === 'sidomeny'
      ? `${lage.antalProvade} av ${lage.antalTotalt} provade`
      : komIgangRadText(lage, fakta)

  const placering =
    variant === 'flytande'
      ? 'fixed inset-x-3 z-30 lg:hidden'
      : 'w-full'

  return (
    <button
      type="button"
      onClick={oppna}
      aria-haspopup="dialog"
      aria-expanded={arkOppet}
      aria-label={`${rubrik}. ${rad}`}
      data-komigang-rad={variant}
      style={variant === 'flytande' ? { bottom: 'calc(var(--bottom-nav-h) + 8px)' } : undefined}
      className={`flex items-center gap-3 rounded-xl bg-ink-1 px-4 py-3 text-left text-white shadow-svav transition-colors hover:bg-ink-hover ${placering} ${className ?? ''}`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-5">{rubrik}</span>
        <span className="block truncate text-xs leading-4 text-ink-1-mjuk">{rad}</span>
      </span>
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink-1-kant text-[13px] font-semibold tabular-nums"
      >
        {lage.antalProvade}/{lage.antalTotalt}
      </span>
    </button>
  )
}
