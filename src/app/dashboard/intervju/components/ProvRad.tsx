/**
 * En rad i "Dina intervjuprov" (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 3): talet i display, frågans korta namn, underraden och "Öppna".
 * Samma listrader som "Det här har du gjort" på hemskärmen, direkt på mark.
 */

import Link from 'next/link'
import { FRAGOR } from '@/components/artiklar/intervjuprov/fragor'
import { provHref } from '@/lib/intervju/lankar'
import { dagEtikett, type ProvSammanfattning } from '@/lib/intervju/nasta'
import { LISTA } from '../infor-intervjun-copy'

export const TEXTLANK =
  'inline-flex min-h-11 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

export default function ProvRad({ prov, now }: { prov: ProvSammanfattning; now: Date }) {
  const niva = Math.min(5, Math.max(1, Math.round(prov.level)))
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="flex min-w-[52px] shrink-0 items-baseline gap-1">
        <span aria-hidden="true" className="font-display text-[22px] font-extrabold leading-6 tracking-[-0.02em] tabular-nums text-ink-1">
          {niva}
        </span>
        <span aria-hidden="true" className="text-xs text-ink-3">
          {LISTA.av}
        </span>
        <span className="sr-only">{LISTA.sr(niva)}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5 text-ink-1">{FRAGOR[prov.question].kort}</span>
        <span className="block text-meta tabular-nums text-ink-3">
          {LISTA.underrad(niva, dagEtikett(prov.createdAt, now), prov.missingKind)}
        </span>
      </span>
      <Link href={provHref(prov.token)} className={`shrink-0 ${TEXTLANK}`}>
        {LISTA.oppna}
      </Link>
    </li>
  )
}
