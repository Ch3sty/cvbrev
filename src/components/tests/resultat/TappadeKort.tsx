/**
 * Var du tappade i det här testet (skiss Provbladet, avsnitt 3, steg s4):
 * familjer, svarstyper eller uppgiftstyper med minst två frågor i sessionen,
 * svagast först. En stapel per grupp; den svagaste i koppar, övriga i
 * rummets ton. Inget rött.
 */

import type { Grupp } from '@/lib/tester/resultat'
import { RESULTAT } from '@/lib/tester/copy'

export interface TappadeKortProps {
  grupper: Grupp[]
  svagast: Grupp | null
  matris: boolean
  term: string
  flera: string
  /** Dator: kortet står bredvid genomgången och lyfts över väggen. */
  lyft?: boolean
  className?: string
}

export default function TappadeKort({ grupper, svagast, matris, term, flera, lyft, className }: TappadeKortProps) {
  return (
    <section
      aria-label={RESULTAT.tappade.rub}
      className={`rounded-2xl border bg-papper p-4 ${
        lyft ? 'border-kant lg:relative lg:z-[2] lg:-mt-[30px] lg:border-[color:var(--lyft-kant)] lg:shadow-lyft' : 'border-kant'
      } ${className ?? ''}`}
    >
      <p className="text-ey text-ink-3">
        <span className={lyft ? 'lg:hidden' : undefined}>{RESULTAT.tappade.rub}</span>
        {lyft ? <span className="hidden lg:inline">{RESULTAT.tappade.rubKort}</span> : null}
      </p>
      <h3 className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-0.015em] text-ink-1">
        {svagast ? RESULTAT.tappade.titel(svagast.namn, svagast.ratt, svagast.totalt) : RESULTAT.tappade.allaSatt(matris)}
      </h3>
      <ul className="mt-3 flex flex-col gap-2.5">
        {grupper.map((g) => {
          const svag = svagast?.namn === g.namn
          const pct = Math.round((g.ratt / g.totalt) * 100)
          return (
            <li key={g.namn} className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-0.5">
              <b className={`text-sm font-semibold leading-[19px] ${svag ? 'text-koppar-ink' : 'text-ink-1'}`}>{g.namn}</b>
              <span className="text-right text-meta tabular-nums text-ink-3">
                {g.ratt} av {g.totalt}
              </span>
              <span
                className="col-span-2 block h-2 overflow-hidden rounded border border-kant bg-papper-2"
                role="img"
                aria-label={`${g.namn}: ${g.ratt} av ${g.totalt} rätt`}
              >
                <i className={`block h-full rounded ${svag ? 'bg-koppar' : 'bg-ton-ink'}`} style={{ width: `${pct}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-meta text-ink-3">{RESULTAT.tappade.fot(term, flera)}</p>
    </section>
  )
}
