'use client'

/**
 * PaketKort: Jobbcoach Premium som ett kort i rummen (spec-rummen våg 5,
 * docs/design/copy-premium-2026-10-11.md).
 *
 * Bara ett paket säljs, så kortet har en form: namnet, förklaringsraden,
 * listan med vad som ingår, prisraden i kort form (namnet står i rubriken)
 * och köpknappen. Rummens material: papper, kant, radie 16, KNAPP_PRIMAR.
 * Kopparkanten markerar det sålda kortet och står bara där (`markerad`).
 *
 * Används på kontosidan (/dashboard/profil/prenumeration). Den publika
 * prissidan har Trådens utseende och ett eget kort (PriserPaket), eftersom
 * koppar och knapp-primar bara finns i inloggat.
 *
 * Anroparen bestämmer knappen (text och handling), en status i stället för
 * knapp, en egen text eller prisrad (bytet för en kund med ett osålt
 * paket). Kortet vet ingenting om inloggning.
 */

import { Check } from '@/components/illustrations/RumIkoner'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { PAKET_KORT, type PaketId } from './paket-copy'

export interface PaketKortKnapp {
  text: string
  onClick: () => void
  disabled?: boolean
}

export interface PaketKortProps {
  paket?: PaketId
  /** Ersätter namnet som rubrik. */
  titel?: string
  /** En mening under förklaringsraden, till exempel varför bytet lönar sig. */
  text?: string
  /** Ersätter prisraden ovanför knappen. */
  prisrad?: string
  /** Knappen. null döljer den. Utelämnad ger köpknappen utan handling. */
  knapp?: PaketKortKnapp | null
  /** Status i stället för knapp: "Du har Premium". */
  status?: string
  /** Ersätter raden under knappen. null tar bort den. */
  fotnot?: string | null
  /** Textlänk under knappen eller statusen. */
  lank?: { text: string; onClick: () => void }
  /** Kopparkanten: kortet är det som säljs. Standard sant. */
  markerad?: boolean
  /** Visa listan med vad som ingår. Standard sant. */
  visaLista?: boolean
  id?: string
  className?: string
}

export default function PaketKort({
  paket = 'allt',
  titel,
  text,
  prisrad,
  knapp,
  status,
  fotnot,
  lank,
  markerad = true,
  visaLista = true,
  id,
  className,
}: PaketKortProps) {
  const copy = PAKET_KORT[paket]
  const knappen: PaketKortKnapp | null =
    knapp === null ? null : knapp ?? { text: copy.knapp, onClick: () => {} }
  const fot = fotnot === undefined ? copy.fotnot : fotnot
  const namn = titel ?? copy.namn

  return (
    <section
      id={id}
      aria-label={namn}
      className={`flex flex-col rounded-2xl border bg-papper p-4 text-ink-1 sm:p-5 ${
        markerad ? 'border-koppar shadow-[inset_0_0_0_1px_var(--koppar)]' : 'border-kant'
      } ${className ?? ''}`}
    >
      <h2 className="text-kort-t text-ink-1">{namn}</h2>
      <p className="mt-1 text-meta text-ink-3">{copy.beskrivning}</p>
      {text ? <p className="mt-2 text-sm leading-[21px] text-ink-2">{text}</p> : null}

      {visaLista ? (
        <div className="mt-4 border-t border-kant pt-3">
          <p className="text-ey text-ink-3">{copy.listEtikett}</p>
          <ul className="mt-2 grid gap-2">
            {copy.ingar.map((rad) => (
              <li key={rad} className="flex items-start gap-2.5 text-sm leading-5 text-ink-1">
                <Check className="mt-px h-[18px] w-[18px] shrink-0 text-ton-ink" strokeWidth={2} aria-hidden="true" />
                <span>{rad}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        {status ? (
          <p
            role="status"
            className="flex min-h-12 items-center justify-center rounded-xl border border-kant-stark px-4 text-[15px] font-semibold text-ink-1"
          >
            {status}
          </p>
        ) : knappen ? (
          <>
            <p className="mb-2.5 text-sm leading-[21px] text-ink-2">{prisrad ?? copy.prisrad}</p>
            <button
              type="button"
              onClick={knappen.onClick}
              disabled={knappen.disabled}
              className={`${KNAPP_PRIMAR} sm:w-auto sm:min-w-[280px]`}
            >
              {knappen.text}
            </button>
          </>
        ) : null}

        {lank ? (
          <button type="button" onClick={lank.onClick} className={`${LANK} mt-3 block`}>
            {lank.text}
          </button>
        ) : null}

        {fot ? <p className="mt-2 text-meta text-ink-3">{fot}</p> : null}
      </div>
    </section>
  )
}
