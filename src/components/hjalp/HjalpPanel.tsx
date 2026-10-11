'use client'

/**
 * Sidopanelen (skiss Provbladet, dator 1200): hjälpraderna till höger om
 * listan, 320 px, sticky, så att hjälpen aldrig trycker ner korten. På
 * mobil står samma rader som HjalpRad på golvet i stället; sidan väljer
 * med klasser, till exempel
 *
 *   <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
 *     <div>...korten... <HjalpRad ids={['A1','A2','A5']} className="lg:hidden" /></div>
 *     <HjalpPanel className="hidden lg:block" rader={[
 *       { ids: ['A1', 'A2', 'A3', 'A5'], rubrik: 'Aldrig gjort ett rekryteringstest?' },
 *       { ids: ['C5'], oppnasForsta: false },
 *       { ids: ['C4'], oppnasForsta: false },
 *     ]} />
 *   </div>
 *
 * "Dölj hjälpen" står i första radens fot. Ritar ingenting när hjälpen är
 * dold eller inga rader har visningsbara rutor.
 */

import HjalpRad from './HjalpRad'
import { useHjalp } from './HjalpKontext'
import { HJALP_UI, synligaRutor, type HjalpId } from '@/lib/traning/hjalp-copy'

export interface HjalpPanelRad {
  ids: readonly HjalpId[]
  rubrik?: string
  /** false: hopfälld även första gången. Standard true. */
  oppnasForsta?: boolean
}

export interface HjalpPanelProps {
  rader: readonly HjalpPanelRad[]
  className?: string
}

export default function HjalpPanel({ rader, className }: HjalpPanelProps) {
  const { dold } = useHjalp()
  const synliga = rader.filter((r) => synligaRutor(r.ids).length > 0)
  if (dold || synliga.length === 0) return null

  return (
    <aside aria-label={HJALP_UI.panelEtikett} className={`w-80 shrink-0 space-y-3 self-start lg:sticky lg:top-4 ${className ?? ''}`}>
      {synliga.map((r, i) => (
        <HjalpRad
          key={r.ids.join('-')}
          ids={r.ids}
          rubrik={r.rubrik}
          oppnasForsta={r.oppnasForsta}
          doljLank={i === 0}
          variant="panel"
        />
      ))}
    </aside>
  )
}
