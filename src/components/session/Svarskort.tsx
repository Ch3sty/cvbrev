'use client'

/**
 * Svarskorten som klossar (omgång 3 steg 1, skissens Test-matris, Test-ord,
 * Test-siffror-cirkel och Mobil-matris), samma för alla typer och lägen:
 *
 *   SvarRuta   figur: tangentbrickan uppe till vänster, märket uppe till höger
 *   SvarRad    text, tal, påstående: tangentbrickan till vänster
 *   SvarTal    sifferkloss (två och två): brickan och etiketten överst, talet stort under
 *   TreFasta   Sant, Falskt, Går inte att avgöra: tre lika breda på en rad
 *
 * Klossen (.sess-kloss i globals.css): 2 px kant i --sess-kant och 4 px kant
 * nedtill (box-shadow), tangentbrickan (.sess-tangent) med bokstaven.
 * Tillstånden via data-tillstand: neutral, vald (indigo), rätt (grön), fel
 * (röd, bara det valda, efter facit) och dämpad (övriga efter facit, .45).
 * Ingen kantbredd byts, så ingenting flyttar (CLS 0).
 *
 * Etiketterna "Ditt svar", "Rätt svar" och "Rätt, ditt svar" står utanför
 * textens flöde: på raden som en flik på klossens överkant till höger, på
 * sifferklossen i den översta raden som redan har brickans höjd. Figurrutan
 * har märket i stället (skissen), skärmläsaren får svaret i aria-label.
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

/** Klossens klasser: formen och fokusringen. Färgerna sätter data-tillstand. */
export const KLOSS = 'sess-kloss touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fokus,var(--ink-1))] disabled:cursor-default'

/**
 * Tangentbrickan: bokstaven (eller siffran) i en liten kloss. Färgen följer
 * tillståndet (data-tangent); dämpad ritas som neutral, klossen tonas.
 * `stor`: Likert-skalans siffra (34 px, 40 från lg).
 */
export function Tangent({ tecken, tillstand, stor = false, className = '' }: { tecken: string; tillstand: Tillstand; stor?: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`sess-tangent ${className}`} data-tangent={tillstand === 'dampad' ? 'neutral' : tillstand} data-stor={stor ? '' : undefined}>
      {tecken}
    </span>
  )
}

/**
 * Brickan med bokstaven, eller märket efter facit (rätt och fel). Används av
 * figurseriens remsa (bryter mönstret); klossarna använder Tangent.
 */
export function Bricka({ i, tillstand, className = '' }: { i: number; tillstand: Tillstand; className?: string }) {
  if (tillstand === 'ratt' || tillstand === 'fel') {
    return (
      <span aria-hidden="true" className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center ${className}`}>
        <Marke typ={tillstand} storlek={24} fylld pop />
      </span>
    )
  }
  return <Tangent tecken={BOKSTAV(i)} tillstand={tillstand} className={className} />
}

/** Etikettens text efter facit, null utan etikett. */
export function pillText(tillstand: Tillstand, ditt?: boolean): string | null {
  if (tillstand === 'fel') return SESSION.svar.ditt
  if (tillstand === 'ratt') return ditt ? SESSION.svar.rattDitt : SESSION.svar.ratt
  return null
}

/** Etiketten "Rätt svar", "Ditt svar" eller "Rätt, ditt svar". */
export function Pill({ tillstand, ditt, className = '' }: { tillstand: Tillstand; ditt?: boolean; flik?: boolean; className?: string }) {
  const text = pillText(tillstand, ditt)
  if (!text) return null
  return (
    <span className={`sess-pill sess-etikett inline-flex flex-shrink-0 items-center ${className}`} data-pill={tillstand === 'fel' ? 'ditt' : ditt ? 'ratt-ditt' : 'ratt'}>
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

const ariaChecked = (t: Tillstand, ditt?: boolean) => t === 'vald' || t === 'fel' || Boolean(ditt && t === 'ratt')

interface KortBas {
  i: number
  tillstand: Tillstand
  /** Sant på kortet hon valde (efter facit): etiketten säger "Rätt, ditt svar". */
  ditt?: boolean
  /** Sant efter facit när hon valde fel: rätt kort visas 120 ms efter felet. */
  efterFel?: boolean
  disabled?: boolean
  onValj?: (i: number) => void
}

/** Figurkortet: figuren centrerad, tangentbrickan uppe till vänster, märket uppe till höger efter facit. */
export function SvarRuta({ i, tillstand, ditt, efterFel, disabled, onValj, children, className = '' }: KortBas & { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ariaChecked(tillstand, ditt)}
      aria-label={ariaFor(i, tillstand, 'Svarsalternativ', ditt)}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`${KLOSS} sess-svar-ruta isolate w-full min-w-0 ${className}`}
    >
      <Tangent tecken={BOKSTAV(i)} tillstand={tillstand} className="absolute left-[7px] top-[7px] z-10 lg:left-2.5 lg:top-2.5" />
      {tillstand === 'ratt' || tillstand === 'fel' ? (
        <span aria-hidden="true" className="absolute right-[7px] top-[7px] z-10 lg:right-2.5 lg:top-2.5" data-ruta-marke>
          <Marke typ={tillstand} storlek={26} fylld pop />
        </span>
      ) : null}
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
      aria-checked={ariaChecked(tillstand, ditt)}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`${KLOSS} isolate flex min-h-[56px] w-full items-center gap-3 px-3.5 py-2.5 text-left text-base font-semibold leading-[22px] lg:gap-3.5 lg:px-4`}
    >
      <Tangent tecken={BOKSTAV(i)} tillstand={tillstand} />
      <span className="min-w-0 flex-1">{children}</span>
      <Pill tillstand={tillstand} ditt={ditt} className="absolute -top-[11px] right-3 z-10" />
    </button>
  )
}

/**
 * Sifferklossen (skissens Test-siffror-cirkel): två och två, brickan och
 * etiketten i en översta rad med fast höjd, talet stort under. Etiketten
 * ryms i radens höjd, så ingenting flyttar när facit kommer.
 */
export function SvarTal({ i, tillstand, ditt, efterFel, disabled, onValj, children }: KortBas & { children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={ariaChecked(tillstand, ditt)}
      aria-label={ariaFor(i, tillstand, 'Svarsalternativ', ditt)}
      disabled={disabled}
      onClick={() => onValj?.(i)}
      data-tillstand={tillstand}
      data-efter-fel={efterFel && tillstand === 'ratt' ? '' : undefined}
      data-svar={BOKSTAV(i)}
      className={`${KLOSS} isolate flex w-full min-w-0 flex-col gap-2 px-3.5 pb-3.5 pt-3 text-left`}
    >
      <span className="sess-topp flex min-h-[30px] w-full items-center">
        <Tangent tecken={BOKSTAV(i)} tillstand={tillstand} />
        <Pill tillstand={tillstand} ditt={ditt} className="ml-auto" />
      </span>
      <span className="block font-sess-display text-[20px] font-extrabold leading-[26px] lg:text-[22px] lg:leading-[28px]">{children}</span>
    </button>
  )
}

/** Sant, Falskt, Går inte att avgöra: klossar utan bricka, märket på överkanten efter facit. */
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
    <div role="radiogroup" aria-label="Ditt svar" className="grid grid-cols-3 gap-2 lg:gap-2.5">
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
            className={`${KLOSS} isolate flex min-h-[56px] items-center justify-center gap-1.5 px-1.5 py-1.5 text-center text-sm font-semibold leading-[18px]`}
          >
            {/* Märket sitter på klossens överkant till höger, som radernas
                flik, så att den centrerade texten aldrig flyttar (CLS 0). */}
            {t === 'ratt' || t === 'fel' ? (
              <span aria-hidden="true" className="absolute -top-[11px] right-2 z-10 inline-flex rounded-full bg-papper" data-tre-marke>
                <Marke typ={t} storlek={22} fylld pop />
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
