'use client'

/**
 * Provets övningsprov i den tonade gruppen (skissens ovnKort på webben):
 * klocksymbol, namnet med etiketten, formatet, senaste resultatet och dagen
 * vi föreslår. Kortet öppnar menyn för provets första del; knappen går
 * direkt till övningsprovet, eller öppnar betalväggen för gratis.
 */

import { kortDatum } from '@/lib/traning/rubrik'
import type { Handling, PlanV4, TestTypId, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { IngarChip, KortKnapp, KORT_KLASS, KORT_PLAN } from './TesttypKort'
import { TESTER, rattAv } from './copy'

export function Klocka() {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-vagg text-vagg-ink" aria-hidden="true">
      <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
        <circle cx="12" cy="12.5" r="7.5" />
        <path d="M12 8.5v4.5l3 2M9 3h6" />
      </svg>
    </span>
  )
}

export default function OvningsprovKort({
  plan,
  handling,
  senaste,
  menyTyp,
  vald,
  onOppna,
}: {
  plan: PlanV4 & { ovningsprov: NonNullable<PlanV4['ovningsprov']> }
  handling: Handling
  senaste: UtvecklingsPunkt | null
  menyTyp: TestTypId
  vald: boolean
  onOppna: (typ: TestTypId) => void
}) {
  const o = plan.ovningsprov
  const delar: string[] = [`${o.meta}.`]
  if (senaste?.resultat) delar.push(TESTER.ovningsprov.senast(kortDatum(senaste.dag), rattAv(senaste.resultat)))
  delar.push(o.foreslagenDag ? TESTER.ovningsprov.foreslar(kortDatum(o.foreslagenDag)) : TESTER.ovningsprov.narSomHelst)
  return (
    <div
      className={`${KORT_KLASS} ${KORT_PLAN} ${vald ? 'outline outline-[2.5px] outline-offset-2 outline-ink-1' : ''}`}
      data-ovningsprov
    >
      <button
        type="button"
        onClick={() => onOppna(menyTyp)}
        aria-label={o.namn}
        className="absolute inset-0 z-[1] rounded-2xl"
      />
      <span className="flex min-w-0 items-center gap-3">
        <Klocka />
        <span className="grid min-w-0 gap-1">
          <b className="font-display text-base font-bold leading-5 tracking-[-.01em]">{o.namn}</b>
          <IngarChip namn={plan.namn} />
        </span>
      </span>
      <span className="text-meta text-ink-3">{delar.join(' ')}</span>
      <KortKnapp h={{ ...handling, etikett: handling.las ? handling.etikett : TESTER.ovningsprov.knapp }} />
    </div>
  )
}
