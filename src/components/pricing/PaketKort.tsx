'use client'

/**
 * PaketKort: Jobbcoach Premium som ett kort i rummen (spec-rummen våg 5,
 * docs/design/copy-premium-2026-10-11.md).
 *
 * Bara ett paket säljs, så kortet har en form: namnet, förklaringsraden,
 * listan med vad som ingår, prisraden i kort form (namnet står i rubriken)
 * och köpknappen. Rummens material: papper, kant, radie 16, KNAPP_PRIMAR.
 * Ingen kopparkant: med ett paket finns inget att rekommendera framför
 * något annat, och kopparn i ett köpkort är knappen (art-director 24.2
 * fråga 3). Ingen statusplatta heller: en text i en ram med knappens mått
 * läses som en knapp som inte gör något.
 *
 * `lyft` gör kortet till vyns LyftKort, först på golvet och över väggen
 * (prenumerationssidan på gratisnivån och för en spårkund). Utan `lyft` är
 * det ett vanligt kort med kant.
 *
 * Används på kontosidan (/dashboard/profil/prenumeration). Den publika
 * prissidan har Trådens utseende och ett eget kort (PriserPaket), eftersom
 * koppar och KNAPP_PRIMAR bara finns i inloggat.
 *
 * Anroparen bestämmer knappen (text och handling), en egen text eller
 * prisrad (bytet för en kund med ett osålt paket). Kortet vet ingenting om
 * inloggning.
 */

import { Check } from '@/components/illustrations/RumIkoner'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
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
  /** Knappen. null döljer den och prisraden. Utelämnad ger köpknappen utan handling. */
  knapp?: PaketKortKnapp | null
  /** Ersätter raden under knappen. null tar bort den. */
  fotnot?: string | null
  /** Textlänk bredvid knappen. */
  lank?: { text: string; onClick: () => void }
  /** Kortet är vyns lyfta kort och överlappar väggen. */
  lyft?: boolean
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
  fotnot,
  lank,
  lyft = false,
  visaLista = true,
  id,
  className,
}: PaketKortProps) {
  const copy = PAKET_KORT[paket]
  const knappen: PaketKortKnapp | null =
    knapp === null ? null : knapp ?? { text: copy.knapp, onClick: () => {} }
  const fot = fotnot === undefined ? copy.fotnot : fotnot
  const namn = titel ?? copy.namn

  const ram = lyft
    ? 'relative z-[2] -mt-[30px] border-[color:var(--lyft-kant)] shadow-lyft'
    : 'border-kant'

  return (
    <section
      id={id}
      aria-label={namn}
      className={`flex flex-col rounded-2xl border bg-papper p-4 text-ink-1 ${lyft ? '' : 'sm:p-5'} ${ram} ${className ?? ''}`}
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

      {knappen ? (
        <div className="mt-auto pt-4">
          <p className="text-sm font-medium text-ink-1">{prisrad ?? copy.prisrad}</p>
          <div className={KNAPPRAD}>
            <button
              type="button"
              onClick={knappen.onClick}
              disabled={knappen.disabled}
              className={KNAPP_PRIMAR}
            >
              {knappen.text}
            </button>
            {lank ? (
              <button type="button" onClick={lank.onClick} className={LANK}>
                {lank.text}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {fot ? <p className="mt-3.5 border-t border-kant pt-3 text-meta text-ink-3">{fot}</p> : null}
    </section>
  )
}
