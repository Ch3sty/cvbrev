'use client'

/**
 * Resultatet efter ett text- eller sifferpass (beställning omgång 2, B2):
 * "3 av 4 rätt" med ringen som bär andelen, tempot mot provets tid för
 * underlaget som en stapel med budgetlinjen, "Var du tappade" med en liten
 * stapel per typ (aldrig procent i text) och "Öva den här typen" som
 * textlänk, sedan statusraden "I morgon".
 */

import Link from 'next/link'
import Dagsring from '@/components/rum/Dagsring'
import Rader, { Rad } from '@/components/rum/Rader'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { vnPassHref } from '@/lib/traning/rutter'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { VN_PASS_COPY, vnFamiljNamn } from '@/lib/tester/pass-copy'
import type { VnPassVy } from '@/lib/tester/pass-typer'

const R = VN_PASS_COPY.resultat

function Tempo({ tid, budget }: { tid: number; budget: number }) {
  const max = Math.max(tid, budget) * 1.15
  const andel = max > 0 ? tid / max : 0
  const linje = max > 0 ? budget / max : 0
  return (
    <section aria-label={R.tempoRubrik} className="rounded-2xl border border-kant bg-papper p-4" data-vn-tempo>
      <p className="text-ey uppercase text-ink-3">{R.tempoRubrik}</p>
      <p className="mt-1 text-sm leading-5 text-ink-1">{R.tempo(tid, budget)}</p>
      <div className="relative mt-3 h-2.5 w-full rounded-full bg-papper-2" role="img" aria-label={R.tempoAria(tid, budget)}>
        <i className="absolute inset-y-0 left-0 block rounded-full bg-koppar" style={{ width: `${(andel * 100).toFixed(1)}%` }} />
        <i className="absolute -top-1 bottom-[-4px] block w-[2px] rounded bg-ink-1" style={{ left: `calc(${(linje * 100).toFixed(1)}% - 1px)` }} />
      </div>
      <p className="mt-1.5 flex justify-between text-[11px] leading-4 tabular-nums text-ink-3">
        <span>{R.tid(tid)}</span>
        <span>
          {R.budgetEtikett} {R.tid(budget)}
        </span>
      </p>
    </section>
  )
}

export default function VnResultatVy({ vy, onGenomga, onTillbaka }: { vy: VnPassVy; onGenomga: () => void; onTillbaka: () => void }) {
  const r = vy.resultat
  if (!r) return null
  const riktat = vy.typ === 'riktat'
  const expertHref = testPaths.hub(vy.kind === 'verbal' ? 'verbal-resonemang-expert' : 'numeriskt-test-expert')
  return (
    <div className="flex flex-col gap-3.5" data-resultat data-vn-resultat>
      <section className="flex items-center gap-4 rounded-2xl border border-kant bg-papper p-4" role="status" aria-live="polite">
        <Dagsring status="gjord" andel={r.antal ? r.ratt / r.antal : 0} storlek={64} label={R.ringAria(r.ratt, r.antal)} />
        <div className="min-w-0">
          <p className="text-ey uppercase text-koppar-ink">{R.eyebrow(vy.kind, riktat)}</p>
          <h1 className="mt-0.5 font-display text-[26px] font-bold leading-[31px] tracking-[-.02em] text-ink-1">{R.rubrik(r.ratt, r.antal)}</h1>
        </div>
      </section>

      <Tempo tid={r.tid_s} budget={r.budget_s} />

      {r.tappade.length > 0 ? (
        <section aria-label={R.tappadeRubrik} data-vn-tappade>
          <p className="mb-2 text-ey uppercase text-ink-3">{R.tappadeRubrik}</p>
          <Rader label={R.tappadeRubrik}>
            {r.tappade.map((t, i) => {
              const namn = vnFamiljNamn(t.familj) ?? t.familj
              return (
                <Rad
                  key={t.familj}
                  titel={<span aria-label={`${namn}. ${R.tappadeMeta(t.ratt, t.antal)}.`}>{namn}</span>}
                  stapel={{ andel: Math.max(0.04, t.andel), ton: i === 0 ? 'koppar' : 'ton' }}
                  hoger={
                    t.riktat ? (
                      <Link href={vnPassHref(vy.kind, t.familj)} className={`${LANK} inline-flex min-h-11 items-center whitespace-nowrap text-[13px]`}>
                        {VN_PASS_COPY.knapp.ovaTypen}
                      </Link>
                    ) : undefined
                  }
                />
              )
            })}
          </Rader>
        </section>
      ) : null}

      {vy.upprepad ? <p className="text-sm leading-5 text-ink-2">{R.upprepad}</p> : null}
      {vy.expertRad ? (
        <p className="text-sm leading-5 text-ink-2">
          <Link href={expertHref} className={LANK}>
            {R.expertRad}
          </Link>
        </p>
      ) : null}

      <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1" data-vn-imorgon>
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-koppar" />
        <span>{R.imorgon(vy.kind)}</span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="button" onClick={onGenomga} className={KNAPP_PRIMAR}>
          {VN_PASS_COPY.knapp.genomga}
        </button>
        <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
          {VN_PASS_COPY.knapp.tillbaka}
        </button>
      </div>
    </div>
  )
}
