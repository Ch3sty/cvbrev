'use client'

/**
 * Nästa steg (utkast v4 avsnitt 2, skissens lyftkort på webben): den första
 * hinten ur datan som vyns lyfta kort. Eyebrow (skälets kategori), rubrik
 * (handlingen), skäl ur datan, en knapp och ett kort tips. Samma kort ligger
 * överst i Tester (B monterar det därifrån).
 *
 * Knappen öppnar testtypens meny på Tester (/dashboard/tester/alla?typ=),
 * en befintlig adress som också fungerar i appen. Knappar som startar
 * direkt, Nivåkollen i en typ som inte är mätt, går till knapp.href. Kräver
 * knappen Premium står "Ingår i Premium" med lås, och menyn visar låsen.
 *
 * Första steget (ny användare, plan från en artikel) går att stänga.
 */

import Link from 'next/link'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { IkonLas, IkonX } from '@/components/illustrations/RumSymboler'
import { menyHref } from '@/lib/tester/v4/rutter'
import type { Hint, HintTyp } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { hintKlickad, useHintStangd, type HintKontext } from './HintSparning'

/** Hintar vars Nivåkoll-knapp startar direkt i stället för att öppna menyn. */
const STARTAR_DIREKT: ReadonlySet<HintTyp> = new Set(['forsta_steg', 'nivakoll_saknas', 'nivakoll_paborjad', 'prova_nytt'])

/** Vart hintens knapp leder. Ren, testas. */
export function hintHref(h: Pick<Hint, 'typ' | 'testtyp' | 'knapp'>): string {
  if (!h.testtyp) return h.knapp.href
  if (!h.knapp.las && h.knapp.slag === 'nivakoll' && STARTAR_DIREKT.has(h.typ)) return h.knapp.href
  return menyHref(h.testtyp)
}

/** Knappens text: låsta hintar säger vad som krävs. */
export function hintEtikett(h: Pick<Hint, 'knapp'>): string {
  return h.knapp.las ? HEM_V4.las : h.knapp.etikett
}

const TOM_KONTEXT: HintKontext = { planTest: null, planTyper: [] }

export default function NastaSteg({
  hint,
  kontext = TOM_KONTEXT,
  utanOverlapp,
  className,
}: {
  hint: Hint | null | undefined
  kontext?: HintKontext
  /** Utan överlappet mot väggen, när kortet inte står direkt under den. */
  utanOverlapp?: boolean
  className?: string
}) {
  const [stangd, stang] = useHintStangd(hint?.id ?? '')
  if (!hint || (hint.stangbar && stangd)) return null
  const las = hint.knapp.las
  return (
    <LyftKort
      label={HEM_V4.nastaSteg}
      eyebrow={hint.eyebrow}
      eyebrowTon="neutral"
      titel={hint.rubrik}
      text={hint.skal}
      utanOverlapp={utanOverlapp}
      className={className}
    >
      {hint.stangbar ? (
        <button
          type="button"
          onClick={stang}
          aria-label={HEM_V4.stangEtikett}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl text-ink-3 hover:bg-papper-2"
        >
          <IkonX size={20} />
        </button>
      ) : null}
      <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4" data-hint={hint.typ}>
        <Link
          href={hintHref(hint)}
          className={`${KNAPP_PRIMAR} sm:w-auto`}
          onClick={() => hintKlickad(hint, kontext, 0)}
          aria-label={las ? `${hint.knapp.etikett}. ${HEM_V4.las}.` : undefined}
        >
          {las ? <IkonLas size={18} /> : null}
          {hintEtikett(hint)}
        </Link>
        {hint.tips ? (
          <p className="text-meta text-ink-3">
            {HEM_V4.tips} {hint.tips}
          </p>
        ) : null}
      </div>
    </LyftKort>
  )
}
