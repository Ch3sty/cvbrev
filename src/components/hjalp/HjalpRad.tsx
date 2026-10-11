'use client'

/**
 * Hjälpraden (skiss Provbladet, avsnitt 4): en fällbar rad, 48 px hopfälld,
 * frågetecknet i rummets ton. Står på golvet, aldrig på väggen, aldrig före
 * det lyfta kortet eller mellan ett kort och dess knapp.
 *
 *   <HjalpRad ids={['A1', 'A2', 'A5']} rubrik="Aldrig gjort ett rekryteringstest?" oppnasForsta={false} />
 *   <HjalpRad ids={['C5']} />
 *
 * Första rutan i `ids` står som brödtext (rubriken är radens), övriga får
 * sin egen fetstilta fråga framför texten. Rutor som väntar på verifiering
 * hoppas över; blir inget kvar ritas ingenting.
 *
 * Läget kommer från useHjalp(): öppen första gången, hopfälld sedan, borta
 * när användaren valt "Dölj hjälpen".
 */

import { useState } from 'react'
import { IkonChev, IkonFraga } from '@/components/illustrations/RumSymboler'
import { HJALP_UI, synligaRutor, type HjalpId, type HjalpRutaText } from '@/lib/traning/hjalp-copy'
import { startlage } from '@/lib/traning/hjalp'
import { useHjalp } from './HjalpKontext'

export interface HjalpRadProps {
  /** Rutorna ur hjalp-copy.ts, i visningsordning. */
  ids: readonly HjalpId[]
  /** Radens fråga. Standard: första rutans rubrik. */
  rubrik?: string
  /** false: hopfälld även första gången. Standard true. */
  oppnasForsta?: boolean
  /** Visa länken "Dölj hjälpen" i radens fot. Standard true. */
  doljLank?: boolean
  /** 'rad' på golvet (48 px), 'panel' i sidopanelen (56 px, displayrubrik). */
  variant?: 'rad' | 'panel'
  className?: string
}

export function HjalpText({ rutor, forstaUtanRubrik = true }: { rutor: HjalpRutaText[]; forstaUtanRubrik?: boolean }) {
  return (
    <>
      {rutor.map((r, i) => (
        <p key={r.id} className={i > 0 ? 'mt-2' : undefined}>
          {i === 0 && forstaUtanRubrik ? null : <b className="font-semibold text-ink-1">{r.rubrik} </b>}
          {r.text}
        </p>
      ))}
    </>
  )
}

export default function HjalpRad({
  ids,
  rubrik,
  oppnasForsta = true,
  doljLank = true,
  variant = 'rad',
  className,
}: HjalpRadProps) {
  const { dold, forsta, dolj } = useHjalp()
  // null = användaren har inte rört raden; startläget gäller.
  const [oppen, setOppen] = useState<boolean | null>(null)
  const rutor = synligaRutor(ids)
  const lage = startlage(dold, forsta, oppnasForsta)
  if (lage === 'dold' || rutor.length === 0) return null

  const arOppen = oppen ?? lage === 'oppen'
  const fraga = rubrik ?? rutor[0].rubrik
  const forstaUtanRubrik = rubrik === undefined || rubrik === rutor[0].rubrik
  const panel = variant === 'panel'

  return (
    <details
      open={arOppen}
      onToggle={(e) => setOppen((e.currentTarget as HTMLDetailsElement).open)}
      className={`group border border-kant bg-papper ${panel ? 'rounded-2xl' : 'rounded-xl'} ${className ?? ''}`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 text-ink-1 [&::-webkit-details-marker]:hidden ${
          panel ? 'min-h-14 font-display text-base font-bold tracking-[-0.01em]' : 'min-h-12 text-sm font-medium'
        }`}
      >
        <IkonFraga size={20} className="shrink-0 text-ton-ink" />
        <span className="min-w-0 flex-1">{fraga}</span>
        <IkonChev size={20} className="shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none" />
      </summary>
      <div className="px-3.5 pb-3.5 text-sm leading-[21px] text-ink-2">
        <HjalpText rutor={rutor} forstaUtanRubrik={forstaUtanRubrik} />
        {doljLank ? (
          <div className="mt-3 flex justify-end border-t border-kant pt-1">
            <button
              type="button"
              onClick={dolj}
              className="inline-flex min-h-11 items-center text-meta font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
            >
              {HJALP_UI.dolj}
            </button>
          </div>
        ) : null}
      </div>
    </details>
  )
}
