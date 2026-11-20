/**
 * Nivå per testtyp (skissens "Nivå per testtyp", webben): nivåbandet per
 * typ, provets delar först med etiketten "Ingår i ...". Ett tryck på en rad
 * väljer typen i grafen, ett tryck till går tillbaka till Alla.
 *
 * Inga egna hooks; trycket kommer ur UtvecklingVy.
 */

import Nivaband from '@/components/tester-v4/Nivaband'
import type { NivaLage, TestTypId } from '@/lib/tester/v4/typer'
import { ingarI } from '@/lib/tester/v4/copy'
import TypSymbol from '../tester/TypSymbol'
import type { TypVal } from './geometri'
import { UTV } from './copy'

export interface NivaPerTypProps {
  typer: { id: TestTypId; namn: string; ingarIPlan: boolean; niva: NivaLage }[]
  planNamn: string | null
  typVal: TypVal
  onTyp: (v: TypVal) => void
}

export default function NivaPerTyp({ typer, planNamn, typVal, onTyp }: NivaPerTypProps) {
  const ordnade = [...typer.filter((t) => t.ingarIPlan), ...typer.filter((t) => !t.ingarIPlan)]
  return (
    <section aria-label={UTV.nivaPerTyp.eyebrow} className="rounded-2xl border border-kant bg-papper p-4" data-sektion="niva-per-typ">
      <h2 className="flex flex-wrap items-baseline justify-between gap-x-3 text-ey text-ink-3">
        {UTV.nivaPerTyp.eyebrow}
        <span className="text-meta normal-case tracking-normal">{UTV.nivaPerTyp.meta}</span>
      </h2>
      <ul className="mt-2 flex flex-col gap-1">
        {ordnade.map((t) => {
          const vald = typVal === t.id
          const ton = !planNamn || t.ingarIPlan || vald ? 'koppar' : 'neutral'
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={vald}
                onClick={() => onTyp(vald ? 'alla' : t.id)}
                className={`-mx-2 flex min-h-11 w-[calc(100%+16px)] items-center gap-3 rounded-xl px-2 py-1.5 text-left ${
                  vald ? 'bg-papper-2' : 'hover:bg-papper-2'
                } ${t.ingarIPlan ? 'shadow-[inset_3px_0_0_var(--koppar)]' : ''}`}
                data-typ={t.id}
              >
                <TypSymbol typ={t.id} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                    <b className="font-semibold text-ink-1">{t.namn}</b>
                    {t.ingarIPlan && planNamn ? (
                      <span className="inline-flex h-[22px] items-center rounded-md bg-koppar-mjuk px-2 text-xs font-semibold text-koppar-ink">
                        {ingarI(planNamn)}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block max-w-[320px]">
                    <Nivaband namn={t.namn} typ={t.id} lage={t.niva} storlek="liten" ton={ton} />
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
