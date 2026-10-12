'use client'

/**
 * Genomgången av figurserier, uppgift för uppgift (figurserier-spec.md 8,
 * beställningen omgång 2, A1): luckan fylld med facit i koppar-bläck, valt
 * alternativ i bläckram, rätt i kopparram med punkt, övriga tonade. Under
 * alternativen regelpanelen med bankens regel och misstaget för det valda
 * alternativet ordagrant, och rapportlänken "Något ser fel ut". Ingenting
 * ritas ovanpå figurerna.
 *
 * Frågorna kommer färdiga från servern (src/lib/figurserierV1/fragor.server.ts):
 * samma urval och visade ordning som i testet.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Regelpanel from '@/components/traning/Regelpanel'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import { serieFamiljNamn } from '@/lib/figurserierV1/familjer'
import type { GenomgangSerie } from '@/lib/figurserierV1/types'
import { FigurserieAlternativ, FigurserieRad } from './FigurserieRad'

export interface SerieSvar {
  q_id: string
  selected: number
  visat?: number
  correct: boolean
  time_spent: number
}

const tid = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function FigurserieReview({
  answers,
  fragor,
  sessionId,
  oppnaFran,
}: {
  answers: SerieSvar[]
  fragor: GenomgangSerie[]
  sessionId?: string
  /** Index (nollbaserade) som står öppna från start: missarna från resultatsidan. */
  oppnaFran?: readonly number[]
}) {
  const [oppna, setOppna] = useState<ReadonlySet<number>>(() => new Set(oppnaFran ?? []))
  const vaxla = (i: number) =>
    setOppna((fore) => {
      const nya = new Set(fore)
      if (nya.has(i)) nya.delete(i)
      else nya.add(i)
      return nya
    })

  if (fragor.length === 0) return null

  return (
    <section aria-label="Uppgift för uppgift">
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel" data-serie-genomgang>
        {fragor.map((q, i) => {
          const svar = answers.find((a) => a.q_id === q.id)
          const valt = visatForSvar(svar)
          const isOpen = oppna.has(i)
          const fel = !!svar && !svar.correct
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => vaxla(i)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-insunken"
              >
                <span className="w-6 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-1">{serieFamiljNamn(q.family) ?? q.title}</span>
                  <span className="mt-0.5 block text-meta tabular-nums text-ink-3">{svar ? tid(svar.time_spent ?? 0) : 'Inte besvarad'}</span>
                </span>
                <span className={`shrink-0 text-meta font-medium ${!svar ? 'text-ink-3' : svar.correct ? 'text-positiv' : 'text-ink-1'}`}>
                  {!svar ? 'Hoppad' : svar.correct ? 'Rätt' : 'Fel'}
                </span>
                <ChevronDown aria-hidden="true" strokeWidth={1.75} className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen ? (
                <div className="serie-kolumn px-4 pb-6">
                  <div className="mx-auto max-w-[640px] space-y-3.5">
                    <FigurserieRad rad={q.rad} facit={q.options[q.rattVisat]} />
                    <FigurserieAlternativ options={q.options} valt={valt} ratt={q.rattVisat} disabled />
                    <Regelpanel
                      rad={!svar ? 'Inte besvarad' : svar.correct ? `Rätt · ${tid(svar.time_spent ?? 0)}` : `Inte den här · ${tid(svar.time_spent ?? 0)}`}
                      regel={q.rule}
                      misstag={fel && valt !== null ? q.misstag[valt] || null : null}
                      rapport={{ qId: q.id, sessionId: sessionId ?? null, testKind: 'figurserie', bankVersion: null }}
                    />
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
