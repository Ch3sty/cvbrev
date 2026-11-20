'use client'

/**
 * Ett kort i rutnätet på Tester (skissens .wtyp): symbol, namn, etiketten
 * "Ingår i <provet>" för planens delar, nivåbandet (liten), nivåkollens
 * datum och antal träningar, och primärknappen direkt på kortet
 * (Träna; Mät din nivå om omätt; Grundnivå med "1 kvar i dag" för gratis).
 *
 * Hela kortet öppnar typens meny (en utsträckt knapp under innehållet);
 * primärknappen ligger ovanpå och går direkt. Inga knappar i knappar.
 */

import Link from 'next/link'
import { kortDatum } from '@/lib/traning/rubrik'
import type { Handling, TestTypId, TesttypKort as Kort } from '@/lib/tester/v4/typer'
import Nivaband from '../Nivaband'
import TypSymbol from './TypSymbol'
import { TESTER } from './copy'
import { omattMeta } from '@/lib/tester/v4/rutter'
import { useOppnaLas } from './LasKontext'

export const KORT_KLASS =
  'relative grid min-w-0 content-start gap-2.5 rounded-2xl border p-3.5 text-left text-ink-1'
export const KORT_PLAN =
  'border-[1.5px] border-koppar bg-[color-mix(in_srgb,var(--koppar-mjuk)_35%,var(--papper))] shadow-[inset_0_0_0_1px_var(--koppar)]'
export const KORT_VANLIG = 'border-kant bg-papper'
export const KNAPP_LITEN =
  'knapp-primar relative z-[2] inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[10px] px-3.5 text-sm font-semibold'
export const KNAPP_LITEN_LAS =
  'relative z-[2] inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-kant-stark bg-papper-2 px-3.5 text-sm font-semibold text-ink-2'

export function kortStatus(k: Pick<Kort, 'id' | 'niva' | 'senasteNivakoll' | 'antalTraningar'>): string {
  if (k.niva.status === 'paborjad' && k.niva.svar) return TESTER.kort.paborjad(k.niva.svar.besvarade, k.niva.svar.antal)
  if (k.niva.status !== 'matt') return omattMeta(k.id)
  return k.senasteNivakoll
    ? TESTER.kort.matt(kortDatum(k.senasteNivakoll), k.antalTraningar)
    : TESTER.kort.mattUtanDatum(k.antalTraningar)
}

/** Handlingens text på en knapp: "Grundnivå · 1 kvar i dag", "Grundnivå · I morgon". */
export function knappText(h: Handling): string {
  if (h.las) return h.las.skal === 'kvot' ? `${h.etikett} · ${h.las.chip}` : h.las.chip
  return h.meta ? `${h.etikett} · ${h.meta}` : h.etikett
}

/** Primärknappen på ett kort: länk när den är öppen, låsknapp när den är låst. */
export function KortKnapp({ h }: { h: Handling }) {
  const oppnaLas = useOppnaLas()
  if (h.las) {
    return (
      <button type="button" className={`${KNAPP_LITEN_LAS} justify-self-start`} onClick={() => oppnaLas(h)} data-las={h.las.skal}>
        <LasIkon />
        {knappText(h)}
      </button>
    )
  }
  if (!h.href) return null
  return (
    <Link href={h.href} className={`${KNAPP_LITEN} justify-self-start`} data-handling={h.slag}>
      {knappText(h)}
    </Link>
  )
}

export function LasIkon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}

export default function TesttypKort({
  kort,
  planNamn,
  ton,
  vald,
  premium,
  onOppna,
}: {
  kort: Kort
  planNamn: string | null
  ton: 'koppar' | 'neutral'
  vald: boolean
  premium: boolean
  onOppna: (typ: TestTypId) => void
}) {
  const plan = kort.ingarIPlan && planNamn
  return (
    <div
      className={`${KORT_KLASS} ${plan ? KORT_PLAN : KORT_VANLIG} ${vald ? 'outline outline-[2.5px] outline-offset-2 outline-ink-1' : ''}`}
      data-testtyp={kort.id}
      data-plan={plan ? '' : undefined}
    >
      <button
        type="button"
        onClick={() => onOppna(kort.id)}
        aria-label={TESTER.kort.oppnaMeny(kort.namn)}
        aria-expanded={vald}
        className="absolute inset-0 z-[1] rounded-2xl"
      />
      <span className="flex min-w-0 items-center gap-3">
        <TypSymbol typ={kort.id} size={44} />
        <span className="grid min-w-0 gap-1">
          <b className="font-display text-base font-bold leading-5 tracking-[-.01em]">{kort.namn}</b>
          {plan ? <IngarChip namn={planNamn} /> : null}
        </span>
      </span>
      <Nivaband namn={kort.namn} typ={kort.id} lage={kort.niva} storlek="liten" ton={ton} />
      {/* Omätt: nivåbandet säger redan "Nivåkoll, 7 min" eller "Nivåtest, 15 uppgifter", raden upprepar det inte. */}
      {kort.niva.status === 'omatt' ? null : <span className="text-meta text-ink-3">{kortStatus(kort)}</span>}
      <KortKnapp h={kort.primar} />
      {premium && kort.niva.status === 'matt' && kort.primar.slag === 'trana' ? (
        <span className="text-meta text-ink-3">{TESTER.kort.tranaRad}</span>
      ) : null}
    </div>
  )
}

export function IngarChip({ namn }: { namn: string }) {
  return (
    <span className="inline-flex h-[22px] items-center justify-self-start whitespace-nowrap rounded-[7px] bg-koppar-mjuk px-2 text-xs font-semibold text-koppar-ink">
      {TESTER.ingarI(namn)}
    </span>
  )
}
