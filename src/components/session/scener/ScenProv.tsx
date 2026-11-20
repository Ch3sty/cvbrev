/**
 * Provet (I-provet, övningsprov utan egen typ). Säger: som på riktigt, mot
 * klockan, facit efteråt. Bladet med två rader uppgifter där de första är
 * gjorda på mjuk yta, en klocka i hörnet och en tidslinje nertill som nått
 * halvvägs. Kopparn: uppgiften du står på.
 */

import { A, Blad, DIM, Dimrad, FILL, K, MJUK, Rad, SEN, ScenRam, YTA, type ScenProps } from './bas'

const GJORDA = [24, 48, 72]
const RAD2 = [24, 48, 72, 96]

export default function ScenProv(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={8} w={144} h={80} />
      <g className={SEN}>
        {GJORDA.map((x) => (
          <rect key={x} x={x} y="24" width="16" height="16" rx="4" fill={MJUK} stroke={DIM} strokeWidth="2.5" />
        ))}
        <rect className={YTA} x="96" y="24" width="16" height="16" rx="4" fill={A} />
        {RAD2.map((x) => (
          <rect key={x} x={x} y="52" width="16" height="16" rx="4" stroke={DIM} strokeWidth="2.5" />
        ))}
        <circle cx="132" cy="60" r="12" fill={FILL} stroke={K} strokeWidth="3" />
        <Rad d="M132 60v-7M132 60l5 3.5" />
        <Dimrad d="M16 106h128" />
        <Rad d="M16 106h64" />
        <Rad d="M16 100v12M144 100v12" />
      </g>
    </ScenRam>
  )
}
