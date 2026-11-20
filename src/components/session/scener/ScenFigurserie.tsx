/**
 * Figurserier. Säger: följ serien, vad kommer sedan? En remsa med sex rutor
 * där pricken vandrar runt hörnen och sista rutan är luckan på mjuk yta.
 * Under: tre svarskort, det mellersta lyft med kopparpricken i rätt hörn.
 */

import { A, Blad, DIM, Dimrad, K, Kort, MJUK, SEN, ScenRam, YTA, type ScenProps } from './bas'

/** Rutans mitt-x för de sex cellerna, och pricken i tur och ordning runt hörnen. */
const CX = [20, 44, 68, 92, 116]
const HORN: [number, number][] = [[-6, -6], [6, -6], [6, 6], [-6, 6], [-6, -6]]

function Inre({ cx, cy }: { cx: number; cy: number }) {
  return <rect x={cx - 6} y={cy - 6} width="12" height="12" rx="2" stroke={DIM} strokeWidth="2" />
}

export default function ScenFigurserie(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={18} w={144} h={40} />
      <g className={SEN}>
        <rect className={YTA} x="130" y="22" width="20" height="32" rx="4" fill={MJUK} />
        <Dimrad d="M32 18v40M56 18v40M80 18v40M104 18v40M128 18v40" w={2.5} />
        {CX.map((cx, i) => (
          <g key={cx}>
            <Inre cx={cx} cy={38} />
            <circle className={YTA} cx={cx + HORN[i][0]} cy={38 + HORN[i][1]} r="3" fill={K} />
          </g>
        ))}
        <Kort x="24" y="76" width="32" height="28" />
        <Inre cx={40} cy={90} />
        <circle className={YTA} cx="34" cy="96" r="3" fill={K} />
        <Kort x="64" y="72" width="32" height="28" />
        <Inre cx={80} cy={86} />
        <circle className={YTA} cx="86" cy="80" r="3.5" fill={A} />
        <Kort x="104" y="76" width="32" height="28" />
        <Inre cx={120} cy={90} />
        <circle className={YTA} cx="126" cy="96" r="3" fill={K} />
      </g>
    </ScenRam>
  )
}
