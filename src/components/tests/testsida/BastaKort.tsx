'use client'

/**
 * Ditt bästa på testsidan (tester-lyftet): ett tal bär kortet, andelen rätt
 * i display, och under det en rad med en ruta per fråga där de rätta är
 * ifyllda. Antalet står som etikett under bilden, aldrig i en metarad.
 * i-knappen förklarar vad procent rätt betyder (hjälpruta C1).
 */

import Link from 'next/link'
import { HjalpKnapp } from '@/components/hjalp'
import { LANK } from '@/components/shell/knappar'
import { TESTSIDA } from '@/lib/tester/copy'

export interface BastaKortProps {
  ratt: number
  totalt: number
  /** Resultatsidan för försöket, eller null. */
  href: string | null
  className?: string
}

export default function BastaKort({ ratt, totalt, href, className }: BastaKortProps) {
  const pct = Math.min(100, Math.round((ratt / totalt) * 100))
  // En ruta per fråga upp till 60; över det blir rutorna för smala.
  const rutor = totalt <= 60 ? totalt : 0
  return (
    <section aria-label={TESTSIDA.bast.rub} className={`relative rounded-2xl border border-kant bg-papper p-4 ${className ?? ''}`}>
      <p className="flex items-center gap-1 text-ey text-ink-3">
        {TESTSIDA.bast.rub}
        <HjalpKnapp id="C1" />
      </p>
      <p className="mt-2 flex items-baseline gap-1 font-display font-extrabold tabular-nums text-ink-1">
        <span className="text-[48px] leading-[48px] tracking-[-0.035em]">{pct}</span>
        <span className="text-2xl leading-none tracking-[-0.02em] text-ink-2">%</span>
      </p>
      {rutor > 0 ? (
        <div
          className={`mt-3 flex ${rutor > 30 ? 'gap-px' : 'gap-[3px]'}`}
          role="img"
          aria-label={TESTSIDA.bast.etikett(ratt, totalt)}
        >
          {Array.from({ length: rutor }, (_, i) => (
            <i
              key={i}
              className={`block h-3 min-w-0 flex-1 rounded-[2px] ${i < ratt ? 'bg-ton-ink' : 'border border-kant-stark'}`}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 h-3 overflow-hidden rounded border border-kant bg-papper-2" role="img" aria-label={TESTSIDA.bast.etikett(ratt, totalt)}>
          <i className="block h-full bg-ton-ink" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-meta tabular-nums text-ink-3">{TESTSIDA.bast.etikett(ratt, totalt)}</span>
        {href ? (
          <Link href={href} className={`${LANK} text-[13px]`}>
            {TESTSIDA.bast.lank}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
