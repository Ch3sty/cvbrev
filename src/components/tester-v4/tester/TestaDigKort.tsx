/**
 * Testa dig på en nivå (utkast v4 avsnitt 4): eget kort i indigoton med
 * provikon, "En fast svårighet, som ett prov. Du får resultat i procent.
 * Flyttar inte din nivå." och de tre fasta nivåtesten som rader. Grundnivån
 * bär "1 kvar i dag" eller "I morgon" för gratis, avancerad och expert lås.
 */

import type { TypMeny } from '@/lib/tester/v4/typer'
import MenyRad from './MenyRad'
import { TESTER } from './copy'

export default function TestaDigKort({ nivaer, matNiva = false }: { nivaer: TypMeny['nivaer']; /** Nivåtestet sätter nivån (typer utan Nivåkoll). */ matNiva?: boolean }) {
  return (
    <section
      aria-label={TESTER.meny.testa}
      data-testa
      className="grid gap-2.5 rounded-[18px] border-[1.5px] border-[color-mix(in_srgb,var(--ton-ink)_30%,transparent)] bg-ton px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-papper text-ton-ink" aria-hidden="true">
          <svg viewBox="0 0 24 24" width={24} height={24}>
            <rect x="4" y="3.5" width="16" height="17" rx="3" fill="none" stroke="currentColor" strokeWidth={2} />
            <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity=".6" />
            <path d="M13.5 17l1.8 1.8 3.2-3.6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-ey text-ton-ink">{TESTER.meny.testa}</p>
          <h3 className="font-display text-base font-bold leading-5 text-ink-1">{TESTER.meny.testaRubrik}</h3>
        </div>
      </div>
      <p className="text-sm leading-5 text-ink-2">{matNiva ? TESTER.meny.testaTextNivatest : TESTER.meny.testaText}</p>
      <div className="overflow-hidden rounded-2xl bg-papper">
        {nivaer.map((n) => (
          <MenyRad key={n.zon} h={n} rubrik={n.rubrik} text={n.text} />
        ))}
      </div>
    </section>
  )
}
