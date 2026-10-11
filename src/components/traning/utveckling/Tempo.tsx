/**
 * "Tempo mot provets tid" (skiss Provbladet, avsnitt 2): tiden per fråga i
 * senaste passet som staplar mot provets tid (streckad linje). Rätt fylld,
 * fel ihålig, över provets tid i koppar. Under: snittet per pass för de
 * senaste passen (meta.snitt_s, frågorna nära nivån).
 *
 * Talen står som display-tal och etiketter, aldrig i löptexten.
 */

import { kortDatum } from '@/lib/traning/rubrik'
import { tempoSammandrag } from './berakna'
import { UTV } from './copy'
import { Brodtext, Eyebrow, Legend, LegendPost, T2, Tal, UKort } from './delar'
import type { UtvecklingTempo } from './typer'

const T = UTV.tempo

export function tempoRubrik(over: number, antal: number): string {
  if (over === 0) return T.hinner
  return over * 3 <= antal ? T.mest : T.for
}

export default function Tempo({ tempo, className }: { tempo: UtvecklingTempo | null; className?: string }) {
  const s = tempo?.senaste ?? null
  if (!tempo || !s) {
    return (
      <UKort label={T.rubrik} className={className} data="tempo">
        <Eyebrow hjalp="C3">{T.rubrik}</Eyebrow>
        <T2>{T.tomtTitel}</T2>
        <Brodtext>{T.tomt}</Brodtext>
      </UKort>
    )
  }
  const sum = tempoSammandrag(s)
  const tak = Math.max(s.budget_s * 1.25, ...s.fragor.map((f) => f.tid_s))
  const budgetTopp = (1 - s.budget_s / tak) * 100
  const perPass = tempo.snittPerPass.filter((p) => p.snitt_s != null)
  const passTak = Math.max(1, ...tempo.snittPerPass.map((p) => Math.max(p.snitt_s ?? 0, p.budget_s * 1.25)))

  return (
    <UKort label={T.rubrik} className={className} data="tempo">
      <Eyebrow hjalp="C3">{T.rubrik}</Eyebrow>
      <T2>{tempoRubrik(sum.over, sum.antal)}</T2>
      <p className="mt-1 text-meta text-ink-3">{T.senaste(kortDatum(s.dag))}</p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <Tal varde={String(sum.snitt_s)} enhet="s" etikett={T.snitt} />
        <Tal varde={String(s.budget_s)} enhet="s" etikett={T.budget} />
        <Tal varde={String(sum.over)} enhet={`/${sum.antal}`} etikett={T.over} ton={sum.over ? 'koppar' : 'ink'} />
      </div>

      <div role="img" aria-label={T.aria(sum.over, sum.antal, sum.snitt_s, s.budget_s)} className="relative mt-5 flex h-[88px] items-end gap-[5px] pt-1.5" data-tempo-staplar>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-kant-stark" style={{ top: `${budgetTopp}%` }}>
          <em className="absolute right-0 -top-[18px] not-italic text-ax text-ink-3">{T.budget}</em>
        </span>
        {s.fragor.map((f, i) => {
          const over = f.tid_s > s.budget_s
          const h = Math.max(4, (f.tid_s / tak) * 100)
          const farg = over ? 'var(--koppar)' : 'var(--ton-ink)'
          return (
            <i
              key={i}
              title={T.stapelTitel(i + 1, f.tid_s, f.ratt)}
              className="block flex-1 rounded-t-[3px]"
              style={{
                height: `${h}%`,
                background: f.ratt ? farg : 'transparent',
                border: f.ratt ? undefined : `1.5px solid ${farg}`,
                opacity: over ? 1 : 0.75,
              }}
              data-over={over ? '1' : undefined}
            />
          )
        })}
      </div>
      <div aria-hidden="true" className="mt-1.5 flex justify-between text-ax text-ink-3">
        <span>{T.fraga(1)}</span>
        <span>{T.fraga(s.fragor.length)}</span>
      </div>
      <Legend>
        <LegendPost ruta={<rect x="2" y="2" width="10" height="10" rx="2" fill="var(--ton-ink)" opacity=".75" />}>{T.legend.ratt}</LegendPost>
        <LegendPost ruta={<rect x="2.75" y="2.75" width="8.5" height="8.5" rx="2" fill="none" stroke="var(--ton-ink)" strokeWidth="1.5" />}>{T.legend.fel}</LegendPost>
        <LegendPost ruta={<rect x="2" y="2" width="10" height="10" rx="2" fill="var(--koppar)" />}>{T.legend.over}</LegendPost>
      </Legend>
      {sum.fastnade.length ? <Brodtext>{T.fast}</Brodtext> : null}

      {perPass.length >= 2 ? (
        <div className="mt-4 border-t border-kant pt-3" data-tempo-perpass>
          <p className="text-ey text-ink-3">{T.perPass}</p>
          <p className="mt-0.5 text-meta text-ink-3">{T.perPassMeta}</p>
          <div className="mt-3 flex items-end gap-3">
            {tempo.snittPerPass.map((p, i) => {
              const over = p.snitt_s != null && p.snitt_s > p.budget_s
              return (
                <div key={`${p.dag}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={T.passTitel(kortDatum(p.dag), p.snitt_s)}>
                  <span className={`text-ax font-semibold tabular-nums ${over ? 'text-koppar-ink' : 'text-ink-2'}`}>{p.snitt_s != null ? T.sek(p.snitt_s) : ''}</span>
                  <span className="relative block h-10 w-full max-w-7">
                    <span aria-hidden="true" className="absolute inset-x-[-4px] border-t border-dashed border-kant-stark" style={{ top: `${(1 - p.budget_s / passTak) * 100}%` }} />
                    {p.snitt_s != null ? (
                      <i className={`absolute inset-x-0 bottom-0 block rounded-t-[3px] ${over ? 'bg-koppar' : 'bg-ton-ink opacity-75'}`} style={{ height: `${(p.snitt_s / passTak) * 100}%` }} />
                    ) : (
                      <i className="absolute inset-x-0 bottom-0 block h-1 rounded-sm bg-kant" />
                    )}
                  </span>
                  <span className="text-ax text-ink-3">{kortDatum(p.dag)}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </UKort>
  )
}
