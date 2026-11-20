'use client'

// Delar för Ord och text och Siffror och tabeller på resultatskärmen och i
// genomgången (plan-testflode-2026-11-20 etapp 2).

import type { VnNivatestGenomgang } from '@/lib/tester/vn-nivatest'
import type { GenomgangPost } from '../lagen/Genomgang'
import type { RamFacit } from '../typ'
import { tillVnU, type VnU } from '../typer/Vn'

/**
 * Förklaringen för en uppgift: "Rätt svar: Falskt" som fet rad när hon inte
 * svarade rätt, bankens förklaring som löptext under.
 */
export function vnFacit(u: VnU, ratt: number, valt: number | null, forklaring: string | null): RamFacit {
  const correct = valt != null && valt === ratt
  const rattText = ratt >= 0 ? u.alternativ[ratt]?.text ?? null : null
  return { ratt, correct, regel: !correct && rattText ? `Rätt svar: ${rattText}` : null, text: forklaring, misstag: null }
}

/** Genomgångens poster: uppgiften, hennes svar, rätt svar och förklaringen. */
export function vnGenomgangPoster(kind: 'verbal' | 'numerisk', g: VnNivatestGenomgang): GenomgangPost<VnU>[] {
  const per = new Map(g.punkter.map((p) => [p.nyckel, p]))
  return g.uppgifter.flatMap((uv) => {
    const ul = g.underlag[uv.del]
    if (!ul) return []
    const u = tillVnU(kind, uv, ul)
    const p = per.get(u.nyckel)
    const ratt = u.alternativ.findIndex((a) => a.id === p?.ratt)
    const valtI = p?.valt == null ? -1 : u.alternativ.findIndex((a) => a.id === p.valt)
    const valt = valtI < 0 ? null : valtI
    return [
      {
        u,
        valt,
        facit: vnFacit(u, ratt, valt, p?.forklaring ?? null),
        tid_s: p?.tid_s ?? null,
      },
    ]
  })
}

/** Upp till tre missade uppgifter som en rad text var, på resultatets genomgångskort. */
export function VnMissar({ poster }: { poster: { nr: number; u: VnU }[] }) {
  if (!poster.length) return null
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-hidden="true" data-vn-missar>
      {poster.slice(0, 3).map((p) => (
        <li key={p.u.nyckel} className="flex min-w-0 items-baseline gap-2.5 rounded-lg bg-papper-2 px-3 py-2 text-sm leading-5">
          <span className="flex-shrink-0 text-[12px] font-semibold tabular-nums text-ink-3">{p.nr}</span>
          <span className="min-w-0 truncate text-ink-1">{p.u.text}</span>
        </li>
      ))}
    </ul>
  )
}
