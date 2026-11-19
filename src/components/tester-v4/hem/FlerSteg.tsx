'use client'

/**
 * Fler steg (skissen Hem A, utkast v4 avsnitt 2 punkt 4): hint två till
 * fyra som rader. Raden är länken: en liten bild när datan finns
 * strukturerad, rubriken (handlingen), skälet som meta, och till höger
 * knappens ord (pil på mobil) eller låschippet. Samma mål som Nästa steg.
 *
 * Bilderna ritas bara ur strukturerad data, aldrig ur hintens text:
 *   provet_nara    kalendern med det föreslagna övningsprovets dag
 *   svagt_monster  rätt av antal i mönstret som prickar (menyns mönster)
 * Övriga hintar står som text.
 */

import Link from 'next/link'
import Chip from '@/components/rum/Chip'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import type { Dag, Hint, PlanV4, TestTypId, TypMeny } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { hintHref } from './hintLank'
import { hintKlickad, type HintKontext } from './HintSparning'

export type FlerStegBild = { slag: 'kalender'; dag: number } | { slag: 'prickar'; ratt: number; antal: number } | null

/** Radens bild ur strukturerad data, eller null. Ren, testas. */
export function flerStegBild(
  h: Pick<Hint, 'typ' | 'testtyp' | 'rubrik'>,
  plan: Pick<PlanV4, 'ovningsprov'> | null,
  menyer: Partial<Record<TestTypId, Pick<TypMeny, 'monster'>>>,
  idag: Dag
): FlerStegBild {
  if (h.typ === 'provet_nara' && plan?.ovningsprov) {
    const dag = plan.ovningsprov.foreslagenDag ?? idag
    return { slag: 'kalender', dag: Number(dag.slice(8, 10)) }
  }
  if (h.typ === 'svagt_monster' && h.testtyp) {
    const m = menyer[h.testtyp]?.monster?.find((x) => h.rubrik.toLowerCase().includes(x.namn.toLowerCase())) ?? menyer[h.testtyp]?.monster?.[0]
    if (m && m.antal > 0 && m.antal <= 12 && m.ratt >= 0 && m.ratt <= m.antal) return { slag: 'prickar', ratt: m.ratt, antal: m.antal }
  }
  return null
}

function Bild({ b }: { b: NonNullable<FlerStegBild> }) {
  if (b.slag === 'kalender') {
    return (
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" className="shrink-0">
        <rect x="5" y="7" width="30" height="28" rx="6" style={{ fill: 'var(--papper-2)', stroke: 'var(--kant-stark)' }} strokeWidth="1.5" />
        <path d="M5 15h30" style={{ stroke: 'var(--kant-stark)' }} strokeWidth="1.5" />
        <text x="20" y="30" textAnchor="middle" className="font-display" style={{ fontSize: 14, fontWeight: 800, fill: 'var(--ink-1)' }}>
          {b.dag}
        </text>
      </svg>
    )
  }
  const perRad = b.antal <= 6 ? 3 : b.antal <= 8 ? 4 : 6
  const rader = Math.ceil(b.antal / perRad)
  const steg = 36 / perRad
  const r = Math.min(4, steg / 2 - 1)
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" className="shrink-0">
      {Array.from({ length: b.antal }, (_, i) => {
        const cx = 2 + steg / 2 + (i % perRad) * steg
        const cy = 20 + (Math.floor(i / perRad) - (rader - 1) / 2) * (r * 2 + 4)
        return i < b.ratt ? (
          <circle key={i} cx={cx} cy={cy} r={r} style={{ fill: 'var(--koppar)' }} />
        ) : (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--kant-stark)' }} strokeWidth="1.5" />
        )
      })}
    </svg>
  )
}

export default function FlerSteg({
  hintar,
  kontext,
  plan = null,
  menyer = {},
  idag,
}: {
  hintar: Hint[]
  kontext: HintKontext
  plan?: PlanV4 | null
  menyer?: Partial<Record<TestTypId, Pick<TypMeny, 'monster'>>>
  idag?: Dag
}) {
  if (!hintar.length) return null
  return (
    <section aria-labelledby="fler-steg" className="rounded-2xl border border-kant bg-papper px-4 pb-1 pt-3.5 sm:px-5 sm:pt-4" data-fler-steg>
      <h2 id="fler-steg" className="flex items-baseline gap-2 text-ey text-ink-3">
        {HEM_V4.flerSteg}
        <span className="text-meta normal-case tracking-normal">{HEM_V4.flerStegRad}</span>
      </h2>
      <ul className="mt-2 list-none p-0">
        {hintar.map((h, i) => {
          const bild = idag ? flerStegBild(h, plan, menyer, idag) : null
          return (
            <li key={h.id} className="border-t border-kant">
              <Link
                href={hintHref(h)}
                onClick={() => hintKlickad(h, kontext, i + 1)}
                className="flex min-h-16 items-center gap-3 py-2.5 sm:gap-3.5"
                data-hint={h.typ}
                data-bild={bild?.slag}
              >
                {bild ? <Bild b={bild} /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-[19px] text-ink-1">{h.rubrik}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-[17px] text-ink-3 sm:text-meta">{h.skal}</span>
                </span>
                {h.knapp.las ? (
                  <Chip las className="shrink-0">
                    {HEM_V4.las}
                  </Chip>
                ) : (
                  <>
                    <span className="hidden shrink-0 whitespace-nowrap text-[13px] font-semibold text-ink-2 sm:inline">{h.knapp.etikett}</span>
                    <IkonChev size={20} className="shrink-0 text-ink-3 sm:hidden" />
                  </>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
