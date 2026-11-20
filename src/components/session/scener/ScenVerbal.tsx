/**
 * Ord och text (verbalt). Säger: läs texten, ta ställning till påståendet.
 * Ett textblock i två stycken med en rad markerad på mjuk yta, bredvid tre
 * svar (Sant, Falskt, Går inte att avgöra) där den valda cirkeln är koppar.
 */

import { A, Blad, Dimrad, K, MJUK, SEN, ScenRam, YTA, type ScenProps } from './bas'

export default function ScenVerbal(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={8} w={88} h={104} />
      <g className={SEN}>
        <rect className={YTA} x="16" y="52" width="72" height="16" rx="4" fill={MJUK} />
        <Dimrad d="M20 24h64M20 36h52M20 60h64M20 72h44M20 84h64M20 96h36" />
        <circle className={YTA} cx="122" cy="36" r="7" fill={A} />
        <Dimrad d="M136 36h16" />
        <circle cx="122" cy="60" r="6" fill="var(--illu-fill, var(--papper))" stroke={K} strokeWidth="3" />
        <Dimrad d="M136 60h16" />
        <circle cx="122" cy="84" r="6" fill="var(--illu-fill, var(--papper))" stroke={K} strokeWidth="3" />
        <Dimrad d="M136 84h16" />
      </g>
    </ScenRam>
  )
}
