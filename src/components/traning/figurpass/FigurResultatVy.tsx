'use client'

/**
 * Resultatet efter figurpasset (beställning omgång 3, A3; copy-omgang3 2.3):
 * "3 av 4 rätt" med ringen som bär andelen, tempot per uppgift mot provets
 * 45 sekunder som en stapel med budgetlinjen, "Var du tappade" per familj
 * med en liten stapel (aldrig procent i text), statusraden "I morgon".
 * Ringens title säger att passet inte påverkar nivån på skalan.
 */

import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import Rader, { Rad } from '@/components/rum/Rader'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { FIGUR_PASS_COPY } from '@/lib/tester/pass-copy'
import { serieFamiljNamn } from '@/lib/figurserierV1/familjer'
import type { FigurPassVy } from '@/lib/tester/pass-figur'

const R = FIGUR_PASS_COPY.resultat

function Tempo({ tidPer, budgetPer }: { tidPer: number; budgetPer: number }) {
  const max = Math.max(tidPer, budgetPer) * 1.15
  const andel = max > 0 ? tidPer / max : 0
  const linje = max > 0 ? budgetPer / max : 0
  return (
    <section aria-label={R.tempoRubrik} className="rounded-2xl border border-kant bg-papper p-4" data-figur-tempo>
      <p className="text-ey uppercase text-ink-3">{R.tempoRubrik}</p>
      <p className="mt-1 text-sm leading-5 text-ink-1">{R.tempo(tidPer, budgetPer)}</p>
      <div className="relative mt-3 h-2.5 w-full rounded-full bg-papper-2" role="img" aria-label={R.tempoAria(tidPer, budgetPer)}>
        <i className="absolute inset-y-0 left-0 block rounded-full bg-koppar" style={{ width: `${(andel * 100).toFixed(1)}%` }} />
        <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: `calc(${(linje * 100).toFixed(1)}% - 1px)` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] leading-4 tabular-nums text-ink-3">
        <span>{R.tid(tidPer)}</span>
        <span>
          {R.budgetEtikett} {R.tid(budgetPer)}
        </span>
      </p>
    </section>
  )
}

export default function FigurResultatVy({ vy, onGenomga, onTillbaka }: { vy: FigurPassVy; onGenomga: () => void; onTillbaka: () => void }) {
  const r = vy.resultat
  if (!r) return null
  const tidPer = r.antal ? Math.round(r.tid_s / r.antal) : 0
  const budgetPer = r.antal ? Math.round(r.budget_s / r.antal) : 0
  return (
    <div className="flex flex-col gap-3.5" data-resultat data-figur-resultat>
      <section className="flex items-center gap-4 rounded-2xl border border-kant bg-papper p-4" role="status" aria-live="polite">
        <span title={R.ingenNiva}>
          <Dagsring status="gjord" andel={r.antal ? r.ratt / r.antal : 0} storlek={64} label={R.ringAria(r.ratt, r.antal)} />
        </span>
        <div className="min-w-0">
          <p className="text-ey uppercase text-koppar-ink">{R.eyebrow}</p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold leading-[31px] tracking-[-.02em] text-ink-1">{R.rubrik(r.ratt, r.antal)}</h1>
        </div>
      </section>

      <Tempo tidPer={tidPer} budgetPer={budgetPer} />

      {r.tappade.length > 0 ? (
        <section aria-label={R.tappadeRubrik} data-figur-tappade>
          <p className="mb-2 text-ey uppercase text-ink-3">{R.tappadeRubrik}</p>
          <Rader label={R.tappadeRubrik}>
            {r.tappade.map((t, i) => {
              const namn = serieFamiljNamn(t.familj) ?? t.familj
              return (
                <Rad
                  key={t.familj}
                  titel={<span aria-label={`${namn}. ${R.tappadeMeta(t.ratt, t.antal)}.`}>{namn}</span>}
                  stapel={{ andel: Math.max(0.04, t.andel), ton: i === 0 ? 'koppar' : 'ton' }}
                />
              )
            })}
          </Rader>
        </section>
      ) : null}

      {vy.upprepad ? <p className="text-sm leading-5 text-ink-2">{R.upprepad}</p> : null}
      {vy.expertRad ? (
        <p className="text-sm leading-5 text-ink-2">
          <Link href={testPaths.hub('figurserier-expert')} className={LANK}>
            {R.expertRad}
          </Link>
        </p>
      ) : null}

      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1" data-figur-imorgon>
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-koppar" />
        <span>{R.imorgon}</span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="button" onClick={onGenomga} className={KNAPP_PRIMAR}>
          {FIGUR_PASS_COPY.knapp.genomga}
        </button>
        <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
          {FIGUR_PASS_COPY.knapp.tillbaka}
        </button>
      </div>
    </div>
  )
}
