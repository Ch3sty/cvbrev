'use client'

/**
 * Resultatet efter ett pass i testplanens steg 2 (skissen, resultatvyerna):
 * ringen och "4 av 6 rätt" som huvudtal, Var du tappar per regelfamilj eller
 * uppgiftsform med en liten stapel (aldrig procent i text), tempot per
 * uppgift mot provets tid som en stapel med budgetlinjen, och I morgon.
 */

import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import Rader, { Rad } from '@/components/rum/Rader'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { steg2PassCopy } from '@/lib/tester/steg2/copy'
import type { Steg2PassVy } from '@/lib/tester/steg2/pass'

export default function Steg2ResultatVy({ vy, onGenomga, onTillbaka }: { vy: Steg2PassVy; onGenomga: () => void; onTillbaka: () => void }) {
  const r = vy.resultat
  if (!r) return null
  const R = steg2PassCopy(vy.kind).resultat
  const knapp = steg2PassCopy(vy.kind).knapp
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = r.antal ? Math.round(r.budget_s / r.antal) : 0
  const max = Math.max(tidPer, budgetPer) * 1.15
  const andel = max > 0 ? tidPer / max : 0
  const linje = max > 0 ? budgetPer / max : 0
  const svagast = r.tappade.find((t) => t.ratt < t.antal)?.familj ?? null
  return (
    <div className="flex flex-col gap-3.5" data-resultat data-steg2-resultat>
      <section className="flex items-center gap-4 rounded-2xl border border-kant bg-papper p-4" role="status" aria-live="polite">
        <span title={R.ingenNiva}>
          <Dagsring status="gjord" andel={r.antal ? r.ratt / r.antal : 0} storlek={64} label={R.ringAria(r.ratt, r.antal)} />
        </span>
        <div className="min-w-0">
          <p className="text-ey uppercase text-koppar-ink">{R.eyebrow}</p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold leading-[31px] tracking-[-.02em] text-ink-1">{R.rubrik(r.ratt, r.antal)}</h1>
        </div>
      </section>

      {r.tappade.length > 0 ? (
        <section aria-label={R.tappadeRubrik} data-steg2-tappade>
          <p className="mb-2 text-ey uppercase text-ink-3">{R.tappadeRubrik}</p>
          <Rader label={R.tappadeRubrik}>
            {r.tappade.map((t, i) => (
              <Rad
                key={t.familj}
                titel={<span aria-label={`${t.familj}. ${R.tappadeMeta(t.ratt, t.antal)}.`}>{t.familj}</span>}
                stapel={{ andel: Math.max(0.04, t.andel), ton: i === 0 && t.ratt < t.antal ? 'koppar' : 'ton' }}
              />
            ))}
          </Rader>
        </section>
      ) : null}

      <section aria-label={R.tempoRubrik} className="rounded-2xl border border-kant bg-papper p-4" data-steg2-tempo>
        <p className="text-ey uppercase text-ink-3">{R.tempoRubrik}</p>
        <p className="mt-1 text-sm leading-5 text-ink-1">{R.tempo(tidPer, budgetPer)}</p>
        <div className="relative mt-3 h-2.5 w-full rounded-full bg-papper-2" role="img" aria-label={R.tempoAria(tidPer, budgetPer)}>
          <i className={`absolute inset-y-0 left-0 block rounded-full ${tidPer > budgetPer ? 'bg-koppar' : 'bg-ton-ink'}`} style={{ width: `${(andel * 100).toFixed(1)}%` }} />
          <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: `calc(${(linje * 100).toFixed(1)}% - 1px)` }} />
        </div>
        <p className="mt-1.5 flex justify-between text-[11px] leading-4 tabular-nums text-ink-3">
          <span>{R.tid(tidPer)}</span>
          <span>
            {R.budgetEtikett} {R.tid(budgetPer)}
          </span>
        </p>
      </section>

      {vy.upprepad ? <p className="text-sm leading-5 text-ink-2">{R.upprepad}</p> : null}

      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1" data-steg2-imorgon>
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-koppar" />
        <span>{R.imorgon(svagast)}</span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="button" onClick={onGenomga} className={KNAPP_PRIMAR}>
          {knapp.genomga}
        </button>
        <Link href="/dashboard/tester" onClick={(e) => { e.preventDefault(); onTillbaka() }} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
          {knapp.tillbaka}
        </Link>
      </div>
    </div>
  )
}
