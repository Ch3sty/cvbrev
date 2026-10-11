/**
 * Tempo per fråga (spec-rummen 4.4, konceptets .staplar i P4 och S1).
 *
 * En stapel per fråga, 72 px hög yta, den streckade linjen är provets tid.
 * Över provets tid i koppar, fel svar tonade (opacitet 0,35), resten i
 * rummets ton. Aldrig rött. Axeln "fråga 1 ... fråga 9" i HTML, 11 px.
 *
 * Server component.
 */

import type { Staplar as StaplarData } from '@/lib/traning/resultat'

export interface StaplarProps {
  data: StaplarData
  axel: { start: string; mitt: string; slut: string }
  /** Tillgängligt namn: vad linjen och färgerna betyder. */
  aria: string
}

export default function Staplar({ data, axel, aria }: StaplarProps) {
  return (
    <figure className="m-0" aria-label={aria}>
      <div className="relative mt-3 flex h-[72px] items-end gap-[5px] pt-1.5" aria-hidden="true">
        <span
          className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-kant-stark"
          style={{ top: `calc(6px + ${(data.linje * 66).toFixed(1)}px)` }}
        />
        {data.staplar.map((s, i) => (
          <i
            key={i}
            className={`block flex-1 rounded-t-[3px] ${s.over ? 'bg-koppar' : 'bg-ton-ink'} ${
              s.fel ? 'opacity-[.35]' : s.over ? '' : 'opacity-75'
            }`}
            style={{ height: `${Math.round(s.hojd * 100)}%` }}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 flex justify-between text-[11px] leading-4 text-ink-3">
        <span>{axel.start}</span>
        <span>{axel.mitt}</span>
        <span>{axel.slut}</span>
      </figcaption>
    </figure>
  )
}
