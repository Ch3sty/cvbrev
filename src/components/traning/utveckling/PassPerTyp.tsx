/**
 * Pass per testtyp (beställning omgång 2, B3): hur många pass hon gjort i
 * figurer och mönster, ord och text, siffror och tabeller, och sedan
 * testplanen steg 1 figurserier och deduktivt (raderna syns när passen finns). En stapel per
 * typ och antalet i ord; inga procent.
 */

import { Eyebrow, T2, UKort } from './delar'
import type { DinUtvecklingData } from './typer'

const RADER = [
  { nyckel: 'matris', namn: 'Figurer och mönster' },
  { nyckel: 'verbal', namn: 'Ord och text' },
  { nyckel: 'numerisk', namn: 'Siffror och tabeller' },
  { nyckel: 'figurserie', namn: 'Figurserier' },
  { nyckel: 'deduktiv', namn: 'Deduktivt' },
] as const

export default function PassPerTyp({ pass, className }: { pass: DinUtvecklingData['passPerTyp']; className?: string }) {
  if (!pass) return null
  const antal = (k: (typeof RADER)[number]['nyckel']) => pass[k] ?? 0
  const summa = RADER.reduce((s, r) => s + antal(r.nyckel), 0)
  if (summa === 0) return null
  const max = Math.max(...RADER.map((r) => antal(r.nyckel)), 1)
  // De nya typerna står bara när hon har pass i dem; de tre första står alltid.
  const rader = RADER.filter((r) => r.nyckel === 'matris' || r.nyckel === 'verbal' || r.nyckel === 'numerisk' || antal(r.nyckel) > 0)
  return (
    <UKort label="Pass per testtyp" className={className} data="pass-per-typ">
      <Eyebrow>Pass per testtyp</Eyebrow>
      <T2>{summa === 1 ? 'Ett pass hittills' : `${summa} pass hittills`}</T2>
      <ul className="mt-3 flex flex-col gap-2.5">
        {rader.map((r) => {
          const n = antal(r.nyckel)
          return (
            <li key={r.nyckel} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm leading-5 text-ink-1">
              <span>{r.namn}</span>
              <span className="tabular-nums text-ink-3">{n === 1 ? '1 pass' : `${n} pass`}</span>
              <span className="col-span-2 block h-1.5 rounded-full bg-papper-2" aria-hidden="true">
                <i className="block h-full rounded-full bg-koppar" style={{ width: `${n === 0 ? 0 : Math.max(4, (n / max) * 100)}%` }} />
              </span>
            </li>
          )
        })}
      </ul>
    </UKort>
  )
}
