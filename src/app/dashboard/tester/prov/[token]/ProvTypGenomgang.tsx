'use client'

/**
 * Genomgången av provet utan konto i typerna utöver matrisen
 * (spec-prov-fler-typer-2026-11-09 avsnitt 4). Varje uppgift ritas med
 * testernas egna komponenter i genomgångsläge: Nivåkollens för figurserier,
 * deduktivt, verbalt och numeriskt, steg 2:s för spatial förmåga, talserier
 * och ordförråd. Rätt svar och förklaringen står under, som i testerna.
 */

import NivakollUppgift from '@/components/traning/nivakoll/NivakollUppgift'
import { Steg2Genomgang } from '@/components/tests/steg2/Uppgifter'
import type { GenomgangUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'

const PANEL = 'rounded-xl border border-kant bg-panel p-4 sm:p-6'

export default function ProvTypGenomgang({
  uppgifter,
  underlag,
  token,
}: {
  uppgifter: GenomgangUppgift[]
  underlag: Record<string, VnUnderlag>
  token: string
}) {
  return (
    <ol className="list-none space-y-4 p-0" data-prov-genomgang>
      {uppgifter.map((u, i) => (
        <li key={u.nyckel} className={PANEL} data-correct={'valt' in u ? u.correct : u.genomgang.correct}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.06em] text-ink-3">
            {u.deltest ? `${i + 1}. ${u.deltest}` : `Uppgift ${i + 1}`}
            {('valt' in u ? u.correct : u.genomgang.correct) ? ', rätt' : ', fel'}
          </p>
          {'valt' in u ? (
            <Steg2Genomgang kind={u.kind} g={u.genomgang} valt={u.valt} />
          ) : (
            <NivakollUppgift
              u={u.data}
              nr={i + 1}
              antal={uppgifter.length}
              vald={u.genomgang.valt}
              genomgang={u.genomgang}
              underlag={underlag}
              sessionId={u.seed || token}
              last
            />
          )}
        </li>
      ))}
    </ol>
  )
}
