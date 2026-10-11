/**
 * "Var du tappar" (skiss Provbladet, avsnitt 2): andel rätt per
 * mönsterfamilj i logiktestet, ackumulerat över mätningen och passen,
 * familjer med minst två frågor. Den svagaste i koppar. Stapeln delas i rätt
 * i tid (fylld) och rätt men långsamt (skrafferad). Verbalt och numeriskt har
 * ingen familjetaxonomi, och det står rakt i kortet.
 */

import Link from 'next/link'
import { familjInfo } from '@/lib/logicTestV7/familjer'
import type { Familjestatistik } from '@/lib/traning/familjer'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { KNAPP_SEKUNDAR } from '@/components/shell/knappar'
import { familjerForKortet } from './berakna'
import { UTV } from './copy'
import { Brodtext, Eyebrow, Legend, LegendPost, T2, UKort } from './delar'

const T = UTV.tappar
const RANDER = 'repeating-linear-gradient(135deg, var(--ton-ink) 0 3px, transparent 3px 6px)'

function namn(id: string): string {
  return familjInfo(id)?.namn ?? id
}

export default function VarDuTappar({ familjer, className }: { familjer: readonly Familjestatistik[] | null; className?: string }) {
  const rader = familjer ? familjerForKortet(familjer).slice(0, 6) : []
  const svagast = rader[0] && rader[0].ratt < rader[0].antal ? rader[0] : null
  return (
    <UKort label={T.rubrik} className={className} data="tappar">
      <Eyebrow hjalp="C6" koppar={!!svagast}>
        {T.rubrik}
      </Eyebrow>
      {rader.length === 0 ? (
        <>
          <T2>{T.tomtTitel}</T2>
          <Brodtext>{T.tomt}</Brodtext>
        </>
      ) : (
        <>
          <T2>{svagast ? namn(svagast.family) : T.inget}</T2>
          <Brodtext>{svagast ? familjInfo(svagast.family)?.kort ?? '' : T.ingetText}</Brodtext>
          <ul className="mt-3 flex flex-col gap-2.5">
            {rader.map((f) => {
              const iTid = f.ratt - f.ratt_men_langsamma
              const ar = f === svagast
              return (
                <li
                  key={f.family}
                  aria-label={T.aria(namn(f.family), f.ratt, f.antal, f.ratt_men_langsamma)}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-0.5"
                  data-familj={f.family}
                >
                  <b className={`truncate text-sm font-semibold leading-[19px] ${ar ? 'text-koppar-ink' : 'text-ink-1'}`}>{namn(f.family)}</b>
                  <span className="text-meta tabular-nums text-ink-3">{T.rattAv(f.ratt, f.antal)}</span>
                  <span aria-hidden="true" className="col-span-2 flex h-2 overflow-hidden rounded-full border border-kant bg-papper-2">
                    <i className={`block h-full ${ar ? 'bg-koppar' : 'bg-ton-ink'}`} style={{ width: `${(iTid / f.antal) * 100}%` }} />
                    {f.ratt_men_langsamma ? (
                      <i className="block h-full" style={{ width: `${(f.ratt_men_langsamma / f.antal) * 100}%`, background: RANDER }} />
                    ) : null}
                  </span>
                </li>
              )
            })}
          </ul>
          <Legend>
            <LegendPost ruta={<rect x="1" y="4" width="12" height="6" rx="3" fill="var(--ton-ink)" />}>{T.legend.ratt}</LegendPost>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-1.5 w-3 shrink-0 rounded-full border border-kant" style={{ background: RANDER }} />
              {T.legend.langsam}
            </span>
            {svagast ? <LegendPost ruta={<rect x="1" y="4" width="12" height="6" rx="3" fill="var(--koppar)" />}>{T.legend.svag}</LegendPost> : null}
          </Legend>
          {svagast ? (
            <div className="mt-4">
              <Link href={TRANING_RUTT.riktat(svagast.family)} className={`${KNAPP_SEKUNDAR} lg:w-auto`}>
                {T.riktat(namn(svagast.family))}
              </Link>
            </div>
          ) : null}
        </>
      )}
      <p className="mt-3 border-t border-kant pt-3 text-meta text-ink-3">{T.bara}</p>
    </UKort>
  )
}
