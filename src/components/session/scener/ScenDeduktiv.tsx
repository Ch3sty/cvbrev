/**
 * Deduktiv slutledning. Säger: ur villkoren följer vad som står på en plats.
 * Bladet med tre villkorsrader (den sista är den som avgör, i stark kontur),
 * en remsa med fem platser där två är givna och den tredje fylls av kopparn,
 * som landar snett.
 */

import { A, Blad, DIM, Dimrad, K, Kort, Rad, SEN, ScenRam, YTA, type ScenProps } from './bas'

const PLATS = [28, 51, 74, 97, 120]

export default function ScenDeduktiv(p: ScenProps) {
  return (
    <ScenRam {...p}>
      <Blad x={8} y={8} w={140} h={100} />
      <g className={SEN}>
        <rect className={YTA} x="22" y="29" width="6" height="6" rx="1.5" fill={K} />
        <Dimrad d="M36 32h52" />
        <rect className={YTA} x="22" y="43" width="6" height="6" rx="1.5" fill={K} />
        <Dimrad d="M36 46h38" />
        <rect className={YTA} x="22" y="57" width="6" height="6" rx="1.5" fill={K} />
        <Rad d="M36 60h60" />
        <Kort x="22" y="74" width="113" height="24" />
        <Dimrad d="M44.6 74v24M67.2 74v24M89.8 74v24M112.4 74v24" w={2.5} />
        <rect className={YTA} x={PLATS[0]} y="81" width="10" height="10" rx="2" fill={K} />
        <rect x={PLATS[1]} y="81" width="10" height="10" rx="2" stroke={DIM} strokeWidth="2" />
        <rect className={YTA} x={PLATS[2]} y="79" width="12" height="12" rx="2.5" fill={A} transform="rotate(8 80 85)" />
        <rect x={PLATS[3]} y="81" width="10" height="10" rx="2" stroke={DIM} strokeWidth="2" />
        <rect className={YTA} x={PLATS[4]} y="81" width="10" height="10" rx="2" fill={K} />
      </g>
    </ScenRam>
  )
}
