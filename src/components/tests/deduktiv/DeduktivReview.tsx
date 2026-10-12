'use client'

/**
 * Genomgången av deduktiv slutledning, uppgift för uppgift (deduktiv-spec.md
 * 2 och 5). Samma lista som figurseriernas: nummer, villkorstyp, tid och
 * utfall; utfälld visar den villkoren, frågan, alternativen (rätt i koppar,
 * valt i bläck) och lösningspanelen med stegen, remsan och misstaget för det
 * valda alternativet. Rapportlänken "Något ser fel ut" under panelen.
 *
 * Uppgifterna kommer färdiga från servern (src/lib/deduktivV1/fragor.server.ts):
 * samma urval och visade ordning som i testet.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import { deduktivFamiljNamn } from '@/lib/deduktivV1/familjer'
import type { DeduktivSchema, GenomgangDeduktiv } from '@/lib/deduktivV1/types'
import { BOKSTAV, DeduktivAlternativ, DeduktivLayout, Fragerad, Villkorskort } from './DeduktivFraga'
import DeduktivLosning from './DeduktivLosning'

export interface DeduktivSvar {
  q_id: string
  selected: number
  visat?: number
  correct: boolean
  time_spent: number
}

const tid = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Utfallet i panelens överrad: "Rätt · 0:48", "Inte den här · 0:52" eller "Inte besvarad". */
export function utfallRad(svar: DeduktivSvar | undefined): string {
  if (!svar) return 'Inte besvarad'
  return svar.correct ? `Rätt · ${tid(svar.time_spent ?? 0)}` : `Inte den här · ${tid(svar.time_spent ?? 0)}`
}

/** En uppgift i genomgångsläge: villkor, fråga, alternativ och lösningen. */
export function DeduktivGenomgang({
  q,
  nr,
  antal,
  svar,
  sessionId,
}: {
  q: GenomgangDeduktiv
  nr: number
  antal: number
  svar?: DeduktivSvar
  sessionId?: string | null
}) {
  const valt = visatForSvar(svar)
  const fel = !!svar && !svar.correct && valt !== null
  return (
    <DeduktivLayout
      fast
      villkor={<Villkorskort fast intro={q.intro} villkor={q.villkor} premisser={q.typ === 'D1'} />}
      hoger={
        <>
          <Fragerad nr={nr} antal={antal} fraga={q.fraga} />
          <DeduktivAlternativ options={q.options} valt={valt} ratt={q.rattVisat} disabled />
          <DeduktivLosning
            losning={q.losning}
            utfall={utfallRad(svar)}
            misstag={fel && valt !== null && q.misstag[valt] ? { bokstav: BOKSTAV[valt], text: q.misstag[valt] } : null}
            rapport={{ qId: q.id, sessionId: sessionId ?? null, testKind: 'deduktiv', bankVersion: null }}
          />
        </>
      }
    />
  )
}

export default function DeduktivReview({
  answers,
  fragor,
  sessionId,
  oppnaFran,
}: {
  answers: DeduktivSvar[]
  fragor: GenomgangDeduktiv[]
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
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel" data-deduktiv-genomgang>
        {fragor.map((q, i) => {
          const svar = answers.find((a) => a.q_id === q.id)
          const isOpen = oppna.has(i)
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
                  <span className="block truncate text-sm font-medium text-ink-1">{deduktivFamiljNamn(q.family) ?? q.fraga}</span>
                  <span className="mt-0.5 block text-meta tabular-nums text-ink-3">{svar ? tid(svar.time_spent ?? 0) : 'Inte besvarad'}</span>
                </span>
                <span className={`shrink-0 text-meta font-medium ${!svar ? 'text-ink-3' : svar.correct ? 'text-positiv' : 'text-ink-1'}`}>
                  {!svar ? 'Hoppad' : svar.correct ? 'Rätt' : 'Fel'}
                </span>
                <ChevronDown aria-hidden="true" strokeWidth={1.75} className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen ? (
                <div className="px-4 pb-6">
                  <DeduktivGenomgang q={q} nr={i + 1} antal={fragor.length} svar={svar} sessionId={sessionId} />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * Miniatyren i genomgångskortet (spec 5.1): remsan i 120 × 28 med en prick
 * per plats och svarets plats i koppar; premisskedjan som fyra streck med
 * det sista kortare i koppar. Inga namn, ingen svg.
 */
export function DeduktivMiniatyr({ schema, className = '' }: { schema: DeduktivSchema | null; className?: string }) {
  if (!schema) {
    return (
      <span className={`flex h-7 w-[120px] max-w-full flex-col justify-center gap-[3px] rounded-md border border-kant bg-papper px-2 ${className}`} aria-hidden="true">
        <span className="h-[3px] w-[80%] rounded-full bg-ink-3" />
        <span className="h-[3px] w-[60%] rounded-full bg-ink-3" />
        <span className="h-[3px] w-[85%] rounded-full bg-ink-3" />
        <span className="h-[3px] w-[45%] rounded-full bg-koppar" />
      </span>
    )
  }
  return (
    <span
      className={`grid h-7 w-[120px] max-w-full overflow-hidden rounded-md border border-kant bg-papper ${className}`}
      style={{ gridTemplateColumns: `repeat(${schema.namn.length}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {schema.namn.map((_, i) => {
        const koppar = schema.koppar === i + 1
        return (
          <span key={i} className={`flex items-center justify-center ${i > 0 ? 'border-l border-kant' : ''} ${koppar ? 'shadow-[inset_0_0_0_1.5px_var(--koppar)]' : ''}`}>
            <span className={`h-[7px] w-[7px] rounded-full ${koppar ? 'bg-koppar' : 'bg-ink-2'}`} />
          </span>
        )
      })}
    </span>
  )
}
