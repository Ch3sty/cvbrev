'use client'

/**
 * Svarskorten (plan-testflode-2026-11-20 avsnitt 3.1 och 7.2, omgång 2
 * steg A: rätt/fel-systemet), samma för alla typer och lägen:
 *
 *   SvarRuta   figur: min 96 px, radie 12, bricka 24 px uppe till vänster
 *   SvarRad    text, tal, påstående: min 52 px, bricka till vänster
 *   TreFasta   Sant, Falskt, Går inte att avgöra: tre lika breda på en rad
 *
 * Tillstånden: neutral, vald (bläck), rätt (positiv), fel (bara det valda,
 * efter facit) och dämpad (övriga efter facit, opacitet .38). Efter facit är
 * ytan vit och kanten en 1 px ring i positiv eller fel (1 px border plus 1 px
 * inset-skugga, så ingenting flyttar, CLS 0). Brickan byts mot det ritade
 * märket (Marke) med 240 ms pop, och pillen "Rätt svar", "Ditt svar" eller
 * "Rätt, ditt svar" glider in från höger 200 ms med 120 ms fördröjning. I de
 * tre fasta sitter märket (20 px) på kortets överkant och ingen pill. På en figurruta
 * står pillen uppe till höger och döljs när rutan är för smal för den
 * (container query i globals.css). På raden sitter pillen som en flik på
 * kortets överkant till höger, utanför textens flöde, så att svarets text
 * aldrig bryts om när facit kommer (slutkontrollen omgång 2: CLS 0 också
 * med långa påståenden). prefers-reduced-motion stänger rörelsen.
 *
 * `ditt`: sant på kortet hon valde. Behövs bara för att skilja "Rätt svar"
 * från "Rätt, ditt svar"; typerna skickar `ditt={vald === i}`.
 */

import type { ReactNode } from 'react'
import Marke from './Marke'
import { SESSION } from './copy'

export type Tillstand = 'neutral' | 'vald' | 'ratt' | 'fel' | 'dampad'

export const BOKSTAV = (i: number) => String.fromCharCode(65 + i)

/**
 * Kortets tillstånd. Utan facit: vald eller neutral. Med facit (Träna och
 * genomgången): rätt svar positivt, det valda felaktiga rött, övriga dämpade.
 */
export function tillstandFor(i: number, vald: number | null, facit: number | null): Tillstand {
  if (facit == null) return vald === i ? 'vald' : 'neutral'
  if (i === facit) return 'ratt'
  if (i === vald) return 'fel'
  return 'dampad'
}

const KANT: Record<Tillstand, string> = {
  neutral: 'border-kant bg-papper hover:border-kant-stark',
  vald: 'border-ink-1 bg-papper shadow-[inset_0_0_0_1px_var(--ink-1)]',
  ratt: 'border-positiv bg-papper shadow-[inset_0_0_0_1px_var(--positiv)]',
  fel: 'border-fel bg-papper shadow-[inset_0_0_0_1px_var(--fel)]',
  dampad: 'border-kant bg-papper opacity-[.38]',
}

const BRICKA: Record<Tillstand, string> = {
  neutral: 'bg-papper-2 text-ink-2',
  vald: 'bg-ink-1 text-papper',
  ratt: 'bg-positiv text-papper',
  fel: 'bg-fel text-papper',
  dampad: 'bg-papper-2 text-ink-2',
}

/**
 * Brickan med bokstaven, eller märket efter facit (rätt och fel). Flyttas
 * aldrig och byter aldrig storlek: märket har samma 24 px.
 */
export function Bricka({ i, tillstand, className = '' }: { i: number; tillstand: Tillstand; className?: string }) {
  if (tillstand === 'ratt' || tillstand === 'fel') {
    return (
      <span aria-hidden="true" className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center ${className}`}>
        <Marke typ={tillstand} storlek={24} pop />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`sess-bricka inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold leading-4 ${BRICKA[tillstand]} ${className}`}
    >
      {BOKSTAV(i)}
    </span>
  )
}

/** Pillens text efter facit, null utan pill. */
export function pillText(tillstand: Tillstand, ditt?: boolean): string | null {
  if (tillstand === 'fel') return SESSION.svar.ditt
  if (tillstand === 'ratt') return ditt ? SESSION.svar.rattDitt : SESSION.svar.ratt
  return null
}

/** Pillen "Rätt svar", "Ditt svar" eller "Rätt, ditt svar". */
export function Pill({ tillstand, ditt, flik = false, className = '' }: { tillstand: Tillstand; ditt?: boolean; flik?: boolean; className?: string }) {
  const text = pillText(tillstand, ditt)
  if (!text) return null
  const farg = tillstand === 'fel' ? 'bg-fel-mjuk text-fel' : 'bg-positiv-mjuk text-positiv'
  // Fliken på radens överkant: 18 px hög, mitt på kanten, ryms i listans 8 px mellanrum.
  const matt = flik ? 'px-2 py-[2px] text-[10px] leading-[14px]' : 'px-2 py-[3px] text-[11px] leading-4'
  return (
    <span
      className={`sess-pill inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-full font-semibold uppercase tracking-[.04em] ${matt} ${farg} ${className}`}
      data-pill={tillstand === 'fel' ? 'ditt' : ditt ? 'ratt-ditt' : 'ratt'}
    >
      {text}
    </span>
  )
}

function ariaFor(i: number, t: Tillstand, etikett?: string, ditt?: boolean): string {
  const bas = `${etikett ?? 'Alternativ'} ${BOKSTAV(i)}`
  if (t === 'ratt') return ditt ? `${bas}, rätt svar, ditt svar` : `${bas}, rätt svar`
  if (t === 'fel') return `${bas}, ditt svar, fel`
  return bas
}

interface KortBas {
  i: number
  tillstand: Tillstand
  /** Sant på kortet hon valde (efter facit): pillen säger "Rätt, ditt svar". */
  ditt?: boolean
  /** Sant efter facit när hon valde fel: rätt kort visas 120 ms efter felet. */
  efterFel?: boolean
  disabled?: boolean
  onValj?: (i: number) => void
}

/** Figurkortet: figuren centrerad med 12 px marginal, bricka uppe till vänster, pillen uppe till höger. */
export function SvarRuta({ i, tillstand, ditt, efterFel, disabled, onValj, children, className = '' }: KortBas & { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={tillstand === 'vald' || tillstand === 'fel' || Boolean(ditt && tillstand === 'ratt')}
      aria-label={ariaFor(i, tillstand, 'Svarsalternativ', ditt)}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`sess-kort sess-svar-ruta relative isolate w-full min-w-0 touch-manipulation rounded-xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default ${KANT[tillstand]} ${className}`}
    >
      <Bricka i={i} tillstand={tillstand} className="absolute left-2 top-2 z-10" />
      <Pill tillstand={tillstand} ditt={ditt} className="absolute right-1.5 top-2 z-10" />
      <span className="flex h-full w-full items-center justify-center p-1.5">{children}</span>
    </button>
  )
}

/** Raden: text, tal eller påstående. */
export function SvarRad({ i, tillstand, ditt, efterFel, disabled, onValj, children }: KortBas & { children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={tillstand === 'vald' || tillstand === 'fel' || Boolean(ditt && tillstand === 'ratt')}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`sess-kort relative isolate flex min-h-[52px] w-full touch-manipulation items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-base font-medium leading-[22px] text-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default ${KANT[tillstand]}`}
    >
      <Bricka i={i} tillstand={tillstand} />
      <span className="min-w-0 flex-1">{children}</span>
      <Pill tillstand={tillstand} ditt={ditt} flik className="absolute -top-[9px] right-3 z-10" />
    </button>
  )
}

/** Sant, Falskt, Går inte att avgöra: Svarskort utan bricka, märket på överkanten efter facit. */
export function TreFasta({
  etiketter,
  vald,
  facit,
  onValj,
  disabled,
}: {
  etiketter: [string, string, string]
  vald: number | null
  facit: number | null
  onValj?: (i: number) => void
  disabled?: boolean
}) {
  return (
    <div role="radiogroup" aria-label="Ditt svar" className="grid grid-cols-3 gap-2">
      {etiketter.map((e, i) => {
        const t = tillstandFor(i, vald, facit)
        return (
          <button
            key={e}
            type="button"
            role="radio"
            aria-checked={t === 'vald' || t === 'fel' || (t === 'ratt' && vald === i)}
            disabled={disabled}
            onClick={() => onValj?.(i)}
            data-tillstand={t}
            className={`sess-kort relative isolate flex min-h-[52px] touch-manipulation items-center justify-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-center text-sm font-semibold leading-[18px] text-ink-1 ${KANT[t]}`}
          >
            {/* Märket sitter på kortets överkant till höger, som radernas
                flik, så att den centrerade texten aldrig flyttar (CLS 0). */}
            {t === 'ratt' || t === 'fel' ? (
              <span aria-hidden="true" className="absolute -top-[11px] right-2 z-10 inline-flex rounded-full bg-papper" data-tre-marke>
                <Marke typ={t} storlek={20} pop />
              </span>
            ) : null}
            <span>{e}</span>
            {t === 'ratt' || t === 'fel' ? <span className="sr-only">{t === 'fel' ? `, ${SESSION.svar.ditt}` : vald === i ? `, ${SESSION.svar.rattDitt}` : `, ${SESSION.svar.ratt}`}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
