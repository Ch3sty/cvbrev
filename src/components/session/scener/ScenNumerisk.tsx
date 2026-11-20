/**
 * Siffror och tabeller (numeriskt). Säger: läs av diagrammet, räkna, under
 * tid. Ett blad med fyra staplar där den du ska läsa av står på mjuk yta,
 * två tabellrader under, en klocka uppe till höger och två svarskort där
 * det nedre är kopparn, talet du kommer fram till.
 */

import { A, Blad, Dimrad, FILL, K, Kort, Rad, SEN, ScenRam, YTA, MJUK, type ScenProps } from './bas'

const STAPEL = [
  { x: 24, h: 24 },
  { x: 40, h: 40, m: true },
  { x: 56, h: 16 },
  { x: 72, h: 32 },
]

export default function ScenNumerisk(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={10} w={96} h={96} />
      <g className={SEN}>
        {STAPEL.map((s) => (
          <rect key={s.x} x={s.x} y={74 - s.h} width="10" height={s.h} rx="2" fill={s.m ? MJUK : FILL} stroke={K} strokeWidth="2.5" />
        ))}
        <Dimrad d="M20 74h72" />
        <Dimrad d="M20 88h20M48 88h36M20 98h28" />
        <circle cx="136" cy="30" r="12" fill={FILL} stroke={K} strokeWidth="3" />
        <Rad d="M136 30v-7M136 30l5 3.5" />
        <Kort x="116" y="54" width="36" height="20" />
        <Dimrad d="M126 64h16" />
        <rect className={YTA} x="116" y="82" width="36" height="20" rx="6" fill={A} />
      </g>
    </ScenRam>
  )
}
