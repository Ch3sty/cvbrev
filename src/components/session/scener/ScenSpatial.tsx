/**
 * Spatial förmåga. Säger: vik ihop nätet, vilken kub blir det? Till vänster
 * kubens utbredning (sex rutor i kors) där en ruta bär en kvadrat på mjuk
 * yta, en vikbåge, och till höger kuben i isometri med symbolerna på plats.
 * Kopparn: kvadraten som hamnat på kubens ovansida, svaret.
 */

import { A, DIM, Dimrad, FILL, K, MJUK, Rad, SEN, ScenRam, YTA, type ScenProps } from './bas'

/** Nätets rutor (kolumn, rad), 14 px, origo 16/22. */
const NAT: [number, number][] = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]]

export default function ScenSpatial(p: ScenProps) {
  return (
    <ScenRam {...p}>
      {NAT.map(([c, r]) => (
        <rect
          key={`${c}${r}`}
          x={16 + c * 14}
          y={22 + r * 14}
          width="14"
          height="14"
          rx="2"
          fill={c === 1 && r === 1 ? MJUK : FILL}
          stroke={c === 1 && r === 1 ? K : DIM}
          strokeWidth="2.5"
        />
      ))}
      <rect className={YTA} x="34" y="40" width="6" height="6" rx="1" fill={K} />
      <circle cx="37" cy="29" r="3" stroke={K} strokeWidth="2" />
      <g className={SEN}>
        <Dimrad d="M62 48c8-10 16-10 24-2" w={2.5} />
        <path d="M112 24l34 20v38l-34 20-34-20V44z" fill={FILL} stroke={K} strokeWidth="3" />
        <path d="M78 44l34 20v38V64z" fill={MJUK} stroke={K} strokeWidth="3" />
        <Rad d="M112 64l34-20" />
        <path className={YTA} d="M112 37l11 6.5-11 6.5-11-6.5z" fill={A} />
        <Rad d="M89 72l10 6M99 72l-10 6" />
        <ellipse cx="128" cy="76" rx="5" ry="8" transform="rotate(-30 128 76)" stroke={K} strokeWidth="2.5" />
      </g>
    </ScenRam>
  )
}
