'use client'

/**
 * Stapeln i övningsprovets topprad (Testerna v2, skiss 2): ett segment per
 * uppgift i stället för texten "12 av 35". Besvarade i ton, den aktuella i
 * bläck, överhoppade i ljus koppar så att hon hittar tillbaka. I fasta
 * format går segmenten att trycka på; adaptiva format har ingen väg bakåt.
 * Talet står bara i aria-label.
 */

export type SegmentLage = 'besvarad' | 'aktuell' | 'hoppad' | 'kvar'

export interface SegmentstapelProps {
  lagen: SegmentLage[]
  aria: string
  /** Fasta format: hoppa till en uppgift. */
  onValj?: (index: number) => void
  etikett?: (index: number) => string
}

const FARG: Record<SegmentLage, string> = {
  besvarad: 'bg-ton-ink',
  aktuell: 'bg-ink-1',
  hoppad: 'bg-koppar-ljus',
  kvar: 'bg-kant',
}

export default function Segmentstapel({ lagen, aria, onValj, etikett }: SegmentstapelProps) {
  const aktuell = lagen.indexOf('aktuell')
  return (
    <div
      role="progressbar"
      aria-label={aria}
      aria-valuemin={1}
      aria-valuemax={lagen.length}
      aria-valuenow={aktuell + 1}
      className="flex w-full gap-[2px]"
      data-segmentstapel
    >
      {lagen.map((l, i) =>
        onValj ? (
          <button
            key={i}
            type="button"
            onClick={() => onValj(i)}
            aria-label={etikett?.(i)}
            className="group flex h-4 flex-1 items-center"
            tabIndex={-1}
          >
            <i className={`block h-[5px] w-full rounded-[2px] ${FARG[l]}`} />
          </button>
        ) : (
          <i key={i} aria-hidden="true" className={`block h-[5px] flex-1 rounded-[2px] ${FARG[l]}`} />
        )
      )}
    </div>
  )
}
