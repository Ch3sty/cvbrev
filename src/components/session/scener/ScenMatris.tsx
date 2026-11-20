/**
 * Figurer och mönster (matris). Säger: hitta regeln, fyll luckan. En latinsk
 * kvadrat 3 × 3 där nionde rutan är streckad, tre svarskort till höger; det
 * mellersta kortet lyfts en aning och bär kopparn, svaret.
 */

import { A, Blad, DIM, Dimrad, K, Kort, STRECK, SEN, ScenRam, YTA, type ScenProps } from './bas'

const TRI = (x: number, y: number) => `M${x} ${y}l5.5 10h-11z`

export default function ScenMatris(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={14} y={14} w={72} h={72} />
      <g className={SEN}>
        <Dimrad d="M38 14v72M62 14v72M14 38h72M14 62h72" w={2.5} />
        <circle className={YTA} cx="26" cy="26" r="5" fill={K} />
        <rect className={YTA} x="45" y="21" width="10" height="10" rx="2" fill={K} />
        <path className={YTA} d={TRI(74, 20.5)} fill={K} />
        <rect className={YTA} x="21" y="45" width="10" height="10" rx="2" fill={K} />
        <path className={YTA} d={TRI(50, 44.5)} fill={K} />
        <circle className={YTA} cx="74" cy="50" r="5" fill={K} />
        <path className={YTA} d={TRI(26, 68.5)} fill={K} />
        <circle className={YTA} cx="50" cy="74" r="5" fill={K} />
        <rect className={STRECK} x="65" y="65" width="18" height="18" rx="4" stroke={DIM} strokeWidth="2.5" strokeDasharray="4 3" />
        <Kort x="106" y="16" width="40" height="24" />
        <circle className={YTA} cx="126" cy="28" r="5" fill={K} />
        <g transform="rotate(-6 126 60)">
          <Kort x="106" y="48" width="40" height="24" />
          <rect className={YTA} x="120" y="54" width="12" height="12" rx="2.5" fill={A} />
        </g>
        <Kort x="106" y="80" width="40" height="24" />
        <path className={YTA} d={TRI(126, 86.5)} fill={K} />
      </g>
    </ScenRam>
  )
}
