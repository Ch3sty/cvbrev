'use client'

/**
 * Svarskorten (plan-testflode-2026-11-20 avsnitt 3.1 och 7.2), samma för
 * alla typer och lägen:
 *
 *   SvarRuta   figur: min 96 px, radie 12, bricka 24 px uppe till vänster
 *   SvarRad    text, tal, påstående: min 52 px, bricka till vänster
 *   TreFasta   Sant, Falskt, Går inte att avgöra: tre lika breda på en rad
 *
 * Tillstånden: neutral, vald (bläck), rätt (positiv), fel (bara det valda,
 * efter facit) och dämpad (övriga efter facit, opacitet .38). Tvåpixelkanten
 * är 1 px border plus 1 px inset-skugga, så ingenting flyttar (CLS 0).
 * Brickan bär bokstaven, vit på bläck när vald, bock när rätt, kryss när fel;
 * den flyttas aldrig och byter aldrig storlek.
 */

import type { ReactNode } from 'react'
import { IkonCheck, IkonKryss } from '@/components/illustrations/RumSymboler'

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
  ratt: 'border-positiv bg-positiv-mjuk shadow-[inset_0_0_0_1px_var(--positiv)]',
  fel: 'border-fel bg-fel-mjuk shadow-[inset_0_0_0_1px_var(--fel)]',
  dampad: 'border-kant bg-papper opacity-[.38]',
}

const BRICKA: Record<Tillstand, string> = {
  neutral: 'bg-papper-2 text-ink-2',
  vald: 'bg-ink-1 text-papper',
  ratt: 'bg-positiv text-papper',
  fel: 'bg-fel text-papper',
  dampad: 'bg-papper-2 text-ink-2',
}

export function Bricka({ i, tillstand, className = '' }: { i: number; tillstand: Tillstand; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`sess-bricka inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold leading-4 ${BRICKA[tillstand]} ${className}`}
    >
      {tillstand === 'ratt' ? (
        <IkonCheck size={16} strokeWidth={2.5} className="sess-bricka-ikon" />
      ) : tillstand === 'fel' ? (
        <IkonKryss size={16} strokeWidth={2.5} className="sess-bricka-ikon" />
      ) : (
        BOKSTAV(i)
      )}
    </span>
  )
}

function ariaFor(i: number, t: Tillstand, etikett?: string): string {
  const bas = `${etikett ?? 'Alternativ'} ${BOKSTAV(i)}`
  if (t === 'ratt') return `${bas}, rätt svar`
  if (t === 'fel') return `${bas}, ditt svar, fel`
  return bas
}

interface KortBas {
  i: number
  tillstand: Tillstand
  /** Sant efter facit när hon valde fel: rätt kort visas 120 ms efter felet. */
  efterFel?: boolean
  disabled?: boolean
  onValj?: (i: number) => void
}

/** Figurkortet: figuren centrerad med 12 px marginal, bricka uppe till vänster. */
export function SvarRuta({ i, tillstand, efterFel, disabled, onValj, children, className = '' }: KortBas & { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={tillstand === 'vald' || tillstand === 'fel'}
      aria-label={ariaFor(i, tillstand, 'Svarsalternativ')}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`sess-kort relative w-full min-w-0 touch-manipulation rounded-xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default ${KANT[tillstand]} ${className}`}
    >
      <Bricka i={i} tillstand={tillstand} className="absolute left-2 top-2 z-10" />
      <span className="flex h-full w-full items-center justify-center p-1.5">{children}</span>
    </button>
  )
}

/** Raden: text, tal eller påstående. */
export function SvarRad({ i, tillstand, efterFel, disabled, onValj, children }: KortBas & { children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={tillstand === 'vald' || tillstand === 'fel'}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`sess-kort flex min-h-[52px] w-full touch-manipulation items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-base font-medium leading-[22px] text-ink-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default ${KANT[tillstand]}`}
    >
      <Bricka i={i} tillstand={tillstand} />
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  )
}

/** Sant, Falskt, Går inte att avgöra: Svarskort utan bricka, bock och kryss 16 px före texten. */
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
            aria-checked={t === 'vald' || t === 'fel'}
            disabled={disabled}
            onClick={() => onValj?.(i)}
            data-tillstand={t}
            className={`sess-kort flex min-h-[52px] touch-manipulation items-center justify-center gap-1.5 rounded-xl border px-1.5 py-1.5 text-center text-sm font-semibold leading-[18px] text-ink-1 ${KANT[t]}`}
          >
            {t === 'ratt' ? <IkonCheck size={16} strokeWidth={2.5} className="sess-bricka-ikon flex-shrink-0 text-positiv" /> : null}
            {t === 'fel' ? <IkonKryss size={16} strokeWidth={2.5} className="sess-bricka-ikon flex-shrink-0 text-fel" /> : null}
            <span>{e}</span>
          </button>
        )
      })}
    </div>
  )
}
