'use client'

/**
 * Genomgången efter nivåtestet i testplanens steg 2, uppgift för uppgift.
 * Samma lista som deduktivens: nummer, grupp (regelfamilj eller
 * uppgiftsform), tid och utfall; utfälld visar uppgiften med rätt svar i
 * koppar, förklaringen och misstaget för hennes val, och rapportlänken.
 * Uppgifterna kommer färdiga från servern i visad ordning.
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { visatForSvar } from '@/lib/logicTestV7/blanda'
import FragaRapport from '@/components/traning/FragaRapport'
import type { Steg2Kind } from '@/app/dashboard/tester/testConfig'
import { FAMILJ_NAMN, FORM_NAMN } from '@/lib/tester/steg2/namn'
import { Steg2Genomgang } from './Uppgifter'

export interface Steg2Svar {
  q_id: string
  selected: number
  visat?: number
  correct: boolean
  time_spent: number
}

const tid = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** Gruppens namn ur genomgången: talseriens familj eller spatial förmågas form. */
export function gruppNamn(g: { family?: string; form?: 'A' | 'B' | 'C' | 'D'; klipp?: boolean }): string | null {
  if (g.family) return FAMILJ_NAMN[g.family] ?? null
  if (g.form) return g.form === 'B' && g.klipp ? FORM_NAMN.Bklipp : FORM_NAMN[g.form]
  return null
}

export default function Steg2Review({
  kind,
  answers,
  fragor,
  sessionId,
  oppnaFran,
}: {
  kind: Steg2Kind
  answers: Steg2Svar[]
  fragor: unknown[]
  sessionId?: string
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
      <ul className="divide-y divide-kant rounded-xl border border-kant bg-panel" data-steg2-review>
        {(fragor as { id: string; family?: string; form?: 'A' | 'B' | 'C' | 'D'; klipp?: boolean }[]).map((q, i) => {
          const svar = answers.find((a) => a.q_id === q.id)
          const isOpen = oppna.has(i)
          return (
            <li key={q.id}>
              <button type="button" onClick={() => vaxla(i)} aria-expanded={isOpen} className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left hover:bg-insunken">
                <span className="w-6 shrink-0 text-meta tabular-nums text-ink-3">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-1">{gruppNamn(q) ?? `Uppgift ${i + 1}`}</span>
                  {svar ? <span className="mt-0.5 block text-meta tabular-nums text-ink-3">{tid(svar.time_spent ?? 0)}</span> : null}
                </span>
                <span className={`shrink-0 text-meta font-medium ${!svar ? 'text-ink-3' : svar.correct ? 'text-positiv' : 'text-ink-1'}`}>
                  {!svar ? 'Inget svar' : svar.correct ? 'Rätt' : 'Fel'}
                </span>
                <ChevronDown aria-hidden="true" strokeWidth={1.75} className={`h-5 w-5 shrink-0 text-ink-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen ? (
                <div className="mx-auto max-w-[420px] px-4 pb-6">
                  <Steg2Genomgang kind={kind} g={q} valt={visatForSvar(svar)} />
                  <FragaRapport qId={q.id} sessionId={sessionId ?? null} testKind={kind} />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
