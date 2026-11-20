/**
 * Talserier. Säger: vilket tal kommer härnäst? Fyra kort där talen antyds
 * som streck (ett, två, tre) och bågar över visar steget. Fjärde kortet är
 * luckan, streckad på mjuk yta, och kopparbrickan är svaret som landar i den.
 */

import { A, DIM, Dimrad, FILL, K, MJUK, Rad, SEN, STRECK, ScenRam, YTA, type ScenProps } from './bas'

const X = [12, 46, 80]

export default function ScenTalserie(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <rect x="18" y="42" width="130" height="40" rx="6" fill={FILL} stroke={DIM} strokeWidth="2.5" />
      {X.map((x) => (
        <rect key={x} x={x} y="36" width="28" height="40" rx="6" fill={FILL} stroke={K} strokeWidth="3" />
      ))}
      <g className={SEN}>
        <Rad d="M26 48v16M57 48v16M63 48v16M88 48v16M94 48v16M100 48v16" />
        <Dimrad d="M30 28c6-8 14-8 20 0M64 28c6-8 14-8 20 0M98 28c6-8 14-8 20 0" w={2.5} />
        <rect className={YTA} x="114" y="36" width="28" height="40" rx="6" fill={MJUK} />
        <rect className={STRECK} x="114" y="36" width="28" height="40" rx="6" stroke={DIM} strokeWidth="2.5" strokeDasharray="5 4" />
        <rect className={YTA} x="122" y="44" width="18" height="26" rx="4" fill={A} transform="rotate(8 131 57)" />
        <Dimrad d="M24 96h108" w={2.5} />
        <circle className={YTA} cx="32" cy="96" r="3" fill={DIM} />
        <circle className={YTA} cx="66" cy="92" r="3" fill={DIM} />
        <circle className={YTA} cx="100" cy="88" r="3" fill={DIM} />
      </g>
    </ScenRam>
  )
}
