/**
 * Planen till provet i M1 (spec-rummen 4.4, konceptets .plan).
 *
 * Rader med en punkt (28 px), text och ett chip. Punkten: gjord i koppar,
 * planerad som ihålig ring, ommätning som ring med tjockare kant,
 * generalrepetition som ihålig kvadrat och provdagen som fylld kvadrat. En
 * låst rad (ingår inte i gratisnivån, 17.2) står i ink-3 med låschippet.
 *
 * Server component.
 */

import Chip from '@/components/rum/Chip'
import type { PlanRad } from '@/lib/traning/resultat'

function Punkt({ typ }: { typ: PlanRad['punkt'] }) {
  const bas = 'block h-3 w-3'
  switch (typ) {
    case 'gjord':
      return <i className={`${bas} rounded-full border-[1.5px] border-koppar bg-koppar`} />
    case 'om':
      return <i className={`${bas} rounded-full border-[2.5px] border-ink-2`} />
    case 'prov':
      return <i className={`${bas} rounded-[2px] border-[1.5px] border-ink-1 bg-ink-1`} />
    case 'general':
      return <i className={`${bas} rounded-[2px] border-[1.5px] border-kant-stark`} />
    default:
      return <i className={`${bas} rounded-full border-[1.5px] border-kant-stark`} />
  }
}

export default function Plan({ rader }: { rader: PlanRad[] }) {
  return (
    <ul className="mt-2 flex flex-col">
      {rader.map((r, i) => (
        <li
          key={i}
          className={`grid grid-cols-[28px_1fr_auto] items-start gap-3 py-2.5 ${i > 0 ? 'border-t border-kant' : ''}`}
        >
          <span className="flex h-7 w-7 items-center justify-center" aria-hidden="true">
            <Punkt typ={r.punkt} />
          </span>
          <span className="min-w-0">
            <b className={`block text-sm font-semibold leading-[19px] ${r.last ? 'text-ink-3' : 'text-ink-1'}`}>{r.titel}</b>
            <span className={`mt-px block text-meta ${r.last ? 'text-ink-3' : 'text-ink-3'}`}>{r.meta}</span>
          </span>
          {r.chip ? (
            <Chip ton={r.chip.ton} las={r.chip.las} className="!h-6 !text-[11px]">
              {r.chip.text}
            </Chip>
          ) : (
            <span />
          )}
        </li>
      ))}
    </ul>
  )
}
