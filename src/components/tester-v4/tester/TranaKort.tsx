'use client'

/**
 * Träna i typens meny (utkast v4 avsnitt 4): eget kort i kopparton med
 * kurvikon, rubriken "Träning som följer din nivå" och brödtexten ur datan.
 * Knappen startar träningen; för gratis är den mörk med lås och öppnar
 * betalväggen (aldrig en kopparknapp som öppnar ett ark).
 */

import Link from 'next/link'
import type { TypMeny } from '@/lib/tester/v4/typer'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { useOppnaLas } from './LasKontext'
import { LasIkon } from './TesttypKort'
import { TESTER } from './copy'

const forstaLiten = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

export default function TranaKort({ trana }: { trana: TypMeny['trana'] }) {
  const oppnaLas = useOppnaLas()
  return (
    <section
      aria-label={TESTER.meny.trana}
      data-trana
      className="grid gap-2.5 rounded-[18px] border-[1.5px] border-[color-mix(in_srgb,var(--koppar)_40%,transparent)] bg-koppar-mjuk px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-papper text-koppar-ink" aria-hidden="true">
          <svg viewBox="0 0 24 24" width={24} height={24}>
            <path d="M4 14c3-1 4.5-6 7.5-7s4 4 8.5 2" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            <path d="M4 19h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity=".5" />
            <circle cx="20" cy="9" r="2.4" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-ey text-koppar-ink">{TESTER.meny.trana}</p>
          <h3 className="font-display text-base font-bold leading-5 text-ink-1">{trana.rubrik}</h3>
        </div>
      </div>
      <p className="text-sm leading-5 text-ink-2">{trana.text}</p>
      {trana.las ? (
        <button
          type="button"
          onClick={() => oppnaLas(trana)}
          data-las={trana.las.skal}
          className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-ink-1 px-[18px] text-[15px] font-semibold text-papper"
        >
          <LasIkon />
          {`${trana.etikett}, ${forstaLiten(trana.las.chip)}`}
        </button>
      ) : trana.href ? (
        <Link href={trana.href} className={KNAPP_PRIMAR} data-handling="trana">
          {trana.etikett}
        </Link>
      ) : null}
    </section>
  )
}
