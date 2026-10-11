/**
 * 80 px-läget av MatrixQuestionReview (skiss Provbladet, avsnitt 3): bara
 * matrisen, utan svarsalternativ, ritad ur frågans egna figurer. Den tomma
 * rutan står streckad i koppar, som luckan hon skulle fylla.
 *
 * Figurerna är V7-renderarnas (SvgLayeredCell), inne i .matrisyta så att de
 * följer bläcket och papperet i mörkt läge. Inget rött, ingen bild.
 */

import { SvgLayeredCell, type GenomgangsFraga } from '@/lib/logicTestV7/layered.v7'

const RAM = 80
const KANT = 4

export default function MatrisMiniatyr({ fraga, className }: { fraga: Pick<GenomgangsFraga, 'grid'>; className?: string }) {
  const rader = fraga.grid.length
  const kolumner = Math.max(1, ...fraga.grid.map((r) => r.length))
  const inre = RAM - KANT * 2
  const cw = inre / kolumner
  const ch = inre / Math.max(1, rader)
  // Figuren står med luft i sin ruta, som på provbladet.
  const luft = Math.min(cw, ch) * 0.14

  return (
    <svg
      viewBox={`0 0 ${RAM} ${RAM}`}
      className={`matrisyta block h-auto w-full text-ink-1 ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <rect x={KANT} y={KANT} width={inre} height={inre} rx="6" fill="var(--papper)" stroke="currentColor" strokeWidth="1.5" />
      <g stroke="var(--kant-stark)" strokeWidth="1">
        {Array.from({ length: kolumner - 1 }, (_, i) => (
          <path key={`k${i}`} d={`M${KANT + cw * (i + 1)} ${KANT}v${inre}`} />
        ))}
        {Array.from({ length: rader - 1 }, (_, i) => (
          <path key={`r${i}`} d={`M${KANT} ${KANT + ch * (i + 1)}h${inre}`} />
        ))}
      </g>
      {fraga.grid.map((rad, r) =>
        rad.map((cell, k) => {
          const x = KANT + k * cw + luft
          const y = KANT + r * ch + luft
          const w = cw - luft * 2
          const h = ch - luft * 2
          if (!cell) {
            return (
              <rect
                key={`${r}-${k}`}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="2"
                fill="none"
                stroke="var(--koppar)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
            )
          }
          return (
            <svg key={`${r}-${k}`} x={x} y={y} width={w} height={h} viewBox="0 0 100 100" overflow="hidden">
              <SvgLayeredCell cell={cell} />
            </svg>
          )
        })
      )}
    </svg>
  )
}
