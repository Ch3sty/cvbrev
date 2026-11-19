'use client'

/**
 * Resultat (skissens resultat()): följer valet i grafen. Alla typer:
 * nivåkoller och övningsprov. En typ: även träningarna. Varje rad väljer
 * punkten i grafen. Listan är också grafens tabellvy: allt som grafen ritar
 * går att läsa här utan att peka.
 *
 * Gratis (historikLast): bara senaste raden per typ och en låst rad,
 * "Äldre resultat ingår i Premium" (ägarens regel: historiken är Premium).
 */

import { useState } from 'react'
import type { TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { TEST_TYP_ORDNING } from '@/lib/tester/v4/typer'
import { ingarI } from '@/lib/tester/v4/copy'
import { LasChip } from '@/components/traning/HemKlient'
import { LAS_CHIP } from '@/lib/tester/v4/copy'
import TypSymbol from '../tester/TypSymbol'
import { nivaText, type TypVal } from './geometri'
import { UTV, kort } from './copy'

const FORST = 6

export function radVarde(p: UtvecklingsPunkt): string {
  if (!p.raknas) return UTV.detalj.raknasInte.toLowerCase()
  if (p.slag === 'ovningsprov') return p.resultat ? UTV.detalj.ratt(p.resultat.ratt, p.resultat.antal) : ''
  if (p.niva != null) return nivaText(p.niva)
  return p.resultat ? UTV.detalj.ratt(p.resultat.ratt, p.resultat.antal) : ''
}

/** Raderna per typ, nyast först. */
export function resultatGrupper(
  punkter: readonly UtvecklingsPunkt[],
  typVal: TypVal,
  planTyper: readonly TestTypId[],
): { typ: TestTypId; rader: UtvecklingsPunkt[] }[] {
  const ordning = [...planTyper, ...TEST_TYP_ORDNING.filter((t) => !planTyper.includes(t))]
  return ordning
    .filter((t) => typVal === 'alla' || typVal === t)
    .map((typ) => ({
      typ,
      rader: punkter
        .filter((p) => p.typ === typ && (p.slag !== 'trana' || typVal === typ))
        .sort((a, b) => (a.dag < b.dag ? 1 : a.dag > b.dag ? -1 : 0)),
    }))
    .filter((g) => g.rader.length)
}

export interface ResultatProps {
  punkter: readonly UtvecklingsPunkt[]
  typVal: TypVal
  planTyper: readonly TestTypId[]
  planNamn: string | null
  namn: Record<TestTypId, string>
  valdId: string | null
  historikLast: boolean
  onValj: (p: UtvecklingsPunkt) => void
}

export default function Resultat({ punkter, typVal, planTyper, planNamn, namn, valdId, historikLast, onValj }: ResultatProps) {
  const [oppna, setOppna] = useState<Partial<Record<TestTypId, boolean>>>({})
  const grupper = resultatGrupper(punkter, typVal, planTyper)
  return (
    <section aria-label={UTV.resultat.eyebrow} className="rounded-2xl border border-kant bg-papper p-4" data-sektion="resultat">
      <h2 className="flex flex-wrap items-baseline justify-between gap-x-3 text-ey text-ink-3">
        {UTV.resultat.eyebrow}
        <span className="text-meta normal-case tracking-normal">{typVal === 'alla' ? UTV.resultat.metaAlla : UTV.resultat.metaTyp}</span>
      </h2>
      {!grupper.length ? <p className="mt-2 text-sm text-ink-2">{UTV.resultat.tom}</p> : null}
      <div className="mt-3 flex flex-col gap-4">
        {grupper.map((g) => {
          const alla = !!oppna[g.typ]
          const visas = alla ? g.rader : g.rader.slice(0, FORST)
          const iPlan = planTyper.includes(g.typ)
          return (
            <div key={g.typ} data-grupp={g.typ}>
              <h3 className="mb-1 flex items-center gap-2.5 text-sm">
                <TypSymbol typ={g.typ} size={28} />
                <b className="font-semibold text-ink-1">{namn[g.typ]}</b>
                {iPlan && planNamn ? (
                  <span className="inline-flex h-[22px] items-center rounded-md bg-koppar-mjuk px-2 text-xs font-semibold text-koppar-ink">
                    {ingarI(planNamn)}
                  </span>
                ) : null}
              </h3>
              <ul>
                {visas.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={p.id === valdId}
                      onClick={() => onValj(p)}
                      className={`grid min-h-11 w-full grid-cols-[64px_1fr_auto] items-center gap-2.5 border-t border-kant px-1 py-2 text-left text-[13px] leading-[18px] tabular-nums text-ink-3 ${
                        p.id === valdId ? 'bg-papper-2' : 'hover:bg-papper-2'
                      }`}
                      data-rad={p.id}
                    >
                      <span>{kort(p.dag)}</span>
                      <span className="min-w-0 truncate">{p.provNamn ?? UTV.slag[p.slag]}</span>
                      <b className="text-right font-semibold text-ink-1">{radVarde(p)}</b>
                    </button>
                  </li>
                ))}
              </ul>
              {g.rader.length > FORST ? (
                <button
                  type="button"
                  className="mt-1 inline-flex min-h-11 items-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
                  aria-expanded={alla}
                  onClick={() => setOppna((o) => ({ ...o, [g.typ]: !alla }))}
                >
                  {alla ? UTV.resultat.visaFarre : UTV.resultat.visaAlla(g.rader.length)}
                </button>
              ) : null}
            </div>
          )
        })}
      </div>
      {historikLast && grupper.length ? (
        <div className="mt-3 flex min-h-11 items-center justify-between gap-3 border-t border-kant pt-3 text-sm text-ink-2" data-last-rad>
          <span>{UTV.resultat.historikLast}</span>
          <LasChip feature="tests_above_base" plats="historik" text={LAS_CHIP.premium} label={`${UTV.resultat.historikLast}. ${LAS_CHIP.premium}`} />
        </div>
      ) : null}
    </section>
  )
}
